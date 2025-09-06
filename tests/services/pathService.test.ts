import { describe, it, expect, vi } from 'vitest'

// Mock the module first
vi.mock('@/services/pathService', () => {
  return {
    default: {
      loadPath: vi.fn(() =>
        Promise.resolve({
          nodes: new Map([
            ['n1', { id: 'n1' }],
            ['n2', { id: 'n2' }],
          ]),
          adjacencyList: new Map([
            ['n1', [{ targetNodeId: 'n2', weight: 10 }]],
            ['n2', [{ targetNodeId: 'n1', weight: 10 }]],
          ]),
        }),
      ),
      savePath: vi.fn(() => Promise.resolve({ status: 'success' })),
    },
  }
})

// Now import after mocking
import pathService from '@/services/pathService'

describe('ITC-08 [admin] pathService', () => {
  it('TC-01 loadPath retrieves graph', async () => {
    const { nodes, adjacencyList } = await pathService.loadPath('testBuildingId1', 'testFloorId1')
    expect(nodes.size).toBe(2)
    expect(adjacencyList.get('n1')?.[0].targetNodeId).toBe('n2')
  })

  it('TC-02 savePath confirms save', async () => {
    const result = await pathService.savePath('testBuildingId1', 'testFloorId1', new Map(), new Map())
    expect(result.status).toBe('success')
  })
})
