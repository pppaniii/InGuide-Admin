/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest'
import L from 'leaflet'
import { exportGraph } from '@/utils/exportGraph'

describe('UTC-06 [admin] exportGraph', () => {
  it('TC-01 exportGraph returns JSON graph', () => {
    const markers = new Map<string, L.Marker>([
      ['n1', L.marker([18.799, 98.950])],
      ['n2', L.marker([18.800, 98.951])]
    ])

    const conns = new Map<string, any[]>([
      ['n1', [{ polyline: L.polyline([[18.799, 98.950], [18.800, 98.951]]) }]]
    ])

    const graph = exportGraph(markers, conns)

    expect(graph.nodes).toEqual([
      { id: 'n1', coordinates: [18.799, 98.950] },
      { id: 'n2', coordinates: [18.800, 98.951] }
    ])

    expect(graph.adjacencyList['n1'][0].targetNodeId).toBe('n2')
    expect(graph.adjacencyList['n1'][0].weight).toBeGreaterThan(0)
  })
})

