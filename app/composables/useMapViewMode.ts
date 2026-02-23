export type MapViewMode = 'nodes' | 'trails'

export const useMapViewMode = () => {
  const mode = useState<MapViewMode>('map:view-mode', () => 'nodes')
  return { mode }
}
