const axios = require("axios");
const request = require("request");
const fs = require("fs-extra");

// ═══════════════════════════════════════════════════════════
// 👑 KIRA - صور القطط العشوائية
// المطور: Ayman ♛
// ═══════════════════════════════════════════════════════════

module.exports.config = {
  name: "قطقوطه",
  aliases: ["قطة", "cat", "قط"],
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Ayman ♛",
  description: "🐱 صور قطط عشوائية لطيفة",
  commandCategory: "fun",
  usages: ".قطقوطه",
  cooldowns: 10
};

module.exports.run = async ({ api, event }) => {
  const { threadID, messageID, senderID } = event;

  try {
    // رسالة انتظار
    api.setMessageReaction("🐱", messageID, () => {}, true);

    // جلب صورة عشوائية
    const res = await axios.get("https://api.thecatapi.com/v1/images/search");
    const catUrl = res.data[0].url;
    
    const ext = catUrl.substring(catUrl.lastIndexOf(".") + 1);
    const path = __dirname + `/cache/cat_${Date.now()}.${ext}`;

    // تحميل الصورة
    const callback = function() {
      const AYMAN_ID = "61577861540407";
      const message = senderID === AYMAN_ID
        ? `💖 ───『 قطقوطه لأيمن 』─── 💖

🐱 قطة لطيفة من أجلك يا حبيبي!
😻 ميااااو~

💖 ─── كيرا ─── 💖`
        : `◈ ───『 قطقوطه 』─── ◈

🐱 قطة لطيفة!
😼 ميااااو~

◈ ─── كيرا ─── ◈`;

      api.sendMessage(
        {
          body: message,
          attachment: fs.createReadStream(path)
        },
        threadID,
        () => fs.unlinkSync(path),
        messageID
      );
    };

    request(catUrl)
      .pipe(fs.createWriteStream(path))
      .on("close", callback);

  } catch (error) {
    console.error("Cat Error:", error);
    return api.sendMessage(
      "❌ فشل جلب القطة! حاول مرة أخرى 😿",
      threadID,
      messageID
    );
  }
};
