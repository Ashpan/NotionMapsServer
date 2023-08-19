// index.js
const express = require('express')
// const cors = require('cors');
const axios = require('axios')

const { getDatabaseOptions, getMapOptions, patchDatabaseOptions } = require('./endpointOptions');
require('dotenv').config();

const app = express()
// app.use(cors());
const PORT = 4000

app.listen(PORT, () => {
  console.log(`API listening on PORT ${PORT} `)
})

app.get('/', (req, res) => {
  res.send('Hey this is my API running 🥳')
})

app.get('/dontuse', (req, res) => {
    res.send(process.env.TEST)
})

app.get('/locations', (req, res) => {
    const locations = [];
    const unfinishedLocations = [];
    let databaseId = req.query.databaseId;

    axios.request(getDatabaseOptions(databaseId))
      .then(function async (response) {
        for (const location of response.data.results) {
          // Add location to unfinishedLocations if it doesn't have a latitude or longitude
          if (location.properties.Latitude.number === null || location.properties.Longitude.number === null) {
            unfinishedLocations.push(location);
            continue;
          }

          let notes;
          try {
            notes = location.properties.Notes.rich_text[0].text.content;
          } catch (error) {
            notes = '-';
          }
          const locationMetadata = {
            lat: parseFloat(location.properties.Latitude.number),
            long: parseFloat(location.properties.Longitude.number),
            name: location.properties.Name.title[0].text.content,
            type: location.properties.Type.multi_select.map((type) => type.name),
            notes: notes,
            url: location.properties["Maps Link"].url
          }
          locations.push(locationMetadata);
        }
        for (const location of unfinishedLocations) {
          axios.request(getMapOptions(location.properties.Name.title[0].plain_text + ", " + location.properties.Address.rich_text[0].text.content))
          .then(function (response) {
            const { lat, lng } = response.data.results[0].geometry.location;
            const numOfResults = response.data.results.length;
            const relevantResult = response.data.results[numOfResults - 1];
            const pageId = location.id;
            let url;
            let notes;
            try{
              url = `https://www.google.com/maps/place/?q=place_id:${relevantResult.place_id}`
            } catch (error) {
              url = `https://www.google.com/maps?q=${lat},${lng}`
            }
            try {
              notes = location.properties.Notes.rich_text[0].text.content;
            } catch (error) {
              notes = '-';
            }
            axios.request(patchDatabaseOptions(pageId, lat, lng, url))
            .then(function (response) {
              const locationMetadata = {
                lat: lat,
                long: lng,
                name: location.properties.Name.title[0].plain_text,
                type: location.properties.Type.multi_select.map((type) => type.name),
                notes: notes,
                url: url
              }
              locations.push(locationMetadata);
            }).catch(function (error) {
              console.error(error);
            });

          }).catch(function (error) {
            console.error(error);
          });
        }
        res.send(locations);
      })
      .catch(function (error) {
        console.error(error);
      });
})

// Export the Express API
module.exports = app