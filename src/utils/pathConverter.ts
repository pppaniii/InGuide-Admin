import type { MapNode, MapEdge, NavigationGraph, JSONNavigationGraph } from '@/types/path'
import type { Marker } from 'leaflet'

export function convertEditorToGraph(
  nodeMarkers: Map<string, Marker>,
  connections: Map<string, { nodeId: string; polyline: L.Polyline }[]>
): NavigationGraph {
  const nodes: Map<string, MapNode> = new Map()
  const adjacencyList: Map<string, MapEdge[]> = new Map()

  // Convert nodes
  nodeMarkers.forEach((marker, id) => {
    const latlng = marker.getLatLng()
    nodes.set(id, {
      id,
      coordinates: [latlng.lat, latlng.lng],
      // you could add flags here later: isPOI, isIntersection, isStair, etc.
    })
  })

  // Convert edges
  connections.forEach((edges, sourceId) => {
    const edgeList: MapEdge[] = edges.map(({ nodeId, polyline }) => {
      const latlngs = polyline.getLatLngs() as L.LatLng[]
      const weight = latlngs[0].distanceTo(latlngs[1]) // Euclidean distance
      return { targetNodeId: nodeId, weight }
    })
    adjacencyList.set(sourceId, edgeList)
  })

  return { nodes, adjacencyList }
}

export function graphToJSON(graph: NavigationGraph): JSONNavigationGraph {
  return {
    nodes: Array.from(graph.nodes.values()),
    adjacencyList: Object.fromEntries(graph.adjacencyList),
  }
}

export function jsonToGraph(json: JSONNavigationGraph): NavigationGraph {
  return {
    nodes: new Map(json.nodes.map(node => [node.id, node])),
    adjacencyList: new Map(Object.entries(json.adjacencyList)),
  }
}

