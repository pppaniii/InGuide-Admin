<template>
  <div class="canvas">
    <div class="test">
      test line <br />
      POIs Management: {{ building?.name ?? '...' }} building
    </div>
  </div>
</template>

<script setup lang="ts">
// import AdminSidePanel from '@/components/AdminSidePanel.vue';
import type { Building } from '@/types/types'

defineProps<{
  building: Building | null
  id: string
}>()
</script>

<style src="../../styles/POIsView.css"></style>
