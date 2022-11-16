const VT_PILOTS_IN_FIR_DIV_ID = "pilotsWidget"
const VT_PILOTS_IN_FIR_FETCH_URL = "https://cors.eu.org/https://vatapi.veritynh.dev/api"

class PilotsWithinFIR {
  constructor(fir) {
    this.fir = fir
    this.mainDivId = VT_PILOTS_IN_FIR_DIV_ID
    this.url = VT_PILOTS_IN_FIR_FETCH_URL
    this.widgetDiv = undefined
    this.init()
  }

  init() {
    this.widgetDiv = document.getElementById(this.mainDivId)

    let link = document.createElement('link')
    link.type = 'text/css'
    link.rel = 'stylesheet'

    document.head.appendChild(link)
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"

    let d3script = document.createElement('script')
    d3script.src = 'https://cdn.jsdelivr.net/npm/d3@7'
    document.head.appendChild(d3script)
  }

  async fetchData() {
    const req = await fetch(`${this.url}/pilotsInFirExtended/${this.fir}`)
    const data = await req.json()
    return data
  }

  async fetchFir() {
    const req = await fetch(`${this.url}/firboundary/${this.fir}`)
    const data = await req.json()
    return data
  }

  async render() {
    const data = await this.fetchData()
    const container = this.widgetDiv

    const emptyHtml = `<div class="vat-pilotsWidget-body-empty">No pilots in ${this.fir}</div>`

    let innerHTML = ``

    const showToolTip = (e) => {
      const id = e.target.getAttribute('data')
      const searchId = `pilotsWidget-${id}`
      const element = document.getElementById(searchId)

      if (element) {
        element.style.display = "block"
      }
    }

    const hideToolTip = (e) => {
      const id = e.target.getAttribute('data')
      const searchId = `pilotsWidget-${id}`
      const element = document.getElementById(searchId)

      if (element) {
        element.style.display = "none"
      }
    }

    if ( !data.length ) {
      innerHTML = emptyHtml
    } else {
      innerHTML = data.map( (rec) => {
        const tooltipHTML = `
            <div class="vat-pilotsWidget-tooltip-text" id="pilotsWidget-${rec.callsign}">
                <div class="vat-pilotsWidget-tooltip-row">
                    <div class="vat-tip-cell vat-tip-label">Callsign:</div>
                    <div class="vat-tip-cell vat-tip-text">${rec.callsign}</div>
                </div>
                <div class="vat-pilotsWidget-tooltip-row">
                    <div class="vat-tip-cell vat-tip-label">Decoded CS:</div>
                    <div class="vat-tip-cell vat-tip-text">${rec.callsign_decoded}</div>
                </div>
                <div class="vat-pilotsWidget-tooltip-row">
                    <div class="vat-tip-cell vat-tip-label">Departure:</div>
                    <div class="vat-tip-cell vat-tip-text">${rec.dep_decoded}</div>
                </div>
                <div class="vat-pilotsWidget-tooltip-row">
                    <div class="vat-tip-cell vat-tip-label">Arrival:</div>
                    <div class="vat-tip-cell vat-tip-text">${rec.arr_decoded}</div>
                </div>
                <div class="vat-pilotsWidget-tooltip-row">
                    <div class="vat-tip-cell vat-tip-label">Name:</div>
                    <div class="vat-tip-cell vat-tip-text">${rec.name}</div>
                </div>
                <div class="vat-pilotsWidget-tooltip-row">
                    <div class="vat-tip-cell vat-tip-label">Altitude:</div>
                    <div class="vat-tip-cell vat-tip-text">${rec.altitude}</div>
                </div>
                <div class="vat-pilotsWidget-tooltip-row">
                    <div class="vat-tip-cell vat-tip-label">Groundspeed:</div>
                    <div class="vat-tip-cell vat-tip-text">${rec.groundspeed}</div>
                </div>
                <div class="vat-pilotsWidget-tooltip-row">
                    <div class="vat-tip-cell vat-tip-label">Transponder:</div>
                    <div class="vat-tip-cell vat-tip-text">${rec.transponder}</div>
                </div>
                <div class="vat-pilotsWidget-tooltip-row">
                    <div class="vat-tip-cell vat-tip-label">Frequency:</div>
                    <div class="vat-tip-cell vat-tip-text">${rec.monitored_freq}</div>
                </div>
                <div class="vat-pilotsWidget-tooltip-row">
                    <div class="vat-tip-cell vat-tip-label">Route:</div>
                    <div class="vat-tip-cell vat-tip-text">${rec?.flight_plan?.route || `N/A`}</div>
                </div>
            </div>
        `

        return `
            <div class="vat-pilotsWidget-brow">
                <div class="vat-pilotsWidget-bcell callsign" data="${rec.callsign}">${rec.callsign}${tooltipHTML}</div>
                <div class="vat-pilotsWidget-bcell type">${rec?.flight_plan?.aircraft_short || `N/A`}</div>
                <div class="vat-pilotsWidget-bcell departure">${rec?.flight_plan?.departure || `N/A`}</div>
                <div class="vat-pilotsWidget-bcell arrival">${rec?.flight_plan?.arrival || `N/A`}</div>
            </div>
      `
      }).join('')
    }

    let html = `
        <div class="vat-pilotsWidget-mainContainer">
          <div class="vat-pilotsWidget-title">Aircraft within ZJX Airspace
            <div class="vat-pilotsWidget-menuBtns"> 
                <button class="vat-pilotsWidget-btnRefresh"><i class="fa fa-refresh"></i></button>
                <button class="vat-pilotsWidget-btnMap"><i class="fa fa-map"></i></button>
            </div>
          </div>
          <div class="vat-pilotsWidget-table">
            <div class="vat-pilotsWidget-header">
                <div class="vat-pilotsWidget-hcell callsign">Callsign</div>
                <div class="vat-pilotsWidget-hcell type">Type</div>
                <div class="vat-pilotsWidget-hcell departure">Departure</div>
                <div class="vat-pilotsWidget-hcell arrival">Arrival</div>
            </div>
            ${innerHTML}
          </div>
          <div class="vat-pilotsWidget-mapContainer modal">
            <div id="vat-pilotsWidget-mapContainer" class="vat-pilotsWidget-mapBody">
                <div class="close">[x] Close</div>
            </div>
          </div>
        </div>
      `

    container.innerHTML = html

    //Draw Fir
    const drawFir = async () => {
      const firCoordinates = await this.fetchFir()

      const geojson = {
        type: "FeatureCollection",
        features: [firCoordinates]
      }

      let width = window.innerWidth / 2
      let height = window.innerHeight / 2

      let projection = d3.geoEquirectangular()
      projection.fitSize([width, height], geojson)
      let geoGenerator = d3.geoPath().projection(projection)

      let svg = d3.select("#vat-pilotsWidget-mapContainer").append('svg').style('width', width).style('height', height)

      svg.append('g').selectAll('path')
        .data(geojson.features)
        .join('path')
        .attr('d', geoGenerator)
        .attr('fill', '#088')
        .attr('stroke', '#000')

      let planes = data.map(pilot => {
        return {long: pilot.longitude, lat: pilot.latitude, heading: pilot.heading, callsign: pilot.callsign}
      })

      svg.selectAll(".mark")
        .data(planes)
        .enter()
        .append("svg:image")
        .attr('class','mark')
        .attr('width', 20)
        .attr('height', 20)
        .attr('xlink:href', "./img/plane.png")
        .attr("transform", d => { return `translate(${projection([d.long,d.lat])}) rotate(${d.heading})` } )
        .append("svg:title").text( d => { return `${d.callsign}` } )
    }

    // Apply map handlers
    const showMap = async () => {
      await drawFir()
      document.querySelector('.vat-pilotsWidget-mapContainer').style.display = 'flex'
      document.querySelector('.vat-pilotsWidget-mapBody .close').addEventListener('click', hideMap, false)
    }

    const hideMap = () => {
      document.querySelector('.vat-pilotsWidget-mapContainer').style.display = 'none'
      document.querySelector('.vat-pilotsWidget-mapBody .close').removeEventListener('click', hideMap)
      document.querySelector('.vat-pilotsWidget-mapContainer svg').remove()
    }

    document.querySelector(".vat-pilotsWidget-btnMap").addEventListener('click', showMap, false)


    // Apply refresh handlers
    document.querySelector(".vat-pilotsWidget-btnRefresh").addEventListener('click', () => {
      this.render()
    }, false)

    // Apply tooltip handlers
    if (data.length) {
      data.forEach(rec => {
        const element = document.querySelector(`[data=${rec.callsign}]`)
        element.addEventListener('mouseover', showToolTip, false)
        element.addEventListener('mouseleave', hideToolTip, false)
      })
    }
  }
}


const PilotsWidget = new PilotsWithinFIR("KZJX")
PilotsWidget.render()
