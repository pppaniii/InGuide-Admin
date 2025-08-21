<template>
  <header class="navbar">
    <div class="nav-left">
      <button
        v-if="back"
        class="back-btn"
        type="button"
        aria-label="Back"
        @click="$emit('back')"
      >‹</button>

      <h1 class="nav-title">
        <slot name="title">{{ title }}</slot>
      </h1>
    </div>

    <div class="nav-right">
      <slot name="actions" />
      <slot name="avatar">
        <div class="profile" aria-label="Account" />
      </slot>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  /** Optional page title when you don't provide the title slot */
  title?: string
  /** Show a back button and emit 'back' when clicked */
  back?: boolean
}>()

defineEmits<{ (e: 'back'): void }>()
</script>

<style scoped>
.navbar{
  position: sticky; 
  top: 0; 
  z-index: 10;
  display: flex; 
  align-items: center; 
  justify-content: space-between;
  height: 70px; 
  padding: 0 16px;
  background: #fdf9f4; 
  border-bottom: 1px solid #e7ebe7;
}

.nav-left { 
  display:flex; 
  align-items:center; 
  gap:10px 
}

.back-btn { 
  border:0; 
  background:#e6efe8; 
  border-radius:8px; 
  padding:4px 8px; 
  cursor:pointer 
}

.nav-title { 
  margin:0; 
  font-size:18px; 
  font-weight:700; 
  color:#334b3a 
}

.nav-right { 
  display:flex; 
  align-items:center; 
  gap:10px 
}

.profile { 
  width:32px; 
  height:32px; 
  border-radius:50%; 
  background:#b4cfbb 
}
</style>
