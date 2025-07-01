const axios = require('axios');

module.exports = (bot, userState) => {
    bot.on('callback_query', async (callbackQuery) => {
        const msg = callbackQuery.message;
        const chatId = msg.chat.id;
        const data = callbackQuery.data;
        if (data === 'fake_identity') {
            let loadingMsg;
            try {
                loadingMsg = await bot.sendMessage(chatId, '⏳ Loading...');
                const res = await axios.get('https://randomuser.me/api/');
                if (res.data && res.data.results && res.data.results[0]) {
                    const f = res.data.results[0];
                    const nama = `${f.name.title} ${f.name.first} ${f.name.last}`;
                    const alamat = `${f.location.street.number} ${f.location.street.name}`;
                    const kota = f.location.city;
                    const negara = f.location.country;
                    const email = f.email;
                    const telepon = f.phone;
                    const tgl = new Date(f.dob.date).toLocaleDateString('id-ID');
                    const gender = f.gender === 'male' ? 'Laki-laki' : 'Perempuan';
                    const caption = `Nama: ${nama}\nGender: ${gender}\nAlamat: ${alamat}\nKota: ${kota}\nNegara: ${negara}\nEmail: ${email}\nTelepon: ${telepon}\nTanggal Lahir: ${tgl}`;
                    await bot.sendPhoto(chatId, f.picture.large, { caption });
                } else {
                    await bot.sendMessage(chatId, 'Gagal mendapatkan data identitas palsu.');
                }
            } catch (e) {
                await bot.sendMessage(chatId, `❌ Gagal: ${e.message || 'Gagal menghubungi API identitas palsu.'}`);
            } finally {
                if (loadingMsg) {
                    try { await bot.deleteMessage(chatId, loadingMsg.message_id); } catch {}
                }
            }
        }
    });
};
