// Jadwal Sholat (multi API fallback + loading)
const axios = require('axios');

async function getJadwalMyQuran(kota, today) {
    try {
        const res = await axios.get(`https://api.myquran.com/v1/sholat/jadwal/${encodeURIComponent(kota)}/${today}`);
        if (res.data && res.data.data && res.data.data.jadwal) return res.data.data.jadwal;
    } catch (e) { throw e; }
    return null;
}

async function getJadwalAladhan(kota, today) {
    try {
        // Kota dan negara default: Indonesia
        // today: yyyy-mm-dd
        const [year, month, day] = today.split('-');
        const res = await axios.get(`https://api.aladhan.com/v1/timingsByCity`, {
            params: {
                city: kota,
                country: 'Indonesia',
                method: 2,
                date: `${day}-${month}-${year}`
            }
        });
        if (res.data && res.data.data && res.data.data.timings) {
            const t = res.data.data.timings;
            // Samakan field dengan format jadwal lain
            return {
                subuh: t.Fajr,
                dzuhur: t.Dhuhr,
                ashar: t.Asr,
                maghrib: t.Maghrib,
                isya: t.Isha
            };
        }
    } catch (e) { throw e; }
    return null;
}

async function getJadwalBimasislam(kota, today) {
    try {
        // Bimasislam Kemenag API: kota = id kota, misal 703 (Jakarta Pusat)
        // Untuk demo, fallback ke Jakarta Pusat jika kota tidak ditemukan
        const kotaId = isNaN(kota) ? 703 : kota;
        const res = await axios.get(`https://bimasislam.kemenag.go.id/jadwal-sholat/load.php?city=${kotaId}&year=${today.slice(0,4)}&month=${today.slice(5,7)}&day=${today.slice(8,10)}`);
        if (res.data && res.data.jadwal) return res.data.jadwal;
    } catch (e) { throw e; }
    return null;
}

module.exports = (bot) => {
    bot.onText(/sholat (.+)/i, async (msg, match) => {
        const chatId = msg.chat.id;
        const kota = match[1].trim();
        const today = new Date().toISOString().slice(0, 10);
        let loadingMsg;
        try {
            loadingMsg = await bot.sendMessage(chatId, '🔎 Mengambil jadwal sholat, mohon tunggu...');
            let jadwal;
            let errorMsg = '';
            try {
                jadwal = await getJadwalMyQuran(kota, today);
            } catch (e) {
                errorMsg += `myquran: ${e.message}\n`;
            }
            if (!jadwal) {
                try {
                    jadwal = await getJadwalAladhan(kota, today);
                } catch (e) {
                    errorMsg += `aladhan: ${e.message}\n`;
                }
            }
            if (!jadwal) {
                try {
                    jadwal = await getJadwalBimasislam(kota, today);
                } catch (e) {
                    errorMsg += `bimasislam: ${e.message}\n`;
                }
            }
            if (jadwal) {
                await bot.editMessageText(`Jadwal Sholat ${kota} (${today}):\nSubuh: ${jadwal.subuh}\nDzuhur: ${jadwal.dzuhur}\nAshar: ${jadwal.ashar}\nMaghrib: ${jadwal.maghrib}\nIsya: ${jadwal.isya}`, { chat_id: chatId, message_id: loadingMsg.message_id });
            } else {
                await bot.editMessageText('Jadwal sholat tidak ditemukan di semua sumber.' + (errorMsg ? `\n\nError detail:\n${errorMsg}` : ''), { chat_id: chatId, message_id: loadingMsg.message_id });
            }
        } catch (e) {
            if (loadingMsg) {
                await bot.editMessageText('Terjadi error: ' + e.message, { chat_id: chatId, message_id: loadingMsg.message_id });
            } else {
                await bot.sendMessage(chatId, 'Terjadi error: ' + e.message);
            }
        }
    });
};
