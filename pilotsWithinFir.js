import pointInPoly from 'geo-point-in-polygon'
import VatsimData from './core/vatsim-data.js'
import Firboundary from './core/firboundary.js'

customElements.define('pilots-within-fir', class PilotsWithinFir extends HTMLElement {
  constructor() {
    super()

    this.vatsimData = new VatsimData()
    this.firData = new Firboundary()
    this.pilots = []
  }

  async connectedCallback() {
    const fir = await this.firData.getFir("KZJX")
    const polygon = fir.geometry.coordinates[0][0]
    const pilots = await this.vatsimData.getPilots()
    const zjxPilots = pilots.filter( p => {
      const pLong = p.longitude
      const pLat = p.latitude

      return pointInPoly([pLong, pLat], polygon)
    } )

    this.pilots = zjxPilots

    this.innerHTML = `
    <div class="pilots-within-fir_main">
    ${this.pilots.map( (pilot) => {
      return `
        <div class="pilots-within-fir_row">
            <div class="pilots-within-fir_callsign"><div class="label">Callsign:</div><div class="value">${pilot.callsign}</div></div>
            <div class="pilots-within-fir_name"><div class="label">Name:</div><div class="value">${pilot.name}</div></div>
            <div class="pilots-within-fir_altitude"><div class="label">Altitude:</div><div class="value">${pilot.altitude}</div></div>
            <div class="pilots-within-fir_groundspeed"><div class="label">Ground speed:</div><div class="value">${pilot.groundspeed}</div></div>
            <div class="pilots-within-fir_transponder"><div class="label">Transponder:</div><div class="value">${pilot.transponder}</div></div>
        </div>
      `
    }).join("")}
    </div>
    `
  }

  disconnectedCallback() {
  }

})
