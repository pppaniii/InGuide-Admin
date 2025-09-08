import type { BuildingInfo } from '@/types/types'
import axios from 'axios'

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

async function listBuildings(): Promise<BuildingInfo[]> {
  try {
    const response = await httpClient.get('/buildings')
    return response.data
  } catch (err) {
    console.error('Cannot get building from the server...', err)
    throw err
  }
}

async function createBuilding(name: string) {
  try {
    const response = await httpClient.post('/buildings', {
      name: name,
    })
    const newBuilding = response.data.building
    return newBuilding
  } catch (err) {
    console.error('There is an error creating a building...', err)
    throw err
  }
}

async function deleteBuilding(id: string) {
  try {
    const response = await httpClient.delete(`/buildings/${id}`)
    return response.data
  } catch (err) {
    console.error('There is an error deleting a building...', err)
    throw err
  }
}

async function getBuilding(id: string): Promise<BuildingInfo> {
  try {
    const response = await httpClient.get(`/buildings/${id}`)
    return response.data
  } catch (err) {
    console.error('Cannot get building from the server...', err)
    throw err
  }
}

export default {
  listBuildings,
  createBuilding,
  deleteBuilding,
  getBuilding,
}
