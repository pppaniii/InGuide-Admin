<template>
  <AdminSidePanel :back="true" @back="$router.push({ name: 'home' })">
    <template #title>{{ building?.name ?? 'Building' }}</template>
    <h3>this is details page</h3>
    <MapEditor/>
  </AdminSidePanel>
</template>

<script setup lang="ts">
import AdminSidePanel from '@/views/AdminSidePanel.vue';
import MapEditor from '@/components/MapEditor.vue';
import type { Building } from '@/types';

import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useBuildings } from '@/stores/buildings';
import { AdminService } from '@/service/adminService';

const route = useRoute()
const id = computed(() => String(route.params.id))

const store = useBuildings()
const building = ref<Building | null>(null)

onMounted(async () => {
  const currentId = id.value
  const fromStore = store.items.find(x => x.id === currentId)
  const fetched = fromStore ?? await AdminService.getBuilding(currentId)
  building.value = fetched ?? null
})

</script>

<style src="../styles/LayoutView.css"></style>
