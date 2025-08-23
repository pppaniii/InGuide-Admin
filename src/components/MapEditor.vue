<template>
  <div class="relative w-full h-full map-wrapper">
    <div ref="mapContainer" id="map" class="absolute inset-0"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, toRaw } from 'vue'
import L, { Map, FeatureGroup, Rectangle } from 'leaflet'
import 'leaflet-draw'

const mapContainer = ref<HTMLElement | null>(null)
const map = ref<Map | null>(null)
const drawnItems = new FeatureGroup()
let circleMarker: L.CircleMarker
let editHandler: L.EditToolbar.Edit | null = null
let intervalId: any = null

// Convert meters to degrees
const metersToDegrees = 1 / 111320

onMounted(() => {
  // Initialize the map
  map.value = L.map(toRaw(mapContainer.value) as HTMLElement, {
    center: [0, 0],
    zoom: 18,
    zoomControl: false,
    attributionControl: false,
  })

  // Set background color (no tiles)
  toRaw(map.value)?.getContainer().style.setProperty('background-color', '#e0f7fa')

  // Disable interactions
  toRaw(map.value)?.touchZoom.disable()
  toRaw(map.value)?.doubleClickZoom.disable()
  toRaw(map.value)?.scrollWheelZoom.disable()
  toRaw(map.value)?.boxZoom.disable()
  toRaw(map.value)?.keyboard.disable()

  // User pane (for marker layering)
  toRaw(map.value)?.createPane('userPane')

  // Add origin pin
  const originPin = L.icon({
    iconUrl: 'static/images/home.png',
    iconSize: [50, 50],
    iconAnchor: [25, 25]
  })
  L.marker([0, 0], { icon: originPin }).addTo(toRaw(map.value)!)

  // Add circle marker
  circleMarker = L.circleMarker([0, 0], {
    radius: 10,
    fillColor: "#278cea",
    color: "#fffbf3",
    weight: 2,
    opacity: 1,
    fillOpacity: 1,
    pane: 'userPane'
  }).addTo(toRaw(map.value) as L.Map)

  // Add drawn items + draw control
  toRaw(map.value)?.addLayer(drawnItems)

  const drawControl = new L.Control.Draw({
    edit: { featureGroup: drawnItems },
    draw: {
      rectangle: { shapeOptions: { color: '#da4f4f', weight: 2 } },
      polygon: false,
      polyline: false,
      circle: false,
      marker: false,
      circlemarker: false
    }
  })

  toRaw(map.value)?.on(L.Draw.Event.CREATED, (event: any) => {
    const layer = event.layer
    drawnItems.addLayer(layer)
  })

  editHandler = new L.EditToolbar.Edit(toRaw(map.value)!, {
    featureGroup: drawnItems
  })
})

// Cleanup
onBeforeUnmount(() => {
  clearInterval(intervalId)
  if (map.value) toRaw(map.value).remove()
})

// ========== METHODS ==========
function setToCurrentLocation() {
  toRaw(map.value)?.flyTo(circleMarker.getLatLng(), 18)
}

function setToOriginPoint() {
  toRaw(map.value)?.flyTo([0, 0], 18)
}

function toggleEditMode() {
  if (editHandler?.enabled) {
    editHandler.disable()
  } else {
    editHandler?.enable()
  }
}

function setForbiddenZone() {
  new L.Draw.Rectangle(toRaw(map.value)!, { shapeOptions: { color: '#da4f4f', weight: 2 } }).enable()
}

function cancelAction() {
  if (confirm("Are you sure you want to delete all forbidden zones?")) {
    drawnItems.clearLayers()
  }
}


</script>

<style>
#map {
  height: 100%;
  width: 100%;
}

.overlay button {
  display: block;
  margin: 5px 0;
  padding: 10px;
  width: 100%;
  border: none;
  background: #0078A8;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}

.overlay button:hover {
  background: #005f8a;
}

.map-wrapper {
  overflow: hidden;
}
</style>
