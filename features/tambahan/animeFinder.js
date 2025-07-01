// Anime Finder via Screenshot (trace.moe + saucenao fallback)
const axios = require('axios');
const FormData = require('form-data');

async function searchTraceMoe(url) {
    try {
        const res = await axios.get('https://api.trace.moe/search', { params: { url } });
        if (res.data && res.data.result && res.data.result[0]) return res.data.result[0];
    } catch (e) { throw e; }
    return null;
}

async function searchSauceNao(imageBuffer) {
    const apiKey = process.env.SAUCENAO_API_KEY;
    if (!apiKey) return null;
    try {
        const form = new FormData();
        form.append('api_key', apiKey);
        form.append('output_type', 2);
        form.append('file', imageBuffer, 'image.jpg');
        const res = await axios.post('https://saucenao.com/search.php', form, { headers: form.getHeaders() });
        if (res.data && res.data.results && res.data.results[0]) return res.data.results[0];
    } catch (e) { throw e; }
    return null;
}

module.exports = (bot) => {
    bot.on('photo', async (msg) => {
        const chatId = msg.chat.id;
        if (msg.caption && msg.caption.toLowerCase().includes('anime')) {
            const fileId = msg.photo[msg.photo.length - 1].file_id;
            const file = await bot.getFile(fileId);
            const url = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;
            let loadingMsg;
            try {
                loadingMsg = await bot.sendMessage(chatId, '🔎 Mencari info anime, mohon tunggu...');
                let result = await searchTraceMoe(url);
                if (result) {
                    let judul = '';
                    if (result.anilist?.title) {
                        judul = result.anilist.title.romaji || result.anilist.title.native || result.anilist.title.english || '';
                        // Jika semua field ada tapi kosong string
                        if (judul.trim() === '') judul = '';
                    }
                    if (!judul) judul = 'Tidak ditemukan';
                    await bot.editMessageText(`Judul: ${judul}\nEpisode: ${result.episode || '-'}\nSimilarity: ${(result.similarity*100).toFixed(2)}%`, { chat_id: chatId, message_id: loadingMsg.message_id });
                    return;
                }
                // Fallback ke saucenao jika ada API key
                if (process.env.SAUCENAO_API_KEY) {
                    try {
                        const imgRes = await axios.get(url, { responseType: 'arraybuffer' });
                        const sauce = await searchSauceNao(Buffer.from(imgRes.data));
                        if (sauce && sauce.data && sauce.data.title) {
                            await bot.editMessageText(`Judul: ${sauce.data.title}\nSource: ${sauce.data.source || '-'}\nSimilarity: ${sauce.header.similarity}%`, { chat_id: chatId, message_id: loadingMsg.message_id });
                            return;
                        }
                    } catch (e) {
                        await bot.editMessageText('Gagal mencari di saucenao: ' + e.message, { chat_id: chatId, message_id: loadingMsg.message_id });
                        return;
                    }
                }
                await bot.editMessageText('Anime tidak ditemukan di semua sumber.', { chat_id: chatId, message_id: loadingMsg.message_id });
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
