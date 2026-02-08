// ═══════════════════════════════════════════════════════════
// 👑 KIRA - صوت
// المطور: Ayman ♛
// الوصف: تحويل الفيديو إلى مقطع صوتي بصيغة MP3
// ═══════════════════════════════════════════════════════════

const fs = require("fs-extra");
const ffmpeg = require("fluent-ffmpeg");
const axios = require("axios");
const path = require("path");

module.exports.config = {
  name: "صوت",
  aliases: [],
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Ayman ♛",
  description: "تحويل الفيديو إلى مقطع صوتي بصيغة MP3",
  commandCategory: "media",
  usePrefix: true
};

module.exports.run = async function({ api, event }) {
  const { threadID, messageID, type, messageReply } = event;

  if (type !== "message_reply" || !messageReply.attachments[0]) 
    return api.sendMessage("◯ رجاءً رد على فيديو لتحويله إلى صوت.", threadID, messageID);

  const loading = await api.sendMessage("◈ جاري تحويل الفيديو إلى صوت... [ 3 ]", threadID, messageID);
  setTimeout(() => api.editMessage("◈ جاري تحويل الفيديو إلى صوت... [ 2 ]", loading.messageID), 1000);
  setTimeout(() => api.editMessage("◈ جاري تحويل الفيديو إلى صوت... [ 1 ]", loading.messageID), 2000);

  try {
    const videoUrl = messageReply.attachments[0].url;
    const videoPath = path.join(__dirname, `cache/video_${Date.now()}.mp4`);
    const audioPath = path.join(__dirname, `cache/audio_${Date.now()}.mp3`);

    // تحميل الفيديو مؤقتًا
    const videoData = await axios.get(videoUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(videoPath, Buffer.from(videoData.data));

    // تحويل الفيديو إلى MP3
    ffmpeg(videoPath)
      .output(audioPath)
      .audioCodec("libmp3lame")
      .on("end", async () => {
        await api.sendMessage({
          body: "✅ تم تحويل الفيديو إلى صوت بنجاح!",
          attachment: fs.createReadStream(audioPath)
        }, threadID, () => {
          fs.unlinkSync(videoPath);
          fs.unlinkSync(audioPath);
          api.unsendMessage(loading.messageID);
        }, messageID);
      })
      .on("error", (err) => {
        console.error(err);
        api.editMessage("❌ فشل تحويل الفيديو إلى صوت.", loading.messageID);
      })
      .run();

  } catch (e) {
    console.error(e);
    api.editMessage("❌ حدث خطأ أثناء المعالجة.", loading.messageID);
  }
};
