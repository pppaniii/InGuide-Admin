import type { Floor } from '@/types/types'
import axios from 'axios'

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

async function addFloorPlan(floor: Floor, buildingId: string) {
  try {
    const response = await httpClient.post(`/buildings/${buildingId}/floors`, floor)
    return response.data
  } catch (error) {
    console.error('There is an error adding a floor T-T', error)
  }
}

async function removeFloorPlan(floorId: string, buildingId: string) {
  try {
    const response = await httpClient.delete(`/buildings/${buildingId}/floors/${floorId}`)
    return response.data
  } catch (error) {
    console.error('There is an error removing a floor T-T', error)
  }
}

async function updateFloorPlan(floorId: string, imgUrl: string, buildingId: string) {
  try {
    const response = await httpClient.patch(`/buildings/${buildingId}/floors/${floorId}`, {
      "floor_plan_url": imgUrl
    })
    return response.data
  } catch (error) {
    console.error('There is an error removing a floor T-T', error)
  }
}

export default {
  addFloorPlan,
  removeFloorPlan,
  updateFloorPlan,
}
