<template>
  <div class="poi-edit">
    <div v-if="isLoading">Loading POI...</div>
    <div v-else-if="localPOI">

      <!-- Title -->
      <div class="title-row">
        <input
          class="name-input"
          type="text"
          placeholder="New POI"
          v-model="localPOI.name"
        />
        <font-awesome-icon icon="pencil" />
      </div>
      <hr class="section-divider">

      <!-- Infomation Edit -->
      <label class="poi-field info">
        <span class="title">Infomation</span>
        <textarea
          class="textarea"
          placeholder="Enter Information Here"
          rows="5"
          v-model="localPOI.detail"
        />
      </label>

      <!-- Tag Select -->
      <label class="poi-field">
        <span class="title">Tag</span>
        <div class="select-wrap">
          <select v-model="localPOI.type" class="select">
            <option value="-">-</option>
            <option value="Restroom">Restroom</option>
            <option value="Lecture Room">Lecture Room</option>
            <option value="Computer Lab">Computer Lab</option>
          </select>
        </div>
      </label>

      <!-- Image -->
      <div class="poi-field">
        <span class="title">Image of Place</span>
        <ImageGallery
          :images="localPOI.images"
          @add="handleAddImage"
          @remove="handleRemoveImage"
        />
      </div>

      <div class="toggle-row" role="switch" :aria-checked="!!localPOI?.recommended">
        <div class="toggle-text">
          <div class="title">Recommended</div>
          <div class="toggle-sub">Show as recommended place</div>
        </div>

        <label class="switch">
          <input
            type="checkbox"
            v-model="localPOI.recommended"
            aria-label="Toggle recommended"
          />
          <span class="slider"></span>
        </label>
      </div>

      <!-- Action button -->
      <div class="poi-editor-action">
        <button type="button" class="poi-editor-btn cancel" @click="deletePOI">Delete</button>
        <!-- <button type="button" class="btn ghost">Edit Position</button> -->
        <button type="button" class="poi-editor-btn save" @click="saveNewPOIInfo">Save</button>
      </div>
    </div>

    <div v-else class="empty">
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
  const POIName = localPOI.value?.name || '[ Unnamed POI ]'
  console.log(`deleting ${thisPOIId}`)
  const payload = {
    buildingId: props.buildingId,
    floorId: props.floorId,
    poiId: thisPOIId,
    name: POIName
  }
  emit('delete-poi', payload)
}

async function handleAddImage(file: File) {
  const imgUrl: string = await imageService.uploadImage(file)
  localPOI.value?.images.push(imgUrl)
}

async function handleRemoveImage(index: number) {
  const url = localPOI.value?.images[index] as string
  try {
    await imageService.deleteImage(url) // remove from backend
    localPOI.value?.images.splice(index, 1) // remove locally
  } catch (err) {
    console.error('Failed to delete image:', err)
    alert('Could not delete image. Please try again.')
  }
}
</script>

<style src="../../styles/POIEditor.css"></style>
