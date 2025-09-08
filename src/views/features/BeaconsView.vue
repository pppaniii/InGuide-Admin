<template>
  <!-- Beacon Title -->
  <div>
    <div class="beacon-title">
      Beacons Management: <br>
      {{ building?.name ?? '...' }}
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

<style src="../../styles/BeaconsView.css"></style>
