import axios from 'axios'
import type { POI } from '@/types/poi';

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Request a list of POIs on a specific floor and building.
 * @param buildingId object id of the building.
 * @param floorId specify a floor of this building to retrieve POIs.
 * @returns A Promise that resolves to the list of POIs on the selected floor of the building.
 */
async function getPOIs(buildingId: string, floorId: string): Promise<POI[]> {
  try {
    const response = await httpClient.get(`/POIs/${buildingId}/${floorId}`);

    return response.data;
  } catch (err) {
    console.error(`Error getting POIs on floor ${floorId}...`, err);
    throw err;
  }
}

/**
 * Request a list of POIs on a specific floor and building.
 * @param buildingId object id of the building.
 * @param poiId specify target POI id .
 * @returns A Promise that resolves to the selected POI of the building.
 */
async function getPOIById(buildingId: string, poiId: string) {
  try {
    const response = await httpClient.get(`/POIs/POI_info/${buildingId}/${poiId}`);

    return response.data;
  } catch (err) {
    console.error(`Error getting POI id: ${poiId}...`, err);
    throw err;
  }
}

/**
 * Save a list of POIs on a specific floor and building.
 * @param buildingId object id of the building.
 * @param poiId specify target POI id.
 * @param POIs list of new POIs.
 * @returns A Promise that resolves to the selected POI of the building.
 */
async function savePOIs(buildingId: string, floorId: string, POIs: POI[]){
  try {
    const response = await httpClient.post(`/POIs/POI_info/${buildingId}/${floorId}`, {
      "pois": POIs
    });

    return response.data;
  } catch (err) {
    console.error('Error saving POI...', err);
    throw err;
  }
}


/**
 * Update a POI on a specific floor and building.
 * @param buildingId object id of the building.
* @param floorId specify a floor of this building to retrieve POIs.
 * @param poiId specify target POI id.
 * @param newLatLan new location.
 * @returns A Promise that resolves to the selected POI of the building.
 */
async function updatePOI(buildingId: string, floorId: string, poiId: string, newLatLng: [number, number]){
  try {
    const response = await httpClient.patch(`/POIs/${buildingId}/${floorId}/${poiId}`, {
      location: newLatLng
    });

    return response.data;
  } catch (err) {
    console.error('Error saving POI...', err);
    throw err;
  }
}

export default {
  getPOIs,
  getPOIById,
  savePOIs,
  updatePOI,
}
