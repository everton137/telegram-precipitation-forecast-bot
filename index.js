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
  return darkskyData;
}

// Bot /help
bot.onText(/\/help/, msg => {
  // 'msg' is the received Message from Telegram
  text = `
Type:
  /temp [city name] - to get the current temperature
  /rain [city name] - to get the rain forecast for the next 7 days
`;

  bot.sendMessage(msg.chat.id, text);

});

// Matches "/rain [city name]"
bot.onText(/\/rain (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const city = match[1]; // the captured "city name"
  getForecast(city).then(resp => {
    let text = `
The chances of rain in ${city} the 7 five days are:
 (today) ${Math.round(resp.currently.precipProbability * 100)}%\n`;
    for (let i=1; i < 7; i++) {
      text += ` (${i}) ${Math.round(resp.daily.data[i].precipProbability * 100)}% \n`;
    }
    let sendMessageParams = { chat_id: msg.chat.id, text: text, parse_mode: 'Markdown'};
    axios.post(telegramUrl + 'sendMessage', sendMessageParams);
  });
});

// Matches "/temp [city name]"
bot.onText(/\/temp (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const city = match[1]; // the captured "city name"
  getForecast(city).then(response => {
    let text = `Now it's *${response.currently.temperature} °C* in *${city}*`;
    let sendMessageParams = { chat_id: msg.chat.id, text: text, parse_mode: 'Markdown'};
    axios.post(telegramUrl + 'sendMessage', sendMessageParams);
  });
});

// bot.on('polling_error', err => console.log(err));
