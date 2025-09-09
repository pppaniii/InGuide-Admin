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
      <div
        v-for="beacon in beacons"
        :key="beacon.beaconId"
        class="beacon-item"
      >
        <span>{{ beacon.beaconId }}</span>
        <span>({{ beacon.latLng[0].toFixed(5) }}, {{ beacon.latLng[1].toFixed(5) }})</span>
      </div>
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

const props = defineProps<{
  building: Building | null
  id: string
  mapEditorRef: InstanceType<typeof MapEditor> | null
  floorId: string
  beacons?: Beacon[]
}>()

function triggerAddBeacon() {
  props.mapEditorRef?.startCreatingBeacon()
}

</script>

<style src="@/styles/BeaconsView.css"></style>
