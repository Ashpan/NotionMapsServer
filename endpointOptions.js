require('dotenv').config();

const getDatabaseOptions = {
    method: 'POST',
    url: 'https://api.notion.com/v1/databases/7eef035b-dfa2-4cc0-9131-734e8dc8414d/query',
    headers: {
        accept: 'application/json',
        'Authorization': `Bearer ${process.env.NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'content-type': 'application/json'
    },
};

const getMapOptions = (address) => ({
    method: 'GET',
    url: `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.GOOGLE_MAPS_API_KEY}`,
});

const patchDatabaseOptions = (pageId, lat, long, url) => ({
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
            "Maps Link": url
        }
    }
});

module.exports = {
    getDatabaseOptions,
    getMapOptions,
    patchDatabaseOptions
}