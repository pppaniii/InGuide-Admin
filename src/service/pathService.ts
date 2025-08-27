import type { MapNode, MapEdge, JSONNavigationGraph, NavigationGraph } from "@/types/path";
import type { Connection } from '@/types/types'
import axios from 'axios'
import L from "leaflet";

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

async function loadPath(buildingId: string, floorId: string): Promise<NavigationGraph> {
  try {
    const response = await httpClient.get(`/paths/${buildingId}/${floorId}`);
    const pathData: JSONNavigationGraph = response.data;

    // Use a Map for efficient lookups when building the graph
    const nodesMap = new Map<string, MapNode>();
    pathData.nodes.forEach(node => {
      nodesMap.set(node.id, node);
    });

    // Rebuild the adjacency list using Map
    const adjacencyListMap = new Map<string, MapEdge[]>();
    for (const sourceId in pathData.adjacencyList) {
      if (pathData.adjacencyList.hasOwnProperty(sourceId)) {
        adjacencyListMap.set(sourceId, pathData.adjacencyList[sourceId]);
      }
    }

    // Now, return the object that matches the NavigationGraph interface
    return {
      nodes: nodesMap,
      adjacencyList: adjacencyListMap
    };
  } catch (err) {
    console.error('Error loading path data:', err);
    throw err;
  }
}

async function savePath(buildingId: string, floorId: string, markers: Map<string, L.Marker>, conns: Map<string, Connection[]>) {
  try {
    const JSONPaths = exportGraph(markers, conns)
    const response = await httpClient.post(`/paths/${ buildingId }/${ floorId }`, JSONPaths)
    const newBuilding = response.data.building
    return newBuilding
  } catch (err) {
    console.error('There is an error creating a building...', err)
    throw err
  }
}


export default{
  loadPath,
  savePath
}


function exportGraph(markers: Map<string, L.Marker>, conns: Map<string, Connection[]>): JSONNavigationGraph {
  // Convert markers to plain JSON nodes
  const nodes: MapNode[] = [];
  markers.forEach((marker, id) => {
    const latLng = marker.getLatLng();
    nodes.push({
      id,
      coordinates: [latLng.lat, latLng.lng]
    });
  });

  // Convert connections to plain JSON adjacency list
  const adjacencyList: Record<string, MapEdge[]> = {};
  conns.forEach((lines, sourceId) => {
    const edges: MapEdge[] = [];

    lines.forEach(line => {
      const latLngs = line.polyline.getLatLngs() as L.LatLng[];
      if (latLngs.length === 2) {
        const targetMarkerId = findMarkerIdByLatLng(latLngs[1], markers);
        if (targetMarkerId) {
          const weight = markerDistance(latLngs[0], latLngs[1]);
          edges.push({ targetNodeId: targetMarkerId, weight });
        }
      }
    });

    adjacencyList[sourceId] = edges;
  });

  return {
    nodes,
    adjacencyList
  };
}

// Helper to find marker ID by coordinates (from marker map)
function findMarkerIdByLatLng(latLng: L.LatLng, markers: Map<string, L.Marker>): string | null {
  for (const [id, marker] of markers) {
    const mLatLng = marker.getLatLng();
    if (Math.abs(mLatLng.lat - latLng.lat) < 1e-8 && Math.abs(mLatLng.lng - latLng.lng) < 1e-8) {
      return id;
    }
  }
  return null;
}

function markerDistance(a: L.LatLng, b: L.LatLng): number {
  return a.distanceTo(b);
}

