// Jadwal Sholat (myquran.com)
const axios = require('axios');

module.exports = (bot) => {
    bot.onText(/sholat (.+)/i, async (msg, match) => {
        const chatId = msg.chat.id;
        const kota = match[1].trim();
        const today = new Date().toISOString().slice(0, 10);
        try {
            const res = await axios.get(`https://api.myquran.com/v1/sholat/jadwal/${encodeURIComponent(kota)}/${today}`);
            const data = res.data.data.jadwal;
            await bot.sendMessage(chatId, `Jadwal Sholat ${kota} (${today}):\nSubuh: ${data.subuh}\nDzuhur: ${data.dzuhur}\nAshar: ${data.ashar}\nMaghrib: ${data.maghrib}\nIsya: ${data.isya}`);
        } catch {
            await bot.sendMessage(chatId, 'Jadwal sholat tidak ditemukan.');
        }
    });
};
