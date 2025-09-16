import type { JSONNavigationGraph } from '@/types/path'
import axios from 'axios'

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

async function saveNavigationGraph(buildingId: string, floorId: string, graph: JSONNavigationGraph) {
  try {
    const response = await httpClient.post(`/navigations/${ buildingId }/${ floorId }`, graph)
    // console.log("Saved nav graph ", response.data)
    return response.data
  } catch (error) {
    console.error('Error loading path data:', error)
    throw error
  }
}

export default {
  saveNavigationGraph,
}
