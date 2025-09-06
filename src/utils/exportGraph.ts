import type { JSONNavigationGraph, MapEdge, MapNode } from '@/types/path'
import type { Connection } from '@/types/types'

export function exportGraph(
  markers: Map<string, L.Marker>,
  conns: Map<string, Connection[]>,
): JSONNavigationGraph {
  // Convert markers to plain JSON nodes
  const nodes: MapNode[] = []
  markers.forEach((marker, id) => {
    const latLng = marker.getLatLng()
    nodes.push({
      id,
      coordinates: [latLng.lat, latLng.lng],
    })
  })

  // Convert connections to plain JSON adjacency list
  const adjacencyList: Record<string, MapEdge[]> = {}
  conns.forEach((lines, sourceId) => {
    const edges: MapEdge[] = []

    lines.forEach((line) => {
      const latLngs = line.polyline.getLatLngs() as L.LatLng[]
      if (latLngs.length === 2) {
        const [a, b] = latLngs
        const idA = findMarkerIdByLatLng(a, markers)
        const idB = findMarkerIdByLatLng(b, markers)

        // pick the endpoint that isn't the source
        const targetMarkerId = idA === sourceId ? idB : idA

        if (targetMarkerId && targetMarkerId !== sourceId) {
          const weight = markerDistance(a, b)
          edges.push({ targetNodeId: targetMarkerId, weight })
        }
      }
    })

    adjacencyList[sourceId] = edges
  })

  return {
    nodes,
    adjacencyList,
  }
}

// Helper to find marker ID by coordinates (from marker map)
function findMarkerIdByLatLng(latLng: L.LatLng, markers: Map<string, L.Marker>): string | null {
  for (const [id, marker] of markers) {
    const mLatLng = marker.getLatLng()
    if (Math.abs(mLatLng.lat - latLng.lat) < 1e-8 && Math.abs(mLatLng.lng - latLng.lng) < 1e-8) {
      return id
    }
  }
  return null
}

function markerDistance(a: L.LatLng, b: L.LatLng): number {
  return a.distanceTo(b)
}


