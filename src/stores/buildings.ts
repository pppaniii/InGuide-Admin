// mock API
import { defineStore } from 'pinia'
import { AdminService } from '@/service/adminService'
import type { Building } from '@/types'

export const useBuildings = defineStore('buildings', {
  state: () => ({
    items: [] as Building[],
    loading: false,
    error: '' as string | undefined,
  }),
  actions: {
    async fetch(): Promise<void> {
      this.loading = true
      this.error = undefined
      try {
        this.items = await AdminService.listBuildings()
      } catch (e: unknown) {
        this.error = e instanceof Error ? e.message : String(e)
      } finally {
        this.loading = false
      }
    },
    async create(name: string): Promise<void> {
      try {
        const b = await AdminService.createBuilding(name)
        this.items.push(b)
      } catch (e: unknown) {
        this.error = e instanceof Error ? e.message : String(e)
      }
    },
    async remove(id: string): Promise<void> {
      try {
        await AdminService.deleteBuilding(id)
        this.items = this.items.filter(b => b.id !== id)
      } catch (e: unknown) {
        this.error = e instanceof Error ? e.message : String(e)
      }
    },
  },
})