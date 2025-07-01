require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const debug = require('debug');
const urlShortener = require('./features/urlShortener');

const qrCode = require('./features/qrCode');

// Tambahkan require fitur internet & sosial media
const whoisIp = require('./features/internet/whoisIp');
const fakeIdentity = require('./features/internet/fakeIdentity');

// Tambahkan require fitur securityTools
const passwordGenerator = require('./features/securityTools/passwordGenerator');
const emailValidator = require('./features/securityTools/emailValidator');
const linkScanner = require('./features/securityTools/linkScanner');

// Pastikan hanya require tambahan:

const tambahan = require('./features/tambahan');
const menuManager = require('./menuManager');

// Hapus loader downloader.js jika masih ada (fitur sudah dihapus)
try {
  require.resolve('./features/internet/downloader');
  // Jika file masih ada, abaikan, tapi jangan require
} catch (e) {}

const log = debug('bot');

const token = process.env.TELEGRAM_BOT_TOKEN;

const bot = new TelegramBot(token, { polling: true });

const userState = {};

// Initialize features
urlShortener(bot, userState);

qrCode(bot, userState);

// Inisialisasi fitur internet & sosial media
// (Agar handler callback_query/message aktif)
whoisIp(bot, userState);
fakeIdentity(bot, userState);

// Inisialisasi fitur securityTools
passwordGenerator(bot, userState);
emailValidator(bot, userState);
linkScanner(bot, userState);

// Inisialisasi fitur tambahan
// (Panggil setelah bot didefinisikan)
tambahan(bot);

bot.onText(/\/start|\/home/, (msg) => {
    const chatId = msg.chat.id;
    const welcomeMessage = "Selamat datang di All-in-One Bot! Silakan pilih kategori tools yang ingin Anda gunakan:";
    bot.sendMessage(chatId, welcomeMessage, menuManager.mainMenu);
});

const downloadMenu = [
    [{ text: '🌍 Whois & IP Lookup', callback_data: 'whois_ip' }],
    [{ text: '🧑‍💻 Fake Identity Generator', callback_data: 'fake_identity' }],
    [{ text: '🏠 Kembali ke Home', callback_data: 'main_menu' }]
];

bot.on('callback_query', (callbackQuery) => {
    const msg = callbackQuery.message;
    const chatId = msg.chat.id;
    const data = callbackQuery.data;
    log(`Received callback_query with data: ${data} from chat ID: ${chatId}`);

    if (data === 'general_tools') {
        const message = "Pilih alat yang ingin Anda gunakan:";
        const options = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🔗 URL Shortener (TinyURL)', callback_data: 'url_shortener_tinyurl' }],
                    [{ text: '📷 QR Code Tool', callback_data: 'qr_code_tool' }],
                    [{ text: '🏠 Kembali ke Home', callback_data: 'main_menu' }]
                ]
            }
        };
        bot.editMessageText(message, { chat_id: chatId, message_id: msg.message_id, reply_markup: options.reply_markup });
    } else if (data === 'qr_code_tool') {
        const message = "Pilih aksi QR Code:";
        const options = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '📷 Buat QR Code', callback_data: 'generate_qr_code' }],
                    [{ text: '🔍 Baca QR Code', callback_data: 'read_qr_code' }],
                    [{ text: '🏠 Kembali ke Home', callback_data: 'main_menu' }]
                ]
            }
        };
        bot.editMessageText(message, { chat_id: chatId, message_id: msg.message_id, reply_markup: options.reply_markup });
    } else if (data === 'internet_tools') {
        bot.editMessageText('Pilih fitur internet & sosial media:', {
            chat_id: chatId,
            message_id: msg.message_id,
            reply_markup: { inline_keyboard: downloadMenu }
        });
        return;
    } else if (data === 'security_tools') {
        bot.editMessageText('Pilih tools keamanan:', {
            chat_id: chatId,
            message_id: msg.message_id,
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🔑 Password Generator', callback_data: 'password_generator' }],
                    [{ text: '📧 Email Validator', callback_data: 'email_validator' }],
                    [{ text: '🔗 Link Scanner', callback_data: 'link_scanner' }],
                    [{ text: '🏠 Kembali ke Home', callback_data: 'main_menu' }]
                ]
            }
        });
        return;
    } else if (data === 'tambahan_tools') {
        bot.editMessageText('Pilih tools tambahan yang ingin Anda gunakan:', {
            chat_id: chatId,
            message_id: msg.message_id,
            reply_markup: menuManager.tambahanMenu.reply_markup
        });
        return;
    }
    // Handler untuk masing-masing tools tambahan
    if (data === 'tambahan_sticker') {
        bot.sendMessage(chatId, 'Kirim foto dengan caption "sticker" untuk membuat stiker.', menuManager.backToHome);
        return;
    }
    if (data === 'tambahan_anime') {
        bot.sendMessage(chatId, 'Kirim foto dengan caption "anime" untuk mencari info anime.', menuManager.backToHome);
        return;
    }
    if (data === 'tambahan_lirik') {
        bot.sendMessage(chatId, 'Ketik: /lirik <judul lagu>\nContoh:\n/lirik Melukis Senja\n/lirik Demons', menuManager.backToHome);
        return;
    }
    if (data === 'tambahan_cuaca') {
        bot.sendMessage(chatId, 'Ketik: cuaca [lokasi] untuk info cuaca.', menuManager.backToHome);
        return;
    }
    if (data === 'tambahan_sholat') {
        bot.sendMessage(chatId, 'Ketik: sholat [kota] untuk jadwal sholat hari ini.', menuManager.backToHome);
        return;
    } else if (data === 'main_menu') {
        const welcomeMessage = "Selamat datang di All-in-One Bot! Silakan pilih kategori tools yang ingin Anda gunakan:";
        bot.editMessageText(welcomeMessage, { chat_id: chatId, message_id: msg.message_id, reply_markup: menuManager.mainMenu.reply_markup });
    }
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    // Clear user state if the message is not a URL and a state exists
    if (userState[chatId] && !(msg.text && (msg.text.startsWith('http://') || msg.text.startsWith('https://')))) {
        delete userState[chatId];
        log(`User state for chat ID: ${chatId} has been cleared due to non-URL message.`);
    }
});

// Menambahkan log detail untuk event polling_error
bot.on('polling_error', (err) => {
    console.error('Polling error:', err);
});

console.log('Bot sedang berjalan...');
