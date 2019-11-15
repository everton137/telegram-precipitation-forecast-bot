const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const moment = require("moment");
const tz = require("moment-timezone");
require("dotenv").config();
const aux = require('./aux');

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
  return darkskyData;
}

// Bot /help
bot.onText(/\/help/, msg => {
  // 'msg' is the received Message from Telegram
  text = `
Type:
  /rain [city name] - to get the rain forecast for the next 7 days
  /temp [city name] - to get the current weather information
  /maxmin [city name] - to get the higher and lower temperatures for the next 7 days
  /help - for this help message
  `;

  bot.sendMessage(msg.chat.id, text);
});

// Matches "/rain [city name]"
bot.onText(/\/rain (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const city = match[1];
  const cityNoAccents = aux.removeAccents(match[1]); // the captured "city name"

  getForecast(cityNoAccents).then(resp => {
    let text = `
The chance of rain in *${city}* in the next 7 days is:
 ${moment().format('ddd')}: *${Math.round(resp.currently.precipProbability * 100)}%* - _today_\n`;
    for (let i = 1; i < 7; i++) {
      text += ` ${moment().add(i, 'days').format('ddd')}: *${Math.round(resp.daily.data[i].precipProbability * 100)}%* \n`;
    }
    let sendMessageParams = { chat_id: msg.chat.id, text: text, parse_mode: 'Markdown' };
    axios.post(telegramUrl + 'sendMessage', sendMessageParams);
  });
});

// Matches "/temp [city name]"
bot.onText(/\/temp (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message


  const city = match[1]; // the captured "city name"
  const cityNoAccents = aux.removeAccents(match[1]);


  getForecast(cityNoAccents).then(response => {
    let text = `
Now it's *${response.currently.temperature}* °C (feels like *${response.currently.apparentTemperature}* °C) in *${city}*
Wind: speed *${(response.currently.windSpeed * 3.6).toFixed(1)}* (km/h), gust *${(response.currently.windGust * 3.6).toFixed(1)}* (km/h), direction *${aux.degToCard(response.currently.windBearing)}*
Sunrise/Sunset: *${moment.unix(response.daily.data[0].sunriseTime).tz(response.timezone).format('HH[h]mm')}* / *${moment.unix(response.daily.data[0].sunsetTime).tz(response.timezone).format('HH[h]mm')}*
Humidity: *${Math.round(response.currently.humidity * 100)}%*, UV Index: *${response.currently.uvIndex}*
`;
    let sendMessageParams = { chat_id: msg.chat.id, text: text, parse_mode: 'Markdown' };
    axios.post(telegramUrl + 'sendMessage', sendMessageParams);
  });
});

// Matches "/maxmin [city name]"
bot.onText(/\/maxmin (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const city = match[1]; // the captured "city name"
  const cityNoAccents = aux.removeAccents(match[1]);

  getForecast(cityNoAccents).then(resp => {
    let text = `
The higher and lower temperatures in *${city}* in the next 7 days are: \n`;
    for (let i = 0; i < 7; i++) {
      text += ` ${moment().add(i, 'days').format('ddd')}: *${resp.daily.data[i].temperatureLow}* / *${resp.daily.data[i].temperatureHigh}* (°C) \n`;
    }

    let sendMessageParams = { chat_id: msg.chat.id, text: text, parse_mode: 'Markdown' };
    axios.post(telegramUrl + 'sendMessage', sendMessageParams);
  });
});

// bot.on('polling_error', err => console.log(err));
