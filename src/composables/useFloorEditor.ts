import { toRaw, type Ref } from 'vue'
import L, { Map, ImageOverlay } from 'leaflet'
import { useBuildings } from '@/stores/buildings'

const baseImgUrl = 'https://firebasestorage.googleapis.com/v0/b/inguide-se953499.firebasestorage.app/o/sample-img.jpg?alt=media&token=b90aec28-877e-41a6-a992-4ae2fca58109'

export function useFloorEditor(
  map: Ref<Map | null>,
) {
  const buildingStore = useBuildings()
  let floorOverlay: ImageOverlay | null = null

  async function addFloorPlan(imgUrl: string = baseImgUrl) {
    try {
      buildingStore.addFloorPlan(imgUrl)
    } catch (error) {
      console.error('There is an error adding a floor', error)
    }
  }

  function deleteFloorPlan(floorId: string) {
    try {
      buildingStore.removeFloorPlan(floorId)
      if (floorOverlay) {
        toRaw(map.value)?.removeLayer(floorOverlay)
        floorOverlay = null
      }
    } catch (error) {
      console.error('There is an error deleting a floor', error)
    }
  }

  function renderFloorPlan(floorId: string) {
    const floor = buildingStore.floorById(floorId)
    if (!floor) return

    // remove old overlay
    if (floorOverlay) {
      toRaw(map.value)?.removeLayer(floorOverlay)
      floorOverlay = null
    }

    const buildingBound = buildingStore.getCurrentBuildingBound()

    // add new overlay
    const overlay = L.imageOverlay(floor.floor_plan_url, buildingBound)
    overlay.addTo(toRaw(map.value)!)
    floorOverlay = overlay
    toRaw(map.value)?.invalidateSize()
  }

  async function updateFloorPlan(floorId: string, imgUrl: string) {
    try {
      buildingStore.updateFloorPlan(floorId, imgUrl)
      renderFloorPlan(floorId)
    } catch (error) {
      console.error('There is an error updating a floor', error)
    }
  }

  return {
    addFloorPlan,
    deleteFloorPlan,
    updateFloorPlan,
    renderFloorPlan,
  }
}
