const QRCode = require('qrcode');
const Jimp = require('jimp');
const jsQR = require('jsqr');
const axios = require('axios');

function escapeMarkdown(text) {
    return text.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, '\\$1');
}

module.exports = (bot, userState) => {
    const QR_GENERATE_STATE = 'awaiting_qr_text';
    const QR_READ_STATE = 'awaiting_qr_image';

    bot.on('callback_query', async (callbackQuery) => {
        const msg = callbackQuery.message;
        const chatId = msg.chat.id;
        const data = callbackQuery.data;

        if (data === 'generate_qr_code') {
            userState[chatId] = { state: QR_GENERATE_STATE };
            bot.sendMessage(chatId, "Silakan kirim teks atau URL yang ingin Anda buat QR Code-nya.");
        } else if (data === 'read_qr_code') {
            userState[chatId] = { state: QR_READ_STATE };
            bot.sendMessage(chatId, "Silakan kirim gambar yang berisi QR Code.");
        }
    });

    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const text = msg.text;

        if (userState[chatId]?.state === QR_GENERATE_STATE) {
            if (text) {
                try {
                    const qrCodeBuffer = await QRCode.toBuffer(text, { width: 512, height: 512 });
                    bot.sendPhoto(chatId, qrCodeBuffer, { caption: 'QR Code Anda:' });
                } catch (error) {
                    console.error("Error generating QR Code:", error);
                    bot.sendMessage(chatId, "Maaf, terjadi kesalahan saat membuat QR Code.");
                } finally {
                    delete userState[chatId];
                }
            }
        } else if (userState[chatId]?.state === QR_READ_STATE) {
            if (msg.photo && msg.photo.length > 0) {
                const fileId = msg.photo[msg.photo.length - 1].file_id;
                try {
                    const fileLink = await bot.getFileLink(fileId);
                    const response = await axios.get(fileLink, { responseType: 'arraybuffer' });
                    const image = await Jimp.read(Buffer.from(response.data));
                    const imageData = new Uint8ClampedArray(image.bitmap.data.buffer);
                    const code = jsQR(imageData, image.bitmap.width, image.bitmap.height);

                    if (code) {
                        bot.sendMessage(chatId, `Isi QR Code: ${escapeMarkdown(code.data)}`, { parse_mode: 'Markdown' });
                    } else {
                        bot.sendMessage(chatId, "Maaf, tidak dapat membaca QR Code dari gambar ini.");
                    }
                    delete userState[chatId];
                } catch (error) {
                    console.error("Error processing QR Code image:", error);
                    bot.sendMessage(chatId, "Maaf, terjadi kesalahan saat memproses gambar QR Code.");
                    delete userState[chatId];
                }
            } else {
                bot.sendMessage(chatId, "Mohon kirimkan gambar yang berisi QR Code.");
            }
        }
    });
};