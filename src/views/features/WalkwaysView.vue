<template>
  <div class="canvas">
    <div class="test">
      Walkways Management: {{ building?.name ?? '...' }} <br />
      building
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

<style src="../../styles/WalkwaysView.css"></style>
