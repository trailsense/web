export type TrailNode = {
  id: string
  name: string
  coordinates: [number, number]
  intensity: number
}

export const mockNodes: TrailNode[] = [
  {
    id: 'node-innsbruck-centre',
    name: 'Innsbruck City Centre',
    coordinates: [11.39454, 47.26266],
    intensity: 0.4
  },
  {
    id: 'node-patscherkofel-base',
    name: 'Patscherkofel Cable Car Base (Igls)',
    coordinates: [11.4272, 47.22226],
    intensity: 0.7
  },
  {
    id: 'node-hozler-alm',
    name: 'Arzler Alm',
    coordinates: [11.40309, 47.29651],
    intensity: 0.6
  },
  {
    id: 'node-hungerburg-funicular',
    name: 'Hungerburg Funicular Station',
    coordinates: [11.40663, 47.29145],
    intensity: 0.5
  },
  {
    id: 'node-bergisel',
    name: 'Bergisel Ski Jump / Trailhead',
    coordinates: [11.39202, 47.24754],
    intensity: 0.3
  }
]
