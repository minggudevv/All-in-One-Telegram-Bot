// Email Validator
const axios = require('axios');

module.exports = (bot, userState) => {
    bot.on('callback_query', (callbackQuery) => {
        const msg = callbackQuery.message;
        const chatId = msg.chat.id;
        const data = callbackQuery.data;
        if (data === 'email_validator') {
            userState[chatId] = { state: 'awaiting_email_input' };
            bot.sendMessage(chatId, 'Masukkan email yang ingin dicek:');
        }
    });
    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const text = msg.text && msg.text.trim();
        if (userState[chatId]?.state === 'awaiting_email_input' && text) {
            // Validasi format dasar
            if (!/^\S+@\S+\.\S+$/.test(text)) {
                bot.sendMessage(chatId, 'Format email tidak valid.');
                delete userState[chatId];
                return;
            }
            let loadingMsg;
            try {
                loadingMsg = await bot.sendMessage(chatId, '⏳ Loading...');
                // Gunakan open API (disposable.debounce.io)
                const res = await axios.get(`https://disposable.debounce.io/?email=${encodeURIComponent(text)}`);
                if (res.data && res.data.disposable !== undefined) {
                    let valid = res.data.disposable === 'false';
                    await bot.sendMessage(chatId, `Email <b>${text}</b> ${(valid ? 'valid' : 'TIDAK valid/disposable')}.`, { parse_mode: 'HTML' });
                } else {
                    await bot.sendMessage(chatId, 'Tidak bisa memvalidasi email.');
                }
            } catch (e) {
                await bot.sendMessage(chatId, `❌ Gagal: ${e.message || 'Gagal menghubungi API validasi email.'}`);
            } finally {
                if (loadingMsg) {
                    try { await bot.deleteMessage(chatId, loadingMsg.message_id); } catch {}
                }
                delete userState[chatId];
            }
        }
    });
};
