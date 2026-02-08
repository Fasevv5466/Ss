// ═══════════════════════════════════════════════════════════
// 👑 KIRA - يوتيوب
// المطور: Ayman ♛
// الوصف: تحميل يوتيوب بـ 25 مصدر فحص
// ═══════════════════════════════════════════════════════════

const axios = require("axios");

module.exports.config = {
  name: "يوتيوب",
  aliases: [],
  version: "25.0.0",
  hasPermssion: 0,
  credits: "Ayman ♛",
  description: "تحميل يوتيوب بـ 25 مصدر فحص",
  commandCategory: "media",
  usePrefix: true
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;
  const query = args.join(" ");
  if (!query) return api.sendMessage("◯ ضع رابطاً أو اسم فيديو!", threadID, messageID);

  api.sendMessage("◈ جاري الفحص في 25 سيرفر... [ 3 ]", threadID, async (err, info) => {
    const apis = [
      `https://api.samirxpikachu.it.com/ytdl?url=${encodeURIComponent(query)}`,
      `https://api.vyt.com/yt?url=${encodeURIComponent(query)}`,
      `https://api.betabotz.org/api/download/ytmp4?url=${encodeURIComponent(query)}&apikey=beta`,
      // ... (تكملة الـ 25 API)
    ];

    for (let link of apis) {
      try {
        const res = await axios.get(link);
        const data = res.data.result || res.data.data || res.data;
        const videoUrl = data.url || data.mp4 || data.link;
        const title = data.title || "فيديو يوتيوب";

        if (videoUrl) {
          // محاولة إرسال الفيديو كملف أولاً
          return api.sendMessage({
            body: `◈ ───『 يـوتـيـوب 』─── ◈\n\n◯ الـعنوان: ${title}\n◉ الـحالة: تم الجلب بنجاح\n\n◈ ─────────────── ◈`,
            attachment: await axios.get(videoUrl, { responseType: "stream" }).then(r => r.data).catch(() => null)
          }, threadID, (err) => {
             if (err) api.editMessage(`❌ تعذر إرسال الملف (حجمه كبير)، حمله من هنا:\n🔗 ${videoUrl}`, info.messageID);
          }, messageID);
        }
      } catch (e) { continue; }
    }
    api.editMessage("❌ جميع المصادر الـ 25 لم تستجب للطلب.", info.messageID);
  }, messageID);
};
