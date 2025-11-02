<template>
  <div class="admin-shell">
    <AdminSidePanel>
      <RouterView v-slot="{ Component }">
        <component
          :is="Component"
          :mapEditorRef="mapEditorRef"
          :floorId="floorId"
          :building="building"
          @update:floorId="handleFloorIdUpdate"
          @openOverlay="handleOpenOverlay"
          @openPopUp="showPopup = true"
          @setPopUpContent="setPopUpContent"
        />
      </RouterView>
    </AdminSidePanel>

    <main class="main">
      <AdminNavbar
        :title="building?.name ?? 'Building'"
        :back="true"
        @back="$router.push({ name: 'home' })"
      >
        <template #title>{{ building?.name ?? 'Building' }}</template>
        <template #actions><slot name="actions" /></template>
        <template #avatar><slot name="avatar" /></template>
      </AdminNavbar>

      <section class="content">
        <nav class="tabs">
          <RouterLink class="tab" :to="{ name: 'building-floorplan', params: { id } }"
            >Floor Plan</RouterLink
          >
          <RouterLink class="tab" :to="{ name: 'building-pois', params: { id } }">POIs</RouterLink>
          <RouterLink class="tab" :to="{ name: 'building-walkway', params: { id } }"
            >Walkway</RouterLink
          >
          <RouterLink class="tab" :to="{ name: 'building-beacons', params: { id } }"
            >Beacons</RouterLink
          >
        </nav>

        <MapEditor
          ref="mapEditorRef"
          :building-info="store"
          :building="building"
          :floorId="floorId"
          @openOverlay="handleOpenOverlay"
          @update:floorId="handleFloorIdUpdate"
        />
      </section>
    </main>
  </div>

  <!-- OVERLAY -->
  <OverlayPanel :visible="overlayVisible" :title="overlayTitle" @close="overlayVisible = false">
    <component
      :is="overlayComponent"
      v-bind="overlayProps"
      @close="overlayVisible = false"
      @save-poi="savePOIInfo"
      @delete-poi="deletePOI"
      @save-beacon="saveBeaconInfo"
      @delete-beacon="deleteBeacon"
      @save-node="saveNodeInfo"
    />
  </OverlayPanel>

  <!-- POPUP -->
  <PopUpWindow name="popup" v-model:visible="showPopup">
    <!-- UPLOAD IMAGE -->
    <div v-if="popUpContent == 'UPDATE_FLOOR'">
      <div
        class="upload-box"
        @dragover.prevent
        @dragenter.prevent
        @drop.prevent="floorFileSelector.handleDrop"
        @click="selectFloorFile"
      >
        <p v-if="!floorFileSelector.isSelectedFile()">
          Drag & Drop your file here, or click to select
        </p>
        <p v-else>Selected: {{ floorFileSelector.file.value?.name }}</p>
        <input
          ref="floorFileSelector.fileInput"
          type="file"
          accept="image/*"
          class="hidden-input"
          @change="floorFileSelector.handleChange"
        />
      </div>
      <div class="actions" v-if="floorFileSelector.isSelectedFile()">
        <button @click="updateFloorPlan">Confirm</button>
        <button @click="floorFileSelector.clearFile">Cancel</button>
      </div>
    </div>

    <!-- DELETE FLOOR -->
    <div v-else-if="popUpContent == 'DELETE_FLOOR'">
    <p class="popup-confirm-title">Are you sure you want to delete this floor?</p>
    <p class="popup-confirm-subtext">This action can't be undone.</p>
    <div class="actions">
      <button class="deleteBtn" @click="deleteFloorPlan">Confirm</button>
      <button class="cancelBtn" @click="cancelDelete">Cancel</button>
    </div>
  </div>

    <!-- DELETE POI -->
    <div v-else-if="popUpContent == 'DELETE_POI'">
    <p class="popup-confirm-title">Are you sure you want to delete this POI?</p>
    <p class="popup-confirm-subtext"><a class="popup-confirm-item">"{{ pendingPOIDeletePayload.name || 'This POI' }}"</a> will be deleted, this action can't be undone.</p>
    <div class="actions">
      <button class="deleteBtn" @click="confirmDeletePOI">Confirm</button>
      <button class="cancelBtn" @click="cancelDelete">Cancel</button>
    </div>
  </div>

    <!-- DELETE BEAON -->
    <div v-else-if="popUpContent == 'DELETE_BEACON'">
    <p class="popup-confirm-title">Are you sure you want to delete this beacon?</p>
    <p class="popup-confirm-subtext"><a class="popup-confirm-item">"{{ pendingBeaconDeletePayload?.name || 'This Beacon' }}"</a> will be deleted, this action can't be undone.</p>
    <div class="actions">
      <button class="deleteBtn" @click="confirmDeleteBeacon">Confirm</button>
      <button class="cancelBtn" @click="cancelDelete">Cancel</button>
    </div>
  </div>

    <!-- ERROR -->
    <div v-else>
      <p>Something went wrong.....</p>
      <p>please close this pop-up and try again</p>
    </div>
  </PopUpWindow>
</template>

<script setup lang="ts">
import AdminSidePanel from '@/components/AdminSidePanel.vue'
import AdminNavbar from '@/components/AdminNavbar.vue'
import MapEditor from '@/components/MapEditor.vue'
import OverlayPanel from '@/components/OverlayPanel.vue'

import BeaconEditor from '@/components/overlayContents/beaconEditor.vue'
import NodeEditor from '@/components/overlayContents/nodeEditor.vue'
import POIEditor from '@/components/overlayContents/POIEditor.vue'

import { computed, onMounted, ref, watch, shallowRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBuildings } from '@/stores/buildings'
import PopUpWindow from '@/components/PopUpWindow.vue'
import { useFileSelector } from '@/composables/useFileSelector'
import imageService from '@/services/imageService'
// import { convertEditorToGraph } from '@/utils/pathConverter'

type PopUpContent = 'UPDATE_FLOOR' | 'DELETE_FLOOR' | 'DELETE_POI' | 'DELETE_BEACON' | 'NAN'
const popUpContent = ref<PopUpContent>('NAN')
const showPopup = ref(false)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pendingPOIDeletePayload = ref<any>(null)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pendingBeaconDeletePayload = ref<any>(null)

const router = useRouter()
const route = useRoute()
const overlayVisible = ref(false)
const overlayTitle = ref('Details')
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const overlayComponent = shallowRef<any>(null)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const overlayProps = ref<Record<string, any>>({})
const id = computed(() => String(route.params.id))

const store = useBuildings()
const building = computed(() => store.current)
const floorId = ref<string | null>(null)

const mapEditorRef = ref<InstanceType<typeof MapEditor> | null>(null)

const floorFileSelector = useFileSelector(['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'])

const editorMode = computed<'PATH' | 'POI' | 'BEACON' | 'IDLE'>(() => {
  switch (route.name) {
    case 'building-floorplan':
      return 'IDLE'
    case 'building-walkway':
      return 'PATH'
    case 'building-pois':
      return 'POI'
    case 'building-beacons':
      return 'BEACON'
    default:
      return 'IDLE'
  }
})

function applyEditorMode(newMode: string) {
  if (!mapEditorRef.value) return

  switch (newMode) {
    case 'PATH':
      console.log('start path editing')
      mapEditorRef.value.startPathEditing?.()
      break
    case 'POI':
      console.log('start POI editing')
      mapEditorRef.value.startPOIEditing?.()
      break
    case 'BEACON':
      console.log('start beacon editing')
      mapEditorRef.value.startBeaconEditing?.()
      break
    default:
      mapEditorRef.value.resetEditor?.()
  }

  console.log(`[Editor Mode] Switched to ${newMode}`)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function setPopUpContent(payload: any) {
  const { content } = payload
  popUpContent.value = content ?? 'NAN'
}

// Handler function to update floorId (general functions)
function handleFloorIdUpdate(newFloorId: string | null) { 
  floorId.value = newFloorId
}
async function handleOpenOverlay({
  type,
  data,
  loading,
  buildingId,
  floorId,
}: {
  type: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
  loading: boolean
  buildingId: string
  floorId: string
}) {
  if (type === 'POI' && editorMode.value == 'POI') {
    overlayVisible.value = true
    overlayTitle.value = 'Edit POI'
    overlayComponent.value = POIEditor
    overlayProps.value = { poi: data, isLoading: loading, buildingId: buildingId, floorId: floorId }
  }
  if (type === 'BEACON' && editorMode.value == 'BEACON') {
    overlayVisible.value = true
    overlayTitle.value = 'Edit Beacon'
    overlayComponent.value = BeaconEditor
    overlayProps.value = { beacon: data, isLoading: loading, buildingId, floorId }
  }
  if (type === 'NODE' && editorMode.value == 'PATH') {
    overlayVisible.value = true
    overlayTitle.value = 'Edit Path Node Portal'
    overlayComponent.value = NodeEditor // <-- Use the new component
    overlayProps.value = {
      // Pass the props your NodeEditor.vue component expects
      portalNames: data.portalNames,
      currentNodePortalName: data.currentNodePortalName,
      nodeId: data.nodeId,
      buildingId,
      floorId,
    }
  }
}

// POI Functions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function savePOIInfo(payload: any) {
  const buildingId = payload.buildingId
  const floor = payload.floorId
  const newPOI = payload.newPoi
  await mapEditorRef.value?.addOrUpdatePOI(buildingId, floor, newPOI)
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function deletePOI(payload: any) {
  pendingPOIDeletePayload.value = payload // Store the payload
  popUpContent.value = 'DELETE_POI'      // Set popup mode
  showPopup.value = true
}
async function confirmDeletePOI() {
  if (!pendingPOIDeletePayload.value) {
    console.error('No pending POI deletion to confirm.')
    return
  }
  const { buildingId, floorId, poiId } = pendingPOIDeletePayload.value
  mapEditorRef.value?.removePOI(buildingId, floorId, poiId)

  overlayVisible.value = false
  showPopup.value = false
  popUpContent.value = 'NAN'
  pendingPOIDeletePayload.value = null
}

// Beacon Functions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function saveBeaconInfo(payload: any) {
  const { buildingId, floorId, newBeacon } = payload
  await mapEditorRef.value?.addOrUpdateBeacon(buildingId, floorId, newBeacon)
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function deleteBeacon(payload: any) {
  pendingBeaconDeletePayload.value = payload // Store payload
  popUpContent.value = 'DELETE_BEACON'   // Set mode
  showPopup.value = true
}
async function confirmDeleteBeacon() {
  if (!pendingBeaconDeletePayload.value) {
    console.error('No pending beacon deletion to confirm.')
    return
  }
  const { buildingId, floorId, beaconId } = pendingBeaconDeletePayload.value
  mapEditorRef.value?.removeBeacon(buildingId, floorId, beaconId)

  overlayVisible.value = false
  showPopup.value = false
  popUpContent.value = 'NAN'
  pendingBeaconDeletePayload.value = null
}

// Walkway Function
async function saveNodeInfo(payload: { nodeId: string; portalName: string | null }) {
  // Call the function you exposed on MapEditor.vue
  mapEditorRef.value?.handlePortalSave(payload.nodeId, payload.portalName)
  overlayVisible.value = false // Close the overlay
}

// Floor Functions
async function updateFloorPlan() {
  showPopup.value = false
  if (floorFileSelector.file.value) {
    // CHANGED
    const file: File = floorFileSelector.file.value // CHANGED
    const imgUrl = await imageService.uploadImage(file)
    mapEditorRef.value?.updateFloorPlan(imgUrl)
  } else {
    console.error('cannot update floor')
  }
  floorFileSelector.clearFile() // CHANGED
  popUpContent.value = 'NAN'
}
function deleteFloorPlan() {
  showPopup.value = false
  popUpContent.value = 'NAN'
  mapEditorRef.value?.deleteFloorPlan()
}

// trigger select floor file
const selectFloorFile = async () => {
  const file: File | null = await new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    // Use the allowed types from our instance
    input.accept = 'image/*' // Or be more specific: 'image/png,image/jpeg,image/svg+xml'
    input.onchange = () => resolve(input.files?.[0] ?? null)
    input.click()
  })
  if (file) floorFileSelector.validateAndSetFile(file) // CHANGED
}

function cancelDelete() {
  showPopup.value = false
  popUpContent.value = 'NAN'
  pendingPOIDeletePayload.value = null
  pendingBeaconDeletePayload.value = null // <-- ADD THIS
}

onMounted(() => {
  const buildingId = route.params.id
  if (buildingId) {
    router.replace(`/building/${buildingId}/floorplan`) // redirect
  }
  floorFileSelector.clearFile() // CHANGED
  console.log('file: ', floorFileSelector.file) // CHANGED
  // Reapply mode after mount
  applyEditorMode(editorMode.value)
  floorId.value = building.value?.floors[0].id as string
  applyEditorMode('IDLE')
})

watch(editorMode, (newMode) => applyEditorMode(newMode), { immediate: true })
</script>

<style src="@/styles/LayoutView.css"></style>
<!-- <style scoped>
.admin-shell {
  display: grid;
  grid-template-columns: 260px 1fr;
  width: 100%;
  height: 100vh;
}

.main {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content {
  flex: 1;
  overflow: auto;
  padding: 1rem;
}

.tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.upload-box {
  border: 2px dashed #aaa;
  padding: 2rem;
  text-align: center;
  border-radius: 12px;
  cursor: pointer;
}
.upload-box:hover {
  border-color: #666;
}
.hidden-input {
  display: none;
}
.actions {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.popup-confirm-title {
  font-size: 1.25rem; /* Makes it larger */
  font-weight: 600;   /* Makes it bolder */
  color: #333;
  margin-bottom: 0.5rem;
}

.popup-confirm-item {
  font-weight: 600; /* Keeps it bold */
  color: #d9534f; /* Uses your delete color */
  text-decoration: none; /* Optional: Removes underline from <a> */

}

.popup-confirm-subtext {
  font-size: 0.9rem;
  color: #777; /* Lighter text */
}

.cancelBtn,
.deleteBtn {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s ease;
}

.cancelBtn {
  color: #333;
  background: #f0f0f0;
  border: 1px solid #ccc;
}
.cancelBtn:hover {
  background: #e0e0e0;
}

.deleteBtn {
  color: #fff;
  background: #d9534f;
}
.deleteBtn:hover {
  background: #c9302c;
}
</style> -->
