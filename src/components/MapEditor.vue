<template>
  <button @click="connectOrAddNode"> BTN </button>
  <div class="relative w-full h-full map-wrapper">
    <div ref="mapContainer" id="map" class="absolute inset-0"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, toRaw } from 'vue'
import L, { Map, FeatureGroup } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'
import 'leaflet-draw'
import 'leaflet-snap'

// Fix Leaflet.Draw bug: expects `type` global
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).type = true

const mapContainer = ref<HTMLElement | null>(null)
const map = ref<Map | null>(null)
const drawnItems = new FeatureGroup()

const editorState = ref<'IDLE' | 'PLACING_NODE' | 'CONNECTING_NODES'>('IDLE')
const selectedNodeLayer = ref<L.Marker | null>(null)

let nextNodeId = 1

onMounted(() => {
  map.value = L.map(toRaw(mapContainer.value) as HTMLElement, {
    center: [0, 0],
    zoom: 18,
    zoomControl: false,
    attributionControl: false,
  })

  toRaw(map.value)?.getContainer().style.setProperty('background-color', '#e0f7fa')

  toRaw(map.value)?.touchZoom.disable()
  toRaw(map.value)?.doubleClickZoom.disable()
  toRaw(map.value)?.scrollWheelZoom.disable()
  toRaw(map.value)?.boxZoom.disable()
  toRaw(map.value)?.keyboard.disable()

  toRaw(map.value)?.createPane('userPane')

  const originPin = L.icon({
    iconUrl: 'static/images/home.png',
    iconSize: [50, 50],
    iconAnchor: [25, 25],
  })
  L.marker([0, 0], { icon: originPin }).addTo(toRaw(map.value)! as L.Map)

  L.circleMarker([0, 0], {
    radius: 10,
    fillColor: '#278cea',
    color: '#fffbf3',
    weight: 2,
    opacity: 1,
    fillOpacity: 1,
    pane: 'userPane',
  }).addTo(toRaw(map.value) as L.Map)

  toRaw(map.value)?.addLayer(drawnItems)

  toRaw(map.value)?.on('click', (event: L.LeafletMouseEvent) => {
    if (editorState.value === 'PLACING_NODE') {
      const newNode = L.marker(event.latlng, { draggable: true }).addTo(drawnItems)
      // You can add a unique ID to the marker here
      // newNode.nodeId = nextNodeId++;

      // Reset state and selection after placing the node
      editorState.value = 'IDLE'
      selectedNodeLayer.value = null
    } else if (editorState.value === 'CONNECTING_NODES' && selectedNodeLayer.value) {
      const newNode = L.marker(event.latlng, { draggable: true }).addTo(drawnItems)
      // newNode.nodeId = nextNodeId++;

      const polyline = L.polyline([selectedNodeLayer.value.getLatLng(), newNode.getLatLng()]).addTo(drawnItems)

      // Reset state and selection after connecting
      editorState.value = 'IDLE'
      selectedNodeLayer.value = null
    }
  })

  drawnItems.on('click', (event: any) => {
    if (event.layer instanceof L.Marker) {
      if (editorState.value === 'IDLE' || editorState.value === 'CONNECTING_NODES') {
        if (selectedNodeLayer.value) {
          // You would need to change the icon back to a default state here
        }

        selectedNodeLayer.value = event.layer
        editorState.value = 'CONNECTING_NODES'

        console.log('Node selected for connection')
      }
    }
  })
})

onBeforeUnmount(() => {
  if (map.value) toRaw(map.value).remove()
})

function connectOrAddNode() {
  if (drawnItems.getLayers().length > 0) {
    editorState.value = 'CONNECTING_NODES';
    console.log("State: CONNECTING_NODES. Click a node to select it.");
  } else {
    editorState.value = 'PLACING_NODE';
    console.log("State: PLACING_NODE. No nodes exist. Click anywhere to create the first one.");
  }
}

defineExpose({
  connectOrAddNode,
})
</script>

<style>
#map {
  height: 100%;
  width: 100%;
}
.map-wrapper {
  overflow: hidden;
}
</style>
