const express = require("express");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const PORT = 3000;

// ==============================
// PATH SETUP
// ==============================
const BASE_DOWNLOAD_PATH = path.join(__dirname, "downloads");
const AUDIO_PATH = path.join(BASE_DOWNLOAD_PATH, "audio");
const VIDEO_PATH = path.join(BASE_DOWNLOAD_PATH, "video");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

ensureDir(AUDIO_PATH);
ensureDir(VIDEO_PATH);

// ==============================
// ACTIVE DOWNLOAD MEMORY
// ==============================
const activeDownloads = {};

// ==============================
// ROUTE HOME
// ==============================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ==============================
// START DOWNLOAD
// ==============================
app.post("/download", (req, res) => {
  const { url, type = "video", quality } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL wajib diisi" });
  }

  const downloadId = Date.now().toString();

  let downloadPath;
  let args = ["--newline", "--progress", url];

  if (type === "audio") {
  downloadPath = AUDIO_PATH;

  args.push(
    "-P", downloadPath,
    "-x",
    "--audio-format", "mp3"
  );

} else {
  downloadPath = VIDEO_PATH;

  args.push("-P", downloadPath);

  if (quality) {
    args.push(
      "-f",
      `bestvideo[ext=mp4][height<=${quality}]+bestaudio[ext=m4a]/best[ext=mp4][height<=${quality}]`
    );
  } else {
    args.push(
      "-f",
      "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]"
    );
  }

  // paksa hasil akhir tetap mp4
  args.push("--merge-output-format", "mp4");
}

// nama file output
args.push("-o", "%(title)s.%(ext)s");

  const ytdlp = spawn("./yt-dlp_linux", args);

  activeDownloads[downloadId] = {
    progress: 0,
    done: false,
    filePath: null,
    error: false
  };

  ytdlp.stdout.on("data", (data) => {
    const output = data.toString();
    const match = output.match(/(\d+\.\d+)%/);

    if (match) {
      activeDownloads[downloadId].progress = parseFloat(match[1]);
    }
  });

  ytdlp.on("close", (code) => {
    if (code === 0) {
      const files = fs.readdirSync(downloadPath);

      const sortedFiles = files
        .map(file => ({
          name: file,
          time: fs.statSync(path.join(downloadPath, file)).mtime.getTime()
        }))
        .sort((a, b) => b.time - a.time);

      const latestFile = sortedFiles[0].name;
      const filePath = path.join(downloadPath, latestFile);

      activeDownloads[downloadId].filePath = filePath;
      activeDownloads[downloadId].done = true;
    } else {
      activeDownloads[downloadId].error = true;
    }
  });

  res.json({ downloadId });
});

// ==============================
// PROGRESS STREAM (SSE)
// ==============================
app.get("/progress/:id", (req, res) => {
  const { id } = req.params;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const interval = setInterval(() => {
    const data = activeDownloads[id];

    if (!data) return;

    res.write(`data: ${JSON.stringify(data)}\n\n`);

    if (data.done || data.error) {
      clearInterval(interval);
      res.end();
    }

  }, 500);
});

// ==============================
// FINAL FILE DOWNLOAD + AUTO DELETE
// ==============================
app.get("/file/:id", (req, res) => {
  const { id } = req.params;
  const data = activeDownloads[id];

  if (!data || !data.filePath) {
    return res.status(404).send("File belum siap");
  }

  res.download(data.filePath, () => {
    fs.unlinkSync(data.filePath); // hapus file
    delete activeDownloads[id];   // hapus dari memory
  });
});

// ==============================
app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});
