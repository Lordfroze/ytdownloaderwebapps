const express = require("express");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(express.static("public"));

// ==============================
// PATH SETUP
// ==============================
const BASE_DOWNLOAD_PATH = path.join(__dirname, "downloads");
const AUDIO_PATH = path.join(BASE_DOWNLOAD_PATH, "audio");
const VIDEO_PATH = path.join(BASE_DOWNLOAD_PATH, "video");

// helper bikin folder recursive
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// pastikan semua folder ada
ensureDir(AUDIO_PATH);
ensureDir(VIDEO_PATH);

// ==============================
// ROUTE TEST
// ==============================
app.get("/", (req, res) => {
  res.send("Server YT Downloader hidup bang 🔥");
});

// ==============================
// ROUTE DOWNLOAD
// ==============================
app.post("/download", (req, res) => {
  const { url, type = "video", quality } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL wajib diisi" });
  }

  // validasi sederhana
  if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
    return res.status(400).json({ error: "URL bukan YouTube bang" });
  }

  let downloadPath;
  let args = [];

  if (type === "audio") {
    downloadPath = AUDIO_PATH;
    args = [
      url,
      "-P", downloadPath,
      "-x",
      "--audio-format", "mp3"
    ];
  } else {
    downloadPath = VIDEO_PATH;
    args = [
      url,
      "-P", downloadPath
    ];

    if (quality) {
      args.push(
        "-f",
        `bestvideo[height<=${quality}]+bestaudio/best`
      );
    }
  }

  // format nama file
  args.push("-o", "%(title)s.%(ext)s");

  console.log("Running yt-dlp with args:", args);

  const ytdlp = spawn("./yt-dlp_linux", args);

  ytdlp.stdout.on("data", (data) => {
    console.log(`STDOUT: ${data}`);
  });

  ytdlp.stderr.on("data", (data) => {
    console.log(`STDERR: ${data}`);
  });

  ytdlp.on("close", (code) => {
    console.log("Process exit code:", code);

    if (code === 0) {
      res.json({
        message: "Download selesai bang 🔥",
        type,
        quality: quality || "best"
      });
    } else {
      res.status(500).json({
        error: "Download gagal",
        exitCode: code
      });
    }
  });
});

// ==============================
// START SERVER
// ==============================
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});
