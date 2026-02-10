// kira-media-lite.js
// جميع وظائف الميديا لبوت Kira
// متوافق مع Node ≥20 وRailway
require("dotenv").config(); // لضبط مفاتيح البيئة

const fs = require("fs");
const path = require("path");
const axios = require("axios");
const Jimp = require("jimp");
const sharp = require("sharp");
const Canvas = require("@napi-rs/canvas");
const ytdl = require("ytdl-core");
const ytSearch = require("yt-search");
const imgur = require("imgur");

// =================== UTIL ===================
function ensureDir(folder) {
  if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
  return folder;
}

// =================== تنزيل الصور ===================
async function downloadImage(url, destFolder = "./downloads") {
  ensureDir(destFolder);
  const filename = path.join(destFolder, path.basename(url));
  const writer = fs.createWriteStream(filename);
  const response = await axios({ url, method: "GET", responseType: "stream" });
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on("finish", () => resolve(filename));
    writer.on("error", reject);
  });
}

// =================== تنزيل فيديو يوتيوب ===================
async function downloadYouTubeVideo(url, destFolder = "./downloads") {
  ensureDir(destFolder);
  const info = await ytdl.getInfo(url);
  const title = info.videoDetails.title.replace(/[^\w\s]/gi, "");
  const output = path.join(destFolder, `${title}.mp4`);
  return new Promise((resolve, reject) => {
    ytdl(url, { quality: "highest" })
      .pipe(fs.createWriteStream(output))
      .on("finish", () => resolve(output))
      .on("error", reject);
  });
}

// =================== تعديل الصور ===================
async function resizeImage(filePath, width = 500, height = 500, outputFolder = "./edited") {
  ensureDir(outputFolder);
  const output = path.join(outputFolder, path.basename(filePath));
  await sharp(filePath).resize(width, height).toFile(output);
  return output;
}

async function addTextToImage(filePath, text, outputFolder = "./edited") {
  ensureDir(outputFolder);
  const image = await Jimp.read(filePath);
  const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
  image.print(font, 10, 10, text);
  const output = path.join(outputFolder, path.basename(filePath));
  await image.writeAsync(output);
  return output;
}

// =================== Canvas ===================
async function drawCanvas(width = 800, height = 600, text = "Kira Bot") {
  const canvas = Canvas.createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // خلفية
  ctx.fillStyle = "#2c3e50";
  ctx.fillRect(0, 0, width, height);

  // نص
  ctx.fillStyle = "#f1c40f";
  ctx.font = "bold 50px Sans";
  ctx.fillText(text, 50, 100);

  return canvas.toBuffer("image/png");
}

// =================== بحث فيديو يوتيوب ===================
async function searchYouTube(query) {
  const results = await ytSearch(query);
  return results.videos[0]; // أول نتيجة
}

// =================== رفع الصور ===================
async function uploadToImgur(filePath) {
  imgur.setClientId(process.env.IMGUR_CLIENT_ID || "");
  return imgur.uploadFile(filePath);
}

// =================== تصدير الدوال ===================
module.exports = {
  downloadImage,
  downloadYouTubeVideo,
  resizeImage,
  addTextToImage,
  drawCanvas,
  searchYouTube,
  uploadToImgur,
};
