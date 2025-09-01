<template>
  <div class="test">
    Walkways Management: {{ building?.name ?? '...' }} <br />
    building
  </div>
  <button @click="triggerMapConnect" style="background-color: aliceblue">Connect/Add Path</button>
  <button @click="triggerMapDelete" style="background-color: aliceblue">Delete Path</button>
  <p>temporary change floor buttons:</p>
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

function triggerMapConnect() {
  props.mapEditorRef?.startConnecting()
}

function triggerMapDelete() {
  props.mapEditorRef?.startDeleting()
}
</script>

<style src="../../styles/WalkwaysView.css"></style>
