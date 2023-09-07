require("dotenv").config();

const setUserNotionSecretOptions = (temporaryCode) => ({
  method: "POST",
  url: "https://api.notion.com/v1/oauth/token",
  headers: {
    "content-type": "application/json",
    Authorization: `Basic ${btoa(
      process.env.NOTION_OAUTH_CLIENT_ID +
        ":" +
        process.env.NOTION_OAUTH_CLIENT_SECRET
    )}`,
  },
  data: {
    grant_type: "authorization_code",
    code: temporaryCode,
    redirect_uri: process.env.REDIRECT_URL,
  },
});

const getDatabaseOptions = (databaseId, apiKey) => ({
  method: "POST",
  url: `https://api.notion.com/v1/databases/${databaseId}/query`,
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${apiKey}`,
    "Notion-Version": "2022-06-28",
    "content-type": "application/json",
  },
});

const getDatabaseConfigOptions = (databaseId, apiKey) => ({
  method: "GET",
  url: `https://api.notion.com/v1/databases/${databaseId}`,
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${apiKey}`,
    "Notion-Version": "2022-06-28",
    "content-type": "application/json",
  },
});

const getMapPlaceIdOptions = (address) => ({
  method: "GET",
  url: `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${address}&inputtype=textquery&fields=place_id&key=${process.env.GOOGLE_MAPS_API_KEY}`,
});

const getMapOptions = (placeId) => ({
  method: "GET",
  url: `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,geometry,price_level,rating,url&key=${process.env.GOOGLE_MAPS_API_KEY}`,
});

const patchDatabaseOptions = (pageId, lat, long, price, rating, url, apiKey) => ({
  method: "PATCH",
  url: `https://api.notion.com/v1/pages/${pageId}`,
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${apiKey}`,
    "Notion-Version": "2022-06-28",
    "content-type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  data: {
    properties: {
      Latitude: lat,
      Longitude: long,
      "Maps Link": url,
      Price: price,
      Rating: rating,
    },
  },
});

module.exports = {
  setUserNotionSecretOptions,
  getDatabaseOptions,
  getDatabaseConfigOptions,
  getMapOptions,
  getMapPlaceIdOptions,
  patchDatabaseOptions,
};
