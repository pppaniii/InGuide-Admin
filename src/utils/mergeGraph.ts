import type { JSONNavigationGraph, MapEdge, MapNode, NavigationGraph } from '@/types/path'
import type { POI } from '@/types/poi'

/**
 * Helper: calculate Euclidean distance between two points
 */
function distance(a: [number, number], b: [number, number]): number {
  const dx = a[0] - b[0]
  const dy = a[1] - b[1]
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Helper: project a point onto a line segment (edge)
 * Returns the closest point on the segment to the POI and a fraction t (0..1)
 */
function projectPointOnEdge(
  point: [number, number],
  start: [number, number],
  end: [number, number],
): { projected: [number, number]; t: number } {
  const vx = end[0] - start[0]
  const vy = end[1] - start[1]
  const wx = point[0] - start[0]
  const wy = point[1] - start[1]

  const lenSquared = vx * vx + vy * vy
  if (lenSquared === 0) return { projected: start, t: 0 }

  let t = (wx * vx + wy * vy) / lenSquared
  t = Math.max(0, Math.min(1, t)) // clamp between 0 and 1
  return { projected: [start[0] + t * vx, start[1] + t * vy], t }
}

/**
 * Merge POIs into an admin graph to create a navigation graph
 */
export function mergePOIsIntoGraph(adminGraph: NavigationGraph, pois: POI[]): JSONNavigationGraph {
  // 1. Copy nodes and adjacency list
  const nodes = new Map<string, MapNode>()
  const adjacencyList = new Map<string, MapEdge[]>()

  for (const [id, node] of adminGraph.nodes.entries()) {
    nodes.set(id, { ...node })
    adjacencyList.set(id, [...(adminGraph.adjacencyList.get(id) || [])])
  }

  // 2. For each POI, find nearest edge
  for (const poi of pois) {
    let closestEdge: {
      fromId: string
      toId: string
      distance: number
      t: number
      projected: [number, number]
    } | null = null

    for (const [fromId, edges] of adjacencyList.entries()) {
      const fromNode = nodes.get(fromId)!
      for (const edge of edges) {
        const toNode = nodes.get(edge.targetNodeId)!
        const { projected, t } = projectPointOnEdge(
          poi.location,
          fromNode.coordinates,
          toNode.coordinates,
        )
        const d = distance(poi.location, projected)

        if (!closestEdge || d < closestEdge.distance) {
          closestEdge = { fromId, toId: toNode.id, distance: d, t, projected }
        }
      }
    }

    if (!closestEdge) continue

    // 3. Insert POI as a new node
    const poiNodeId = `${poi.id}`
    const poiNode: MapNode = {
      id: poiNodeId,
      coordinates: closestEdge.projected,
      isPOI: true,
    }
    nodes.set(poiNodeId, poiNode)

    // 4. Split edge: remove original edge and its reciprocal, then add two new edges
    // Remove the edge from the original 'from' node to the 'to' node
    const edgesFrom = adjacencyList.get(closestEdge.fromId)!
    const edgeIndexFrom = edgesFrom.findIndex((e) => e.targetNodeId === closestEdge.toId)
    if (edgeIndexFrom >= 0) edgesFrom.splice(edgeIndexFrom, 1)

    // Remove the reciprocal edge from the original 'to' node to the 'from' node
    const edgesTo = adjacencyList.get(closestEdge.toId)!
    const edgeIndexTo = edgesTo.findIndex((e) => e.targetNodeId === closestEdge.fromId)
    if (edgeIndexTo >= 0) edgesTo.splice(edgeIndexTo, 1)

    // 5. Add new edges for the two new path segments (in both directions)
    const fromNode = nodes.get(closestEdge.fromId)!
    const toNode = nodes.get(closestEdge.toId)!
    const weight1 = distance(fromNode.coordinates, poiNode.coordinates)
    const weight2 = distance(poiNode.coordinates, toNode.coordinates)

    // Add new edge: from -> poi
    edgesFrom.push({ targetNodeId: poiNodeId, weight: weight1 })
    // Add reciprocal edge: poi -> from
    if (!adjacencyList.has(poiNodeId)) adjacencyList.set(poiNodeId, [])
    adjacencyList.get(poiNodeId)!.push({ targetNodeId: fromNode.id, weight: weight1 })

    // Add new edge: poi -> to
    adjacencyList.get(poiNodeId)!.push({ targetNodeId: toNode.id, weight: weight2 })
    // Add reciprocal edge: to -> poi
    edgesTo.push({ targetNodeId: poiNodeId, weight: weight2 })
  }
  // 6. Convert Map to JSON-friendly format
  return {
    nodes: Array.from(nodes.values()),
    adjacencyList: Object.fromEntries(adjacencyList.entries()),
  }
}
