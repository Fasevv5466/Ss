// ═══════════════════════════════════════════════════════════
// 👑 KIRA - تيك
// المطور: Ayman ♛
// الوصف: تحميل تيك توك سريع بدون علامة مائية
// ═══════════════════════════════════════════════════════════

const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "تيك",
  aliases: [],
  version: "25.1.0",
  hasPermssion: 0,
  credits: "Ayman ♛",
  description: "تحميل تيك توك سريع بدون علامة مائية",
  commandCategory: "media",
  usePrefix: true
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;
  const url = args[0];
  if (!url) return api.sendMessage("◯ ضع رابط تيك توك!", threadID, messageID);

  const loading = await api.sendMessage("◈ جاري البحث عن الفيديو... [ 3 ]", threadID, messageID);
  setTimeout(() => api.editMessage("◈ جاري البحث عن الفيديو... [ 2 ]", loading.messageID), 1000);
  setTimeout(() => api.editMessage("◈ جاري البحث عن الفيديو... [ 1 ]", loading.messageID), 2000);

  const sources = [
    `https://api.tikwm.com/v1/video/info?url=${encodeURIComponent(url)}`,
    `https://api.tikdown.org/api/download?url=${encodeURIComponent(url)}`,
    `https://api.snaptik.app/aweme?url=${encodeURIComponent(url)}`
    // يمكنك إضافة المزيد من المصادر الموثوقة هنا
  ];

  let success = false;
  for (let src of sources) {
    try {
      const res = await axios.get(src);
      let videoLink = res.data.video || res.data.result?.video || res.data.data?.play || res.data?.play_url;

      if (videoLink) {
        // تنزيل الفيديو مؤقتًا
        const videoPath = path.join(__dirname, `cache/tiktok_${Date.now()}.mp4`);
        const videoRes = await axios.get(videoLink, { responseType: "arraybuffer" });
        fs.writeFileSync(videoPath, videoRes.data);

        await api.sendMessage({
          body: "◈ ───『 تـيـك تـوك 』─── ◈\n\n◉ تم التحميل بدون علامة مائية\n\n◈ ─────────────── ◈",
          attachment: fs.createReadStream(videoPath)
        }, threadID, () => {
          fs.unlinkSync(videoPath);
          api.unsendMessage(loading.messageID);
        }, messageID);

        success = true;
        break;
      }
    } catch (e) { continue; }
  }

  if (!success) {
    api.editMessage("❌ فشل في جلب الفيديو من جميع المصادر المتاحة.", loading.messageID);
  }
};
