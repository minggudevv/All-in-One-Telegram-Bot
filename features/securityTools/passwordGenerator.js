// Password Generator
const crypto = require('crypto');

const LENGTH_OPTIONS = [8, 12, 16, 20, 24];

module.exports = (bot, userState) => {
    bot.on('callback_query', async (callbackQuery) => {
        const msg = callbackQuery.message;
        const chatId = msg.chat.id;
        const data = callbackQuery.data;
        if (data === 'password_generator') {
            userState[chatId] = { state: 'awaiting_password_length' };
            await bot.sendMessage(chatId, 'Pilih panjang password:', {
                reply_markup: {
                    inline_keyboard: LENGTH_OPTIONS.map(l => [{ text: `${l} karakter`, callback_data: `pwlen_${l}` }])
                }
            });
        } else if (data.startsWith('pwlen_')) {
            const length = parseInt(data.split('_')[1]);
            userState[chatId] = { state: 'awaiting_password_opts', length, opts: { angka: false, simbol: false }, checklistMsgId: null };
            const sent = await bot.sendMessage(chatId, 'Checklist karakter yang ingin digunakan:', {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '❌ Angka', callback_data: 'pwopt_angka_on' }, { text: '❌ Simbol', callback_data: 'pwopt_simbol_on' }],
                        [{ text: '✅ Generate Password', callback_data: 'pwgen' }],
                        [{ text: 'Batal', callback_data: 'main_menu' }]
                    ]
                }
            });
            userState[chatId].checklistMsgId = sent.message_id;
        } else if (data.startsWith('pwopt_')) {
            // Toggle opsi
            const [_, opt, state] = data.split('_');
            const user = userState[chatId];
            if (!user || user.state !== 'awaiting_password_opts') return;
            user.opts[opt] = state === 'on';
            // Update tombol checklist pada pesan yang sama
            await bot.editMessageReplyMarkup({
                inline_keyboard: [
                    [
                        { text: user.opts.angka ? '✔️ Angka' : '❌ Angka', callback_data: `pwopt_angka_${user.opts.angka ? 'off' : 'on'}` },
                        { text: user.opts.simbol ? '✔️ Simbol' : '❌ Simbol', callback_data: `pwopt_simbol_${user.opts.simbol ? 'off' : 'on'}` }
                    ],
                    [{ text: '✅ Generate Password', callback_data: 'pwgen' }],
                    [{ text: 'Batal', callback_data: 'main_menu' }]
                ]
            }, { chat_id: chatId, message_id: user.checklistMsgId });
        } else if (data === 'pwgen') {
            const user = userState[chatId];
            if (!user || user.state !== 'awaiting_password_opts') return;
            let chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
            if (user.opts.angka) chars += '0123456789';
            if (user.opts.simbol) chars += '!@#$%^&*()_+-={}[]|:;<>,.?/~';
            const length = user.length || 12;
            let password = Array.from(crypto.randomFillSync(new Uint32Array(length))).map(x => chars[x % chars.length]).join('');
            // Escape karakter HTML sebelum dikirim
            const safePassword = escapeHtml(password);
            await bot.sendMessage(chatId, `Password acak:\n<code>${safePassword}</code>`, { parse_mode: 'HTML' });
            // Hapus pesan checklist agar tidak dobel
            if (user.checklistMsgId) {
                try { await bot.deleteMessage(chatId, user.checklistMsgId); } catch {}
            }
            delete userState[chatId];
        }
    });

    // Fungsi untuk escape karakter khusus HTML
    function escapeHtml(text) {
        return text.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }
};
