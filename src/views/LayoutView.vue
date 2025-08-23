<template>
  <AdminSidePanel :back="true" @back="$router.push({ name: 'home' })">
    <template #title>{{ building?.name ?? 'Building' }}</template>
    <h3>this is details page</h3>
    
    <nav class="tabs">
      <RouterLink class="tab" :to="{ name: 'building-floorplan', params: { id } }">Floor Plan</RouterLink>
      <RouterLink class="tab" :to="{ name: 'building-pois',      params: { id } }">POIs</RouterLink>
      <RouterLink class="tab" :to="{ name: 'building-walkway',   params: { id } }">Walkway</RouterLink>
      <RouterLink class="tab" :to="{ name: 'building-beacons',   params: { id } }">Beacons</RouterLink>
    </nav>

    <!-- Child tab renders here -->
    <section class="manage">
      <RouterView :building="building" :id="id" />
    </section>
  </AdminSidePanel>
</template>

<script setup lang="ts">
import AdminSidePanel from '@/views/AdminSidePanel.vue';
// import type { Building } from '@/types';

import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useBuildings } from '@/stores/buildings';
// import { AdminService } from '@/service/adminService';

const route = useRoute()
const id = computed(() => String(route.params.id))

const store = useBuildings()
const building = computed(() => store.current)

// onMounted(async () => {
//   const currentId = id.value
//   const fromStore = store.items.find(x => x.id === currentId)
//   const fetched = fromStore ?? await AdminService.getBuilding(currentId)
//   building.value = fetched ?? null
// })

</script>

<style src="../styles/LayoutView.css"></style>