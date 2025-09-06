<template>
  <div>
    <div v-if="isLoading">Loading POI...</div>
    <div v-else>
      <h3>{{ localPOI?.name }}</h3>
      <!-- POI edit form here -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref, watch } from 'vue'

interface POIEditorProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  poi: any | null   // will be null initially if loading
  isLoading: boolean
}

const props = defineProps<POIEditorProps>()

// Optional: local reactive copy if you want
const localPOI = ref(props.poi)

watch(
  () => props.poi,
  (newVal) => {
    localPOI.value = newVal
  }
)
</script>


