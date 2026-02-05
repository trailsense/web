export type NodeStatus = 'active' | 'inactive' | 'syncing'

export type ActivityDataPoint = {
  timestamp: string
  value: number
}

export type NodeActivity = {
  daily: ActivityDataPoint[]
  weekly: ActivityDataPoint[]
  monthly: ActivityDataPoint[]
}

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
  activity?: NodeActivity
}

function generateRandomActivity(length: number, maxValue: number, interval: 'hour' | 'day'): ActivityDataPoint[] {
  const now = new Date()
  return Array.from({ length }, (_, i) => {
    const date = new Date(now)
    if (interval === 'hour') {
      date.setHours(now.getHours() - (length - 1 - i))
      date.setMinutes(0, 0, 0)
    } else {
      date.setDate(now.getDate() - (length - 1 - i))
      date.setHours(0, 0, 0, 0)
    }
    return { timestamp: date.toISOString(), value: Math.floor(Math.random() * maxValue) }
  })
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
    setupDate: '2024-05-18',
    activity: {
      daily: generateRandomActivity(24, 10, 'hour'),
      weekly: generateRandomActivity(7, 50, 'day'),
      monthly: generateRandomActivity(30, 200, 'day')
    }
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
    setupDate: '2024-06-03',
    activity: {
      daily: generateRandomActivity(24, 15, 'hour'),
      weekly: generateRandomActivity(7, 60, 'day'),
      monthly: generateRandomActivity(30, 180, 'day')
    }
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
    setupDate: '2024-04-11',
    activity: {
      daily: generateRandomActivity(24, 5, 'hour'),
      weekly: generateRandomActivity(7, 30, 'day'),
      monthly: generateRandomActivity(30, 100, 'day')
    }
  }
]
