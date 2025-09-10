<template>
  <div>
    <div class="walkway-title">
      Walkways Management: <br>
      {{ building?.name ?? '...' }} <br/>
    </div>
  </div>
  <div class="walkway-panel">
    <!-- show floor list, cant switch floor -->
    <div class="walkway-floor-list-container">
      <div class="walkway-floor-list">
        <div
          v-for="f in building?.floors ?? []"
          :key="f.id"
          class="walkway-floor-item"
          :class="{ active: f.id === floorId.value }"
        >
          {{ f.floor }}
        </div>
    </div>

    </div>

    <!-- Actions -->
    <div class="walkway-actions">
      <button class="walkway-btn connect" @click="triggerMapConnect">Connect / Add Path</button>
      <button class="walkway-btn delete"  @click="triggerMapDelete">Delete Path</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BuildingInfo } from '@/types/types'
import MapEditor from '@/components/MapEditor.vue'
import type { Ref } from 'vue'

const props = defineProps<{
  building: BuildingInfo | null
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
