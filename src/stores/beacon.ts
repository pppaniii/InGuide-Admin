// src/stores/beacon.ts
import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Beacon } from '@/types/beacon'

export const useBeaconStore = defineStore('beacon', () => {
  const beacons = ref<Beacon[] | null>(null)

  function loadBeacons(newBeacons: Beacon[]) {
    beacons.value = newBeacons
  }

  function clearBeacons() {
    beacons.value = null
  }

  function addOrUpdateBeacon(beacon: Beacon) {
  if (!beacons.value) {
    console.warn('There are no beacons loaded right now.')
    return
  }

  const index = beacons.value.findIndex(b => b.beaconId === beacon.beaconId)

  if (index === -1) {
    // Not found → add new beacon
    beacons.value.push(beacon)
  } else {
    // Already exists → update all fields
    beacons.value[index] = { ...beacons.value[index], ...beacon }
  }
}

  function deleteBeacon(beaconId: string) {
    if (beacons.value) {
      beacons.value = beacons.value.filter(b => b.beaconId !== beaconId)
    }
  }

  return { beacons, loadBeacons, clearBeacons, addOrUpdateBeacon, deleteBeacon }
})
