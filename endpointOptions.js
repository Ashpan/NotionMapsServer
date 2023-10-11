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
    redirect_uri:
      "https://notion-maps-git-refactor-auth-ashpan.vercel.app/notion-callback",
  },
});

const getIncompleteDatabaseOptions = (databaseId, apiKey, columnsNames) => ({
  method: "POST",
  url: `https://api.notion.com/v1/databases/${databaseId}/query`,
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${apiKey}`,
    "Notion-Version": "2022-06-28",
    "content-type": "application/json",
  },
  data: {
    filter: {
      or: [
        {
          property: columnsNames.latitude,
          number: {
            is_empty: true,
          },
        },
        {
          property: columnsNames.longitude,
          number: {
            is_empty: true,
          },
        },
        {
          property: columnsNames.mapsLink,
          url: {
            is_empty: true,
          },
        },
        {
          property: columnsNames.price,
          number: {
            is_empty: true,
          },
        },
        {
          property: columnsNames.rating,
          number: {
            is_empty: true,
          },
        },
      ],
    },
  },
});

const getDatabaseOptions = (databaseId, apiKey, nextCursor=undefined) => ({
  method: "POST",
  url: `https://api.notion.com/v1/databases/${databaseId}/query`,
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${apiKey}`,
    "Notion-Version": "2022-06-28",
    "content-type": "application/json",
  },
  data: {
    page_size: 100,
    start_cursor: nextCursor
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

const patchDatabaseOptions = (
  pageId,
  lat,
  long,
  price,
  rating,
  url,
  apiKey
) => ({
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
  getIncompleteDatabaseOptions,
  getDatabaseConfigOptions,
  getMapOptions,
  getMapPlaceIdOptions,
  patchDatabaseOptions,
};
