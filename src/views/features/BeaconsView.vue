<template>
  <!-- Beacon Title -->
  <div>
    <div class="beacon-title">
      Beacons Management: <br />
      {{ building?.name ?? '...' }}
    </div>
  </div>

  <div class="beacon-panel">
    <!-- Beacon List -->
    <div class="beacon-list">
      <button
        v-for="beacon in beaconStore.beacons"
        :key="beacon.beaconId"
        class="beacon-item"
        @click="openBeaconOverlay(beacon)"
      >
        {{ beacon.name || beacon.beaconId }}
      </button>
    </div>

    <!-- Action Button -->
    <div>
      <button
        @click="triggerAddBeacon"
        class="beacon-btn add"
      >
        Add Beacon
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Building } from '@/types/types'
import MapEditor from '@/components/MapEditor.vue'
import type { Beacon } from '@/types/beacon'
import { useBeaconStore } from '@/stores/beacon';

const beaconStore = useBeaconStore()
const props = defineProps<{
  building: Building | null
  id: string
  mapEditorRef: InstanceType<typeof MapEditor> | null
  floorId: string
}>()

const emit = defineEmits<{
  (e: 'openOverlay', payload: { type: string; data: Beacon | null; loading: boolean; buildingId: string; floorId: string }): void
}>()

function triggerAddBeacon() {
  props.mapEditorRef?.startCreatingBeacon()
}

function openBeaconOverlay(beacon: Beacon) {
  const buildingId = props.building?.id ?? ''
  const floorId = props.floorId

  // Open overlay in loading state
  emit('openOverlay', { type: 'BEACON', data: beacon, loading: true, buildingId, floorId })
}
</script>

<style src="@/styles/BeaconsView.css"></style>
