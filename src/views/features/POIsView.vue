<template>
  <div class="canvas">
    <div class="test">
      test line <br />
      POIs Management: {{ building?.name ?? '...' }} building
    </div>
    <button @click="triggleAddPOI" style="background-color: aliceblue">Add POI</button>
  </div>
</template>

<script setup lang="ts">
import type { Building } from '@/types/types'
import MapEditor from '@/components/MapEditor.vue'
import type { Ref } from 'vue'

const props = defineProps<{
  building: Building | null
  id: string
  mapEditorRef: InstanceType<typeof MapEditor> | null
  floorId: Ref<string>
}>()

function triggleAddPOI() {
  props.mapEditorRef?.startCreatingPOI()
}
</script>

<style src="../../styles/POIsView.css"></style>
