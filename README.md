# 🎬 YT Downloader (Local Backend Project)

YouTube Downloader berbasis Node.js + yt-dlp.  
Project ini dibuat untuk latihan backend dan komunikasi dengan system process (child_process).

⚠️ Project ini hanya untuk penggunaan pribadi dan pembelajaran.

---

## 🚀 Fitur

- Download Video (best / custom quality)
- Download Audio (MP3)
- Folder terpisah: `audio/` dan `video/`
- UI Web sederhana
- Validasi URL
- Struktur project clean

---

## 🛠 Tech Stack

- Node.js
- Express.js
- yt-dlp (binary)
- ffmpeg

---
## 📦 Struktur Project

yt-downloader/
├── server.js
├── yt-dlp_linux
├── package.json
├── public/
│ └── index.html
├── downloads/
│ ├── audio/
│ └── video/
└── .gitignore

## ⚙️ Cara Setup

1️⃣ Clone Repository
git clone <repository-url>
cd yt-downloader
2️⃣ Install Dependencies
npm install
3️⃣ Install ffmpeg (Wajib untuk audio)
Ubuntu / Debian
sudo apt install ffmpeg

Cek apakah sudah terpasang:

ffmpeg -version

4️⃣ Beri Permission yt-dlp (Linux)
chmod +x yt-dlp_linux

5️⃣ Jalankan Server
node server.js


Server akan berjalan di:

http://localhost:3000

🌐 Cara Pakai

Buka browser

Akses http://localhost:3000

Masukkan URL YouTube

Pilih tipe (Video / Audio)

Klik Download

File hasil download akan tersimpan di:

downloads/audio
downloads/video

🧠 API Endpoint
POST /download

Body JSON:

{
  "url": "https://youtube.com/xxxx",
  "type": "video",
  "quality": 720
}

📌 Catatan

Project ini tidak menggunakan database.

Folder downloads hanya menyimpan hasil lokal.

Jangan gunakan untuk pelanggaran hak cipta.

Gunakan hanya untuk konten yang memiliki izin atau hak akses.
