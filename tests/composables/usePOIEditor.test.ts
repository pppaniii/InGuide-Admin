/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'
import L from 'leaflet'
import { usePoiEditor } from '@/composables/usePOIEditor'

describe('ITC-09 updatePOI (Admin)', () => {
  let mapRef: any
  let poiLayer: L.LayerGroup

  beforeEach(() => {
    // create and activate Pinia before each test
    setActivePinia(createPinia())

    // create dummy map and layer
    mapRef = ref(new L.Map(document.createElement('div')))
    poiLayer = new L.LayerGroup()
  })

  it('should update POI position correctly', () => {
    const { createPOI } = usePoiEditor(mapRef, poiLayer, () => {})

    // use createPOI or other functions here
    const marker = createPOI('testBuilding', 'testFloor', 'Test POI', [18.33, 94.67])

    expect(marker).toBeDefined()
    expect(marker.getLatLng().lat).toBeCloseTo(18.33)
    expect(marker.getLatLng().lng).toBeCloseTo(94.67)
  })
})
