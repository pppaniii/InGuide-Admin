<template>
    <div class="canvas">
        Beacons Management: {{ building?.name ?? '...' }}
    </div>
</template>

<script setup lang="ts">
// import AdminSidePanel from '@/components/AdminSidePanel.vue';
import type { Building } from '@/types'

defineProps<{ 
    building: Building | null; id: string 
}>()
</script>