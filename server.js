const express = require("express");
const { spawn } = require("child_process");
const path = require("path");

const app = express();

app.use(express.static("public"));

function runYtDlp(args) {
  return new Promise((resolve, reject) => {

    const proc = spawn("yt-dlp", args);

    let data = "";
    let err = "";

    proc.stdout.on("data", (chunk) => {
      data += chunk.toString();
    });

    proc.stderr.on("data", (chunk) => {
      err += chunk.toString();
    });

    proc.on("close", (code) => {

      if (code !== 0) {
        reject(err);
      } else {
        resolve(data.trim());
      }

    });

  });
}

const cookiePath = path.join(__dirname, "cookies.txt");

const baseArgs = [
  "--cookies", cookiePath,
  "--no-playlist",
  "--geo-bypass",
  "--no-warnings",
  "--extractor-args",
  "youtube:player_client=android,web_safari"
];

app.get("/api/mp4", async (req, res) => {

  try {

    const url = req.query.url;

    const link = await runYtDlp([
      ...baseArgs,
      "-f",
      "best[ext=mp4]/best",
      "-g",
      url
    ]);

    res.json({
      status: true,
      url: link
    });

  } catch (e) {

    res.json({
      status: false,
      error: String(e)
    });

  }

});

app.get("/api/mp3", async (req, res) => {

  try {

    const url = req.query.url;

    const link = await runYtDlp([
      ...baseArgs,
      "-f",
      "bestaudio",
      "-g",
      url
    ]);

    res.json({
      status: true,
      url: link
    });

  } catch (e) {

    res.json({
      status: false,
      error: String(e)
    });

  }

});

app.get("/api/info", async (req, res) => {

  try {

    const url = req.query.url;

    const info = await runYtDlp([
      ...baseArgs,
      "-j",
      url
    ]);

    res.json(JSON.parse(info));

  } catch (e) {

    res.json({
      status: false,
      error: String(e)
    });

  }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log("Server running on port " + PORT);

});
