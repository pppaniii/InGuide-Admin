<template>
  <div class="relative w-full h-full map-wrapper">
    <div ref="mapContainer" id="map" class="absolute inset-0"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, toRaw, watch, type Ref } from 'vue'
import L, { Map, FeatureGroup } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { usePathEditor } from '@/composables/usePathEditor'

type EditorState = 'IDLE' | 'CONNECTING' | 'DELETING'
const editorState = ref<EditorState>('IDLE')
const selectedNodeId = ref<string | null>(null)

const mapContainer = ref<HTMLElement | null>(null)
const map = ref<Map | null>(null)
const drawnItems = new FeatureGroup()

const props = defineProps<{
  buildingId: string
  floorId: string
}>()

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
  clearPath
} = usePathEditor(map as Ref, drawnItems)

onMounted(async () => {
  // Init Map
  map.value = L.map(toRaw(mapContainer.value) as HTMLElement, {
    center: [18.7996619, 98.950488],
    zoom: 18,
    zoomControl: false,
    attributionControl: false
  })
  toRaw(map.value)?.getContainer().style.setProperty('background-color', '#e0f7fa')
  toRaw(map.value)?.addLayer(drawnItems)

  // Click map to create/connect nodes
  map.value?.on('click', (event: L.LeafletMouseEvent) => {
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

  // Load initial path
  await loadPath(props.buildingId, props.floorId)
})

// Watch for floor change
watch(
  () => props.floorId,
  async (newFloorId, oldFloorId) => {
    if (!newFloorId) return

    savePath(props.buildingId, oldFloorId)
    clearPath()
    await loadPath(props.buildingId, newFloorId)
  }
)

onBeforeUnmount(() => {
  map.value?.remove()
})

// Exposed methods to parent
function startConnecting() {
  editorState.value = editorState.value !== 'CONNECTING' ? 'CONNECTING' : 'IDLE'
  console.log(`[Editor State] Mode changed to: ${editorState.value}`)
}
function startDeleting() {
  editorState.value = editorState.value !== 'DELETING' ? 'DELETING' : 'IDLE'
  console.log(`[Editor State] Mode changed to: ${editorState.value}`)
}

defineExpose({
  startConnecting,
  startDeleting,
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
