// Anime Finder via Screenshot (trace.moe)
const axios = require('axios');

module.exports = (bot) => {
    bot.on('photo', async (msg) => {
        const chatId = msg.chat.id;
        if (msg.caption && msg.caption.toLowerCase().includes('anime')) {
            const fileId = msg.photo[msg.photo.length - 1].file_id;
            const file = await bot.getFile(fileId);
            const url = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;
            try {
                const res = await axios.get('https://api.trace.moe/search', {
                    params: { url },
                });
                const result = res.data.result[0];
                await bot.sendMessage(chatId, `Judul: ${result.anilist.title.romaji}\nEpisode: ${result.episode}\nSimilarity: ${(result.similarity*100).toFixed(2)}%`);
            } catch (e) {
                await bot.sendMessage(chatId, 'Anime tidak ditemukan.');
            }
        }
    });
};
