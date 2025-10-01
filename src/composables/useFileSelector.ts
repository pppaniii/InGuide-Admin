import { ref } from "vue"

// File uploads
const file = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

function triggerFileInput() {
  fileInput.value?.click()
}

function handleChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    file.value = target.files[0]
  }
}

function handleDrop(e: DragEvent) {
  if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
    file.value = e.dataTransfer.files[0]
  }
}

function clearFile() {
  file.value = null
}

function isSelectedFile(): boolean {
  return file.value != null
}

export default {
  file,
  triggerFileInput,
  handleDrop,
  handleChange,
  clearFile,
  isSelectedFile,
}


