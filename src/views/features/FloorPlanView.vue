<template>
  <div class="canvas">
    <div class="text-test">Floor Plan Management: {{ building?.name ?? '...' }} building</div>
  </div>
  <button @click="triggerMapConnect" style="background-color: aliceblue">Connect/Add Path</button>
  <p>temporary change floor buttons:</p>
  <button @click="emit('update:floorId', '3six135u56G4q1yCBzKX')" style="background-color: aliceblue">Floor 2</button>
  <button @click="emit('update:floorId', 'm0ruV6f71G3MRyPhjqd9')" style="background-color: aliceblue">Floor 4 (Testable)</button>
</template>

<script setup lang="ts">
import type { Building } from '@/types/types'
import MapEditor from '@/components/MapEditor.vue'
import type { Ref } from 'vue';

const props = defineProps<{
  building: Building | null
  id: string
  mapEditorRef: InstanceType<typeof MapEditor> | null
  floorId: Ref<string>
}>()

const emit = defineEmits(['update:floorId'])

function triggerMapConnect() {
  props.mapEditorRef?.startConnecting()
}
</script>

<style src="../../styles/FloorPlanView.css"></style>
