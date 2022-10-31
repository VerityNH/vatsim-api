const Firboundary = require('./firboundary.js')
const pointInPoly = require('geo-point-in-polygon')
const VatsimData = require('./vatsim-data.js')
const TransData = require('./transceivers-data.js')
const Airlines = require('../data/airlines.json')

module.exports = class vatsimAPI {
  constructor() {
    this.firData = new Firboundary()
    this.vatData = new VatsimData()
    this.transData = new TransData()
  }

  async getFirBoundary(fir) {
    const boundary = await this.firData.getFir(fir)
    return boundary
  }

  async getPilotsInFir(fir) {
    const boundary = await this.getFirBoundary(fir)

    const polygon = boundary.geometry.coordinates[0][0]

    const pilots = await this.vatData.getPilots()
    const firPilots = pilots.filter( p => {
      const pLong = p.longitude
      const pLat = p.latitude

      return pointInPoly([pLong, pLat], polygon)
    } )

    return firPilots
  }

  async getPilotsInFirExtended(fir) {
    const pilots = await this.getPilotsInFir(fir)
    const tData = await this.transData.preload()

    const pilotsExtended = []

    pilots.forEach(pilot => {
      const pTrans = tData.find(trans => {
        return pilot.callsign == trans.callsign
      })

      pilot.transceivers = pTrans.transceivers

      const callsignDec = Airlines.find(aline => {
        const pCall = pilot.callsign.slice(0, 3)
        return aline.icao == pCall
      })

      const pCalldec = pilot.callsign
      pilot.callsign_decoded = callsignDec?.callsign || pCalldec

      pilotsExtended.push(pilot)
    })

    return pilotsExtended
  }

  async getAllControllers() {
    const data = this.vatData.getAllControllers()
    return data
  }
}
