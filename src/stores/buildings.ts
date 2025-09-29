import { ref } from 'vue'
import { defineStore } from 'pinia'
import AdminService from '@/services/buildingService'
import type { BuildingInfo, Floor } from '@/types/types'
import imageService from '@/services/imageService'
import { generateId } from '@/utils/generateId'
import floorService from '@/services/floorService'

export const useBuildings = defineStore('buildings', () => {
  const items = ref<BuildingInfo[]>([])
  const current = ref<BuildingInfo | null>(null)
  const loading = ref(false)
  const error = ref<string | undefined>('')

  // --- getters ---
  const byId = (id: string) => items.value.find((b) => b.id === id)

  const floorById = (floorId: string, buildingId?: string) => {
    const effectiveBuildingId = buildingId ?? current.value?.id
    if (!effectiveBuildingId) return null
    const building = items.value.find((b) => b.id === effectiveBuildingId)
    return building?.floors.find((f) => f.id === floorId) ?? null
  }

  // --- actions ---
  function setCurrent(b: BuildingInfo | null) {
    current.value = b
  }

  async function fetch() {
    loading.value = true
    error.value = undefined
    try {
      items.value = await AdminService.listBuildings()
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : String(e)
    } finally {
      loading.value = false
    }
  }

  async function fetchById(id: string) {
    const cached = byId(id)
    if (cached) {
      current.value = cached
      return cached
    }
    try {
      const b = await AdminService.getBuilding(id)
      current.value = b ?? null
      if (b && !byId(id)) items.value.push(b)
      return b ?? null
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : String(e)
      current.value = null
      return null
    }
  }

  async function create(name: string, NE: [number, number], SW: [number, number]) {
    try {
      const b = await AdminService.createBuilding(name, NE, SW)
      if (!byId(b.id)) items.value.push(b)
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : String(e)
    }
  }

  async function remove(id: string) {
    try {
      await AdminService.deleteBuilding(id)
      items.value = items.value.filter((b) => b.id !== id)
      if (current.value?.id === id) current.value = null
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : String(e)
    }
  }

  async function addFloorPlan(img: File | string, buildingId?: string) {
    const effectiveBuildingId = buildingId ?? current.value?.id
    if (!effectiveBuildingId) {
      console.warn('No building ID available to add a floor plan')
      return
    }
    try {
      if (typeof img !== 'string') {
        img = await imageService.uploadImage(img as File)
      }
      const nextFloorNumber = current.value ? current.value.floors.length + 1 : 1
      const newFloor: Floor = {
        id: generateId(),
        floor: nextFloorNumber,
        floor_plan_url: img as string,
      }
      current.value?.floors.push(newFloor)
      floorService.addFloorPlan(newFloor, effectiveBuildingId)
    } catch (error) {
      console.log('Error adding a floor', error)
    }
  }

  async function removeFloorPlan(floorId: string, buildingId?: string) {
    const effectiveBuildingId = buildingId ?? current.value?.id
    if (!effectiveBuildingId) {
      console.warn('No building ID available to add a floor plan')
      return
    }
    try {
      if (current.value)
        current.value.floors = current.value.floors.filter((floor) => floor.id !== floorId)
      floorService.removeFloorPlan(floorId, effectiveBuildingId)
    } catch (error) {
      console.log('Error deleting a floor', error)
    }
  }

  async function updateFloorPlan(floorId: string, imgUrl: string, buildingId?: string) {
    const effectiveBuildingId = buildingId ?? current.value?.id
    if (!effectiveBuildingId) {
      console.warn('No building ID available to add a floor plan')
      return
    }
    try {
      const floor = current.value?.floors.find((floor) => floor.id === floorId)
      if (floor) {
        floor.floor_plan_url = imgUrl
      }
      floorService.updateFloorPlan(floorId, imgUrl, effectiveBuildingId)
      return imgUrl
    } catch (error) {
      console.log('Error updating a floor', error)
    }
  }

  return {
    items,
    current,
    loading,
    error,
    byId,
    floorById,
    setCurrent,
    fetch,
    fetchById,
    create,
    remove,

    addFloorPlan,
    removeFloorPlan,
    updateFloorPlan,
  }
})
