const axios = require('axios');
const { createCanvas } = require('canvas');
require('dotenv').config();
const CURRENCY_API = 'https://api.frankfurter.app/latest';

function formatNumber(num) {
    return num.toLocaleString('id-ID');
}

// Fungsi sederhana untuk mendapatkan nama warna dari RGB/HSL (basic)
function getColorName(rgbOrHsl) {
    // Daftar warna dasar (bisa ditambah sesuai kebutuhan)
    const basicColors = [
        { name: 'Merah', rgb: [255,0,0] },
        { name: 'Biru', rgb: [0,0,255] },
        { name: 'Hijau', rgb: [0,128,0] },
        { name: 'Kuning', rgb: [255,255,0] },
        { name: 'Cyan', rgb: [0,255,255] },
        { name: 'Magenta', rgb: [255,0,255] },
        { name: 'Hitam', rgb: [0,0,0] },
        { name: 'Putih', rgb: [255,255,255] },
        { name: 'Abu-abu', rgb: [128,128,128] },
        { name: 'Oranye', rgb: [255,165,0] },
        { name: 'Ungu', rgb: [128,0,128] },
        { name: 'Pink', rgb: [255,192,203] },
        { name: 'Coklat', rgb: [165,42,42] }
    ];
    // Jika input rgb(r,g,b)
    let r, g, b;
    if (rgbOrHsl.startsWith('rgb')) {
        [r,g,b] = rgbOrHsl.match(/\d+/g).map(Number);
    } else if (rgbOrHsl.startsWith('hsl')) {
        // Konversi HSL ke RGB
        let [h,s,l] = rgbOrHsl.match(/\d+/g).map(Number);
        s /= 100; l /= 100;
        let c = (1 - Math.abs(2*l-1)) * s;
        let x = c * (1 - Math.abs((h/60)%2-1));
        let m = l - c/2;
        let r1=0,g1=0,b1=0;
        if (h<60) [r1,g1,b1]=[c,x,0];
        else if (h<120) [r1,g1,b1]=[x,c,0];
        else if (h<180) [r1,g1,b1]=[0,c,x];
        else if (h<240) [r1,g1,b1]=[0,x,c];
        else if (h<300) [r1,g1,b1]=[x,0,c];
        else [r1,g1,b1]=[c,0,x];
        r = Math.round((r1+m)*255);
        g = Math.round((g1+m)*255);
        b = Math.round((b1+m)*255);
    } else {
        return '-';
    }
    // Cari warna terdekat
    let minDist = 9999, closest = '-';
    for (const c of basicColors) {
        let dist = Math.sqrt((r-c.rgb[0])**2 + (g-c.rgb[1])**2 + (b-c.rgb[2])**2);
        if (dist < minDist) { minDist = dist; closest = c.name; }
    }
    return closest;
}

// Ambil nama warna dari The Color API (async)
async function fetchColorNameFromAPI(color) {
    let rgb;
    if (color.startsWith('rgb')) {
        rgb = color.match(/\d+/g).map(Number);
    } else if (color.startsWith('hsl')) {
        // Konversi HSL ke RGB
        let [h,s,l] = color.match(/\d+/g).map(Number);
        s /= 100; l /= 100;
        let c = (1 - Math.abs(2*l-1)) * s;
        let x = c * (1 - Math.abs((h/60)%2-1));
        let m = l - c/2;
        let r1=0,g1=0,b1=0;
        if (h<60) [r1,g1,b1]=[c,x,0];
        else if (h<120) [r1,g1,b1]=[x,c,0];
        else if (h<180) [r1,g1,b1]=[0,c,x];
        else if (h<240) [r1,g1,b1]=[0,x,c];
        else if (h<300) [r1,g1,b1]=[x,0,c];
        else [r1,g1,b1]=[c,0,x];
        rgb = [Math.round((r1+m)*255), Math.round((g1+m)*255), Math.round((b1+m)*255)];
    } else {
        return '-';
    }
    try {
        const res = await axios.get(`https://www.thecolorapi.com/id?rgb=rgb(${rgb[0]},${rgb[1]},${rgb[2]})`);
        return res.data.name.value || '-';
    } catch {
        return '-';
    }
}

module.exports = (bot, userState) => {
    const UNIT_CONVERT_STATE = 'awaiting_unit_convert';
    const CURRENCY_CONVERT_STATE = 'awaiting_currency_convert';

    bot.on('callback_query', async (callbackQuery) => {
        const msg = callbackQuery.message;
        const chatId = msg.chat.id;
        const data = callbackQuery.data;

        if (data === 'unit_converter') {
            userState[chatId] = { state: UNIT_CONVERT_STATE };
            bot.sendMessage(chatId, 'Pilih jenis konversi:', {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🌡️ Suhu', callback_data: 'convert_temp' }],
                        [{ text: '📏 Panjang', callback_data: 'convert_length' }],
                        [{ text: '⚖️ Berat', callback_data: 'convert_weight' }],
                        [{ text: '💱 Mata Uang', callback_data: 'convert_currency' }],
                        [{ text: '🏠 Kembali ke Home', callback_data: 'main_menu' }]
                    ]
                }
            });
        } else if (data === 'convert_currency') {
            userState[chatId] = { state: CURRENCY_CONVERT_STATE };
            bot.sendMessage(chatId, 'Masukkan jumlah dan kode mata uang asal serta tujuan (Contoh: 20000 USD IDR):', {
                reply_markup: {
                    force_reply: true,
                    input_field_placeholder: '20000 USD IDR'
                }
            });
        } else if (data === 'convert_temp') {
            bot.sendMessage(chatId, 'Masukkan angka dan satuan asal serta tujuan (Contoh: 100 C F):', {
                reply_markup: {
                    force_reply: true,
                    input_field_placeholder: '100 C F'
                }
            });
        } else if (data === 'convert_length') {
            bot.sendMessage(chatId, 'Masukkan angka dan satuan asal serta tujuan (Contoh: 10 m cm):', {
                reply_markup: {
                    force_reply: true,
                    input_field_placeholder: '10 m cm'
                }
            });
        } else if (data === 'convert_weight') {
            bot.sendMessage(chatId, 'Masukkan angka dan satuan asal serta tujuan (Contoh: 5 kg g):', {
                reply_markup: {
                    force_reply: true,
                    input_field_placeholder: '5 kg g'
                }
            });
        }
    });

    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const text = msg.text;
        if (!text) return;
        // Hanya proses jika memang sedang dalam state unit converter
        if (
            (msg.reply_to_message && (
                msg.reply_to_message.text.includes('konversi mata uang') ||
                msg.reply_to_message.text.includes('konversi suhu') ||
                msg.reply_to_message.text.includes('konversi panjang') ||
                msg.reply_to_message.text.includes('konversi berat')
            )) ||
            userState[chatId]?.state === 'awaiting_unit_convert' ||
            userState[chatId]?.state === 'awaiting_currency_convert'
        ) {
            // Cek jika ini reply dari force_reply
            if (msg.reply_to_message && msg.reply_to_message.text && (
                msg.reply_to_message.text.includes('konversi mata uang') ||
                msg.reply_to_message.text.includes('konversi suhu') ||
                msg.reply_to_message.text.includes('konversi panjang') ||
                msg.reply_to_message.text.includes('konversi berat')
            )) {
                // Tentukan state dari reply
                let state = null;
                if (msg.reply_to_message.text.includes('mata uang')) state = 'CURRENCY_CONVERT_STATE';
                else if (msg.reply_to_message.text.includes('suhu')) state = 'UNIT_CONVERT_STATE_TEMP';
                else if (msg.reply_to_message.text.includes('panjang')) state = 'UNIT_CONVERT_STATE_LENGTH';
                else if (msg.reply_to_message.text.includes('berat')) state = 'UNIT_CONVERT_STATE_WEIGHT';

                if (state === 'CURRENCY_CONVERT_STATE') {
                    const match = text.match(/(\d+(?:\.\d+)?)\s+(\w{3})\s+(\w{3})/i);
                    if (!match) {
                        bot.sendMessage(chatId, 'Format salah. Contoh: 100 USD IDR');
                        return;
                    }
                    const [, amount, from, to] = match;
                    try {
                        const res = await axios.get(`${CURRENCY_API}?amount=${amount}&from=${from.toUpperCase()}&to=${to.toUpperCase()}`);
                        if (res.data && res.data.rates && res.data.rates[to.toUpperCase()]) {
                            bot.sendMessage(chatId, `${formatNumber(amount)} ${from.toUpperCase()} = ${formatNumber(res.data.rates[to.toUpperCase()])} ${to.toUpperCase()}`);
                        } else {
                            bot.sendMessage(chatId, 'Gagal mendapatkan data kurs.');
                        }
                    } catch (e) {
                        bot.sendMessage(chatId, 'Gagal menghubungi API kurs.');
                    }
                } else if (state === 'UNIT_CONVERT_STATE_TEMP') {
                    const tempMatch = text.match(/(\d+(?:\.\d+)?)\s*(C|F|K)\s*(C|F|K)/i);
                    if (tempMatch) {
                        const [, value, from, to] = tempMatch;
                        let result;
                        if (from.toUpperCase() === to.toUpperCase()) result = value;
                        else if (from.toUpperCase() === 'C' && to.toUpperCase() === 'F') result = (value * 9/5) + 32;
                        else if (from.toUpperCase() === 'F' && to.toUpperCase() === 'C') result = (value - 32) * 5/9;
                        else if (from.toUpperCase() === 'C' && to.toUpperCase() === 'K') result = (parseFloat(value) + 273.15);
                        else if (from.toUpperCase() === 'K' && to.toUpperCase() === 'C') result = (value - 273.15);
                        else if (from.toUpperCase() === 'F' && to.toUpperCase() === 'K') result = ((value - 32) * 5/9) + 273.15;
                        else if (from.toUpperCase() === 'K' && to.toUpperCase() === 'F') result = ((value - 273.15) * 9/5) + 32;
                        bot.sendMessage(chatId, `${formatNumber(value)} ${from.toUpperCase()} = ${formatNumber(result)} ${to.toUpperCase()}`);
                    } else {
                        bot.sendMessage(chatId, 'Format salah. Contoh: 100 C F');
                    }
                } else if (state === 'UNIT_CONVERT_STATE_LENGTH') {
                    const lengthMatch = text.match(/(\d+(?:\.\d+)?)\s*(m|cm|mm|km|in|ft)\s*(m|cm|mm|km|in|ft)/i);
                    if (lengthMatch) {
                        const [, value, from, to] = lengthMatch;
                        const factors = { m: 1, cm: 0.01, mm: 0.001, km: 1000, in: 0.0254, ft: 0.3048 };
                        const result = (parseFloat(value) * factors[from] / factors[to]);
                        bot.sendMessage(chatId, `${formatNumber(value)} ${from} = ${formatNumber(result)} ${to}`);
                    } else {
                        bot.sendMessage(chatId, 'Format salah. Contoh: 10 m cm');
                    }
                } else if (state === 'UNIT_CONVERT_STATE_WEIGHT') {
                    const weightMatch = text.match(/(\d+(?:\.\d+)?)\s*(kg|g|mg|lb|oz)\s*(kg|g|mg|lb|oz)/i);
                    if (weightMatch) {
                        const [, value, from, to] = weightMatch;
                        const factors = { kg: 1, g: 0.001, mg: 0.000001, lb: 0.453592, oz: 0.0283495 };
                        const result = (parseFloat(value) * factors[from] / factors[to]);
                        bot.sendMessage(chatId, `${formatNumber(value)} ${from} = ${formatNumber(result)} ${to}`);
                    } else {
                        bot.sendMessage(chatId, 'Format salah. Contoh: 5 kg g');
                    }
                }
                return;
            } else if (userState[chatId]?.state === CURRENCY_CONVERT_STATE) {
                const match = text.match(/(\d+(?:\.\d+)?)\s+(\w{3})\s+(\w{3})/i);
                if (!match) {
                    bot.sendMessage(chatId, 'Format salah. Contoh: 100 USD IDR');
                    return;
                }
                const [, amount, from, to] = match;
                try {
                    const res = await axios.get(`${CURRENCY_API}?amount=${amount}&from=${from.toUpperCase()}&to=${to.toUpperCase()}`);
                    if (res.data && res.data.rates && res.data.rates[to.toUpperCase()]) {
                        bot.sendMessage(chatId, `${formatNumber(amount)} ${from.toUpperCase()} = ${formatNumber(res.data.rates[to.toUpperCase()])} ${to.toUpperCase()}`);
                    } else {
                        bot.sendMessage(chatId, 'Gagal mendapatkan data kurs.');
                    }
                } catch (e) {
                    bot.sendMessage(chatId, 'Gagal menghubungi API kurs.');
                } finally {
                    delete userState[chatId];
                }
            } else if (userState[chatId]?.state === UNIT_CONVERT_STATE) {
                // Suhu, panjang, berat
                const tempMatch = text.match(/(\d+(?:\.\d+)?)\s*(C|F|K)\s*(C|F|K)/i);
                const lengthMatch = text.match(/(\d+(?:\.\d+)?)\s*(m|cm|mm|km|in|ft)\s*(m|cm|mm|km|in|ft)/i);
                const weightMatch = text.match(/(\d+(?:\.\d+)?)\s*(kg|g|mg|lb|oz)\s*(kg|g|mg|lb|oz)/i);
                if (tempMatch) {
                    const [, value, from, to] = tempMatch;
                    let result;
                    if (from.toUpperCase() === to.toUpperCase()) result = value;
                    else if (from.toUpperCase() === 'C' && to.toUpperCase() === 'F') result = (value * 9/5) + 32;
                    else if (from.toUpperCase() === 'F' && to.toUpperCase() === 'C') result = (value - 32) * 5/9;
                    else if (from.toUpperCase() === 'C' && to.toUpperCase() === 'K') result = (parseFloat(value) + 273.15);
                    else if (from.toUpperCase() === 'K' && to.toUpperCase() === 'C') result = (value - 273.15);
                    else if (from.toUpperCase() === 'F' && to.toUpperCase() === 'K') result = ((value - 32) * 5/9) + 273.15;
                    else if (from.toUpperCase() === 'K' && to.toUpperCase() === 'F') result = ((value - 273.15) * 9/5) + 32;
                    bot.sendMessage(chatId, `${value} ${from.toUpperCase()} = ${result} ${to.toUpperCase()}`);
                    // Kirim gambar warna suhu
                    const canvas = createCanvas(200, 80);
                    const ctx = canvas.getContext('2d');
                    // Gradasi biru (dingin) ke merah (panas)
                    let tempVal = parseFloat(result);
                    let min = -50, max = 100; // range suhu
                    let percent = Math.max(0, Math.min(1, (tempVal - min) / (max - min)));
                    let r = Math.round(255 * percent);
                    let b = Math.round(255 * (1 - percent));
                    let color = `rgb(${r},0,${b})`;
                    let colorName = getColorName(color); // Ganti dari fetchColorNameFromAPI ke getColorName
                    ctx.fillStyle = color;
                    ctx.fillRect(0, 0, 200, 80);
                    ctx.font = '20px Arial';
                    ctx.fillStyle = '#fff';
                    ctx.fillText(`${Math.round(tempVal * 100) / 100} ${to.toUpperCase()}`, 10, 35);
                    ctx.font = '14px Arial';
                    ctx.fillText(color, 10, 65);
                    ctx.fillText(colorName, 120, 65);
                    const buf = canvas.toBuffer();
                    bot.sendPhoto(chatId, buf, { caption: `Preview warna suhu\nKode: ${color}\nNama: ${colorName}` });
                } else if (lengthMatch) {
                    const [, value, from, to] = lengthMatch;
                    const factors = { m: 1, cm: 0.01, mm: 0.001, km: 1000, in: 0.0254, ft: 0.3048 };
                    const result = (parseFloat(value) * factors[from] / factors[to]);
                    bot.sendMessage(chatId, `${value} ${from} = ${result} ${to}`);
                    // Kirim gambar warna panjang (warna random dari hasil)
                    const canvas = createCanvas(200, 80);
                    const ctx = canvas.getContext('2d');
                    // Warna berdasarkan hash hasil
                    let hash = Math.abs(Math.floor(result * 1000)) % 360;
                    let color = `hsl(${hash},70%,50%)`;
                    let colorName = getColorName(color); // Ganti dari fetchColorNameFromAPI ke getColorName
                    ctx.fillStyle = color;
                    ctx.fillRect(0, 0, 200, 80);
                    ctx.font = '20px Arial';
                    ctx.fillStyle = '#fff';
                    ctx.fillText(`${Math.round(result * 100) / 100} ${to}`, 10, 35);
                    ctx.font = '14px Arial';
                    ctx.fillText(color, 10, 65);
                    ctx.fillText(colorName, 120, 65);
                    const buf = canvas.toBuffer();
                    bot.sendPhoto(chatId, buf, { caption: `Preview warna panjang\nKode: ${color}\nNama: ${colorName}` });
                } else if (weightMatch) {
                    const [, value, from, to] = weightMatch;
                    const factors = { kg: 1, g: 0.001, mg: 0.000001, lb: 0.453592, oz: 0.0283495 };
                    const result = (parseFloat(value) * factors[from] / factors[to]);
                    bot.sendMessage(chatId, `${value} ${from} = ${result} ${to}`);
                    // Kirim gambar warna berat (warna random dari hasil)
                    const canvas = createCanvas(200, 80);
                    const ctx = canvas.getContext('2d');
                    let hash = Math.abs(Math.floor(result * 1000)) % 360;
                    let color = `hsl(${hash},80%,45%)`;
                    let colorName = getColorName(color); // Ganti dari fetchColorNameFromAPI ke getColorName
                    ctx.fillStyle = color;
                    ctx.fillRect(0, 0, 200, 80);
                    ctx.font = '20px Arial';
                    ctx.fillStyle = '#fff';
                    ctx.fillText(`${Math.round(result * 100) / 100} ${to}`, 10, 35);
                    ctx.font = '14px Arial';
                    ctx.fillText(color, 10, 65);
                    ctx.fillText(colorName, 120, 65);
                    const buf = canvas.toBuffer();
                    bot.sendPhoto(chatId, buf, { caption: `Preview warna berat\nKode: ${color}\nNama: ${colorName}` });
                } else {
                    bot.sendMessage(chatId, 'Format salah. Silakan cek contoh format.');
                }
                delete userState[chatId];
            }
        }
    });
};
