// Cuaca / Prakiraan (wttr.in)
const axios = require('axios');

module.exports = (bot) => {
    bot.onText(/cuaca(.*)/i, async (msg, match) => {
        const chatId = msg.chat.id;
        let lokasi = match[1].trim();
        if (!lokasi) return bot.sendMessage(chatId, 'Ketik: cuaca [lokasi]');
        try {
            const res = await axios.get(`https://wttr.in/${encodeURIComponent(lokasi)}?format=3`);
            await bot.sendMessage(chatId, res.data);
        } catch {
            await bot.sendMessage(chatId, 'Gagal mengambil data cuaca.');
        }
    });
};
