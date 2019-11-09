const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const token = process.env.TELEGRAM_API_TOKEN;

const bot = new TelegramBot(token, {polling: true});

bot.on('message', msg => {
    bot.sendMessage(msg.chat.id, 'Please, type /help for mode information.')
});