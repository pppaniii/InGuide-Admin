<template>
  <aside class="sidebar">
    <div class="brand">
      <div class="logo">
        <font-awesome-icon icon="location-dot" />
      </div>
      <span class="brand-name">InGuide</span>
    </div>

    <hr class="divider" />

    <!-- Sidebar route content -->
    <slot/>

    <div class="sidebar-footer">
      <button class="logout" type="button" @click="handleLogout">
        <font-awesome-icon icon="right-from-bracket" />
        Log out
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuth } from '@/stores/auth'

const emit = defineEmits<{ (e: 'logout'): void }>()

const router = useRouter()
const auth = useAuth()

async function handleLogout() {
  await auth.logout()
  emit('logout')
  router.push({ name: 'login' })
}
</script>

<style src="../styles/AdminSidePanel.css"></style>
