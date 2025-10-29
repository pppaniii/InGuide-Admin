<template>
  <div class="admin-shell">
    <!-- Sidebar -->
    <AdminSidePanel />

    <!-- Main Content -->
    <main class="main">
      <!-- Navbar -->
      <AdminNavbar title="Your Building">
        <template #title>Your Building</template>
      </AdminNavbar>

      <!-- Page content -->
      <section class="content">
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
      </section>
    </main>
  </div>
  <!-- Popup for adding a building -->
  <PopUpWindow v-model:visible="showPopup">
  <h2 class="popup-title">Add Building</h2>

  <!-- Error Message -->
  <div v-if="errors.length" class="error-box">
    <p v-for="(err, i) in errors" :key="i" class="error-text">⚠️ {{ err }}</p>
  </div>

  <!-- Success Message -->
  <p v-if="successMsg" class="success-text">{{ successMsg }}</p>

  <form @submit.prevent="submitBuilding" class="popup-form">
    <div class="form-row">
      <label>Building Name:</label>
      <input
        v-model="form.name"
        type="text"
        placeholder="Building Name"
        required
        :class="{ invalid: errors.some(e => e.includes('Building name')) }"
      />
    </div>

    <div class="form-row">
      <label>NW Bound:</label>
      <div class="coords">
        <input
          v-model="form.nwLat"
          type="number"
          step="any"
          placeholder="Latitude"
          required
          :class="{ invalid: errors.some(e => e.includes('NW Latitude')) }"
        />
        <input
          v-model="form.nwLng"
          type="number"
          step="any"
          placeholder="Longitude"
          required
          :class="{ invalid: errors.some(e => e.includes('NW Longitude')) }"
        />
      </div>
    </div>

    <div class="form-row">
      <label>SE Bound:</label>
      <div class="coords">
        <input
          v-model="form.seLat"
          type="number"
          step="any"
          placeholder="Latitude"
          required
          :class="{ invalid: errors.some(e => e.includes('SE Latitude')) }"
        />
        <input
          v-model="form.seLng"
          type="number"
          step="any"
          placeholder="Longitude"
          required
          :class="{ invalid: errors.some(e => e.includes('SE Longitude')) }"
        />
      </div>
    </div>

    <div class="form-actions">
      <button class="createBuildingBtn" type="submit">Save</button>
    </div>
  </form>
</PopUpWindow>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import AdminSidePanel from '@/components/AdminSidePanel.vue'
import AdminNavbar from '@/components/AdminNavbar.vue'
import BuildingCard from '@/components/BuildingCard.vue'
import { useBuildings } from '@/stores/buildings'
import PopUpWindow from '@/components/PopUpWindow.vue'

const router = useRouter()
const store = useBuildings()

onMounted(() => {
  void store.fetch()
})
const isEmpty = computed(() => !store.loading && store.items.length === 0)

const showPopup = ref(false)

const form = ref({
  name: '',
  nwLat: '',
  nwLng: '',
  seLat: '',
  seLng: '',
})

const errors = ref<string[]>([])
const successMsg = ref('')

function isValidLat(lat: number) {
  return lat >= -90 && lat <= 90
}
function isValidLng(lng: number) {
  return lng >= -180 && lng <= 180
}

async function submitBuilding() {
  errors.value = []
  successMsg.value = ''

  // --- Validation ---
  if (!form.value.name.trim()) {
    errors.value.push('Building name is required.')
  }

  const coordFields = [
    { key: 'nwLat', label: 'NW Latitude', value: form.value.nwLat, check: isValidLat },
    { key: 'nwLng', label: 'NW Longitude', value: form.value.nwLng, check: isValidLng },
    { key: 'seLat', label: 'SE Latitude', value: form.value.seLat, check: isValidLat },
    { key: 'seLng', label: 'SE Longitude', value: form.value.seLng, check: isValidLng },
  ]

  coordFields.forEach(c => {
    const num = parseFloat(c.value)
    if (isNaN(num)) {
      errors.value.push(`${c.label} must be a valid number.`)
    } else if (!c.check(num)) {
      errors.value.push(`${c.label} must be within a valid range (${c.label.includes('Lat') ? '-90 to 90' : '-180 to 180'}).`)
    }
  })

  if (errors.value.length > 0) {
    return // Exception flow → show errors
  }

  // --- Normal flow continues ---
  await store.create(
    form.value.name,
    [parseFloat(form.value.nwLat), parseFloat(form.value.nwLng)],
    [parseFloat(form.value.seLat), parseFloat(form.value.seLng)],
  )

  form.value = { name: '', nwLat: '', nwLng: '', seLat: '', seLng: '' }
  showPopup.value = false
  successMsg.value = 'Building added successfully.'
}

async function addBuilding(): Promise<void> {
  errors.value = []
  successMsg.value = ''
  showPopup.value = true
}

async function deleteBuilding(id: string): Promise<void> {
  if (confirm('Delete this building?')) await store.remove(id)
}

function openBuilding(id: string): void {
  router.push({ name: 'building-floorplan', params: { id } })
}
</script>


<style src="../styles/DashboardView.css"></style>

<style scoped>
.admin-shell {
  display: grid;
  grid-template-columns: 260px 1fr; /* Sidebar on left, main on right */
  width: 100%; /* Fix: full width */
  height: 100vh; /* Full height of viewport */
}

.main {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.popup-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 16px;
  text-align: center;
  color: #2c3e50;
}

.popup-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-row input {
  width: 100%; /* input full width */
}

.coords {
  display: flex;
  gap: 8px;
}

.coords input {
  flex: 1; /* split evenly latitude + longitude */
}

input {
  padding: 8px 10px;
  border: 1px solid #ccc;   /* mild gray border */
  border-radius: 4px;
  background: #fff;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s ease;
}

input:focus {
  border-color: #7da085;
  box-shadow: 0 0 3px rgba(125, 160, 133, 0.4);
}

.form-actions {
  display: flex;
  justify-content: flex-end; /* move button to right */
}

.createBuildingBtn {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  color: #fff;
  background: #7da085;
  transition: background 0.2s ease;
}

.createBuildingBtn:hover {
  background: #678b6f;
}

.error-box {
  background: #ffeaea;
  border: 1px solid #e39b9b;
  border-radius: 4px;
  padding: 8px 10px;
  margin-bottom: 10px;
}

.error-text {
  color: #b30000;
  font-size: 0.9rem;
  margin: 2px 0;
}

.invalid {
  border-color: #e39b9b !important;
  background: #fff5f5;
}

.success-text {
  color: #2e7d32;
  font-weight: 600;
  margin-bottom: 8px;
}

.invalid {
  border-color: #d9534f !important;
  background: #fff5f5;
}

.error-box {
  background: #ffeaea;
  border: 1px solid #d9534f;
  border-radius: 4px;
  padding: 8px 10px;
  margin-bottom: 10px;
}

.error-text {
  color: #b30000;
  font-size: 0.9rem;
  margin: 2px 0;
}

</style>
