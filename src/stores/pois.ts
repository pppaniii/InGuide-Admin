import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { POI } from '@/types/poi'

export const usePOIStore = defineStore('poi', () => {
  const pois = ref<POI[] | null>(null)

  function loadPOIs(newPois: POI[]) {
    pois.value = newPois
  }

  function clearPOIs() {
    pois.value = null
  }

  function addOrUpdatePOI(poi: POI) {
    if (!pois.value) {
      console.warn('There are no POIs loaded right now.')
      return
    }

    const index = pois.value.findIndex(p => p.id === poi.id)

    if (index === -1) {
      // New POI → add it
      pois.value.push(poi)
    } else {
      // Existing POI → update it (merge fields)
      pois.value[index] = { ...pois.value[index], ...poi }
    }
  }

  function deletePOI(poiId: string) {
    if (pois.value) {
      pois.value = pois.value.filter(p => p.id !== poiId)
    }
  }

  return { pois, loadPOIs, clearPOIs, addOrUpdatePOI, deletePOI }
})
