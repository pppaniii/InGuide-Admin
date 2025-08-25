// mock API
import type { Building } from '@/types'

const KEY = 'ing_admin_mock_v1'
type DB = { buildings: Building[] }

function uid(prefix='b'){ return `${prefix}_${Math.random().toString(36).slice(2,9)}` }

function load(): DB {
  const raw = localStorage.getItem(KEY)
  if (raw) return JSON.parse(raw) as DB
  const seed: DB = { buildings: [{ id:'b1', name:'Building1' }] }
  localStorage.setItem(KEY, JSON.stringify(seed))
  return seed
}

function save(db:DB){ localStorage.setItem(KEY, JSON.stringify(db)) }

export interface AdminServiceAPI {
  listBuildings(): Promise<Building[]>
  createBuilding(name: string): Promise<Building>
  deleteBuilding(id: string): Promise<void>
  getBuilding(id: string): Promise<Building | undefined>
}

export const AdminService = {
  async listBuildings(): Promise<Building[]> {
    return load().buildings
  },
  async createBuilding(name:string): Promise<Building> {
    const db = load()
    const b: Building = { id: uid('b'), name }
    db.buildings.push(b)
    save(db)
    return b
  },
  async deleteBuilding(id:string): Promise<void> {
    const db = load()
    db.buildings = db.buildings.filter(b => b.id !== id)
    save(db)
  },
  async getBuilding(id:string): Promise<Building | undefined>{
    const db = load()
    return db.buildings.find(b => b.id === id)
  },
}
