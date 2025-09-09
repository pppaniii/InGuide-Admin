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
      </div>
      <hr class="section-divider">

      <!-- Coordinates -->
      <label class="beacon-field info">
        <span class="title">Coordinates</span>
        <div class="coord-inputs">
          <input type="number" step="0.000001" v-model="localBeacon.latLng[0]" placeholder="Latitude" />
          <input type="number" step="0.000001" v-model="localBeacon.latLng[1]" placeholder="Longitude" />
        </div>
      </label>

      <!-- Action buttons -->
      <div class="beacon-action">
        <button type="button" class="btn cancel" @click="$emit('close')">Cancel</button>
        <button type="button" class="btn danger" @click="deleteBeacon">Delete</button>
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

<style scoped>
.title-row {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.name-input {
  flex: 1;
  padding: 6px 10px;
  font-size: 14px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.section-divider {
  border: none;
  border-bottom: 1px solid #ddd;
  margin: 0.5rem 0;
}

.beacon-field {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
}

.coord-inputs {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.coord-inputs input {
  flex: 1;
  padding: 6px 10px;
  font-size: 14px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.beacon-action {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.btn {
  padding: 6px 12px;
  font-size: 14px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}

.btn.save {
  background-color: #007bff;
  color: white;
}

.btn.cancel {
  background-color: #6c757d;
  color: white;
}

.btn.danger {
  background-color: red;
  color: white;
}

.empty {
  text-align: center;
  color: #666;
  font-size: 14px;
}
</style>
