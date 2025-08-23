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
        <font-awesome-icon icon="user"/>
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

<style src="../styles/AdminNavbar.css"></style>