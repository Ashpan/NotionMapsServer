require('dotenv').config();

const getDatabaseOptions = (databaseId) => ({
    method: 'POST',
    url: `https://api.notion.com/v1/databases/${databaseId}/query`,
    headers: {
        accept: 'application/json',
        'Authorization': `Bearer ${process.env.NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'content-type': 'application/json'
    },
});

// const getMapOptions = (address) => ({
//     method: 'GET',
//     url: `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.GOOGLE_MAPS_API_KEY}`,
// });

const getMapPlaceIdOptions = (address) => ({
    method: 'GET',
    url: `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${address}&inputtype=textquery&fields=place_id&key=${process.env.GOOGLE_MAPS_API_KEY}`,
});

const getMapOptions = (placeId) => ({
    method: 'GET',
    url: `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,geometry,price_level,rating,url&key=${process.env.GOOGLE_MAPS_API_KEY}`
});

const patchDatabaseOptions = (pageId, lat, long, price, rating, url) => ({
    method: 'PATCH',
    url: `https://api.notion.com/v1/pages/${pageId}`,
    headers: {
        accept: 'application/json',
        'Authorization': `Bearer ${process.env.NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'content-type': 'application/json',
        'X-Requested-With': "XMLHttpRequest"

    },
    data: {
        "properties": {
            "Latitude": lat,
            "Longitude": long,
            "Maps Link": url,
            "Price": price,
            "Rating": rating
        }
    }
});

module.exports = {
    getDatabaseOptions,
    getMapOptions,
    getMapPlaceIdOptions,
    patchDatabaseOptions
}