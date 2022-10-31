const { default: fetch } = require('node-fetch')

//const BoundURI = `${window.location.origin}/firboundaries`
const BoundURI = 'https://raw.githubusercontent.com/maiuswong/simaware-express/main/public/livedata/firboundaries.json'

module.exports = class Firboundary {
  async preload() {
    const req = await fetch(BoundURI)
    const data = await req.json()
    return data
  }

  async getFir(name) {
    const data = await this.preload()
    const features = data.features

    const fir = features.find( (el) => {
      return el.properties.id == name
    } )

    return fir
  }
}
