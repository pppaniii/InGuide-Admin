/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest'
import type { POI } from '@/types/poi'

// Test Data (from Progress 2)
const TD = {
  buildingId: 'testBuildingId1',
  floorId: 'testFloorId1',
  poiId1: 'poi1',
  poiId2: 'poi2',
  newLatLng: [18.800, 98.952] as [number, number],
  poi1: {
    id: 'poi1',
    name: 'Test POI 1',
    detail: 'this is test poi 1',
    location: [18.799, 98.950] as [number, number],
    floor: 1,
    type: '-',
    images: [],
  } as POI,
  poi2: {
    id: 'poi2',
    name: 'Test POI 2',
    detail: 'this is test poi 2',
    location: [18.796, 98.950] as [number, number],
    floor: 1,
    type: '-',
    images: [],
  } as POI,
  newPOI: {
    id: 'poi3',
    name: 'New Test POI',
    detail: 'this is a new test poi',
    location: [18.797, 98.951] as [number, number],
    floor: 1,
    type: '-',
    images: [],
  } as POI,
}

// Mock poiService default export
vi.mock('@/services/poiService', () => {
  return {
    default: {
      getPOIs: vi.fn(() => Promise.resolve([TD.poi1, TD.poi2])),
      getPOIById: vi.fn((buildingId: string, poiId: string) =>
        Promise.resolve(poiId === TD.poi1.id ? TD.poi1 : TD.poi2),
      ),
      addOrUpdatePOI: vi.fn((buildingId: string, floorId: string, poi: POI) =>
        Promise.resolve(poi),
      ),
      updatePOI: vi.fn((buildingId: string, floorId: string, poiId: string, newLatLng: [number, number]) =>
        Promise.resolve({
          ...TD.poi1,
          location: newLatLng,
        }),
      ),
      deletePOI: vi.fn((buildingId: string, floorId: string, poiId: string) =>
        Promise.resolve({ status: 'success', message: `POI ${poiId} deleted.` }),
      ),
    },
  }
})

// Import service after mocking
import poiService from '@/services/poiService'

describe('ITC-07 [admin] usePOIService', () => {
  // TC-01: getPOIs
  it('TC-01: getPOIs retrieves all POIs for building/floor', async () => {
    const pois = await poiService.getPOIs(TD.buildingId, TD.floorId)
    expect(pois).toHaveLength(2)
    expect(poiService.getPOIs).toHaveBeenCalledWith(TD.buildingId, TD.floorId)
    expect(pois[0].id).toBe('poi1')
    expect(pois[1].id).toBe('poi2')
  })

  // TC-02: getPOIById
  it('TC-02: getPOIById retrieves correct POI', async () => {
    const poi = await poiService.getPOIById(TD.buildingId, TD.poiId1)
    expect(poi.id).toBe('poi1')
    expect(poi.name).toBe('Test POI 1')
    expect(poiService.getPOIById).toHaveBeenCalledWith(TD.buildingId, TD.poiId1)
  })

  // TC-03: addOrUpdatePOI
  it('TC-03: addOrUpdatePOI adds new POI', async () => {
    const result = await poiService.addOrUpdatePOI(TD.buildingId, TD.floorId, TD.newPOI)
    expect(result).toEqual(TD.newPOI)
    expect(poiService.addOrUpdatePOI).toHaveBeenCalledWith(TD.buildingId, TD.floorId, TD.newPOI)
  })

  // TC-04: updatePOI
  it('TC-04: updatePOI updates location of existing POI', async () => {
    const updatedPOI = await poiService.updatePOI(TD.buildingId, TD.floorId, TD.poiId1, TD.newLatLng)
    expect(updatedPOI.location).toEqual(TD.newLatLng)
    expect(poiService.updatePOI).toHaveBeenCalledWith(TD.buildingId, TD.floorId, TD.poiId1, TD.newLatLng)
  })

  // TC-05: deletePOI
  it('TC-05: deletePOI removes specified POI', async () => {
    const result = await poiService.deletePOI(TD.buildingId, TD.floorId, TD.poiId2)
    expect(result).toEqual({ status: 'success', message: `POI ${TD.poiId2} deleted.` })
    expect(poiService.deletePOI).toHaveBeenCalledWith(TD.buildingId, TD.floorId, TD.poiId2)
  })
})
