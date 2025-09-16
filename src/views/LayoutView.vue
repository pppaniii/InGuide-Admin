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
          :building="building"
          :floorId="floorId"
          @openOverlay="handleOpenOverlay"
        />
      </section>
    </main>
  </div>
  <OverlayPanel :visible="overlayVisible" :title="overlayTitle" @close="overlayVisible = false">
    <component
      :is="overlayComponent"
      v-bind="overlayProps"
      @close="overlayVisible = false"
      @save-poi="savePOIInfo"
      @delete-poi="deletePOI"
      @save-beacon="saveBeaconInfo"
      @delete-beacon="deleteBeacon"
    />
  </OverlayPanel>
</template>

<script setup lang="ts">
import AdminSidePanel from '@/components/AdminSidePanel.vue'
import AdminNavbar from '@/components/AdminNavbar.vue'
import MapEditor from '@/components/MapEditor.vue'
import OverlayPanel from '@/components/OverlayPanel.vue'

import { computed, onMounted, ref, watch, shallowRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBuildings } from '@/stores/buildings'
// import { convertEditorToGraph } from '@/utils/pathConverter'

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

const editorMode = computed<'PATH' | 'POI' | 'BEACON' | 'IDLE'>(() => {
  switch (route.name) {
    case 'building-floorplan':
      return 'IDLE'
    case 'building-walkway':
      return 'PATH'
    case 'building-pois':
      return 'POI'
    case 'building-beacons':
      console.log('nabbbu')
      return 'BEACON'
    default:
      return 'IDLE'
  }
})

// Handler function to update floorId
function handleFloorIdUpdate(newFloorId: string) {
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
    overlayComponent.value = (await import('@/components/overlayContents/POIEditor.vue')).default
    overlayProps.value = { poi: data, isLoading: loading, buildingId: buildingId, floorId: floorId }
  }
  if (type === 'BEACON' && editorMode.value == 'BEACON') {
    overlayVisible.value = true
    overlayTitle.value = 'Edit Beacon'
    overlayComponent.value = (await import('@/components/overlayContents/beaconEditor.vue')).default
    overlayProps.value = { beacon: data, isLoading: loading, buildingId, floorId }
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
  const buildingId = payload.buildingId
  const floor = payload.floorId
  const poiId = payload.poiId
  mapEditorRef.value?.removePOI(buildingId, floor, poiId)
  overlayVisible.value = false
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function saveBeaconInfo(payload: any) {
  const { buildingId, floorId, newBeacon } = payload
  await mapEditorRef.value?.addOrUpdateBeacon(buildingId, floorId, newBeacon)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function deleteBeacon(payload: any) {
  const { buildingId, floorId, beaconId } = payload
  mapEditorRef.value?.removeBeacon(buildingId, floorId, beaconId)
  overlayVisible.value = false
}

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

onMounted(() => {
  const buildingId = route.params.id
  if (buildingId) {
    router.replace(`/building/${buildingId}/floorplan`) // redirect
  }

  // Reapply mode after mount
  applyEditorMode(editorMode.value)
  floorId.value = building.value?.floors[0].id as string
  applyEditorMode('IDLE')
})

watch(
  editorMode,
  (newMode) => applyEditorMode(newMode),
  { immediate: true },
)
</script>

<style src="@/styles/LayoutView.css"></style>
<style scoped>
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
</style>
