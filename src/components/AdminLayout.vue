<template>
  <div class="admin-shell">
    <aside class="sidebar">
      <div class="brand">
        <div class="logo" />
        <span class="brand-name">InGuide</span>
      </div>
      <hr class="divider" />
      <div class="sidebar-footer">
        <button class="logout" type="button" @click="$emit('logout')">
          Log out
        </button>
      </div>
    </aside>

    <main class="main">
      <!-- Reusable navbar for every page -->
      <AdminNavbar :title="title" :back="back" @back="$emit('back')">
        <!-- pass through page-provided slots -->
        <template #title><slot name="title">{{ title }}</slot></template>
        <template #actions><slot name="actions" /></template>
        <template #avatar><slot name="avatar" /></template>
      </AdminNavbar>

      <section class="content">
        <slot />
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">

import AdminNavbar from './AdminNavbar.vue';

defineProps<{
  title?: string;
  back?: boolean
}>()

defineEmits<{ 
  (e:'back'): void; 
  (e:'logout'): void 
}>()

</script>

<style scoped>
.admin-shell { 
  display: grid; 
  grid-template-columns: 260px 1fr; 
  height:100vh; 
  width:100% 
}

.sidebar {
  background: #A3C4A8; 
  color: #0f2a1b; 
  padding: 16px;
  display: flex; 
  flex-direction: column; 
  gap: 12px;
}

.brand { 
  display: flex; 
  align-items: center; 
  gap: 10px 
}

.logo { 
  width: 36px; 
  height: 36px; 
  border-radius: 8px; 
  background: #fff 
}

.brand-name { 
  font-size: 18px;
  font-weight: 700; 
}

.divider { 
  border:0; 
  height:1px; 
  background:rgba(255,255,255,.4) 
}

.sidebar-footer {
  margin-top: auto 
}

.logout {
  border: 0; 
  background: rgba(255,255,255,.25); 
  padding: 8px 10px; 
  border-radius:8px; 
  cursor: pointer;
}

.logout:hover { 
  background:rgba(255,255,255,.35) 
}

.main { 
  display: flex; 
  flex-direction: column; 
  min-width: 0; 
  overflow: hidden 
}

.content { 
  padding: 16px; 
  overflow: auto; 
  height: 100% 
}
</style>
