const Firboundary = require('./firboundary.js')
const pointInPoly = require('geo-point-in-polygon')
const VatsimData = require('./vatsim-data.js')
const TransData = require('./transceivers-data.js')
const Airlines = require('../data/airlines.json')
const Aircrafts = require('../data/aircrafts.json')
const polygonCenter = require('geojson-polygon-center')

module.exports = class vatsimAPI {
  constructor() {
    this.firData = new Firboundary()
    this.vatData = new VatsimData()
    this.transData = new TransData()
    this.firBoundary = {}
  }

  async getFirBoundary(fir) {
    let boundary
    if (!this.firBoundary[fir]) {
      boundary = await this.firData.getFir(fir)
      this.firBoundary[fir] = boundary
    } else {
      boundary = this.firBoundary[fir]
    }

    return boundary
  }

  async getFirBoundaryCenter(fir) {
    const boundary = await this.getFirBoundary(fir)
    const center = {
      lon: boundary?.properties?.label_lon,
      lat: boundary?.properties?.label_lat
    }

    return center
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

      pilot.transceivers = pTrans?.transceivers

      const callsignDec = Airlines.find(aline => {
        const pCall = pilot.callsign.slice(0, 3)
        return aline.icao == pCall
      })

      const pCalldec = pilot.callsign
      pilot.callsign_decoded = callsignDec?.callsign || pCalldec

      if (pilot.transceivers && pilot.transceivers.length) {
        const freq = pilot.transceivers[0].frequency * 0.000001
        pilot.monitored_freq = freq.toFixed(3)
      }

      // if ( null != pilot.flight_plan) {
      //   const aircraftDec = Aircrafts.find(craft => {
      //     return craft.icao == pilot?.flight_plan?.aircraft_short
      //   })
      //
      //   pilot.aircraft = {
      //     aircraft_short: pilot?.flight_plan?.aircraft_short,
      //     decoded: aircraftDec?.name || null
      //   }
      // }

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
              <div class="pilots-within-fir_aircraft"><div class="label">Aircraft:</div><div class="value">${pilot?.flight_plan?.aircraft_faa}</div></div>
              <div class="pilots-within-fir_name"><div class="label">Name:</div><div class="value">${pilot.name}</div></div>
              <div class="pilots-within-fir_frequency"><div class="label">Monitored Freq:</div><div class="value">${pilot?.monitored_freq}</div></div>
              <div class="pilots-within-fir_altitude"><div class="label">Altitude:</div><div class="value">${pilot.altitude}</div></div>
              <div class="pilots-within-fir_groundspeed"><div class="label">Ground speed:</div><div class="value">${pilot.groundspeed}</div></div>
              <div class="pilots-within-fir_transponder"><div class="label">Transponder:</div><div class="value">${pilot.transponder}</div></div>
              <div class="pilots-within-fir_departure"><div class="label">Departure:</div><div class="value">${pilot?.flight_plan?.departure}</div></div>
              <div class="pilots-within-fir_arrival"><div class="label">Arrival:</div><div class="value">${pilot?.flight_plan?.arrival}</div></div>
              <div class="pilots-within-fir_route"><div class="label">Route:</div><div class="value">${pilot?.flight_plan?.route}</div></div>
          </div>
        `
      }).join("")}
      </div>
    </body>
    </html>
    `

    return innerHTML
  }

  async getPilotsWithinFirMap(fir, width, height, zoom) {
    const pilots = await this.getPilotsInFirExtended(fir)
    const firCenter = await this.getFirBoundaryCenter(fir)
    const boundary = await this.getFirBoundary(fir)

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
            
            #map { height: ${height}px; width: ${width}px; }
        </style>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.2/dist/leaflet.css" integrity="sha256-sA+zWATbFveLLNqWO2gtiw3HL/lh1giY/Inf1BJ0z14=" crossorigin=""/>
      <!-- Make sure you put this AFTER Leaflet's CSS -->
        <script src="https://unpkg.com/leaflet@1.9.2/dist/leaflet.js" integrity="sha256-o9N1jGDZrf5tS+Ft4gbIK7mYMipq9lqpVJ91xHSyKhg=" crossorigin=""></script>
    </head>
    <body>
      <div>
        <div id="map"></div>
      </div>
      <script>
          const map = L.map('map', { zoomControl: false }).setView([${firCenter.lat}, ${firCenter.lon}], ${zoom})
          map.touchZoom.disable();
          map.doubleClickZoom.disable();
          map.scrollWheelZoom.disable();
          map.boxZoom.disable();
          map.keyboard.disable();

          L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
              maxZoom: 19,
              attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          }).addTo(map)
          
          const firPoly = L.polygon([
            ${boundary.geometry.coordinates[0][0].map( coord => {
                return `[${coord[1]}, ${coord[0]}]`
              }
            )}
          ]).addTo(map)
          
          const divIconOpts = {
            html: '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAYAAADhAJiYAAAEsGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS41LjAiPgogPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgeG1sbnM6ZXhpZj0iaHR0cDovL25zLmFkb2JlLmNvbS9leGlmLzEuMC8iCiAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyIKICAgIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIKICAgIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIKICAgIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIgogICAgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIKICAgZXhpZjpQaXhlbFhEaW1lbnNpb249IjM2IgogICBleGlmOlBpeGVsWURpbWVuc2lvbj0iMzYiCiAgIGV4aWY6Q29sb3JTcGFjZT0iMSIKICAgdGlmZjpJbWFnZVdpZHRoPSIzNiIKICAgdGlmZjpJbWFnZUxlbmd0aD0iMzYiCiAgIHRpZmY6UmVzb2x1dGlvblVuaXQ9IjIiCiAgIHRpZmY6WFJlc29sdXRpb249IjcyLzEiCiAgIHRpZmY6WVJlc29sdXRpb249IjcyLzEiCiAgIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiCiAgIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIKICAgeG1wOk1vZGlmeURhdGU9IjIwMjItMDEt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" />'
          }
          
          const imgIcon = L.icon({
              iconUrl: 'https://github.com/maiuswong/simaware-express/blob/main/public/img/aircraft/B738.png?raw=true',
              iconSize: [15, 15],
              // shadowUrl: 'my-icon-shadow.png',
              // shadowSize: [68, 95],
              // shadowAnchor: [22, 94]
          });
          
          let myIcon = L.divIcon(divIconOpts)
          
          ${pilots.map((pilot) => {
            return `
            L.marker([${pilot.latitude}, ${pilot.longitude}], {icon: imgIcon, title: "${pilot.callsign}"}).addTo(map);
            document.querySelector("img[title='${pilot.callsign}']").style.transform += " rotateZ(${pilot.heading}deg)"
            `  
          }).join('')}
      </script>
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
