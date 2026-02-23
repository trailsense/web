export const getTrailColor = (activity: number): string => {
  if (activity >= 90) return '#7f0000'
  if (activity >= 75) return '#ff0000'
  if (activity >= 55) return '#ff9800'
  if (activity >= 35) return '#ffeb3b'
  return '#4caf50'
}
