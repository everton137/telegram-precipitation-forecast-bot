const TelegramBot = require('node-telegram-bot-api');
const fetch = require('node-fetch');
const axios = require('axios');
require('dotenv').config();

const token = process.env.TELEGRAM_API_TOKEN;
const bot = new TelegramBot(token, { polling: true });

async function getForecast(geolocation) {
    let darkskyUrl = `https://api.darksky.net/forecast/${process.env.DARKSKY_API_KEY}/${geolocation.lat},${geolocation.lon}?units=si`;
    let response = await fetch(darkskyUrl);
    let data = await response.json();
    return data.currently;
}

async function getGeolocation(city) {
    let nominatimUrl = `https://nominatim.openstreetmap.org/search.php?q=${city}&format=json`;
    let geolocation = {};
    let response = await fetch(nominatimUrl);
    let data = await response.json();
    geolocation.lat = data[0].lat;
    geolocation.lon = data[0].lon;
    getForecast(geolocation);
}
// Berlin: { lat: '52.5170365', lon: '13.3888599' }

// Test using axios
function getGeolocation2(city) {
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

