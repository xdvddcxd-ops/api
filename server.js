const express = require("express");
const { spawn } = require("child_process");

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

const baseArgs = [
  "--no-playlist",
  "--no-warnings",
  "--extractor-args",
  "youtube:player_client=android"
];

app.get("/", (req, res) => {
  res.json({
    status: true,
    message: "YouTube API running"
  });
});

app.get("/ytmp4", async (req, res) => {
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
      "b",
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

app.get("/ytmp3", async (req, res) => {
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
      "ba",
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

app.get("/ytinfo", async (req, res) => {
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
