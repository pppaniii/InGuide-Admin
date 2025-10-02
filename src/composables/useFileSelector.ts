import { ref } from "vue"

const file = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

// Allowed mime types (safe for Leaflet overlay)
const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"]

function triggerFileInput() {
  fileInput.value?.click()
}

function handleChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    validateAndSetFile(target.files[0])
  }
}

function handleDrop(e: DragEvent) {
  if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
    validateAndSetFile(e.dataTransfer.files[0])
  }
}

function validateAndSetFile(selectedFile: File) {
  if (!allowedTypes.includes(selectedFile.type)) {
    alert("Invalid file type. Please select a PNG, JPEG, or SVG image.")
    clearFile()
    return
  }
  file.value = selectedFile
}

function clearFile() {
  file.value = null
}

function isSelectedFile(): boolean {
  return file.value != null
}

export default {
  file,
  fileInput,
  triggerFileInput,
  handleDrop,
  handleChange,
  clearFile,
  isSelectedFile,
  validateAndSetFile,
}
