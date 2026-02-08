// ═══════════════════════════════════════════════════════════
// 👑 KIRA - انستا
// المطور: Ayman ♛
// الوصف: تحميل ريلز وصور من إنستغرام بشكل آمن
// ═══════════════════════════════════════════════════════════

const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "انستا",
  aliases: [],
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Ayman ♛",
  description: "تحميل ريلز وصور من إنستغرام بشكل آمن",
  commandCategory: "media",
  usePrefix: true,
  cooldowns: 10
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;
  const url = args[0];
  if (!url) return api.sendMessage("◯ يرجى وضع رابط إنستغرام بعد الأمر.", threadID, messageID);

  // رسالة انتظار
  const msgInfo = await api.sendMessage("◈ جاري جلب الوسائط...", threadID, messageID);

  try {
    // استبدل "YOUR_API_KEY" بمفتاحك من LolHuman أو API مشابه
    const res = await axios.get(`https://api.lolhuman.xyz/api/instagram?apikey=YOUR_API_KEY&url=${encodeURIComponent(url)}`);
    const media = res.data.result; // النتيجة تحتوي على فيديو أو صور

    if (!media) throw new Error("❌ لا توجد وسائط متاحة.");

    for (let i = 0; i < media.length; i++) {
      const mediaUrl = media[i].url;
      const ext = mediaUrl.endsWith(".mp4") ? ".mp4" : ".jpg";
      const filePath = path.join(__dirname, `cache/insta_${Date.now()}${i}${ext}`);

      // تحميل الملف
      const fileData = (await axios.get(mediaUrl, { responseType: "arraybuffer" })).data;
      fs.writeFileSync(filePath, Buffer.from(fileData));

      // إرسال الوسائط
      await api.sendMessage({
        body: `◈ ───『 إنـسـتـغـرام 』─── ◈\n\n◉ تم التحميل بنجاح!`,
        attachment: fs.createReadStream(filePath)
      }, threadID);

      // حذف الملف بعد الإرسال
      fs.unlinkSync(filePath);
    }

    // حذف رسالة الانتظار
    api.unsendMessage(msgInfo.messageID);

  } catch (e) {
    console.log(e);
    api.editMessage("❌ فشل التحميل، تأكد من أن الرابط صحيح وأن الحساب عام.", msgInfo.messageID);
  }
};
