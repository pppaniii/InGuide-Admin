<template>
  <div class="beacon-edit">
    <div v-if="isLoading">Loading Beacon...</div>
    <div v-else-if="localBeacon">

      <!-- Title -->
      <div class="title-row">
        <input
          class="name-input"
          type="text"
          placeholder="Beacon Name"
          v-model="localBeacon.name"
        />
        <font-awesome-icon icon="pencil" />
      </div>
      <hr class="section-divider">

      <!-- Coordinates edit -->
      <label class="beacon-field info">
        <span class="coor-title">Coordinates</span>

        <div class="coor-inputs">
          <label class="coor-item">
            <span class="coor-type">Latitude: </span>
            <input 
              type="number" 
              step="0.000001" 
              v-model="localBeacon.latLng[0]" 
              placeholder="Latitude" 
              class="beacon-input-field"
            />
          </label>
          <label class="coor-item">
            <span class="coor-type">Longitude: </span>
            <input 
              type="number" 
              step="0.000001" 
              v-model="localBeacon.latLng[1]" 
              placeholder="Longitude" 
              class="beacon-input-field"
            />
          </label>
        </div>
      </label>

      <!-- Action buttons -->
      <div class="beacon-action">
        <button type="button" class="btn delete" @click="deleteBeacon">Delete</button>
        <button type="button" class="btn save" @click="saveBeacon">Save</button>
      </div>

    </div>

    <div v-else class="empty">
      <p>No Beacon data available.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Beacon } from '@/types/beacon'

const props = defineProps<{
  beacon: Beacon
  isLoading: boolean
  buildingId: string
  floorId: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save-beacon', payload: { buildingId: string; floorId: string; newBeacon: Beacon }): void
  (e: 'delete-beacon', payload: { buildingId: string; floorId: string; beaconId: string }): void
}>()

const localBeacon = ref<Beacon>({ ...props.beacon })

watch(() => props.beacon, (newVal) => {
  localBeacon.value = { ...newVal }
})

function saveBeacon() {
  emit('save-beacon', {
    buildingId: props.buildingId,
    floorId: props.floorId,
    newBeacon: localBeacon.value,
  })
}

function deleteBeacon() {
  emit('delete-beacon', {
    buildingId: props.buildingId,
    floorId: props.floorId,
    beaconId: localBeacon.value.beaconId,
  })
}
</script>

<style src="../../styles/beaconEditor.css"></style>
