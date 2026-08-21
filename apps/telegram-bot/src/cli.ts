import { LumaTelegramBot } from './bot.js';

console.log('🤖 Initializing Luma Telegram Bot CLI...');
const bot = new LumaTelegramBot();
bot.init();
bot.start();
