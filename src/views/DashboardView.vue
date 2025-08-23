<template>
  <AdminLayout>
    <template #title>Your Building</template>
    <div v-if="store.loading">Loading…</div>
    <div v-else class="grid">
      <!-- Existing buildings -->
      <BuildingCard
        v-for="b in store.items"
        :key="b.id"
        :building="b"
        @open="openBuilding"
        @delete="deleteBuilding"
      />
      <!-- Add card -->
      <BuildingCard @add="addBuilding" />
    </div>

    <p v-if="isEmpty" class="empty">No buildings yet. Click <strong>＋</strong> to add one.</p>
  </AdminLayout>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '@/views/AdminSidePanel.vue'
import BuildingCard from '@/components/BuildingCard.vue'
import { useBuildings } from '@/stores/buildings' // <-- your store file

const router = useRouter()
const store = useBuildings()

onMounted(() => { void store.fetch() })
const isEmpty = computed(() => !store.loading && store.items.length === 0)

async function addBuilding(): Promise<void> {
  const name = (prompt('Building name?') ?? '').trim()
  if (!name) return
  await store.create(name)   
}

async function deleteBuilding(id: string): Promise<void> {
  if (confirm('Delete this building?')) await store.remove(id)
}

function openBuilding(id: string): void {
  router.push({ name: 'building-floorplan', params: { id }})
}
</script>


<style src="../styles/DashboardView.css"></style>
