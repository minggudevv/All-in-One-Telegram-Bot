// Lirik Lagu (lyrics.ovh)
const axios = require('axios');

module.exports = (bot) => {
    bot.onText(/lirik (.+)/i, async (msg, match) => {
        const chatId = msg.chat.id;
        const query = match[1];
        const [artist, ...titleArr] = query.split('-');
        const title = titleArr.join('-').trim();
        try {
            const res = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist.trim())}/${encodeURIComponent(title)}`);
            await bot.sendMessage(chatId, res.data.lyrics || 'Lirik tidak ditemukan.');
        } catch {
            await bot.sendMessage(chatId, 'Lirik tidak ditemukan.');
        }
    });
};
