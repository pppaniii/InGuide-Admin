<template>
  <transition name="slide">
    <div v-if="visible" class="overlay-panel">
      <header class="overlay-header">
        <h3>{{ title }}</h3>
        <button @click="$emit('close')">✕</button>
      </header>
      <div class="overlay-body">
        <slot />
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean
  title?: string
}>()

defineEmits(['close'])
</script>

<style scoped>
.overlay-panel {
  position: absolute;
  top: 70px;
  right: 0;
  width: 380px;
  height: 91.5%;
  background: #D8EAD2;
  box-shadow: -2px 0 8px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  z-index: 2000;
}

.overlay-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.overlay-body {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.slide-enter-active, .slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from, .slide-leave-to {
  transform: translateX(100%);
}
</style>
