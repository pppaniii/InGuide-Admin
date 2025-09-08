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
    <div class="poi-list">
      
    </div>
    <!-- Action Button -->
    <div>
      <button 
      @click="triggleAddPOI"
      class="poi-btn add"> 
      Add POI</button>
    </div>
  </div>
  <!-- <hr>
  <div class="canvas">
    <div class="test">
      POIs Management: {{ building?.name ?? '...' }} building
    </div>
    <button @click="triggleAddPOI" style="background-color: aliceblue">Add POI</button>
  </div> -->
</template>

<script setup lang="ts">
import type { Building } from '@/types/types'
import MapEditor from '@/components/MapEditor.vue'
import type { Ref } from 'vue'
import type { POI } from '@/types/poi';


const props = defineProps<{
  building: Building | null
  id: string
  mapEditorRef: InstanceType<typeof MapEditor> | null
  floorId: Ref<string>
  pois?: POI[]
}>()

function triggleAddPOI() {
  props.mapEditorRef?.startCreatingPOI()
}


</script>

<style src="../../styles/POIsView.css"></style>
