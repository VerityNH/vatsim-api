const Firboundary = require('./firboundary.js')
const pointInPoly = require('geo-point-in-polygon')
const VatsimData = require('./vatsim-data.js')
const TransData = require('./transceivers-data.js')

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
        return pilot.callsign = trans.callsign
      })

      pilot.transceivers = pTrans.transceivers
      pilotsExtended.push(pilot)
    })

    return pilotsExtended
  }

  async getAllControllers() {
    const data = this.vatData.getAllControllers()
    return data
  }
}
