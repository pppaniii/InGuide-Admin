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

  function addPOI(poi: POI) {
    if(pois.value !== null) {
      pois.value?.push(poi)
    } else {
      console.log('There is no POI loaded right now T-T')
    }
  }

  return { pois, loadPOIs, clearPOIs, addPOI }
})
