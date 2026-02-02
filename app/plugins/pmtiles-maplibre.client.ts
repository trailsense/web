import maplibregl from 'maplibre-gl'
import { Protocol } from 'pmtiles'

const protocol = new Protocol()

export default defineNuxtPlugin(() => {
  // Guard against duplicate registrations during HMR.
  try {
    maplibregl.removeProtocol('pmtiles')
  } catch (error) {
    console.warn('Failed to remove existing "pmtiles" protocol from MapLibre.', error)
  }

  try {
    maplibregl.addProtocol('pmtiles', protocol.tile)
  } catch (error) {
    console.error('Failed to register "pmtiles" protocol with MapLibre.', error)
  }
})
