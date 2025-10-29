<template>
  <div class="node-edit">
    <div class="title-row">
      <h3>Edit Path Node</h3>
      <p>ID: {{ props.nodeId }}</p>
    </div>
    <hr class="section-divider" />

    <label class="portal-field">
      <span class="portal-title">Portal Group (Stair/Elevator Name)</span>
      <input
        type="text"
        v-model="portalName"
        placeholder="e.g., Main Stairs"
        list="existing-portals"
        class="portal-input-field"
      />
      <datalist id="existing-portals">
        <option v-for="name in portalNames" :key="name" :value="name"></option>
      </datalist>
      <small>Leave blank if this is not a portal.</small>
    </label>

    <div class="portal-editor-action">
      <button type="button" class="portal-editor-btn save" @click="saveNode">Save</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  // 3. Added nodeId as a required prop
  nodeId: string
  portalNames: Set<string>
  currentNodePortalName: string | null
}>()

const emit = defineEmits<{
  // 4. Updated the emit event to match LayoutView's expectation
  (e: 'save-node', payload: { nodeId: string; portalName: string | null }): void
}>()

const portalName = ref(props.currentNodePortalName || '')

function saveNode() {
  // 5. Emit the full payload, including the nodeId
  emit('save-node', {
    nodeId: props.nodeId,
    portalName: portalName.value || null,
  })
}
</script>

<style>
/* Add styles similar to BeaconEditor.css */
.node-edit p {
  font-size: 0.8rem;
  color: #666;
}
</style>
