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
import { usePOIStore } from '@/stores/pois'

export function usePoiEditor(
  map: Ref<Map | null>,
  poiLayer: LayerGroup,
  emit: (
    e: 'openOverlay',
    payload: { type: string; data: any; loading: boolean; buildingId: string; floorId: string },
  ) => void,
) {
  const buildingStore = useBuildings()
  const poisStore = usePOIStore()

  // Instead of using the store inside helpers, accept IDs explicitly in API
  function createPOI(poi: POI, buildingId: string, floorId: string): Marker {
    console.log('POI CREATED!')
    const id = poi.id || generateId()
    const type = poi.type || '-'
    const poiMarker = createPOIMarker(poi.location, type, id, poi.name, buildingId, floorId)
    poiMarker.addTo(toRaw(poiLayer))

    const floorNum = buildingStore.floorById(buildingId, floorId)?.floor as number
    // SAVE POI
    const newPOI: POI = {
      id: id,
      name: poi.name,
      location: poi.location,
      floor: floorNum,
      type: type,
      images: poi.images,
      detail: poi.detail,
      recommended: poi.recommended ?? false,
    }
    addOrUpdatePOI(buildingId, floorId, newPOI)
    return poiMarker
  }

  async function loadPOIs(buildingId: string, floorId: string) {
    try {
      const loadedPOIs = await poiService.getPOIs(buildingId, floorId)
      loadedPOIs.forEach((p) => {
        createPOI(p, buildingId, floorId)
      })
      poisStore.loadPOIs(loadedPOIs)
    } catch (error) {
      console.log('Failed to load POIs:', error)
    }
  }

  function addOrUpdatePOI(buildingId: string, floorId: string, poi: POI) {
    poiService
      .addOrUpdatePOI(buildingId, floorId, poi)
      .then(() => {
        poiLayer.eachLayer((layer) => {
          if (layer instanceof L.Marker && layer.options.title === poi.id) {
            poiLayer.removeLayer(layer)
          }
        })
        const updatedMarker = createPOIMarker(
          poi.location,
          poi.type,
          poi.id,
          poi.name,
          buildingId,
          floorId,
        )
        updatedMarker.addTo(toRaw(poiLayer))
        poisStore.addOrUpdatePOI(poi)
        console.log(`POI ${poi.id} updated and re-rendered`)
      })
      .catch((err) => {
        console.error(`Failed to update POI ${poi.id}`, err)
      })
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
    poisStore.clearPOIs()
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
    const color = poiColorMap[poiType] || '#A3C4A8'

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
      emit('openOverlay', {
        type: 'POI',
        data: null,
        loading: true,
        buildingId: buildingId,
        floorId: floorId,
      })

      // 2️⃣ Fetch data asynchronously
      poiService
        .getPOIById(buildingId, id)
        .then((poiData) => {
          emit('openOverlay', {
            type: 'POI',
            data: poiData as POI,
            loading: false,
            buildingId: buildingId,
            floorId: floorId,
          })
        })
        .catch((err) => {
          console.error('Failed to load POI', err)
          emit('openOverlay', {
            type: 'POI',
            data: null,
            loading: false,
            buildingId: buildingId,
            floorId: floorId,
          })
        })
    })

    return poi
  }

  function removePOI(buildingId: string, floorId: string, poiId: string) {
    poiService
      .deletePOI(buildingId, floorId, poiId)
      .then(() => {
        poiLayer.eachLayer((layer) => {
          if (layer instanceof L.Marker && layer.options.title === poiId) {
            poiLayer.removeLayer(layer)
          }
        })
        poisStore.deletePOI(poiId)
        console.log(`POI ${poiId} deleted successfully`)
      })
      .catch((err) => {
        console.error(`Failed to delete POI ${poiId}`, err)
      })
  }

function updatePOIDraggables(isDraggable: boolean) {
  poiLayer.eachLayer((layer) => {
    if (layer instanceof L.Marker) {
      const dragging = layer.dragging as L.Handler
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      isDraggable ? dragging.enable() : dragging.disable()
    }
  })
}


  return {
    createPOI,
    loadPOIs,
    addOrUpdatePOI,
    updatePOIPosition,
    clearPOIs,
    removePOI,
    updatePOIDraggables,
    poisStore,
  }
}

// HELPER FUNCTIONS
const poiIconMap: Record<string, IconDefinition> = {
  Restroom: faRestroom,
  'Lecture Room': faChalkboardTeacher,
  'Computer Lab': faDesktop,
}

const poiColorMap: Record<string, string> = {
  Restroom: '#B39B4C',
  'Lecture Room': '#708CC2',
  'Computer Lab': '#7866A3',
}

function createSvgIcon(icon: IconDefinition, size = 18, color = 'white') {
  const [width, height, , , svgPath] = icon.icon
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${size}" height="${size}" fill="${color}">
      <path d="${svgPath}" />
    </svg>
  `
}
