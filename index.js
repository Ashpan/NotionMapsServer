// index.js
const express = require("express");
const axios = require("axios");
const supabase = require("@supabase/supabase-js");

const {
  getDatabaseOptions,
  getMapOptions,
  getMapPlaceIdOptions,
  patchDatabaseOptions,
  getDatabaseConfigOptions,
  setUserNotionSecretOptions,
  getIncompleteDatabaseOptions,
} = require("./endpointOptions");
const { getUserApiKeyDatabaseId } = require("./databaseHelper");
require("dotenv").config();

const app = express();
app.use(require("./middlewares"));
const db = supabase.createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const PORT = 4000;

app.listen(PORT, () => {
  console.log(`API listening on PORT ${PORT} `);
});

app.get("/", (req, res) => {
  res.send("Hey this is my API running 🥳");
});

app.get("/dontuse", (req, res) => {
  res.send(process.env.TEST);
});

app.get("/user-exists", async (req, res) => {
  const userId = req.query.userId;
  const { data: userToken, error } = await db
    .from("user_keys")
    .select()
    .eq("user_id", userId);
  if (error) {
    console.error(error);
    res.status(500).send("Error occurred while fetching user token");
  }
  if (userToken.length === 0) {
    res.send({ exists: false });
  } else {
    res.send({ exists: true });
  }
});

app.post("/token", async (req, res) => {
  const userId = req.body.userId;
  const databaseId = req.body.databaseId;
  const axiosInstance = axios.create({
    headers: {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
  axiosInstance
    .request(setUserNotionSecretOptions(req.body.code))
    .then(async function (response) {
      const access_token = response.data.access_token;
      const { error: insertError } = await db.from("user_keys").insert({
        user_id: userId,
        api_secret: access_token,
        database_id: databaseId,
      });
      if (insertError) {
        console.error(insertError);
        res.status(500).send("Error occurred while inserting user token");
      }
      res.status(204).send();
    })
    .catch(function (error) {
      console.error(error);
      res.status(500).send(error);
    });
});

app.get("/filters", async (req, res) => {
  const userId = req.query.userId;
  const userData = await getUserApiKeyDatabaseId(db, userId);
  if (!userData) {
    res.status(500).send("Error occurred while fetching user token");
    return;
  } else {
    const { apiKey, databaseId } = userData;
    const axiosInstance = axios.create({
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
    axiosInstance
      .request(getDatabaseConfigOptions(databaseId, apiKey))
      .then(function (response) {
        const cuisineOptions =
          response.data.properties.Cuisine.multi_select.options.map(
            (option) => option.name
          );
        const typeOptions =
          response.data.properties.Type.multi_select.options.map(
            (option) => option.name
          );
        res.send({ cuisine: cuisineOptions, type: typeOptions });
      })
      .catch(function (error) {
        console.error(error);
        res
          .status(500)
          .send("Error occurred while fetching database config options");
      });
  }
});

app.get("/locations", async (req, res) => {
  const userId = req.query.userId;
  const userData = await getUserApiKeyDatabaseId(db, userId);
  if (!userData) {
    res.status(500).send("Error occurred while fetching user token");
    return;
  } else {
    const { apiKey, databaseId } = userData;
    const axiosInstance = axios.create({
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
    const formattedLocations = [];

    axiosInstance
      .request(getIncompleteDatabaseOptions(databaseId, apiKey))
      .then(function async(response) {
        const incompleteLocations = response.data.results;
        for (const location of incompleteLocations) {
          axiosInstance
            .request(
              getMapPlaceIdOptions(
                encodeURIComponent(
                  location.properties.Name.title[0].plain_text +
                    ", " +
                    location.properties.Address.rich_text[0].text.content
                )
              )
            )
            .then(function (response) {
              axiosInstance
                .request(getMapOptions(response.data.candidates[0].place_id))
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
                    notes = "-";
                  }
                  axiosInstance
                    .request(
                      patchDatabaseOptions(
                        pageId,
                        lat,
                        lng,
                        price,
                        rating,
                        url,
                        apiKey
                      )
                    )
                    .catch(function (error) {
                      console.error(error);
                      res
                        .status(500)
                        .send("Error occurred while patching database");
                    });
                })
                .catch(function (error) {
                  console.error(error);
                  res
                    .status(500)
                    .send("Error occurred while fetching place details");
                });
            })
            .catch(function (error) {
              console.error(error);
              res.status(500).send("Error occurred while fetching place ID");
            });
        }
      })
      .then(async function () {
        let locations = [];
        let nextCursor = undefined;

        do {
          const response = await axiosInstance.request(
            getDatabaseOptions(databaseId, apiKey, nextCursor)
          );

          const responseData = response.data;
          nextCursor = responseData.next_cursor;
          locations = [...locations, ...responseData.results];
        } while (nextCursor);
        for (const location of locations) {
          let notes;
          try {
            notes = location.properties.Notes.rich_text[0].text.content;
          } catch (error) {
            notes = "-";
          }
          let locationMetadata;
          if (location.properties === undefined) {
            continue;
          }
          try{
          locationMetadata = {
            name: location.properties.Name.title[0].text.content,
            lat: parseFloat(location.properties.Latitude.number),
            long: parseFloat(location.properties.Longitude.number),
            type: location.properties.Type.multi_select.map(
              (type) => type.name
            ),
            price: location.properties.Price.number,
            rating: location.properties.Rating.number,
            cuisine: location.properties.Cuisine.multi_select.map(
              (cuisine) => cuisine.name
            ),
            notes: notes,
            url: location.properties["Maps Link"].url,
          };
        } catch (error) {
          console.error(location);
          res
            .status(500)
            .send("Error occurred while fetching incomplete database options");
            return;
        }
          formattedLocations.push(locationMetadata);
        }
        res.send(formattedLocations);
      })
      .catch(function (error) {
        console.error(error);
        res
          .status(500)
          .send("Error occurred while fetching incomplete database options");
      });
  }
});

module.exports = app;
