// kira-media.js
// جميع وظائف الميديا لبوت Kira
// متوافق مع Node ≥20 وRailway
require("dotenv").config(); // لضبط مفاتيح البيئة

const fs = require("fs");
const path = require("path");
const axios = require("axios");
const imageDownloader = require("image-downloader");
const Jimp = require("jimp");
const sharp = require("sharp");
const Canvas = require("@napi-rs/canvas");
const { createGIF } = require("gifencoder");
const ImgbbUploader = require("imgbb-uploader");
const imgur = require("imgur");
const ytdl = require("ytdl-core");
const ytSearch = require("yt-search");

// =================== تنزيل ===================
async function downloadImage(url, destFolder = "./downloads") {
  if (!fs.existsSync(destFolder)) fs.mkdirSync(destFolder, { recursive: true });
  const filename = path.join(destFolder, path.basename(url));
  await imageDownloader.image({ url, dest: filename });
  return filename;
}

async function downloadYouTubeVideo(url, destFolder = "./downloads") {
  if (!fs.existsSync(destFolder)) fs.mkdirSync(destFolder, { recursive: true });
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

// =================== رفع ===================
async function uploadToImgBB(filePath) {
  return ImgbbUploader({
    apiKey: process.env.IMGBB_API_KEY,
    imagePath: filePath,
  });
}

async function uploadToImgur(filePath) {
  imgur.setClientId(process.env.IMGUR_CLIENT_ID);
  return imgur.uploadFile(filePath);
}

// =================== تعديل الصور ===================
async function resizeImage(filePath, width = 500, height = 500, outputFolder = "./edited") {
  if (!fs.existsSync(outputFolder)) fs.mkdirSync(outputFolder, { recursive: true });
  const output = path.join(outputFolder, path.basename(filePath));
  await sharp(filePath).resize(width, height).toFile(output);
  return output;
}

async function addTextToImage(filePath, text, outputFolder = "./edited") {
  if (!fs.existsSync(outputFolder)) fs.mkdirSync(outputFolder, { recursive: true });
  const image = await Jimp.read(filePath);
  const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
  image.print(font, 10, 10, text);
  const output = path.join(outputFolder, path.basename(filePath));
  await image.writeAsync(output);
  return output;
}

// =================== تأثيرات Canvas ===================
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

// =================== بحث يوتيوب ===================
async function searchYouTube(query) {
  const results = await ytSearch(query);
  return results.videos[0]; // أول نتيجة
}

// =================== تصدير الدوال ===================
module.exports = {
  downloadImage,
  downloadYouTubeVideo,
  uploadToImgBB,
  uploadToImgur,
  resizeImage,
  addTextToImage,
  drawCanvas,
  searchYouTube,
};
