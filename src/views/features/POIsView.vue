<template>
  <!-- POI Title -->
  <div>
    <div class="poi-title">
      POIs Management: <br>
      {{ building?.name ?? '...' }}
    </div>
  </div>

  <div class="poi-panel">
    <!-- POI List -->
    <div class="poi-list-container">
      <div class="poi-list" v-if="poiStore.pois?.length != 0">
        <button
          v-for="poi in poiStore.pois"
          :key="poi.id"
          class="poi-item"
          @click="openPOIOverlay(poi)"
        >
          {{ poi.name }}
        </button>
      </div>
      <div v-else class="no-items">
        No POI in this floor.
      </div>
    </div>

    <!-- Action Button -->
    <div class="poi-action">
      <button @click="triggerAddPOI" class="poi-btn add">Add POI</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Building } from '@/types/types'
import MapEditor from '@/components/MapEditor.vue'
import type { Ref } from 'vue'
import type { POI } from '@/types/poi'
import poiService from '@/services/poiService'
import { usePOIStore } from '@/stores/pois'

const poiStore = usePOIStore()

const props = defineProps<{
  building: Building | null
  id: string
  mapEditorRef: InstanceType<typeof MapEditor> | null
  floorId: Ref<string>
}>()

const emit = defineEmits<{
  (e: 'openOverlay', payload: { type: string; data: POI | null; loading: boolean; buildingId: string; floorId: string }): void
}>()

function triggerAddPOI() {
  props.mapEditorRef?.startCreatingPOI()
}

function openPOIOverlay(poi: POI) {
  const buildingId = props.building?.id ?? ''
  const floorId = props.floorId.value

  // Open overlay in loading state
  emit('openOverlay', { type: 'POI', data: null, loading: true, buildingId, floorId })

  // Fetch POI data asynchronously
  poiService.getPOIById(buildingId, poi.id)
    .then((poiData) => {
      emit('openOverlay', { type: 'POI', data: poiData, loading: false, buildingId, floorId })
    })
    .catch((err) => {
      console.error('Failed to load POI', err)
      emit('openOverlay', { type: 'POI', data: null, loading: false, buildingId, floorId })
    })
}
</script>

<style src="../../styles/POIsView.css"></style>
