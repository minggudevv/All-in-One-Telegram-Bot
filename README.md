# All-in-One Telegram Bot

All-in-One Telegram Bot adalah bot Telegram open source yang menyediakan berbagai fitur utilitas, keamanan, dan hiburan dalam satu bot. Cocok untuk kebutuhan sehari-hari, edukasi, dan komunitas!

## ✨ Fitur Utama

- **🛠️ Tools Utama**
  - URL Shortener (TinyURL)
  - QR Code Generator & Reader
- **🌐 Tools Internet & Sosial Media**
  - Whois & IP Lookup
  - Fake Identity Generator
- **🔒 Tools Keamanan**
  - Password Generator (dengan checklist karakter)
  - Email Validator (cek email disposable)
  - Link Scanner (cek link phising/malware)
- **🧩 Tools Tambahan**
  - 🖼️ Sticker Maker (ubah foto jadi stiker Telegram)
  - 🔎 Anime Finder (cari anime dari screenshot via trace.moe)
  - 🎵 Lirik Lagu (cari lirik dari judul)
  - 🌦️ Cuaca (info cuaca dari lokasi)
  - 🕌 Jadwal Sholat (berdasarkan kota)

## 🚀 Cara Pakai

1. **Clone repo ini**
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Buat file `.env`** dan isi dengan token bot Telegram Anda:
   ```env
   TELEGRAM_BOT_TOKEN=isi_token_anda
   ```
4. **Jalankan bot**
   ```bash
   npm start
   ```
5. **Invite bot ke grup/DM, lalu gunakan menu dan perintah yang tersedia!**

## 📦 Struktur Folder

- `index.js` — Entry point bot
- `features/` — Semua fitur utama bot
  - `tambahan/` — Tools tambahan (sticker, anime, lirik, cuaca, sholat)
  - `securityTools/` — Tools keamanan
  - `internet/` — Fitur internet & sosial media
- `menuManager.js` — Pengelola menu utama & tombol

## 🤝 Kontribusi

Pull request, issue, dan saran sangat diterima! Silakan fork, modifikasi, dan submit PR ke repo ini.

## ⚖️ Lisensi

MIT License — silakan gunakan, modifikasi, dan distribusikan dengan bebas.

---

## 📝 Pembaruan Terbaru

- Menu utama dan semua tombol back/home kini konsisten: "🏠 Kembali ke Home" dan selalu menampilkan semua kategori.
- Menu tambahan (tools tambahan) kini tampil dengan editMessageText, tidak membuat pesan baru.
- Semua reply tombol home/back di seluruh fitur sudah seragam dan terintegrasi.
- Fitur lirik lagu kini lebih praktis: cukup ketik /lirik <judul>, pilih lagu dari 5 opsi, klik untuk lirik.
- Fitur jadwal sholat, lirik, anime, dan lain-lain sudah memakai fallback multi-API dan error handling yang ramah.
- Struktur kode, dependensi, dan dokumentasi sudah dirapikan untuk open source.

> Lihat changelog di atas untuk fitur dan UX terbaru!

> Dibuat dengan ❤️ oleh minggu dev.
