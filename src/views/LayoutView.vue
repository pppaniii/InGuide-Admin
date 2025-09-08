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

        <MapEditor ref="mapEditorRef" :building="building" :floorId="floorId" @openOverlay="handleOpenOverlay"/>
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
    />
  </OverlayPanel>
</template>

<script setup lang="ts">
import AdminSidePanel from '@/components/AdminSidePanel.vue'
import AdminNavbar from '@/components/AdminNavbar.vue'
import MapEditor from '@/components/MapEditor.vue'
import OverlayPanel from '@/components/OverlayPanel.vue'

import { computed, onMounted, ref, watch, shallowRef } from 'vue'
import { useRoute } from 'vue-router'
import { useBuildings } from '@/stores/buildings'

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

const editorMode = computed<'FLOOR' | 'PATH' | 'POI' | 'BEACON' | 'IDLE'>(() => {
  switch (route.name) {
    case 'building-floorplan':
      return 'FLOOR'
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

// Handler function to update floorId
function handleFloorIdUpdate(newFloorId: string) {
  floorId.value = newFloorId
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleOpenOverlay({ type, data, loading, buildingId, floorId }: { type: string, data: any, loading: boolean, buildingId: string, floorId: string }) {
  overlayVisible.value = true
  if (type === 'POI') {
    overlayTitle.value = 'Edit POI'
    overlayComponent.value = (await import('@/components/overlayContents/POIEditor.vue')).default
    overlayProps.value = { poi: data, isLoading: loading, buildingId: buildingId, floorId: floorId }
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
}

onMounted(() => {
  floorId.value = building.value?.floors[0].id as string
})

watch(
  editorMode,
  (newMode) => {
    if (!mapEditorRef.value) return
    if (newMode === 'PATH') {
      mapEditorRef.value.startPathEditing?.() // show nodes
    } else if (newMode === 'POI') {
      mapEditorRef.value.startPOIEditing?.() // hide nodes, allow POI editing
    } else {
      // optional: reset all modes
      mapEditorRef.value.resetEditor?.()
    }

    console.log(`[Editor Mode] Switched to ${newMode}`)
  },
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
