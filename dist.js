import pointInPoly from 'geo-point-in-polygon'

import VatsimData from './core/vatsim-data.js'
import TransceiversData from './core/transceivers-data.js'
import Firboundary from './core/firboundary.js'


const vatsimData = new VatsimData()
const transData = new TransceiversData()
const firData = new Firboundary()

const tdata = await transData.preload()
const fir = await firData.getFir("KZJX")
const polygon = fir.geometry.coordinates[0][0]
const pilots = await vatsimData.getPilots()
const zjxPilots = pilots.filter( p => {
  const pLong = p.longitude
  const pLat = p.latitude

  return pointInPoly([pLong, pLat], polygon)
} )

console.log(zjxPilots)
