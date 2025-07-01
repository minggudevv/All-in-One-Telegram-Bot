const convert = require('color-convert');
const ntc = require('ntcjs');
const menuManager = require('../menuManager');

function getColorName(hex) {
    const n_match = ntc.name(hex);
    return n_match[1];
}

module.exports = (bot, userState) => {
    bot.on('callback_query', (callbackQuery) => {
        const chatId = callbackQuery.message.chat.id;
        const data = callbackQuery.data;
        if (data === 'color_converter') {
            userState[chatId] = { state: 'awaiting_color_input' };
            bot.sendMessage(chatId, 'Masukkan kode warna (HEX, RGB, atau nama warna):');
        }
    });

    bot.on('message', (msg) => {
        const chatId = msg.chat.id;
        if (userState[chatId]?.state === 'awaiting_color_input') {
            const input = msg.text.trim();
            let hex = '';
            if (/^#?[0-9A-Fa-f]{6}$/.test(input)) {
                hex = input.replace('#', '');
            } else if (/^rgb\((\d{1,3}),\s?(\d{1,3}),\s?(\d{1,3})\)$/.test(input)) {
                const [, r, g, b] = input.match(/^rgb\((\d{1,3}),\s?(\d{1,3}),\s?(\d{1,3})\)$/);
                hex = convert.rgb.hex([+r, +g, +b]);
            } else {
                try {
                    hex = convert.keyword.hex(input.toLowerCase());
                } catch {
                    bot.sendMessage(chatId, 'Format warna tidak dikenali.');
                    return;
                }
            }
            const colorName = getColorName('#' + hex);
            bot.sendMessage(chatId, `Preview warna: #${hex}\nNama warna: ${colorName}`, menuManager.backToHome);
            delete userState[chatId];
        }
    });
};
