const axios = require('axios');
const debug = require('debug');

const log = debug('bot:urlShortener');
const errorLog = debug('bot:urlShortener:error');

module.exports = (bot, userState) => {
    bot.on('callback_query', (callbackQuery) => {
        const msg = callbackQuery.message;
        const chatId = msg.chat.id;
        const data = callbackQuery.data;

        if (data === 'url_shortener_tinyurl') {
            userState[chatId] = 'awaiting_url';
            log(`User ${chatId} is now in awaiting_url state`);
            bot.answerCallbackQuery(callbackQuery.id);
            bot.sendMessage(chatId, `Silakan kirim URL yang ingin Anda pendekkan.`, {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '↩️ Kembali', callback_data: 'general_tools' }]
                    ]
                }
            });
        }
    });

    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const text = msg.text;

        if (userState[chatId] === 'awaiting_url' && text && (text.startsWith('http://') || text.startsWith('https://'))) {
            log(`Shortening URL: ${text} for chat ID: ${chatId}`);
            try {
                const response = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(text)}`);
                const shortUrl = response.data;
                log(`Successfully shortened URL for chat ID: ${chatId}. Short URL: ${shortUrl}`);
                bot.sendMessage(chatId, `URL pendek Anda: ${shortUrl}`);
            } catch (error) {
                errorLog(`Error shortening URL for chat ID: ${chatId}. Error: ${error.message}`);
                bot.sendMessage(chatId, 'Terjadi kesalahan saat memendekkan URL. Pastikan URL Anda valid.');
            } finally {
                delete userState[chatId];
                log(`User state for chat ID: ${chatId} has been cleared`);
            }
        } else if (userState[chatId] === 'awaiting_url') { // Only show error if awaiting_url state
            log(`Invalid URL received from chat ID: ${chatId}. Message: ${text}`);
            bot.sendMessage(chatId, '⚠️ URL tidak valid. Pastikan URL yang Anda kirimkan dimulai dengan http:// atau https://.');
        }
    });
};
