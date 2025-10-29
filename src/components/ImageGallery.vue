<template>
  <div class="flex gap-2 overflow-x-auto p-2">
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

    <label
      class="flex-shrink-0 w-32 h-32 flex items-center justify-center border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-100"
    >
      <span class="text-gray-500 text-sm">+ Add</span>
      <input
        type="file"
        class="hidden"
        accept="image/png, image/jpeg, image/jpg" @change="onFileChange"
      />
    </label>
  </div>
</template>

<script setup lang="ts">
import { useFileSelector } from '@/composables/useFileSelector' // IMPORT THE FUNCTION

const props = defineProps<{
  images: string[]
}>()

const emit = defineEmits<{
  (e: 'add', file: File): void
  (e: 'remove', index: number): void
}>()

// CREATE A *SEPARATE* INSTANCE for the image gallery
// Note the different allowed types
const imageFileSelector = useFileSelector(['image/png', 'image/jpeg', 'image/jpg'])

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  const file = input.files[0]

  // Use the instance's validator
  // It will show an alert if validation fails
  if (imageFileSelector.validateAndSetFile(file)) {
    // Validation passed, emit the file
    emit('add', file)
  }

  // Always reset the input so the same file can be re-added if needed
  input.value = ''

  // We don't need to keep the file in imageFileSelector.file,
  // so we can clear it.
  imageFileSelector.clearFile()
}
</script>
