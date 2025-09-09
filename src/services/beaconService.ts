// src/services/beaconService.ts
import axios from 'axios'
import type { Beacon } from '@/types/beacon'

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

async function getBeacons(buildingId: string, floorId: string): Promise<Beacon[]> {
  try {
    const response = await httpClient.get(`/beacon/${buildingId}/${floorId}`)
    return response.data
  } catch (err) {
    console.error(`Error getting beacons on floor ${floorId}...`, err)
    throw err
  }
}

async function addBeacon(buildingId: string, floorId: string, beacon: Beacon) {
  try {
    const response = await httpClient.post(`/beacon/${buildingId}/${floorId}`, beacon)
    return response.data
  } catch (err) {
    console.error('Error saving beacon...', err)
    throw err
  }
}

async function updateBeacon(buildingId: string, floorId: string, beaconId: string, newLatLng: [number, number]) {
  try {
    const response = await httpClient.patch(`/beacon/${buildingId}/${floorId}/${beaconId}`, {
      latLng: newLatLng,
    })
    return response.data
  } catch (err) {
    console.error('Error updating beacon...', err)
    throw err
  }
}

async function deleteBeacon(buildingId: string, floorId: string, beaconId: string) {
  try {
    const response = await httpClient.delete(`/beacon/${buildingId}/${floorId}/${beaconId}`)
    return response.data
  } catch (err) {
    console.error('Error deleting beacon...', err)
    throw err
  }
}

export default {
  getBeacons,
  addBeacon,
  updateBeacon,
  deleteBeacon,
}
