<template>
  <div class="canvas">
    <div class="text-test">Floor Plan Management: {{ building?.name ?? '...' }} building</div>
  </div>
  <button @click="triggerMapConnect" style="background-color: aliceblue;">Connect/Add Path</button>
</template>

<script setup lang="ts">
// import AdminSidePanel from '@/components/AdminSidePanel.vue';
import type { Building } from '@/types'
import MapEditor from '@/components/MapEditor.vue'

const props = defineProps<{
  building: Building | null
  id: string
  mapEditorRef: InstanceType<typeof MapEditor> | null
}>()

// This function use a function from MapEditor
function triggerMapConnect() {
  props.mapEditorRef?.startConnecting()
}
</script>

<style src="../../styles/FloorPlanView.css"></style>
