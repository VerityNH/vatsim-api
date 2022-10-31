const { default: fetch } = require('node-fetch')

//const TransDataURL = `${window.location.origin}/transceivers-data`
const TransDataURL = 'https://data.vatsim.net/v3/transceivers-data.json'

module.exports = class TransceiversData {
  async preload() {
    const req = await fetch(TransDataURL)
    const data = await req.json()
    return data
  }

  async getTranscieverData(callsign) {
    const transData = await this.preload()
    const data = transData.filter(trans => {
      return callsign = trans.callsign
    })

    return ( data.transceivers.length ) ? data.transceivers : []
  }
}
