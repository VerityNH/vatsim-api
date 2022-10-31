const { default: fetch } = require('node-fetch')

//const VatsimDataURL = `${window.location.origin}/vatsim-data`
const VatsimDataURL = 'https://data.vatsim.net/v3/vatsim-data.json'

module.exports = class VatsimData {
  async preload() {
    const req = await fetch(VatsimDataURL)
    const data = await req.json()
    return data
  }

  async getPilots() {
    const data = await this.preload()

    return data.pilots
  }
}
