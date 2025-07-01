// Sticker Maker: Ubah gambar menjadi stiker Telegram (konversi ke webp)
const Jimp = require('jimp');
const fs = require('fs');

module.exports = (bot) => {
    bot.on('photo', async (msg) => {
        const chatId = msg.chat.id;
        if (msg.caption && msg.caption.toLowerCase().includes('sticker')) {
            const fileId = msg.photo[msg.photo.length - 1].file_id;
            try {
                const file = await bot.getFile(fileId);
                const url = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;
                const image = await Jimp.read(url);
                const tempPath = `sticker_${chatId}_${Date.now()}.webp`;
                await image.resize(512, 512).quality(90).writeAsync(tempPath);
                await bot.sendSticker(chatId, fs.createReadStream(tempPath));
                fs.unlinkSync(tempPath);
            } catch (e) {
                await bot.sendMessage(chatId, 'Gagal membuat stiker. Pastikan gambar valid.');
            }
        }
    });
};
