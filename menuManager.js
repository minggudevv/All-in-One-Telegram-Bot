// Menu Manager: Konsistensi tombol menu utama dan back

module.exports = {
    mainMenu: {
        reply_markup: {
            inline_keyboard: [
                [{ text: '🛠️ Tools Utama', callback_data: 'general_tools' }],
                [{ text: '🌐 Tools Internet & Sosial Media', callback_data: 'internet_tools' }],
                [{ text: '🔒 Tools Keamanan', callback_data: 'security_tools' }],
                [{ text: '🧩 Tools Tambahan', callback_data: 'tambahan_tools' }]
            ]
        }
    },
    backToHome: {
        reply_markup: {
            inline_keyboard: [
                [{ text: '🏠 Kembali ke Menu Utama', callback_data: 'main_menu' }]
            ]
        }
    },
    tambahanMenu: {
        reply_markup: {
            inline_keyboard: [
                [{ text: '🖼️ Sticker Maker', callback_data: 'tambahan_sticker' }],
                [{ text: '🔎 Anime Finder', callback_data: 'tambahan_anime' }],
                [{ text: '🎵 Lirik Lagu', callback_data: 'tambahan_lirik' }],
                [{ text: '🌦️ Cuaca', callback_data: 'tambahan_cuaca' }],
                [{ text: '🕌 Jadwal Sholat', callback_data: 'tambahan_sholat' }],
                [{ text: '🏠 Kembali ke Menu Utama', callback_data: 'main_menu' }]
            ]
        }
    }
};
