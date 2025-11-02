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
      <div class="walkway-floor-list" v-if="(building?.floors?.length || 0) > 0">
        <div
          v-for="f in building?.floors ?? []"
          :key="f.id"
          class="walkway-floor-item"
          :class="{ active: String(f.id) === String(props.floorId ?? '') }"
        >
          {{ f.floor }}
        </div>
      </div>
      <div v-else class="no-items">
        No floors available in this building.
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
// import type { Ref } from 'vue'

const props = defineProps<{
  building: BuildingInfo | null
  id: string
  mapEditorRef: InstanceType<typeof MapEditor> | null
  floorId: string | null
}>()

function triggerMapConnect() {
  props.mapEditorRef?.startConnecting()
}

function triggerMapDelete() {
  props.mapEditorRef?.startDeleting()
}
</script>

<style src="../../styles/WalkwaysView.css"></style>
