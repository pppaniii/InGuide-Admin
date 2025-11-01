import type { MapNode, MapEdge, JSONNavigationGraph, NavigationGraph } from '@/types/path'
import type { Connection } from '@/types/types'
import { exportGraph } from '@/utils/exportGraph'
import axios from 'axios'
import L from 'leaflet'

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

async function loadPath(buildingId: string, floorId: string): Promise<NavigationGraph> {
  try {
    const response = await httpClient.get(`/paths/${buildingId}/${floorId}`)
    const pathData: JSONNavigationGraph = response.data

    // Use a Map for efficient lookups when building the graph
    const nodesMap = new Map<string, MapNode>()
    pathData.nodes.forEach((node) => {
      nodesMap.set(node.id, node)
    })

    // Rebuild the adjacency list using Map
    const adjacencyListMap = new Map<string, MapEdge[]>()
    for (const sourceId in pathData.adjacencyList) {
      if (pathData.adjacencyList.hasOwnProperty(sourceId)) {
        adjacencyListMap.set(sourceId, pathData.adjacencyList[sourceId])
      }
    }

    // Now, return the object that matches the NavigationGraph interface
    return {
      nodes: nodesMap,
      adjacencyList: adjacencyListMap,
    }
  } catch (err) {
    console.error('Error loading path data:', err)
    throw err
  }
}

async function savePath(
  buildingId: string,
  floorId: string,
  markers: Map<string, L.Marker>,
  conns: Map<string, Connection[]>,
) {
  try {
    const JSONPaths = exportGraph(markers, conns)
    console.log("Path Save", JSONPaths)
    const response = await httpClient.post(`/paths/save/${buildingId}/${floorId}`, JSONPaths)
    const newBuilding = response.data.building
    return newBuilding
  } catch (err) {
    console.error('There is an error saving a path...', err)
    throw err
  }
}

export default {
  loadPath,
  savePath,
}


