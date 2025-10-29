// src/composables/useFileSelector.ts

import { ref } from 'vue'

// Default allowed types (can be overridden)
const defaultAllowedTypes = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/svg+xml'
]

/**
 * A composable for handling file selection, validation, and drag-and-drop.
 * @param allowedTypes - An array of MIME types to accept.
 * @returns An object with state and methods for file selection.
 */
export function useFileSelector(allowedTypes: string[] = defaultAllowedTypes) {
  const file = ref<File | null>(null)
  const fileInput = ref<HTMLInputElement | null>(null)

  /**
   * Programmatically clicks the hidden file input.
   */
  function triggerFileInput() {
    fileInput.value?.click()
  }

  /**
   * Handles the 'change' event from the file input.
   */
  function handleChange(e: Event) {
    const target = e.target as HTMLInputElement
    if (target.files && target.files.length > 0) {
      validateAndSetFile(target.files[0])
    }
  }

  /**
   * Handles the 'drop' event for drag-and-drop.
   */
  function handleDrop(e: DragEvent) {
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0])
    }
  }

  /**
   * Validates a file against the allowedTypes and sets it as the 'file' ref.
   * @param selectedFile - The file to validate.
   * @returns boolean - True if validation passed, false otherwise.
   */
  function validateAndSetFile(selectedFile: File): boolean {
    if (!allowedTypes.includes(selectedFile.type)) {
      alert(
        `Invalid file type. Please select one of: ${allowedTypes.join(', ')}`
      )
      clearFile()
      return false
    }
    file.value = selectedFile
    return true
  }

  /**
   * Clears the selected file.
   */
  function clearFile() {
    file.value = null
    // Also reset the file input if it exists
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }

  /**
   * Checks if a file is currently selected.
   */
  function isSelectedFile(): boolean {
    return file.value != null
  }

  // Return the independent state and methods
  return {
    file,
    fileInput,
    triggerFileInput,
    handleDrop,
    handleChange,
    clearFile,
    isSelectedFile,
    validateAndSetFile
  }
}
