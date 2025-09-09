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

  function addBeacon(beacon: Beacon) {
    if (beacons.value !== null) {
      beacons.value.push(beacon)
    } else {
      console.warn('There are no beacons loaded right now.')
    }
  }

  function updateBeacon(beaconId: string, newLatLng: [number, number]) {
    if (beacons.value) {
      const target = beacons.value.find(b => b.beaconId === beaconId)
      if (target) target.latLng = newLatLng
    }
  }

  function deleteBeacon(beaconId: string) {
    if (beacons.value) {
      beacons.value = beacons.value.filter(b => b.beaconId !== beaconId)
    }
  }

  return { beacons, loadBeacons, clearBeacons, addBeacon, updateBeacon, deleteBeacon }
})
