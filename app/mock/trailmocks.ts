import type { TrailDto } from '../composables/trail-dashboard/types'

export const mockTrails: TrailDto[] = [
  {
    id: 'trail-1',
    name: 'River Walk',
    nodes: [
      { id: 'n1', latitude: 47.7239, longitude: 13.0867 },
      { id: 'n2', latitude: 47.728, longitude: 13.095 },
      { id: 'n3', latitude: 47.732, longitude: 13.105 }
    ],
    nodeActivities: [
      { nodeId: 'n1', activity: 40 },
      { nodeId: 'n2', activity: 65 },
      { nodeId: 'n3', activity: 70 }
    ],
    averageActivity: 58
  },
  {
    id: 'trail-2',
    name: 'Mountain Loop',
    nodes: [
      { id: 'n4', latitude: 47.71, longitude: 13.05 },
      { id: 'n5', latitude: 47.7, longitude: 13.04 }
    ],
    nodeActivities: [
      { nodeId: 'n4', activity: 85 },
      { nodeId: 'n5', activity: 92 }
    ],
    averageActivity: 88
  }
]
