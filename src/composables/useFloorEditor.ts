import { toRaw, type Ref } from 'vue'
import L, { ImageOverlay, Map } from 'leaflet'
import { useBuildings } from '@/stores/buildings'

const baseImgUrl =
  'https://firebasestorage.googleapis.com/v0/b/inguide-se953499.firebasestorage.app/o/sample-img.jpg?alt=media&token=b90aec28-877e-41a6-a992-4ae2fca58109'

export function useFloorEditor(
  map: Ref<Map | null>,
  floorOverlay: Ref<ImageOverlay>,
  buildingBound: [number, number][],
) {
  const buildingStore = useBuildings()

  async function addFloorPlan() {
    try {
      buildingStore.addFloorPlan(baseImgUrl)
    } catch (error) {
      console.error('There is an error adding a floor', error)
    }
  }

  function deleteFloorPlan(floorId: string) {
    try {
      buildingStore.removeFloorPlan(floorId)
    } catch (error) {
      console.error('There is an error deleting a floor', error)
    }
  }

  async function updateFloorPlan(floorId: string, imgUrl: string) {
    try {
      if (imgUrl) {
        const overlay = L.imageOverlay(imgUrl, buildingBound)
        overlay.addTo(toRaw(map.value)! as L.Map)
        floorOverlay.value = overlay
      }
    } catch (error) {
      console.error('There is an error updating a floor', error)
    }
  }

  return {
    addFloorPlan,
    deleteFloorPlan,
    updateFloorPlan,
  }
}
