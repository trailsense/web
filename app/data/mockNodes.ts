export type NodeStatus = 'active' | 'inactive' | 'syncing'

export type TrailNode = {
  id: string
  name: string
  region: string
  coordinates: [number, number]
  trails: string[]
  status: NodeStatus
  lastSynchronized: string
  lastMaintenance: string
  setupDate: string
}

export const mockNodes: TrailNode[] = [
  {
    id: 'nordkette-hungerburg',
    name: 'Hungerburg Station',
    region: 'Nordkette, Innsbruck',
    coordinates: [11.40663, 47.29145],
    trails: ['Nordkette Panorama Trail', 'Höhenweg'],
    status: 'active',
    lastSynchronized: '2026-01-28T14:12:00Z',
    lastMaintenance: '2025-11-10',
    setupDate: '2024-05-18'
  },
  {
    id: 'nordkette-arzler-alm',
    name: 'Arzler Alm',
    region: 'Nordkette, Innsbruck',
    coordinates: [11.40309, 47.29651],
    trails: ['Arzler Alm Trail', 'Nordkette Approach'],
    status: 'syncing',
    lastSynchronized: '2026-01-28T07:45:00Z',
    lastMaintenance: '2025-10-02',
    setupDate: '2024-06-03'
  },
  {
    id: 'nordkette-kettenbruecke',
    name: 'Kettenbrücke Trail Access',
    region: 'Nordkette, Innsbruck',
    coordinates: [11.3898, 47.2809],
    trails: ['Kettenbrücke Steig'],
    status: 'inactive',
    lastSynchronized: '2025-12-19T09:02:00Z',
    lastMaintenance: '2025-07-14',
    setupDate: '2024-04-11'
  }
]
