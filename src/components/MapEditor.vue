<template>
  <div class="relative w-full h-full map-wrapper">
    <div ref="mapContainer" id="map" class="absolute inset-0"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, toRaw, watch, type Ref } from 'vue'
import L, { Map, FeatureGroup, LayerGroup } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { usePathEditor } from '@/composables/usePathEditor'
import type { BuildingInfo } from '@/types/types'
import { usePoiEditor } from '@/composables/usePOIEditor'
import type { POI } from '@/types/poi'
import { generateId } from '@/utils/generateId'

type EditorMode = 'PATH' | 'POI' | 'IDLE' | 'BEACON' | 'FLOOR'
const editorMode = ref<EditorMode>('IDLE')

type EditorState = 'IDLE' | 'CONNECTING' | 'DELETING' | 'CREATING'
const editorState = ref<EditorState>('IDLE')
const selectedNodeId = ref<string | null>(null)

const mapContainer = ref<HTMLElement | null>(null)
const map = ref<Map | null>(null)
const floorOverlay = ref<L.ImageOverlay | null>(null)
const drawnItems = new FeatureGroup()
const poiLayer = new LayerGroup()

const props = defineProps<{
  building: BuildingInfo | null
  floorId: string | null
}>()
const emit = defineEmits<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (e: 'openOverlay', payload: { type: string; data: any; loading: boolean, buildingId: string, floorId: string}): void
}>()

const buildingBound = ref<[number, number][]>([])

// Import Path Editor composable
const {
  nodeMarkers,
  connections,
  createNode,
  connectNodes,
  highlightNode,
  deleteNode,
  loadPath,
  savePath,
  clearPath,
  pathSetNodeVisibility,
} = usePathEditor(map as Ref, drawnItems)

const {
  createPOI,
  loadPOIs,
  addOrUpdatePOI,
  updatePOIPosition,
  clearPOIs,
  removePOI
} = usePoiEditor(map as Ref, poiLayer, emit)

onMounted(async () => {
  // Init Map
  map.value = L.map(toRaw(mapContainer.value) as HTMLElement, {
    center: props.building?.NE_bound,
    zoom: 18,
    zoomControl: false,
    attributionControl: false,
  })
  toRaw(map.value)?.getContainer().style.setProperty('background-color', '#e0f7fa')
  toRaw(map.value)?.addLayer(drawnItems)
  toRaw(map.value)?.addLayer(poiLayer)
  buildingBound.value = [props.building?.SW_bound, props.building?.NE_bound] as [number, number][]
  console.log(buildingBound.value)

  // Click map to create/connect nodes
  toRaw(map.value)?.on('click', async (event: L.LeafletMouseEvent) => {
    if (editorMode.value === 'PATH') {
      if (editorState.value === 'CONNECTING') {
        // First node
        if (nodeMarkers.size === 0) {
          const firstNode = createNode(event.latlng)
          selectedNodeId.value = firstNode.options.title as string
          highlightNode(firstNode, true)
          return
        }

        // Connect to existing selected node
        if (selectedNodeId.value) {
          const newNodeId = connectNodes(selectedNodeId.value, event.latlng)
          highlightNode(nodeMarkers.get(selectedNodeId.value)!, false)
          selectedNodeId.value = null
          editorState.value = 'IDLE'

          console.log(`Node ${newNodeId} created and connected.`)
          console.log(connections)
        }
      }
    }

    if (editorMode.value === 'POI') {
      if (editorState.value === 'CREATING'){
        const latLng = event.latlng
        const newLatLng = [latLng.lat, latLng.lng] as [number, number]
        const buildingId = props.building?.id as string
        const floorId = props.floorId as string
        const name = await prompt("Enter New Point of Interest Name 👇", "new POI") as string
        const newPoi: POI = {
          id: generateId(),
          name: name,
          location: newLatLng,
          floor: 0,
          type: '-',
          images: [],
          detail: ''
        }
        createPOI(newPoi, buildingId,floorId)
        editorState.value = 'IDLE' 
        console.log(`Editor state is now ${ editorState.value }`)
      }
    }
  })

  // Handle click on existing nodes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  drawnItems.on('click', (event: any) => {
    if (!(event.layer instanceof L.Marker)) return

    if (editorState.value === 'CONNECTING') {
      const nodeId = event.layer.options.title as string
      if (!selectedNodeId.value) {
        selectedNodeId.value = nodeId
        highlightNode(event.layer, true)
        console.log(`Selected node ${nodeId}, click map to connect.`)
      }
    }

    if (editorState.value === 'DELETING') {
      const nodeId = event.layer.options.title as string
      const success = deleteNode(nodeId)
      console.log(success ? `Node ${nodeId} deleted.` : `Node ${nodeId} cannot be deleted.`)
    }
  })
})

// Watch for floor change
watch(
  () => props.floorId,
  async (newFloorId, oldFloorId) => {
    if (!newFloorId) return

    // Save old floor path

    if (oldFloorId != null) {
      savePath(props.building?.id as string, oldFloorId as string)
      clearPath()
      clearPOIs()
    }

    // 🔄 Remove old overlay if exists
    if (floorOverlay.value) {
      toRaw(map.value)?.removeLayer(toRaw(floorOverlay.value) as L.ImageOverlay)
      floorOverlay.value = null
    }

    // 🖼️ Add new overlay
    const newFloor = props.building?.floors.find((f) => f.id === newFloorId)
    if (newFloor) {
      floorOverlay.value = L.imageOverlay(newFloor.floor_plan_url, buildingBound.value).addTo(
        toRaw(map.value)! as L.Map,
      )
    }

    // Force map to refresh layout
    toRaw(map.value)?.invalidateSize()

    // Load new floor path
    await loadPath(props.building?.id as string, newFloorId)

    if (editorMode.value !== 'PATH') {
      pathSetNodeVisibility(false)
    }

    if (editorMode.value !== 'BEACON' || 'PATH') {
      console.log('yepp')
      await loadPOIs(props.building?.id as string, newFloorId)
    }
  },
)

onBeforeUnmount(() => {
  toRaw(map.value)?.remove()
})

// Exposed methods to parent
function startPathEditing() {
  editorMode.value = editorMode.value !== 'PATH' ? 'PATH' : 'IDLE'
  pathSetNodeVisibility(true) // show nodes only in PATH mode
  console.log(`[Editor Mode] Switched to ${editorMode.value}`)
}

function startPOIEditing() {
  editorMode.value = editorMode.value !== 'POI' ? 'POI' : 'IDLE'
  pathSetNodeVisibility(false) // hide nodes in POI mode, show in PATH mode
  console.log(`[Editor Mode] Switched to ${editorMode.value}`)
}

function resetEditor() {
  editorMode.value = 'IDLE'
  pathSetNodeVisibility(false)
  console.log(`[Editor Mode] Switched to ${editorMode.value}`)
}

// PATH FUNCTIONS
function startConnecting() {
  editorState.value = editorState.value !== 'CONNECTING' ? 'CONNECTING' : 'IDLE'
  console.log(`[Editor State] Mode changed to: ${editorState.value}`)
}
function startDeleting() {
  editorState.value = editorState.value !== 'DELETING' ? 'DELETING' : 'IDLE'
  console.log(`[Editor State] Mode changed to: ${editorState.value}`)
}
function startCreatingPOI() {
  editorState.value = editorState.value !== 'CREATING' ? 'CREATING' : 'IDLE'
  console.log(`[Editor State] Mode changed to: ${editorState.value}`)
}

defineExpose({
  startPathEditing,
  startPOIEditing,
  resetEditor,
  startConnecting,
  startDeleting,
  startCreatingPOI,
  // POIs
  addOrUpdatePOI,
  updatePOIPosition,
  removePOI,
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

.custom-circle-node div {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #51854e;
  border: 2px solid #fffbf3;
}

.custom-circle-node.selected div {
  background-color: #e8a34f;
}
</style>
