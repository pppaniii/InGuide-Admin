/* eslint-disable @typescript-eslint/no-explicit-any */
import { toRaw, type Ref } from 'vue'
import L, { LayerGroup, Map, Marker } from 'leaflet'
import { generateId } from '@/utils/generateId'
import beaconService from '@/services/beaconService'
import { useBeaconStore } from '@/stores/beacon'
import type { Beacon } from '@/types/beacon'

// Use a single icon/color for all beacons
import { faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'

export function useBeaconEditor(
  map: Ref<Map | null>,
  beaconLayer: LayerGroup,
  emit: (
    e: 'openOverlay',
    payload: { type: string; data: any; loading: boolean; buildingId: string; floorId: string },
  ) => void,
) {
  const beaconStore = useBeaconStore()

  function createBeacon(beacon: Beacon, buildingId: string, floorId: string): Marker {
    const id = beacon.beaconId || generateId()
    const beaconMarker = createBeaconMarker(beacon.latLng, id, buildingId, floorId, beacon.name)
    beaconMarker.addTo(toRaw(beaconLayer))

    const newBeacon: Beacon = {
      beaconId: id,
      name: beacon.name,
      latLng: beacon.latLng,
    }

    addOrUpdateBeacon(buildingId, floorId, newBeacon)
    return beaconMarker
  }

  async function loadBeacons(buildingId: string, floorId: string) {
    try {
      const loadedBeacons = await beaconService.getBeacons(buildingId, floorId)
      loadedBeacons.forEach((b) => {
        createBeacon(b, buildingId, floorId)
      })
      beaconStore.loadBeacons(loadedBeacons)
    } catch (error) {
      console.log('Failed to load beacons:', error)
    }
  }

  function addOrUpdateBeacon(buildingId: string, floorId: string, beacon: Beacon) {
    beaconService
      .addBeacon(buildingId, floorId, beacon)
      .then(() => {
        // remove old marker if exists
        beaconLayer.eachLayer((layer) => {
          if (layer instanceof L.Marker && layer.options.title === beacon.beaconId) {
            beaconLayer.removeLayer(layer)
          }
        })
        // re-add marker
        const updatedMarker = createBeaconMarker(beacon.latLng, beacon.beaconId, buildingId, floorId, beacon.name)
        updatedMarker.addTo(toRaw(beaconLayer))
        beaconStore.addOrUpdateBeacon(beacon)
        console.log(`Beacon ${beacon.beaconId} updated and re-rendered`)
      })
      .catch((err) => {
        console.error(`Failed to update beacon ${beacon.beaconId}`, err)
      })
  }

  function updateBeaconPosition(
    buildingId: string,
    floorId: string,
    beaconId: string,
    newLatLng: [number, number],
  ) {
    beaconService.updateBeacon(buildingId, floorId, beaconId, newLatLng)
  }

  function clearBeacons() {
    beaconLayer.clearLayers()
    beaconStore.clearBeacons()
  }

  function createBeaconMarker(
    latlng: [number, number],
    id: string,
    buildingId: string,
    floorId: string,
    name:string
  ) {
    const iconDef: IconDefinition = faMapMarkerAlt
    const svgIcon = createSvgIcon(iconDef)
    const color = '#9BD6EF'

    const icon = L.divIcon({
      className: 'custom-beacon-icon',
      html: `
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: ${color};
          border-radius: 50%;
          width: 28px;
          height: 28px;
          border: 2px solid white;
          box-shadow: 0 0 5px rgba(0,0,0,0.4);
        ">
          ${svgIcon}
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 28],
    })

    const beacon = L.marker(latlng, {
      icon,
      title: id,
      draggable: false,
    })

    beacon.on('dragend', async (e) => {
      const newLatLng = (e.target as L.Marker).getLatLng()
      try {
        await beaconService.updateBeacon(buildingId, floorId, id, [newLatLng.lat, newLatLng.lng])
        console.log(`Beacon ${id} updated`)
      } catch (error) {
        console.log('Error patching new beacon location', error)
      }
    })

    beacon.on('click', () => {
      emit('openOverlay', {
        type: 'BEACON',
        data: { beaconId: id, name: name, latLng: latlng },
        loading: false, // simpler, no extra fetch
        buildingId,
        floorId,
      })
    })

    return beacon
  }

  function removeBeacon(buildingId: string, floorId: string, beaconId: string) {
    beaconService
      .deleteBeacon(buildingId, floorId, beaconId)
      .then(() => {
        beaconLayer.eachLayer((layer) => {
          if (layer instanceof L.Marker && layer.options.title === beaconId) {
            beaconLayer.removeLayer(layer)
          }
        })
        beaconStore.deleteBeacon(beaconId)
        console.log(`Beacon ${beaconId} deleted successfully`)
      })
      .catch((err) => {
        console.error(`Failed to delete beacon ${beaconId}`, err)
      })
  }

  function updateBeaconDraggables(isDraggable: boolean) {
    beaconLayer.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        const dragging = layer.dragging as L.Handler
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        isDraggable ? dragging.enable() : dragging.disable()
      }
    })
  }

  async function findBlutoothDevice() {
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: "ESP32" }], // match multiple ESP32s (e.g., ESP32-1, ESP32-2)
        optionalServices: ['12345678-1234-1234-1234-1234567890ab']
      });

      console.log("Chosen Device Name:", device.name);
      console.log("Device ID:", device.id);

      const server = await device.gatt?.connect();
      console.log("Connected to:", device.name);

      return server
    } catch (error) {
      console.error("Error:", error);
    }
  }

  return {
    createBeacon,
    loadBeacons,
    addOrUpdateBeacon,
    updateBeaconPosition,
    clearBeacons,
    removeBeacon,
    updateBeaconDraggables,
    findBlutoothDevice,
  }
}

// helper
function createSvgIcon(icon: IconDefinition, size = 14, color = 'white') {
  const [width, height, , , svgPath] = icon.icon
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${size}" height="${size}" fill="${color}">
      <path d="${svgPath}" />
    </svg>
  `
}
