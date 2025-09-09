import type { Ref } from 'vue'
import L, { FeatureGroup, Map, Marker } from 'leaflet'
import type { Connection } from '@/types/types'
import { generateId } from '@/utils/generateId'
import pathServices from '@/services/pathService'

export function usePathEditor(map: Ref<Map | null>, drawnItems: FeatureGroup) {
  const nodeMarkers: globalThis.Map<string, Marker> = new globalThis.Map()
  const connections: globalThis.Map<string, Connection[]> = new globalThis.Map()

  /**
   * Create a node (marker) at a given latlng.
   */
  function createNode(latlng: L.LatLng, nodeId?: string): Marker {
    const id = nodeId || generateId()
    const marker = L.marker(latlng, {
      draggable: true,
      title: id,
      icon: L.divIcon({
        className: 'custom-circle-node',
        html: '<div></div>',
        iconSize: [20, 20],
      }),
    }).addTo(drawnItems)

    connections.set(id, [])
    nodeMarkers.set(id, marker)

    // Update connected lines when dragging node
    marker.on('drag', () => {
      const conns = connections.get(id) || []
      const newPos = marker.getLatLng()
      conns.forEach(({ nodeId: otherId, polyline }) => {
        const otherMarker = nodeMarkers.get(otherId)!
        polyline.setLatLngs([newPos, otherMarker.getLatLng()])
      })
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
        const marker = createNode(L.latLng(node.coordinates[0], node.coordinates[1]), node.id)
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

  return {
    nodeMarkers,
    createNode,
    connectNodes,
    highlightNode,
    deleteNode,
    loadPath,
    savePath,
    clearPath,
    pathSetNodeVisibility,
  }
}
