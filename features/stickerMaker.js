// Sticker Maker: Ubah gambar menjadi stiker Telegram
module.exports = (bot) => {
    bot.on('photo', async (msg) => {
        const chatId = msg.chat.id;
        if (msg.caption && msg.caption.toLowerCase().includes('sticker')) {
            const fileId = msg.photo[msg.photo.length - 1].file_id;
            await bot.sendSticker(chatId, fileId);
        }
    });
};
