<template>
  <div class="map-wrapper">
    <div class="map-label" v-if="editorState != 'IDLE'">
      <div v-if="editorState == 'CONNECTING'">
        <a v-if="nodeMarkers.size == 0 || selectedNodeId">click anywhere to add/connect a path</a>
        <a v-else>Select a node to connect</a>
      </div>
      <div v-if="editorState == 'DELETING'">
        <a>Select a node to delete</a>
      </div>
      <div v-if="editorState == 'CREATING'">
        <a v-if="editorMode == 'POI'">Click anywhere to add a POI</a>
        <a v-else-if="editorMode == 'BEACON'">Click anywhere to add a Beacon</a>
      </div>
    </div>

    <div ref="mapContainer" id="map"></div>

    <div v-if="!floorOverlay" class="map-empty-hint">
      <FontAwesomeIcon :icon="faImage" class="empty-icon" />
      <span>No floor plan available</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, toRaw, watch, type Ref, computed, toRef } from 'vue'
import L, { Map, FeatureGroup, LayerGroup, ImageOverlay } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { usePathEditor } from '@/composables/usePathEditor'
import type { BuildingInfo } from '@/types/types'
import { usePoiEditor } from '@/composables/usePOIEditor'
import { useBeaconEditor } from '@/composables/useBeaconeditor'
import type { POI } from '@/types/poi'
import { generateId } from '@/utils/generateId'
import { faImage } from '@fortawesome/free-solid-svg-icons'
import type { Beacon } from '@/types/beacon'
import { convertEditorToGraph } from '@/utils/pathConverter'
import { mergePOIsIntoGraph } from '@/utils/mergeGraph'
import { usePOIStore } from '@/stores/pois'
import navigationGraphService from '@/services/navigationGraphService'
import { useFloorEditor } from '@/composables/useFloorEditor'
import { useBuildings } from '@/stores/buildings'

type EditorMode = 'PATH' | 'POI' | 'IDLE' | 'BEACON'
const editorMode = ref<EditorMode>('IDLE')

type EditorState = 'IDLE' | 'CONNECTING' | 'DELETING' | 'CREATING'
const editorState = ref<EditorState>('IDLE')
const selectedNodeId = ref<string | null>(null)

const mapContainer = ref<HTMLElement | null>(null)
const map = ref<Map | null>(null)
const floorOverlay = ref<ImageOverlay | null>(null)
const drawnItems = new FeatureGroup()
const poiLayer = new LayerGroup()
const beaconLayer = new LayerGroup()

const props = defineProps<{
  building: BuildingInfo | null
  floorId: string | null
}>()
const emit = defineEmits<{
  (
    e: 'openOverlay',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload: { type: string; data: any; loading: boolean; buildingId: string; floorId: string },
  ): void
  (e: 'update:floorId', newFloorId: string): void
}>()
const buildingStore = useBuildings()
const poiStore = usePOIStore()

const buildingIdRef = computed(() => props.building?.id) // Use computed for nested/optional props
const floorIdRef = toRef(props, 'floorId')

// Path editor
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
  setNodePortalGroup,
} = usePathEditor(
  map as Ref,
  drawnItems,
  buildingIdRef,
  floorIdRef,
  generateAndSaveNavigationGraph,
)

// POI editor
const {
  createPOI,
  loadPOIs,
  addOrUpdatePOI,
  updatePOIPosition,
  clearPOIs,
  removePOI,
  updatePOIDraggables,
  poisStore,
} = usePoiEditor(
  map as Ref,
  poiLayer,
  emit,
  generateAndSaveNavigationGraph, // <-- 3. Pass the callback
)

// Beacon editor
const {
  createBeacon,
  loadBeacons,
  addOrUpdateBeacon,
  updateBeaconPosition,
  clearBeacons,
  removeBeacon,
  updateBeaconDraggables,
} = useBeaconEditor(map as Ref, beaconLayer, emit)

// Floor editor
const floorEditor = useFloorEditor(map as Ref)
const existingPortalNames = ref(new Set<string>())

onMounted(async () => {
  if (props.building?.id) {
    try {
      const names = await navigationGraphService.getPortalGroups(props.building.id)
      existingPortalNames.value = new Set(names)
    } catch (error) {
      console.error("Failed to load portal groups:", error)
    }
  }
  map.value = L.map(toRaw(mapContainer.value) as HTMLElement, {
    center: props.building?.NE_bound,
    zoom: 18,
    zoomControl: false,
    attributionControl: false,
  })
  toRaw(map.value)?.addLayer(drawnItems)
  toRaw(map.value)?.addLayer(poiLayer)
  toRaw(map.value)?.addLayer(beaconLayer)

  await loadFloorData(props.floorId)

  // Click map
  toRaw(map.value)?.on('click', async (event: L.LeafletMouseEvent) => {
    console.log(editorMode.value)
    console.log(editorState.value)
    // Create/connect PATH
    if (editorMode.value === 'PATH' && editorState.value === 'CONNECTING') {
      if (nodeMarkers.size === 0) {
        const firstNode = createNode(event.latlng)
        selectedNodeId.value = firstNode.options.title as string
        highlightNode(firstNode, true)
        return
      }
      if (selectedNodeId.value) {
        connectNodes(selectedNodeId.value, event.latlng)
        highlightNode(nodeMarkers.get(selectedNodeId.value)!, false)
        selectedNodeId.value = null
        editorState.value = 'IDLE'
        savePath(props.building?.id as string, props.floorId as string)
        // 4. REMOVED: generateAndSaveNavigationGraph() - composable calls it
      }
    }
    // Create POI
    if (editorMode.value === 'POI' && editorState.value === 'CREATING') {
      const latLng = event.latlng
      const newPoi: POI = {
        id: generateId(),
        name: (await prompt('Enter New Point of Interest Name 👇', 'new POI')) as string,
        location: [latLng.lat, latLng.lng],
        floor: 0,
        type: '-',
        images: [],
        detail: '',
      }
      const newPOI = createPOI(newPoi, props.building?.id as string, props.floorId as string)
      newPOI.dragging?.enable()
      // 4. REMOVED: generateAndSaveNavigationGraph() - composable calls it
      editorState.value = 'IDLE'
    }
    // Create BEACON
    if (editorMode.value === 'BEACON' && editorState.value === 'CREATING') {
      console.log('create beacon!')
      const latLng = event.latlng
      const newBeacon: Beacon = {
        beaconId: generateId(),
        name: (await prompt('Enter New Beacon Name 👇', 'new Beacon')) as string,
        latLng: [latLng.lat, latLng.lng],
      }

      const beacon = createBeacon(newBeacon, props.building?.id as string, props.floorId as string)
      await beacon.dragging?.enable()
      editorState.value = 'IDLE'
      console.log(`Beacon created at`, newBeacon.latLng)
    }
  })

  // Click nodes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  drawnItems.on('click', (event: any) => {
    if (!(event.layer instanceof L.Marker)) return
    const nodeId = event.layer.options.title as string
    if (editorMode.value === 'PATH' && editorState.value === 'IDLE') {
      selectedNodeId.value = nodeId

      // Get the node's current portal name
      const marker = nodeMarkers.get(nodeId)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const currentName = (marker?.options as any).portalGroup || null

      // Emit the event for LayoutView to handle
      emit('openOverlay', {
        type: 'NODE', // <-- A new type for your overlay handler
        data: {
          nodeId: nodeId,
          currentNodePortalName: currentName,
          portalNames: existingPortalNames.value // Pass the set of names
        },
        loading: false,
        buildingId: props.building?.id as string,
        floorId: props.floorId as string
      })
    }
    if (editorState.value === 'CONNECTING') {
      const nodeId = event.layer.options.title as string
      if (!selectedNodeId.value) {
        selectedNodeId.value = nodeId
        highlightNode(event.layer, true)
      }
    }
    if (editorState.value === 'DELETING') {
      const nodeId = event.layer.options.title as string
      const success = deleteNode(nodeId)
      if (success) {
        savePath(props.building?.id as string, props.floorId as string)
        // 4. REMOVED: generateAndSaveNavigationGraph() - composable calls it
      }
    }
  })
  // 4. REMOVED: poiLayer.addEventListener('mouseup', ...)
})

// Floor change
watch(
  () => props.floorId,
  async (newFloorId) => {
    // --- THIS IS NOW MUCH CLEANER ---
    // Just call the reusable function
    await loadFloorData(newFloorId)
  },
)

onBeforeUnmount(() => {
  try {
    toRaw(map.value)?.remove()
  } catch (e) {
    console.log(e)
  }
})

async function loadFloorData(newFloorId: string | null) {
  // This guard is still essential
  if (!newFloorId || !map.value) {
    console.warn('Skipping floor load:', { newFloorId, mapExists: !!map.value })
    return
  }

  console.log('Loading data for floor:', newFloorId)

  // Clear old layers (but only if there are old layers)
  if (drawnItems.getLayers().length > 0) {
    clearPath()
    clearPOIs()
    clearBeacons()
  }

  // This is the line that was failing before
  floorEditor.renderFloorPlan(newFloorId)

  await loadPath(props.building?.id as string, newFloorId)
  if (editorMode.value !== 'PATH') {
    pathSetNodeVisibility(false)
  }
  await loadPOIs(props.building?.id as string, newFloorId)
  await loadBeacons(props.building?.id as string, newFloorId)
  resetEditor()
}

async function generateAndSaveNavigationGraph() {
  try {
    if (nodeMarkers == undefined) return
    if (connections == undefined) return
    if (poisStore.pois == null) return
    const graph = convertEditorToGraph(nodeMarkers, connections)
    const mergedGraph = mergePOIsIntoGraph(graph, poiStore.pois as POI[])
    console.log(mergedGraph)
    const buildingId: string = props.building?.id as string
    const floorId: string = props.floorId as string
    await navigationGraphService.saveNavigationGraph(buildingId, floorId, mergedGraph)
    console.log('Navigation graph generated and saved.')
  } catch (error) {
    console.log('generate and save Nav Graph', error)
  }
}

// ---- Exposed methods ----

function startPathEditing() {
  editorMode.value = editorMode.value !== 'PATH' ? 'PATH' : 'IDLE'
  updatePOIDraggables(false)
  pathSetNodeVisibility(true)
  updateBeaconDraggables(false)
}

function startPOIEditing() {
  editorMode.value = editorMode.value !== 'POI' ? 'POI' : 'IDLE'
  updatePOIDraggables(true)
  pathSetNodeVisibility(false)
  updateBeaconDraggables(false)
}

function startBeaconEditing() {
  editorMode.value = editorMode.value !== 'BEACON' ? 'BEACON' : 'IDLE'
  updatePOIDraggables(false) // beacons fixed, not draggable
  pathSetNodeVisibility(false)
  updateBeaconDraggables(true)
}

function resetEditor() {
  editorMode.value = 'IDLE'
  updatePOIDraggables(false)
  pathSetNodeVisibility(false)
  updateBeaconDraggables(false)
}

function addFloorPlan() {
  floorEditor.addFloorPlan()
}

function updateFloorPlan(imgUrl: string) {
  if (props.floorId) floorEditor.updateFloorPlan(props.floorId, imgUrl)
  else console.error('there is no selected floor')
}

function deleteFloorPlan() {
  if (props.floorId) {
    const floor = buildingStore.floorById(props.floorId)
    if (floor) {
      floorEditor.deleteFloorPlan(props.floorId)
      const newFloor = floor.floor - 1 > 0 ? floor.floor - 1 : 1
      const newFloorId = buildingStore.current?.floors[newFloor - 1].id
      if (newFloorId) emit('update:floorId', newFloorId)
      else console.error('There is an error getting a new floor ID')
    }
  } else console.error('there is no selected floor')
}

function handlePortalSave(nodeId: string, newName: string | null) {
  // Call the composable function!
  setNodePortalGroup(nodeId, newName)

  // Update the "Set" locally so it appears in the dropdown
  // on the next click, without a full refresh.
  if (newName) {
    existingPortalNames.value.add(newName)
  }
}

// PATH states
function startConnecting() {
  editorState.value = editorState.value !== 'CONNECTING' ? 'CONNECTING' : 'IDLE'
}
function startDeleting() {
  editorState.value = editorState.value !== 'DELETING' ? 'DELETING' : 'IDLE'
}
function startCreatingPOI() {
  editorState.value = editorState.value !== 'CREATING' ? 'CREATING' : 'IDLE'
}
function startCreatingBeacon() {
  editorState.value = editorState.value !== 'CREATING' ? 'CREATING' : 'IDLE'
}

defineExpose({
  startPathEditing,
  startPOIEditing,
  startBeaconEditing,
  resetEditor,
  startConnecting,
  startDeleting,
  startCreatingPOI,
  startCreatingBeacon,
  connectNodes,
  nodeMarkers,
  connections,
  // POI
  addOrUpdatePOI,
  updatePOIPosition,
  removePOI,
  // Beacon
  addOrUpdateBeacon,
  updateBeaconPosition,
  removeBeacon,
  // Floors
  addFloorPlan,
  updateFloorPlan,
  deleteFloorPlan,
  //Path
  handlePortalSave,
})
</script>

<style src="../styles/MapEditor.css"></style>
