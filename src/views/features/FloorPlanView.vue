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
  selectFloorFile: () => Promise<File | null>
  id: string
  mapEditorRef: InstanceType<typeof MapEditor> | null
  floorId: string
}>()

const addFloorPlan = () => {
  props.mapEditorRef?.addFloorPlan()
}

const updateFloorPlan = async () => {
  if (!props.floorId || !props.mapEditorRef) return
  emit("openPopUp")
  // Ask parent to select a file

  // Continue logic in child
  // const imgUrl = await imageService.uploadImage(file)
  // await props.mapEditorRef.updateFloorPlan(props.floorId, imgUrl)
}

const deleteFloorPlan = () => {


}

const emit = defineEmits(['update:floorId', 'openPopUp'])
</script>

<style src="../../styles/FloorPlanView.css"></style>
