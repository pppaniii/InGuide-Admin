<template>
  <div class="relative w-full h-full map-wrapper">
    <div ref="mapContainer" id="map" class="absolute inset-0"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, toRaw, watch } from 'vue'
import L, { Map, FeatureGroup, Marker } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Connection } from '@/types/types'
import pathServices from '@/services/pathService'
import { generateId } from '@/utils/generateId'

const mapContainer = ref<HTMLElement | null>(null)
const map = ref<Map | null>(null)
const drawnItems = new FeatureGroup()

const editorState = ref<'IDLE' | 'CONNECTING' | 'DELETING'>('IDLE')
const selectedNodeId = ref<string | null>(null)

// Graph data: nodeID → connected polylines
const connections: globalThis.Map<string, Connection[]> = new globalThis.Map()
// Map of nodeID → marker for easy access
const nodeMarkers: globalThis.Map<string, Marker> = new globalThis.Map()

const props = defineProps<{
  buildingId: string
  floorId: string
}>()

onMounted(async () => {
  map.value = L.map(toRaw(mapContainer.value) as HTMLElement, {
    center: [18.7996619, 98.950488],
    zoom: 18,
    zoomControl: false,
    attributionControl: false,
  })
  // toRaw(map.value)?.scrollWheelZoom.disable()
  toRaw(map.value)?.getContainer().style.setProperty('background-color', '#e0f7fa')
  toRaw(map.value)?.addLayer(drawnItems)

  // Click map
  toRaw(map.value)?.on('click', (event: L.LeafletMouseEvent) => {
    // If no nodes exist, place first node directly
    if (nodeMarkers.size === 0) {
      const firstNode = createNode(event.latlng)
      console.log(`First node added: ${firstNode.options.title}`)
      return
    }

    // Connecting mode: place new node connected to selected
    if (editorState.value === 'CONNECTING' && selectedNodeId.value) {
      const newNodeId = generateId()
      const newNode = createNode(event.latlng, newNodeId)

      const startMarker = nodeMarkers.get(selectedNodeId.value)!
      const polyline = L.polyline([startMarker.getLatLng(), newNode.getLatLng()], {
        color: '#f6df4f',
        weight: 15,
      }).addTo(drawnItems)

      // Add polyline to both nodes
      connections.get(selectedNodeId.value)?.push({ nodeId: newNodeId, polyline })
      connections.set(newNodeId, [{ nodeId: selectedNodeId.value, polyline }])

      console.log(`Node ${newNodeId} added and connected to ${selectedNodeId.value}.`)
      highlightNode(startMarker, false)
      selectedNodeId.value = null
      editorState.value = 'IDLE'
      // console.log(nodeMarkers)
      console.log(connections)
      console.log(pathServices.exportGraph(nodeMarkers, connections))
    }
  })

  // Click on existing nodes to select
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  drawnItems.on('click', (event: any) => {
    if (!(event.layer instanceof L.Marker)) return
    if (editorState.value !== 'CONNECTING') return

    const marker = event.layer as L.Marker
    const nodeId = marker.options.title as string

    if (!selectedNodeId.value) {
      selectedNodeId.value = nodeId
      highlightNode(marker, true)
      console.log(`Node selected: ${nodeId}. Click on map to place a connected node.`)
    }
  })
  // load Map
  await loadPath(props.buildingId, props.floorId)
})

watch(() => props.floorId, async (newFloorId, oldFloorId) => {
  if (!newFloorId) return

  pathServices.savePath(props.buildingId, oldFloorId, nodeMarkers, connections)

  // Clear existing markers & lines
  drawnItems.clearLayers()
  nodeMarkers.clear()
  connections.clear()

  await loadPath(props.buildingId, newFloorId)
})

onBeforeUnmount(() => {
  if (map.value) toRaw(map.value).remove()
})
// State control functions
function startConnecting() {
  editorState.value = 'CONNECTING'
  console.log('CONNECTING mode: select a node or click map to place first node.')
}
// MAIN FUNCTIONS
function createNode(latlng: L.LatLng, nodeId?: string) {
  const id = nodeId || generateId()
  const marker = L.marker(latlng, {
    draggable: true,
    title: id,
    icon: L.divIcon({
      className: 'custom-circle-node',
      html: '<div></div>', // empty div, style it with CSS
      iconSize: [20, 20],
    }),
  }).addTo(drawnItems)

  connections.set(id, [])
  nodeMarkers.set(id, marker)
  // Dragging updates all connected polylines (visual update)
  marker.on('drag', () => {
    const conns = connections.get(id) || []
    const newPos = marker.getLatLng()
    conns.forEach(({ nodeId: otherId, polyline }) => {
      const otherMarker = nodeMarkers.get(otherId)!
      polyline.setLatLngs([newPos, otherMarker.getLatLng()])
    })
  })

  return marker
}

function highlightNode(marker: L.Marker, highlight: boolean) {
  const icon = L.divIcon({
    className: highlight ? 'custom-circle-node selected' : 'custom-circle-node',
    html: '<div></div>',
    iconSize: [20, 20],
  })
  marker.setIcon(icon)
}

// EXPOSE FUNCTIONS TO PARENT COMPONENT
defineExpose({
  // This function allow user to create or connect path
  startConnecting,
})

// Assiting functions
async function loadPath(buildingId: string, floorId: string) {
  try {
    const loadedGraph = await pathServices.loadPath(buildingId, floorId)
    if (loadedGraph) {
      // 1. Create the markers and store them in nodeMarkers map
      loadedGraph.nodes.forEach((node) => {
        const marker = createNode(L.latLng(node.coordinates[0], node.coordinates[1]), node.id)
        nodeMarkers.set(node.id, marker)
      })

      // 2. Create the polylines and store them in the connections map
      loadedGraph.adjacencyList.forEach((edges, sourceId) => {
        edges.forEach((edge) => {
          const targetId = edge.targetNodeId
          if (sourceId < targetId) {
            // only draw once
            const startMarker = nodeMarkers.get(sourceId)
            const endMarker = nodeMarkers.get(targetId)
            if (startMarker && endMarker) {
              const polyline = L.polyline([startMarker.getLatLng(), endMarker.getLatLng()], {
                color: '#f6df4f', // yellow
                weight: 15,
              }).addTo(drawnItems)

              if (!connections.has(sourceId)) connections.set(sourceId, [])
              connections.get(sourceId)?.push({ nodeId: targetId, polyline })

              if (!connections.has(targetId)) connections.set(targetId, [])
              connections.get(targetId)?.push({ nodeId: sourceId, polyline })
            }
          }
        })
      })
      console.log('Path data loaded successfully!')
    }
  } catch (error) {
    console.error('Failed to load path data:', error)
  }
}
</script>

<style>
#map {
  height: 100%;
  width: 100%;
}

.map-wrapper {
  overflow: hidden;
}

.custom-circle-node div {
  width: 20px;
  height: 20px;
  border-radius: 50%; /* makes it circular */
  background-color: #51854e;
  border: 2px solid #fffbf3;
}

.custom-circle-node.selected div {
  background-color: #e8a34f;
}
</style>
