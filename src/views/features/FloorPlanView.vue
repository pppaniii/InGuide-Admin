<template>
  <!-- Panel Title -->
  <div>
    <div class="floor-title">
      Floor Management: <br>
      {{ building?.name ?? '...' }}
    </div>
  </div>
  <div class="floor-panel">
    <!-- Floor List -->
    <div class="floor-list">
      <button
        v-for="floor in props.building.floors"
        :key="floor.id"
        class="floor-item"
        :class="{ active: floor.id === props.floorId }"
        @click="emit('update:floorId', floor.id)"
        >
          {{ floor.floor }}
      </button>
    </div>

    <!-- Action Buttons -->
    <div class="floor-actions">
        <button class="floor-btn add">Add Floor</button>
        <button class="floor-btn edit">Edit Floor</button>
        <button class="floor-btn delete">Delete Floor</button>
    </div>
  </div>
  <!-- <div class="canvas">
    <div class="floor-">Floor Plan Management: {{ building?.name ?? '...' }} building</div>
  </div>
  <p>temporary change floor buttons:</p>
  <div v-for="floor in props.building.floors" :key="floor.id">
    <button
      @click="emit('update:floorId', floor.id)"
      style="background-color: aliceblue"
      class="w-full"
    >
      {{ floor.floor }}
    </button>
  </div> -->
</template>

<script setup lang="ts">
import type { BuildingInfo } from '@/types/types'
import MapEditor from '@/components/MapEditor.vue'
// import type { Ref } from 'vue';

const props = defineProps<{
  building: BuildingInfo
  id: string
  mapEditorRef: InstanceType<typeof MapEditor> | null
  floorId: string
}>()

const emit = defineEmits(['update:floorId'])

</script>

<style src="../../styles/FloorPlanView.css"></style>
