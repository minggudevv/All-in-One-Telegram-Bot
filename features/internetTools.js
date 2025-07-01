const ytdl = require('ytdl-core');
const TikTokScraper = require('tiktok-scraper');
const axios = require('axios');

module.exports = (bot, userState) => {
    bot.on('callback_query', (callbackQuery) => {
        const chatId = callbackQuery.message.chat.id;
        const data = callbackQuery.data;
        if (data === 'internet_tools_menu') {
            userState[chatId] = { state: 'awaiting_internet_tool' };
            bot.sendMessage(chatId, 'Pilih tools:\n1. Download YouTube\n2. Download TikTok\nKetik: yt <url> atau tiktok <url>');
        }
    });

    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        if (userState[chatId]?.state === 'awaiting_internet_tool') {
            const text = msg.text.trim();
            if (text.startsWith('yt ')) {
                const url = text.split(' ')[1];
                if (!ytdl.validateURL(url)) {
                    bot.sendMessage(chatId, 'URL YouTube tidak valid.');
                    return;
                }
                try {
                    const info = await ytdl.getInfo(url);
                    const format = ytdl.chooseFormat(info.formats, { quality: '18' });
                    bot.sendMessage(chatId, `Judul: ${info.videoDetails.title}\nMengunduh...`);
                    bot.sendVideo(chatId, format.url);
                } catch {
                    bot.sendMessage(chatId, 'Gagal mengunduh video YouTube.');
                }
            } else if (text.startsWith('tiktok ')) {
                const url = text.split(' ')[1];
                try {
                    const videoMeta = await TikTokScraper.getVideoMeta(url);
                    bot.sendVideo(chatId, videoMeta.collector[0].videoUrl);
                } catch {
                    bot.sendMessage(chatId, 'Gagal mengunduh video TikTok.');
                }
            } else {
                bot.sendMessage(chatId, 'Perintah tidak dikenali.');
            }
            delete userState[chatId];
        }
    });
};
