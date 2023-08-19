// index.js
const express = require('express')
const { NOTION_API_KEY, GOOGLE_MAPS_API_KEY } = process.env;
console.log('NOTION_API_KEY', NOTION_API_KEY)
const app = express()
const PORT = 4000

app.listen(PORT, () => {
  console.log(`API listening on PORT ${PORT} `)
})

app.get('/', (req, res) => {
  res.send('Hey this is my API running 🥳')
})

app.get('/about', (req, res) => {
  res.send('This is my about route..... ')
})

// Export the Express API
module.exports = app