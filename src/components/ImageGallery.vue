<template>
  <div class="flex gap-2 overflow-x-auto p-2">
    <!-- Images -->
    <div
      v-for="(url, index) in props.images"
      :key="index"
      class="flex-shrink-0 w-32 h-32 relative rounded-lg overflow-hidden border"
    >
      <img :src="url" alt="gallery image" class="w-full h-full object-cover" />
      <button
        class="absolute top-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded"
        @click="$emit('remove', index)"
      >
        ✕
      </button>
    </div>

    <!-- Add Image button -->
    <label
      class="flex-shrink-0 w-32 h-32 flex items-center justify-center border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-100"
    >
      <span class="text-gray-500 text-sm">+ Add</span>
      <input type="file" class="hidden" @change="onFileChange" />
    </label>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  images: string[]
}>()

const emit = defineEmits<{
  (e: 'add', file: File): void
  (e: 'remove', index: number): void
}>()

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return
  emit('add', input.files[0])
  input.value = '' // reset so same file can be re-added if needed
}
</script>
