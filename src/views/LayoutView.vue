<template>
  <div class="admin-shell">
    <!-- Sidebar -->
    <AdminSidePanel>
      <!-- Child route content goes inside the sidebar -->
      <RouterView :building="building" :id="id" />
    </AdminSidePanel>

    <!-- Main Content -->
    <main class="main">
      <!-- Navbar -->
      <AdminNavbar
        :title="building?.name ?? 'Building'"
        :back="true"
        @back="$router.push({ name: 'home' })"
      >
        <template #title>{{ building?.name ?? 'Building' }}</template>
        <template #actions><slot name="actions" /></template>
        <template #avatar><slot name="avatar" /></template>
      </AdminNavbar>

      <!-- Page content -->
      <section class="content">
        <h3>This is details page</h3>

        <!-- Tabs -->
        <nav class="tabs">
          <RouterLink class="tab" :to="{ name: 'building-floorplan', params: { id } }">Floor Plan</RouterLink>
          <RouterLink class="tab" :to="{ name: 'building-pois', params: { id } }">POIs</RouterLink>
          <RouterLink class="tab" :to="{ name: 'building-walkway', params: { id } }">Walkway</RouterLink>
          <RouterLink class="tab" :to="{ name: 'building-beacons', params: { id } }">Beacons</RouterLink>
        </nav>

        <!-- Map editor stays in main content -->
        <!-- Map editor ปรับขนาดตาม parent's size เอา div ครอบละปรับขนาดได้เลย-->
        <MapEditor />
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import AdminSidePanel from '@/components/AdminSidePanel.vue'
import AdminNavbar from '@/components/AdminNavbar.vue'
import MapEditor from '@/components/MapEditor.vue'

import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useBuildings } from '@/stores/buildings'

const route = useRoute()
const id = computed(() => String(route.params.id))

const store = useBuildings()
const building = computed(() => store.current)
</script>

<style src="@/styles/LayoutView.css"></style>

<style scoped>
.admin-shell {
  display: grid;
  grid-template-columns: 260px 1fr; /* Sidebar + main content */
  width: 100%;
  height: 100vh;
}

.main {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content {
  flex: 1;           /* Fill remaining space */
  overflow: auto;    /* Scroll if content grows */
  padding: 1rem;
}

.tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}
</style>

