<template>
  <div class="canvas">
    <div class="text-test">Floor Plan Management: {{ building?.name ?? '...' }} building</div>
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
  </div>
</template>

<script setup lang="ts">
import type { BuildingInfo } from '@/types/types'
import MapEditor from '@/components/MapEditor.vue'
import type { Ref } from 'vue';

const props = defineProps<{
  building: BuildingInfo
  id: string
  mapEditorRef: InstanceType<typeof MapEditor> | null
  floorId: Ref<string>
}>()

const emit = defineEmits(['update:floorId'])

</script>

<style src="../../styles/FloorPlanView.css"></style>
