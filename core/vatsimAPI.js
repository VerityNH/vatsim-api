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

  async getPilotsWithinFirHtml(fir) {
    const pilots = await this.getPilotsInFirExtended(fir)

    const innerHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <title>${fir} Airspace</title>
    <head>
        <meta charset="UTF-8">
        <title>Title</title>
        <style>
            .pilots-within-fir_row {
                width: 300px;
                border: 1px solid #231414;
                margin-bottom: 3px;
            }
            
            .pilots-within-fir_row .label {
                font-weight: bold;
                display: inline-block;
            }
            
            .pilots-within-fir_row .value {
                display: inline-block;
                padding-left: 10px;
            }
        </style>
    </head>
    <body>
      <h4>${fir} Airspace</h4>
      <div class="pilots-within-fir_main">
      ${pilots.map( (pilot) => {
        return `
          <div class="pilots-within-fir_row">
              <div class="pilots-within-fir_callsign"><div class="label">Callsign:</div><div class="value">${pilot.callsign}</div></div>
              <div class="pilots-within-fir_decoded_callsign"><div class="label">Decoded Callsign:</div><div class="value">${pilot.callsign_decoded}</div></div>
              <div class="pilots-within-fir_name"><div class="label">Name:</div><div class="value">${pilot.name}</div></div>
              <div class="pilots-within-fir_altitude"><div class="label">Altitude:</div><div class="value">${pilot.altitude}</div></div>
              <div class="pilots-within-fir_groundspeed"><div class="label">Ground speed:</div><div class="value">${pilot.groundspeed}</div></div>
              <div class="pilots-within-fir_transponder"><div class="label">Transponder:</div><div class="value">${pilot.transponder}</div></div>
          </div>
        `
      }).join("")}
      </div>
    </body>
    </html>
    `

    return innerHTML
  }

  async getAllControllers() {
    const data = this.vatData.getAllControllers()
    return data
  }
}
