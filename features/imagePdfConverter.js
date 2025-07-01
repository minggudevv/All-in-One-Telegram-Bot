const { PDFDocument } = require('pdf-lib');
const Jimp = require('jimp');
const axios = require('axios');

module.exports = (bot, userState) => {
    bot.on('callback_query', (callbackQuery) => {
        const chatId = callbackQuery.message.chat.id;
        const data = callbackQuery.data;
        if (data === 'image_pdf_converter') {
            userState[chatId] = { state: 'awaiting_image_for_pdf', images: [] };
            bot.sendMessage(chatId, 'Kirim satu atau beberapa gambar, lalu ketik /selesai jika sudah.');
        }
    });

    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        if (userState[chatId]?.state === 'awaiting_image_for_pdf') {
            if (msg.photo && msg.photo.length > 0) {
                const fileId = msg.photo[msg.photo.length - 1].file_id;
                const fileLink = await bot.getFileLink(fileId);
                userState[chatId].images.push(fileLink);
                bot.sendMessage(chatId, 'Gambar ditambahkan. Kirim gambar lain atau ketik /selesai.');
            } else if (msg.text === '/selesai') {
                if (userState[chatId].images.length === 0) {
                    bot.sendMessage(chatId, 'Belum ada gambar yang dikirim.');
                    return;
                }
                try {
                    const pdfDoc = await PDFDocument.create();
                    for (const imgUrl of userState[chatId].images) {
                        const response = await axios.get(imgUrl, { responseType: 'arraybuffer' });
                        const image = await Jimp.read(Buffer.from(response.data));
                        const imgBuffer = await image.getBufferAsync(Jimp.MIME_JPEG);
                        const imgEmbed = await pdfDoc.embedJpg(imgBuffer);
                        const page = pdfDoc.addPage([imgEmbed.width, imgEmbed.height]);
                        page.drawImage(imgEmbed, { x: 0, y: 0, width: imgEmbed.width, height: imgEmbed.height });
                    }
                    const pdfBytes = await pdfDoc.save();
                    bot.sendDocument(chatId, Buffer.from(pdfBytes), {}, { filename: 'images.pdf' });
                } catch (error) {
                    bot.sendMessage(chatId, 'Gagal membuat PDF.');
                }
                delete userState[chatId];
            }
        }
    });
};
