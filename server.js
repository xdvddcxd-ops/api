const express = require("express");
const { spawn } = require("child_process");
const path = require("path");

const app = express();

function runYtDlp(args) {
  return new Promise((resolve, reject) => {

    const proc = spawn("yt-dlp", args);

    let data = "";
    let error = "";

    proc.stdout.on("data", (chunk) => {
      data += chunk.toString();
    });

    proc.stderr.on("data", (chunk) => {
      error += chunk.toString();
    });

    proc.on("close", (code) => {
      if (code !== 0) {
        reject(error);
      } else {
        resolve(data.trim());
      }
    });

  });
}

const cookiePath = path.join(__dirname, "cookies.txt");

const baseArgs = [
  "--cookies",
  cookiePath,
  "--no-playlist",
  "--no-warnings"
];

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.json({
    status: true,
    message: "YouTube API running"
  });
});


// MP4
app.get("/api/mp4", async (req, res) => {

  try {

    const url = req.query.url;

    if (!url) {
      return res.json({
        status: false,
        error: "Missing url"
      });
    }

    const link = await runYtDlp([
      ...baseArgs,
      "-f",
      "bestvideo+bestaudio/best",
      "-g",
      url
    ]);

    res.json({
      status: true,
      result: link.split("\n")
    });

  } catch (err) {

    res.json({
      status: false,
      error: String(err)
    });

  }

});


// MP3
app.get("/api/mp3", async (req, res) => {

  try {

    const url = req.query.url;

    if (!url) {
      return res.json({
        status: false,
        error: "Missing url"
      });
    }

    const link = await runYtDlp([
      ...baseArgs,
      "-f",
      "bestaudio",
      "-g",
      url
    ]);

    res.json({
      status: true,
      result: link
    });

  } catch (err) {

    res.json({
      status: false,
      error: String(err)
    });

  }

});


// INFO
app.get("/api/info", async (req, res) => {

  try {

    const url = req.query.url;

    if (!url) {
      return res.json({
        status: false,
        error: "Missing url"
      });
    }

    const info = await runYtDlp([
      ...baseArgs,
      "-j",
      url
    ]);

    res.json({
      status: true,
      result: JSON.parse(info)
    });

  } catch (err) {

    res.json({
      status: false,
      error: String(err)
    });

  }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
