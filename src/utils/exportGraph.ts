/* eslint-disable @typescript-eslint/no-explicit-any */
import type { JSONNavigationGraph, MapEdge, MapNode } from '@/types/path'
import type { Connection } from '@/types/types'
import type L from 'leaflet' // Import the Leaflet type

/**
 * Exports the editor's state (Leaflet markers and polylines)
 * into a serializable JSONNavigationGraph format.
 */
export function exportGraph(
  markers: Map<string, L.Marker>,
  conns: Map<string, Connection[]>,
): JSONNavigationGraph {

  // --- 1. Convert markers to plain JSON nodes ---
  const nodes: MapNode[] = []
  markers.forEach((marker, id) => {
    const latLng = marker.getLatLng()

    // FIX: Read the custom portalGroup option from the marker
    // We set this in `usePathEditor.ts`
    const portalGroup = (marker.options as any).portalGroup || null

    nodes.push({
      id,
      coordinates: [latLng.lat, latLng.lng],
      portalGroup: portalGroup || undefined, // Set to undefined if null/empty
    })
  })

  // --- 2. Convert connections to plain JSON adjacency list ---
  const adjacencyList: Record<string, MapEdge[]> = {}
  conns.forEach((connections, sourceId) => {
    const edges: MapEdge[] = []
    const sourceMarker = markers.get(sourceId) // Get source marker once

    // Skip if source marker somehow doesn't exist
    if (!sourceMarker) return

    // FIX: Use the `nodeId` from the Connection object directly
    connections.forEach((conn) => {
      const targetId = conn.nodeId // This is the ID of the connected node
      const targetMarker = markers.get(targetId) // Get the target marker

      // Only add the edge if the target marker still exists
      if (targetMarker) {
        // Calculate distance (weight)
        const weight = sourceMarker.getLatLng().distanceTo(targetMarker.getLatLng())

        edges.push({ targetNodeId: targetId, weight })
      }
    })

    adjacencyList[sourceId] = edges
  })

  return {
    nodes,
    adjacencyList,
  }
}

