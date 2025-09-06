/* eslint-disable @typescript-eslint/no-explicit-any */
import { toRaw, type Ref } from 'vue'
import L, { LayerGroup, Map, Marker } from 'leaflet'
import type { POI } from '@/types/poi'
import { generateId } from '@/utils/generateId'
import poiService from '@/services/poiService'

import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import {
  faRestroom,
  faChalkboardTeacher,
  faDesktop,
  faCircle,
} from '@fortawesome/free-solid-svg-icons'
import { useBuildings } from '@/stores/buildings'

export function usePoiEditor(
  map: Ref<Map | null>,
  poiLayer: LayerGroup,
  emit: (e: 'openOverlay', payload: { type: string; data: any; loading: boolean}) => void,
) {
  const buildingStore = useBuildings()

  // Instead of using the store inside helpers, accept IDs explicitly in API
  function createPOI(
    buildingId: string,
    floorId: string,
    name: string,
    latlng: [number, number],
    poiType?: string,
    poiId?: string,
  ): Marker {
    console.log('POI CREATED!')
    const id = poiId || generateId()
    const type = poiType || '-'
    const poiMarker = createPOIMarker(latlng, type, id, name, buildingId, floorId)
    poiMarker.addTo(toRaw(poiLayer))

    const floorNum = buildingStore.floorById(buildingId, floorId)?.floor as number
    // SAVE POI
    const newPOI: POI = {
      id: id,
      name: name,
      location: latlng,
      floor: floorNum,
      type: type,
      images: [],
      detail: '-',
    }
    addOrUpdatePOI(buildingId, floorId, newPOI)
    return poiMarker
  }

  async function loadPOIs(buildingId: string, floorId: string) {
    try {
      const loadedPOIs = await poiService.getPOIs(buildingId, floorId)
      loadedPOIs.forEach((p) => {
        createPOI(buildingId, floorId, p.name, p.location, p.type, p.id)
      })
    } catch (error) {
      console.log('Failed to load POIs:', error)
    }
  }

  function addOrUpdatePOI(buildingId: string, floorId: string, poi: POI) {
    poiService.addOrUpdatePOI(buildingId, floorId, poi)
  }

  function updatePOIPosition(
    buildingId: string,
    floorId: string,
    poiId: string,
    newLatLng: [number, number],
  ) {
    poiService.updatePOI(buildingId, floorId, poiId, newLatLng)
  }

  function clearPOIs() {
    poiLayer.clearLayers()
  }

  function createPOIMarker(
    latlng: [number, number],
    poiType: string,
    id: string,
    name: string,
    buildingId: string,
    floorId: string,
  ) {
    const iconDef = poiIconMap[poiType] || faCircle
    const svgIcon = createSvgIcon(iconDef)
    const color = poiColorMap[poiType] || '#FDA172'

    const icon = L.divIcon({
      className: 'custom-poi-icon',
      html: `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        color: white;
        font-weight: 600;
        font-size: 12px;
        user-select: none;
      ">
        <div style="
          background-color: ${color};
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
          box-shadow: 0 0 5px rgba(0,0,0,0.4);
        ">
          ${svgIcon}
        </div>
        <div style="margin-top: 2px; color: black; background: white; padding: 0 4px; border-radius: 3px; white-space: nowrap;">
          ${name ?? ''}
        </div>
      </div>
    `,
      iconSize: [36, 50],
      iconAnchor: [18, 50],
    })

    const poi = L.marker(latlng, {
      icon,
      title: id,
      draggable: true,
    })

    // 👇 no store dependency — just use params
    poi.on('dragend', async (e) => {
      const newLatLng = (e.target as L.Marker).getLatLng()
      try {
        await poiService.updatePOI(buildingId, floorId, id, [newLatLng.lat, newLatLng.lng])
        console.log(`POI ${id} updated`)
      } catch (error) {
        console.log('error patching new location', error)
      }
    })

    poi.on('click', () => {
      // 1️⃣ Emit immediately to open overlay
      emit('openOverlay', { type: 'POI', data: null, loading: true })

      // 2️⃣ Fetch data asynchronously
      poiService
        .getPOIById(buildingId, id)
        .then((poiData) => {
          emit('openOverlay', { type: 'POI', data: poiData, loading: false })
        })
        .catch((err) => {
          console.error('Failed to load POI', err)
          emit('openOverlay', { type: 'POI', data: null, loading: false })
        })
    })

    return poi
  }

  return {
    createPOI,
    loadPOIs,
    addOrUpdatePOI,
    updatePOIPosition,
    clearPOIs,
  }
}

// HELPER FUNCTIONS
const poiIconMap: Record<string, IconDefinition> = {
  Restroom: faRestroom,
  'Lecture Room': faChalkboardTeacher,
  'Computer Lab': faDesktop,
}

const poiColorMap: Record<string, string> = {
  Restroom: '#FF0000',
  'Lecture Room': '#00FF00',
  'Computer Lab': '#0000FF',
}

function createSvgIcon(icon: IconDefinition, size = 18, color = 'white') {
  const [width, height, , , svgPath] = icon.icon
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${size}" height="${size}" fill="${color}">
      <path d="${svgPath}" />
    </svg>
  `
}
