class PilotsWithinFIR {
  constructor(fir) {
    this.fir = fir
    this.mainDivId = "pilotsWidget"
    this.widgetDiv = undefined
    this.init()
  }

  init() {
    this.widgetDiv = document.getElementById(this.mainDivId)
  }

  async fetchData() {
    const req = await fetch(`/api/pilotsInFirExtended/${this.fir}`)
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
        element.style.visibility = "visible"
      }
    }

    const hideToolTip = (e) => {
      const id = e.target.getAttribute('data')
      const searchId = `pilotsWidget-${id}`
      const element = document.getElementById(searchId)

      if (element) {
        element.style.visibility = "hidden"
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
          <div class="vat-pilotsWidget-title">Aircraft within ZJX Airspace</div>
          <div class="vat-pilotsWidget-table">
            <div class="vat-pilotsWidget-header">
                <div class="vat-pilotsWidget-hcell callsign">Callsign</div>
                <div class="vat-pilotsWidget-hcell type">Type</div>
                <div class="vat-pilotsWidget-hcell departure">Departure</div>
                <div class="vat-pilotsWidget-hcell arrival">Arrival</div>
            </div>
            ${innerHTML}
          </div>
        </div>
      `

    container.innerHTML = html

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
