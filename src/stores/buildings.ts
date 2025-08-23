// mock API
import { defineStore } from 'pinia'
import { AdminService } from '@/service/adminService'
import type { Building } from '@/types'

export const useBuildings = defineStore('buildings', {
  state: () => ({
    items: [] as Building[],
    current: null as Building | null,
    loading: false,
    error: '' as string | undefined,
  }),
  getters: {
    byId: (state) => (id: string) => state.items.find(b => b.id === id),
  },
  actions: {
    setCurrent(b: Building | null): void {
      this.current = b
    },

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

    async fetchById(id: string): Promise<Building | null> {
      const cached = this.byId(id)
      if (cached) {
        this.current = cached
        return cached
      }

      try {
        const b = await AdminService.getBuilding(id)
        this.current = b ?? null
        // optionally cache it locally so later pages have it
        if (b && !this.byId(id)) this.items.push(b)
        return b ?? null
      } catch (e: unknown) {
        this.error = e instanceof Error ? e.message : String(e)
        this.current = null
        return null
      }
    },

    async create(name: string): Promise<void> {
      try {
        const b = await AdminService.createBuilding(name)
        // avoid dupes if list was already updated elsewhere
        if (!this.byId(b.id)) this.items.push(b)
      } catch (e: unknown) {
        this.error = e instanceof Error ? e.message : String(e)
      }
    },

    async remove(id: string): Promise<void> {
      try {
        await AdminService.deleteBuilding(id)
        this.items = this.items.filter(b => b.id !== id)
        if (this.current?.id === id) this.current = null
      } catch (e: unknown) {
        this.error = e instanceof Error ? e.message : String(e)
      }
    },
  },
})
