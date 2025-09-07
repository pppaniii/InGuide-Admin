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
import poiService from '@/services/poiService';
import type { POI } from '@/types/poi';
import { defineProps, ref, watch, defineEmits } from 'vue'; // Make sure to import defineEmits

interface POIEditorProps {
  poi: POI | null // will be null initially if loading
  isLoading: boolean
  buildingId: string
  floorId: string
}

const props = defineProps<POIEditorProps>()
const emit = defineEmits(['close']) // Correct declaration, placed here to be available to all functions

// Optional: local reactive copy if you want
const localPOI = ref<POI | null>(props.poi)

watch(
  () => props.poi,
  (newVal) => {
    localPOI.value = newVal
  },
)

function saveNewPOIInfo(){
  const buildingId = props.buildingId
  const floorId = props.floorId
  console.log("POI save...")
  poiService.addOrUpdatePOI(buildingId, floorId, localPOI.value as POI)
  emit('close') // Now 'emit' is correctly defined and available
}

function deletePOI(){
  const buildingId = props.buildingId
  const floorId = props.floorId
  const thisPOIId = localPOI.value?.id || ''
  poiService.deletePOI(buildingId, floorId, thisPOIId)
  emit('close')
}
</script>

<style>
.input-box {
  background-color: #fefbf6;
}
</style>
