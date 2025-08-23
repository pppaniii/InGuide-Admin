<template>
  <div class="admin-shell">
    <aside class="sidebar">
      <div class="brand">
        <div class="logo">
          <font-awesome-icon icon="location-dot"/>
        </div>
        <span class="brand-name">InGuide</span>
      </div>

      <hr class="divider" />
      
      <div class="sidebar-footer">
        <button class="logout" type="button" @click="$emit('logout')">
          <font-awesome-icon icon="right-from-bracket"/>
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

<style src="../styles/AdminSidePanel.css"></style>