const axios = require('axios');

// Whois & IP Lookup (pakai API, misal: https://ipwhois.app/json/ atau https://jsonwhoisapi.com/)
module.exports = (bot, userState) => {
    bot.on('callback_query', async (callbackQuery) => {
        const msg = callbackQuery.message;
        const chatId = msg.chat.id;
        const data = callbackQuery.data;
        if (data === 'whois_ip') {
            bot.sendMessage(chatId, 'Masukkan domain atau IP address:');
            userState[chatId] = { state: 'awaiting_whois_ip' };
        }
    });
    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const text = msg.text && msg.text.trim();
        if (userState[chatId]?.state === 'awaiting_whois_ip' && text) {
            let loadingMsg;
            try {
                loadingMsg = await bot.sendMessage(chatId, '⏳ Loading...');
                const res = await axios.get(`https://ipwhois.app/json/${encodeURIComponent(text)}`);
                if (res.data && res.data.success !== false) {
                    const d = res.data;
                    let info = `🌐 Whois/IP Info untuk: ${text}\n`;
                    info += `IP: ${d.ip || '-'}\nNegara: ${d.country || '-'}\nWilayah: ${d.region || '-'}\nKota: ${d.city || '-'}\nISP: ${d.isp || '-'}\nOrg: ${d.org || '-'}\nTipe: ${d.type || '-'}\nTimezone: ${d.timezone_gmt || '-'}\n`;
                    if (d.latitude && d.longitude) info += `Lokasi: ${d.latitude}, ${d.longitude}\n`;
                    await bot.sendMessage(chatId, info);
                } else {
                    await bot.sendMessage(chatId, 'Gagal mendapatkan data. Pastikan domain/IP valid.');
                }
            } catch (e) {
                await bot.sendMessage(chatId, `❌ Gagal: ${e.message || 'Gagal menghubungi API Whois/IP.'}`);
            } finally {
                if (loadingMsg) {
                    try { await bot.deleteMessage(chatId, loadingMsg.message_id); } catch {}
                }
                delete userState[chatId];
            }
        }
    });
};
