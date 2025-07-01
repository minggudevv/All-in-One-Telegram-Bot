// Link Scanner (Phishing/URL checker)
const axios = require('axios');

async function scanWithUrlscan(url) {
    // urlscan.io public search (tanpa API key, hanya summary)
    try {
        const res = await axios.get(`https://urlscan.io/api/v1/search/?q=domain:${encodeURIComponent(url.replace(/^https?:\/\//, '').split('/')[0])}`);
        if (res.data && res.data.results && res.data.results.length > 0) {
            // Ambil status terakhir
            const last = res.data.results[0];
            return {
                verdict: last.verdict || '-',
                tags: last.tags || [],
                screenshot: last.screenshot || null,
                url: last.page.url || url
            };
        }
    } catch {}
    return null;
}

module.exports = (bot, userState) => {
    bot.on('callback_query', (callbackQuery) => {
        const msg = callbackQuery.message;
        const chatId = msg.chat.id;
        const data = callbackQuery.data;
        if (data === 'link_scanner') {
            userState[chatId] = { state: 'awaiting_link_input' };
            bot.sendMessage(chatId, 'Masukkan URL/link yang ingin dicek:');
        }
    });
    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const text = msg.text && msg.text.trim();
        if (userState[chatId]?.state === 'awaiting_link_input' && text) {
            if (!/^https?:\/\//.test(text)) {
                bot.sendMessage(chatId, 'Format link harus diawali http:// atau https://');
                delete userState[chatId];
                return;
            }
            let loadingMsg;
            try {
                loadingMsg = await bot.sendMessage(chatId, '⏳ Loading...');
                // Coba urlscan.io
                let result = await scanWithUrlscan(text);
                if (result) {
                    let msgScan = `Hasil urlscan.io:\nURL: ${result.url}\nVerdict: ${result.verdict}\nTags: ${result.tags.join(', ') || '-'}\n`;
                    if (result.screenshot) {
                        await bot.sendPhoto(chatId, result.screenshot, { caption: msgScan });
                    } else {
                        await bot.sendMessage(chatId, msgScan);
                    }
                    return;
                }
                // Fallback ke phishtank
                try {
                    const res = await axios.get(`https://checkurl.phishtank.com/checkurl/index.php?url=${encodeURIComponent(text)}&format=json`);
                    if (res.data && res.data.results && res.data.results.valid) {
                        const isPhish = res.data.results.in_database && res.data.results.results && res.data.results.results.valid;
                        await bot.sendMessage(chatId, `Link <b>${text}</b> ${(isPhish ? 'berbahaya/phishing!' : 'aman (tidak terdeteksi phishing)')}.`, { parse_mode: 'HTML' });
                    } else {
                        await bot.sendMessage(chatId, 'Tidak bisa memeriksa link.');
                    }
                } catch (e) {
                    await bot.sendMessage(chatId, `❌ Gagal: ${e.message || 'Gagal menghubungi API link scanner.'}`);
                }
            } catch (e) {
                await bot.sendMessage(chatId, `❌ Gagal: ${e.message || 'Gagal memproses link.'}`);
            } finally {
                if (loadingMsg) {
                    try { await bot.deleteMessage(chatId, loadingMsg.message_id); } catch {}
                }
                delete userState[chatId];
            }
        }
    });
};
