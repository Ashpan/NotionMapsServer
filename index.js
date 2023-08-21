// index.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const { getDatabaseOptions, getMapOptions, getMapPlaceIdOptions, patchDatabaseOptions } = require('./endpointOptions');
require('dotenv').config();

const app = express();
app.use(cors());
const PORT = 4000;

app.listen(PORT, () => {
  console.log(`API listening on PORT ${PORT} `);
});

app.get('/', (req, res) => {
  res.send('Hey this is my API running 🥳');
});

app.get('/dontuse', (req, res) => {
  res.send(process.env.TEST);
});

app.get('/locations', (req, res) => {
  const axiosInstance = axios.create({
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
  const locations = [];
  const unfinishedLocations = [];
  let databaseId = req.query.databaseId;

  axiosInstance.request(getDatabaseOptions(databaseId))
    .then(function async(response) {
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
          price: location.properties.Price.number,
          rating: location.properties.Rating.number,
          cuisine: location.properties.Cuisine.multi_select.map((cuisine) => cuisine.name),
          notes: notes,
          url: location.properties["Maps Link"].url
        };
        locations.push(locationMetadata);
      }
      for (const location of unfinishedLocations) {
        axiosInstance.request(getMapPlaceIdOptions(encodeURIComponent(location.properties.Name.title[0].plain_text + ", " + location.properties.Address.rich_text[0].text.content)))
          .then(function (response) {
            axiosInstance.request(getMapOptions(response.data.candidates[0].place_id))
            .then(function (response) {
                const responseJSON = response.data.result;
                const { lat, lng } = responseJSON.geometry.location;
                const price = responseJSON.price_level || 0;
                const rating = responseJSON.rating;
                const pageId = location.id;
                const url = responseJSON.url;
                let notes;
                try {
                  notes = location.properties.Notes.rich_text[0].text.content;
                } catch (error) {
                  notes = '-';
                }
                axiosInstance.request(patchDatabaseOptions(pageId, lat, lng, price, rating, url))
                  .then(function (response) {
                    const locationMetadata = {
                      lat: lat,
                      long: lng,
                      price: price,
                      rating: rating,
                      name: location.properties.Name.title[0].plain_text,
                      type: location.properties.Type.multi_select.map((type) => type.name),
                      cuisine: location.properties.Cuisine.multi_select.map((cuisine) => cuisine.name),
                      notes: notes,
                      url: url
                    };
                    locations.push(locationMetadata);
                  }).catch(function (error) {
                    console.error(error);
                    res.status(500).send("Error occurred while patching database");
                  });
              }).catch(function (error) {
                console.error(error);
                res.status(500).send("Error occurred while fetching place details");
              });
          })
          .catch(function (error) {
            console.error(error);
            res.status(500).send("Error occurred while fetching place ID");
          });
      }
      res.send(locations);
    })
    .catch(function (error) {
      console.error(error);
      res.status(500).send("Error occurred while fetching database options");
    });
});

module.exports = app;