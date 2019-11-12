const TelegramBot = require('node-telegram-bot-api');
const fetch = require('node-fetch');
const axios = require('axios');
require('dotenv').config();

const token = process.env.TELEGRAM_API_TOKEN;
const bot = new TelegramBot(token, { polling: true });

async function getForecast(city) {
    // Get geolocation from Nominatim OSM
    let nominatimUrl = `https://nominatim.openstreetmap.org/search.php?q=${city}&format=json`;
    let geolocation = {};
    let nominatimResp = await fetch(nominatimUrl);
    let nominatimData = await nominatimResp.json();
    geolocation.lat = nominatimData[0].lat;
    geolocation.lon = nominatimData[0].lon;
    // Get weather from Darksky
    let darkskyUrl = `https://api.darksky.net/forecast/${process.env.DARKSKY_API_KEY}/${geolocation.lat},${geolocation.lon}?units=si`;
    let darkskyResp = await fetch(darkskyUrl);
    let darkskyData = await darkskyResp.json();
    return darkskyData.currently;
}

// Printing an example to test 
(async () => {
    console.log(await getForecast('Berlin'))
})();

// Test using axios
function getGeolocation(city) {
    let nominatimUrl = `https://nominatim.openstreetmap.org/search.php?q=${city}&format=json`;
    let geolocation = {};
    return axios.get(nominatimUrl)
        .then(response => {
            let data = response.data;
            geolocation.lat = data[0].lat;
            geolocation.lon = data[0].lon;
            return geolocation;
        });
}

bot.on('message', msg => {
    bot.sendMessage(msg.chat.id, 'Please, type /help for more information.')
});

