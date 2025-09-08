<template>
  <div>
    <div v-if="isLoading">Loading POI...</div>
    <div v-else-if="localPOI">
      <input class="input-box" type="text" placeholder="New POI" v-model="localPOI.name" />
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
      <p>Images of Place</p>
      <ImageGallery :images="localPOI.images" @add="handleAddImage" @remove="handleRemoveImage" />
      <button @click="deletePOI">Delete</button>
      <button @click="saveNewPOIInfo">Save</button>
    </div>
    <div v-else>
      <p>No POI data available.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { POI } from '@/types/poi'
import { defineProps, ref, watch, defineEmits } from 'vue' // Make sure to import defineEmits
import ImageGallery from '../ImageGallery.vue'
import imageService from '@/services/imageService'

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

function saveNewPOIInfo() {
  console.log('POI save...')
  if (localPOI.value?.name == '') {
    localPOI.value.name = 'Unnamed POI'
  }
  const payload = {
    buildingId: props.buildingId,
    floorId: props.floorId,
    newPoi: localPOI.value,
  }
  emit('save-poi', payload)
  emit('close')
}

function deletePOI() {
  const thisPOIId = localPOI.value?.id || ''
  console.log(`deleting ${thisPOIId}`)
  const payload = {
    buildingId: props.buildingId,
    floorId: props.floorId,
    poiId: thisPOIId,
  }
  emit('delete-poi', payload)
  emit('close')
}

async function handleAddImage(file: File) {
  const imgUrl: string = await imageService.uploadImage(file)
  localPOI.value?.images.push(imgUrl)
}

async function handleRemoveImage(index: number) {
  const url = localPOI.value?.images[index] as string
  try {
    await imageService.deleteImage(url) // 🔥 remove from backend
    localPOI.value?.images.splice(index, 1) // remove locally
  } catch (err) {
    console.error('Failed to delete image:', err)
    alert('Could not delete image. Please try again.')
  }
}
</script>

<style>
.input-box {
  background-color: #fefbf6;
}
</style>
