const axios = require('axios');

async function searchVagalume(query) {
    try {
        const res = await axios.get(`https://api.vagalume.com.br/search.excerpt?q=${encodeURIComponent(query)}&limit=5`);
        if (res.data && Array.isArray(res.data.response.docs)) return res.data.response.docs;
    } catch (e) { throw e; }
    return [];
}

async function getLyricsVagalume(art, mus) {
    try {
        const res = await axios.get(`https://api.vagalume.com.br/search.php?art=${encodeURIComponent(art)}&mus=${encodeURIComponent(mus)}`);
        if (res.data && res.data.type === 'exact' && res.data.mus && res.data.mus[0] && res.data.mus[0].text) return res.data.mus[0].text;
    } catch (e) { throw e; }
    return null;
}

module.exports = (bot) => {
    bot.onText(/^\/lirik$/i, async (msg) => {
        const chatId = msg.chat.id;
        await bot.sendMessage(chatId, 'Ketik perintah:\n/lirik <judul lagu>\nContoh:\n/lirik Melukis Senja\n/lirik Demons');
    });

    bot.onText(/lirik (.+)/i, async (msg, match) => {
        const chatId = msg.chat.id;
        const query = match[1].trim();
        let loadingMsg;
        try {
            loadingMsg = await bot.sendMessage(chatId, '🔎 Mencari lagu, mohon tunggu...');
            let results = await searchVagalume(query);
            if (!results.length) {
                await bot.editMessageText('Tidak ditemukan lagu yang cocok.', { chat_id: chatId, message_id: loadingMsg.message_id });
                return;
            }
            const keyboard = results.map(track => [{
                text: `🎵 ${track.title} — ${track.band}`,
                callback_data: `vagalume_${track.band}___${track.title}`
            }]);
            await bot.editMessageText('Pilih lagu yang ingin diambil liriknya:', {
                chat_id: chatId,
                message_id: loadingMsg.message_id,
                reply_markup: { inline_keyboard: keyboard }
            });
        } catch (e) {
            if (loadingMsg) {
                await bot.editMessageText('Terjadi error: ' + e.message, { chat_id: chatId, message_id: loadingMsg.message_id });
            } else {
                await bot.sendMessage(chatId, 'Terjadi error: ' + e.message);
            }
        }
    });

    bot.on('callback_query', async (callbackQuery) => {
        const msg = callbackQuery.message;
        const chatId = msg.chat.id;
        const data = callbackQuery.data;
        if (data && data.startsWith('vagalume_')) {
            const [_, band, title] = data.split(/vagalume_|___/).filter(Boolean);
            let loadingMsg;
            try {
                loadingMsg = await bot.sendMessage(chatId, '🔎 Mengambil lirik...');
                const lyrics = await getLyricsVagalume(band, title);
                if (lyrics) {
                    await bot.editMessageText(`🎵 <b>${title}</b>\n👤 <i>${band}</i>\n\n${lyrics}`, { chat_id: chatId, message_id: loadingMsg.message_id, parse_mode: 'HTML' });
                } else {
                    await bot.editMessageText('Lirik tidak ditemukan.', { chat_id: chatId, message_id: loadingMsg.message_id });
                }
            } catch (e) {
                if (loadingMsg) {
                    await bot.editMessageText('Terjadi error: ' + e.message, { chat_id: chatId, message_id: loadingMsg.message_id });
                } else {
                    await bot.sendMessage(chatId, 'Terjadi error: ' + e.message);
                }
            }
        }
    });
};
