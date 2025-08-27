<template>
  <div class="admin-shell">
    <AdminSidePanel>
      <RouterView v-slot="{ Component }">
        <component
          :is="Component"
          :mapEditorRef="mapEditorRef"
          :floorId="floorId"
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

        <MapEditor ref="mapEditorRef" :buildingId="building?.id || ''" :floorId="floorId" />
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import AdminSidePanel from '@/components/AdminSidePanel.vue'
import AdminNavbar from '@/components/AdminNavbar.vue'
import MapEditor from '@/components/MapEditor.vue'

import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useBuildings } from '@/stores/buildings'

const route = useRoute()
const id = computed(() => String(route.params.id))

const store = useBuildings()
const building = computed(() => store.current)

const floorId = ref<string>('3six135u56G4q1yCBzKX')

const mapEditorRef = ref<InstanceType<typeof MapEditor> | null>(null)

const editorMode = computed<'PATH' | 'POI' | 'IDLE'>(() => {
  switch (route.name) {
    case 'building-walkway':
      return 'PATH'
    case 'building-pois':
      return 'POI'
    default:
      return 'IDLE'
  }
})

// Handler function to update floorId
function handleFloorIdUpdate(newFloorId: string) {
  floorId.value = newFloorId
}

watch(
  editorMode,
  (newMode) => {
    if (!mapEditorRef.value) return

    if (newMode === 'PATH') {
      mapEditorRef.value.startPathEditing?.()   // show nodes
    } else if (newMode === 'POI') {
      mapEditorRef.value.startPOIEditing?.()    // hide nodes, allow POI editing
    } else {
      // optional: reset all modes
      mapEditorRef.value.resetEditor?.()

    }

    console.log(`[Editor Mode] Switched to ${newMode}`)
  },
  { immediate: true }
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
