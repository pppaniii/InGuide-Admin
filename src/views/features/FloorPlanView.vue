<template>
  <!-- Panel Title -->
  <div>
    <div class="floor-title">
      Floor Management: <br />
      {{ building?.name ?? '...' }}
    </div>
  </div>
  <div class="floor-panel">
    <!-- Floor List -->
    <div class="floor-list-container">
      <div class="floor-list" v-if="props.building.floors.length != 0">
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
      <div v-else class="no-items">
        No floors available in this building.
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="floor-actions">
      <button class="floor-btn add" @click="addFloorPlan">Add Floor</button>
      <button class="floor-btn edit" @click="updateFloorPlan">Edit Floor</button>
      <button class="floor-btn delete" @click="deleteFloorPlan">Delete Floor</button>
    </div>
  </div>
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

const addFloorPlan = () => {
  props.mapEditorRef?.addFloorPlan()
}

const updateFloorPlan = async () => {
  if (!props.floorId || !props.mapEditorRef) return
  emit('setPopUpContent', { content: 'UPDATE_FLOOR'})
  emit('openPopUp')
}

const deleteFloorPlan = () => {
  if (!props.floorId || !props.mapEditorRef) return
  emit('setPopUpContent', { content: 'DELETE_FLOOR'})
  emit('openPopUp')
}

const emit = defineEmits(['update:floorId', 'openPopUp', 'setPopUpContent'])
</script>

<style src="../../styles/FloorPlanView.css"></style>
