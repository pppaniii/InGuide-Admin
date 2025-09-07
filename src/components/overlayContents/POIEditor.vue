<template>
  <div>
    <div v-if="isLoading">Loading POI...</div>
    <div v-else-if="localPOI">
      <h1>{{ localPOI.name }}</h1>
      <p>Information</p>
      <input
        class="input-box"
        type="text"
        placeholder="Enter Information Here"
        v-model="localPOI.detail"
      />
      <p>Tag</p>
      <select v-model="localPOI.type">
        <option value="-">-</option>
        <option value="Restroom">Restroom</option>
        <option value="Lecture Room">Lecture Room</option>
        <option value="Computer Lab">Computer Lab</option>
      </select>
      <p>Image of Place</p>
      <button @click="deletePOI">Delete</button>
      <button @click="saveNewPOIInfo">Save</button>
    </div>
    <div v-else>
      <p>No POI data available.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { POI } from '@/types/poi';
import { defineProps, ref, watch, defineEmits } from 'vue'; // Make sure to import defineEmits

interface POIEditorProps {
  poi: POI | null // will be null initially if loading
  isLoading: boolean
  buildingId: string
  floorId: string
}

const props = defineProps<POIEditorProps>()
const emit = defineEmits(['close', 'save-poi', 'delete-poi'])

// Optional: local reactive copy if you want
const localPOI = ref<POI | null>(props.poi)

watch(
  () => props.poi,
  (newVal) => {
    localPOI.value = newVal
  },
)

function saveNewPOIInfo(){
  console.log("POI save...")
  const payload = {
    buildingId: props.buildingId,
    floorId: props.floorId,
    newPoi: localPOI.value,
  }
  emit('save-poi', payload)
  emit('close')
}

function deletePOI(){
  const thisPOIId = localPOI.value?.id || ''
  console.log(`deleting ${ thisPOIId }`)
  const payload = {
    buildingId: props.buildingId,
    floorId: props.floorId,
    poiId: thisPOIId,
  }
  emit('delete-poi', payload)
  emit('close')
}
</script>

<style>
.input-box {
  background-color: #fefbf6;
}
</style>
