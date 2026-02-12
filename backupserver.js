const express = require("express");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(express.json());

const DOWNLOAD_PATH = path.join(__dirname, "downloads");

if (!fs.existsSync(DOWNLOAD_PATH)) {
  fs.mkdirSync(DOWNLOAD_PATH);
}

app.post("/download", (req, res) => {
  const { url, type, quality } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL wajib diisi" });
  }

  let args = [url, "-P", DOWNLOAD_PATH];

  // Kalau audio only
  if (type === "audio") {
    args.push("-x", "--audio-format", "mp3");
  }

  // Kalau video + pilih kualitas
  if (type === "video" && quality) {
    args.push("-f", `bestvideo[height<=${quality}]+bestaudio`);
  }

  const ytdlp = spawn("./yt-dlp_linux", args);

  ytdlp.stdout.on("data", (data) => {
    console.log(`STDOUT: ${data}`);
  });

  ytdlp.stderr.on("data", (data) => {
    console.log(`STDERR: ${data}`);
  });

  ytdlp.on("close", (code) => {
    if (code === 0) {
      res.json({ message: "Download selesai bang 🔥" });
    } else {
      res.status(500).json({ error: "Download gagal" });
    }
  });
});

app.listen(3000, () => {
  console.log("Server jalan di http://localhost:3000");
});
