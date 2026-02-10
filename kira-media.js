// kira-media.js
// جميع وظائف الميديا لبوت Kira
// متوافق مع Node ≥20 وRailway
const fs = require("fs");
const path = require("path");
const Jimp = require("jimp");
const sharp = require("sharp");
const Canvas = require("@napi-rs/canvas");
const ytdl = require("ytdl-core");
const ytSearch = require("yt-search");
const imageDownloader = require("image-downloader");

// =================== تنزيل الصور ===================
async function downloadImage(url, destFolder = "./downloads") {
  if (!fs.existsSync(destFolder)) fs.mkdirSync(destFolder, { recursive: true });
  const filename = path.join(destFolder, path.basename(url));
  await imageDownloader.image({ url, dest: filename });
  return filename;
}

// =================== تنزيل فيديو يوتيوب ===================
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

// =================== رسم Canvas ===================
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
  return results.videos[0]; // أول نتيجة فقط
}

// =================== تصدير الدوال ===================
module.exports = {
  downloadImage,
  downloadYouTubeVideo,
  resizeImage,
  addTextToImage,
  drawCanvas,
  searchYouTube,
};
