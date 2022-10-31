const express = require('express')
const Console = require('console')
const path = require('path')
const fetch = require('node-fetch')
const asyncHandler = require('express-async-handler')

const vatsimAPI = require('./core/vatsimAPI.js')

const api = new vatsimAPI()


const app = express()
const port = 3001

//
// app.use('/index', express.static( 'dist'))
//
// app.get('/vatsim-data', asyncHandler( async (req, res) => {
//   const url = 'https://data.vatsim.net/v3/vatsim-data.json'
//   const response = await fetch(url)
//   const data = await response.json()
//
//   res.send(data)
// }))
//
// app.get('/firboundaries', asyncHandler( async (req, res) => {
//   const url = 'https://raw.githubusercontent.com/maiuswong/simaware-express/main/public/livedata/firboundaries.json'
//   const response = await fetch(url)
//   const data = await response.json()
//
//   res.send(data)
// }))
//
// app.get('/transceivers-data', asyncHandler( async (req, res) => {
//   const url = 'https://data.vatsim.net/v3/transceivers-data.json'
//   const response = await fetch(url)
//   const data = await response.json()
//
//   res.send(data)
// }))


// API

app.get('/api/firboundary/:icao', asyncHandler(async (req, res) => {
  const fir = req.params.icao.replace(/[^a-zA-Z0-9 ]/g, '')
  const boundary = await api.getFirBoundary(fir)
  res.send(boundary)
}))

app.get('/api/pilotsInFir/:icao', asyncHandler( async(req, res) => {
  const fir = req.params.icao.replace(/[^a-zA-Z0-9 ]/g, '')
  const firPilots = await api.getPilotsInFir(fir)
  res.send(firPilots)
}))

app.get('/api/pilotsInFirExtended/:icao', asyncHandler( async(req, res) => {
  const fir = req.params.icao.replace(/[^a-zA-Z0-9 ]/g, '')
  const firPilots = await api.getPilotsInFirExtended(fir)
  res.send(firPilots)
}))


app.listen(port, () => {
  console.log(`App started at port ${port}`)
})