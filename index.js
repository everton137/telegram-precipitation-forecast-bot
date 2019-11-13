const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
require("dotenv").config();

const token = process.env.TELEGRAM_API_TOKEN;
const bot = new TelegramBot(token, { polling: true });

let telegramUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_API_TOKEN}/`

async function getForecast(city) {
  // Get geolocation from Nominatim OSM
  let nominatimUrl = `https://nominatim.openstreetmap.org/search.php?q=${city}&format=json`;
  let geolocation = {};
  let nominatimResp = await axios.get(nominatimUrl);
  let nominatimData = await nominatimResp.data;
  geolocation.lat = nominatimData[0].lat;
  geolocation.lon = nominatimData[0].lon;
  // Get weather from Darksky
  let darkskyUrl = `https://api.darksky.net/forecast/${process.env.DARKSKY_API_KEY}/${geolocation.lat},${geolocation.lon}?units=si`;
  let darkskyResp = await axios.get(darkskyUrl);
  let darkskyData = await darkskyResp.data;
  return darkskyData.currently;
}

// Matches "/city [city name]"
bot.onText(/\/city (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const city = match[1]; // the captured "city name"
  getForecast(city).then(response => {
    let text = `Now it's *${response.temperature} °C* in ${city}`;
    let sendMessageParams = { chat_id: msg.chat.id, text: text, parse_mode: 'Markdown'};
    axios.post(telegramUrl + 'sendMessage', sendMessageParams);
  });

});

// bot.on('polling_error', err => console.log(err));
