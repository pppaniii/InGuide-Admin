/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Ref } from 'vue'
import L, { FeatureGroup, Map, Marker } from 'leaflet'
import type { Connection } from '@/types/types'
import { generateId } from '@/utils/generateId'
import pathServices from '@/services/pathService'

export function usePathEditor(
  map: Ref<Map | null>,
  drawnItems: FeatureGroup,
  buildingId: Ref<string | undefined>,
  floorId: Ref<string | null>,
  onPathUpdate: () => void, // 1. Accept the callback
) {
  const nodeMarkers: globalThis.Map<string, Marker> = new globalThis.Map()
  const connections: globalThis.Map<string, Connection[]> = new globalThis.Map()

  /**
   * Create a node (marker) at a given latlng.
   */
  function createNode(
    latlng: L.LatLng,
    nodeId?: string,
    portalGroup?: string | null, // <-- ADD portalGroup prop
  ): Marker {
    const id = nodeId || generateId()

    // --- 2. Logic copied from setNodePortalGroup ---
    const isPortal = !!portalGroup
    const icon = L.divIcon({
      // Use a different class for portals so you can style them (e.g., make them blue)
      className: 'custom-circle-node',
      html: isPortal ? '<div>P</div>' : '<div></div>', // 'P' for Portal
      iconSize: [20, 20],
    })
    // --- End logic ---

    const marker = L.marker(latlng, {
      draggable: true,
      title: id,
      icon: icon, // <-- Use the new icon
    }).addTo(drawnItems)

    // --- 3. Store the portalGroup on the marker options ---
    ;(marker.options as any).portalGroup = portalGroup || null

    connections.set(id, [])
    nodeMarkers.set(id, marker)

    // Keep this to update the connecting lines in real-time during the drag
    marker.on('drag', () => {
      const conns = connections.get(id) || []
      const newPos = marker.getLatLng()
      conns.forEach(({ nodeId: otherId, polyline }) => {
        const otherMarker = nodeMarkers.get(otherId)!
        polyline.setLatLngs([newPos, otherMarker.getLatLng()])
      })
    })

    // Trigger the save and graph generation once the drag is complete
    marker.on('dragend', () => {
      if (buildingId.value && floorId.value) {
        savePath(buildingId.value, floorId.value)
        onPathUpdate() // 2. Call the callback
        console.log(`Path saved after dragging node ${id}.`)
      } else {
        console.error('Cannot save path: buildingId or floorId is missing.')
      }
    })

    return marker
  }

  /**
   * Connect two existing nodes with a polyline.
   */
  function connectNodes(sourceId: string, targetLatLng: L.LatLng): string {
    const targetId = generateId()
    const sourceMarker = nodeMarkers.get(sourceId)
    if (!sourceMarker) throw new Error(`Source node ${sourceId} not found.`)

    const targetMarker = createNode(targetLatLng, targetId)

    const polyline = L.polyline([sourceMarker.getLatLng(), targetMarker.getLatLng()], {
      color: '#f6df4f',
      weight: 15,
    }).addTo(drawnItems)

    connections.get(sourceId)?.push({ nodeId: targetId, polyline })
    connections.set(targetId, [{ nodeId: sourceId, polyline }])

    onPathUpdate() // 2. Call the callback
    return targetId
  }

  /**
   * Highlight or unhighlight a node marker.
   */
  function highlightNode(marker: Marker, highlight: boolean) {
    marker.setIcon(
      L.divIcon({
        className: highlight ? 'custom-circle-node selected' : 'custom-circle-node',
        html: '<div></div>',
        iconSize: [20, 20],
      }),
    )
  }

  /**
   * Delete a node if it's an end node (<=1 connection).
   */
  function deleteNode(nodeId: string) {
    const connectedEdges = connections.get(nodeId)
    if (!connectedEdges || connectedEdges.length > 1) return false

    if (connectedEdges.length === 1) {
      const { nodeId: neighborId, polyline } = connectedEdges[0]
      drawnItems.removeLayer(polyline)

      const neighborConns = connections.get(neighborId)
      if (neighborConns) {
        connections.set(
          neighborId,
          neighborConns.filter((c) => c.nodeId !== nodeId),
        )
      }
    }

    const marker = nodeMarkers.get(nodeId)
    if (marker) {
      drawnItems.removeLayer(marker)
      nodeMarkers.delete(nodeId)
    }
    connections.delete(nodeId)

    onPathUpdate() // 2. Call the callback
    return true
  }

  /**
   * Load a saved path for a given building/floor.
   */
  async function loadPath(buildingId: string, floorId: string) {
    try {
      const loadedGraph = await pathServices.loadPath(buildingId, floorId)
      if (!loadedGraph) return

      // Create markers
      loadedGraph.nodes.forEach((node) => {
        // Bug fix: Pass node.id, not buildingId
        const marker = createNode(L.latLng(node.coordinates[0], node.coordinates[1]), node.id, node.portalGroup)
        nodeMarkers.set(node.id, marker)
      })

      // Create polylines
      loadedGraph.adjacencyList.forEach((edges, sourceId) => {
        edges.forEach((edge) => {
          const targetId = edge.targetNodeId
          if (sourceId < targetId) {
            const startMarker = nodeMarkers.get(sourceId)
            const endMarker = nodeMarkers.get(targetId)
            if (startMarker && endMarker) {
              const polyline = L.polyline([startMarker.getLatLng(), endMarker.getLatLng()], {
                color: '#f6df4f',
                weight: 15,
              }).addTo(drawnItems)

              if (!connections.has(sourceId)) connections.set(sourceId, [])
              connections.get(sourceId)?.push({ nodeId: targetId, polyline })

              if (!connections.has(targetId)) connections.set(targetId, [])
              connections.get(targetId)?.push({ nodeId: sourceId, polyline })
            }
          }
        })
      })
    } catch (err) {
      console.error('Failed to load path:', err)
    }
  }

  /**
   * Save the current path state.
   */
  function savePath(buildingId: string, floorId: string) {
    pathServices.savePath(buildingId, floorId, nodeMarkers, connections)
  }

  /**
   * Clear all markers and connections.
   */
  function clearPath() {
    drawnItems.clearLayers()
    nodeMarkers.clear()
    connections.clear()
  }

  function pathSetNodeVisibility(visible: boolean) {
    nodeMarkers.forEach((marker) => {
      if (visible) {
        if (!drawnItems.hasLayer(marker)) {
          drawnItems.addLayer(marker)
        }
      } else {
        if (drawnItems.hasLayer(marker)) {
          drawnItems.removeLayer(marker)
        }
      }
    })
  }

  function setNodePortalGroup(nodeId: string, groupName: string | null) {
    const marker = nodeMarkers.get(nodeId)
    if (!marker) return // 1. Update the data on the marker object
    ;(marker.options as any).portalGroup = groupName

    // 2. Update the icon
    const isPortal = !!groupName
    const icon = L.divIcon({
      className: 'custom-circle-node',
      html: isPortal ? '<div>P</div>' : '<div></div>', // 'P' for Portal
      iconSize: [20, 20],
    })
    marker.setIcon(icon)

    // 3. Save the path and trigger graph regeneration
    if (buildingId.value && floorId.value) {
      console.log('saving portal node')
      savePath(buildingId.value, floorId.value) // This now saves the new portalGroup
      onPathUpdate() // This calls generateAndSaveNavigationGraph
    }
  }

  return {
    nodeMarkers,
    connections,
    createNode,
    connectNodes,
    highlightNode,
    deleteNode,
    loadPath,
    savePath,
    clearPath,
    pathSetNodeVisibility,
    setNodePortalGroup,
  }
}
