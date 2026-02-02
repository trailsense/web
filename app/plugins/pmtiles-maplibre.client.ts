import maplibregl from 'maplibre-gl'
import { Protocol } from 'pmtiles'

const protocol = new Protocol()

export default defineNuxtPlugin(() => {
  // Guard against duplicate registrations during HMR.
  maplibregl.removeProtocol('pmtiles')
  maplibregl.addProtocol('pmtiles', protocol.tile)
})
