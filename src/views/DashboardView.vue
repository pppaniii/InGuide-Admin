<template>
  <AdminLayout>
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
import AdminLayout from '@/components/AdminLayout.vue'
import BuildingCard from '@/components/BuildingCard.vue'
import { useBuildings } from '@/stores/buildings' // <-- your store file

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
  // hook up routing later
  alert(`Open building ${id}`)
}
</script>


<style scoped>
.grid {
  margin-top: 15px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
  width: 100%;
}

.empty { 
  margin-top: 12px; 
  color: #6a8772; 
}
</style>
