// ═══════════════════════════════════════════════════════════
// 👑 KIRA - قولي
// المطور: Ayman ♛
// الوصف: تحويل النص لصوت باستخدام مكتبة gtts
// ═══════════════════════════════════════════════════════════

const gtts = require("gtts");
const fs = require("fs-extra");

module.exports.config = {
  name: "قولي",
  aliases: [],
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Ayman ♛",
  description: "تحويل النص لصوت باستخدام مكتبة gtts",
  commandCategory: "media",
  usePrefix: true
};

module.exports.run = async function({ api, event, args }) {
  const text = args.join(" ");
  if (!text) return api.sendMessage("✨ ماذا أقول؟", event.threadID);

  const path = __dirname + "/cache/voice.mp3";
  const speech = new gtts(text, 'ar');
  
  speech.save(path, function (err, result) {
    if (err) return api.sendMessage("❌ خطأ!", event.threadID);
    api.sendMessage({ attachment: fs.createReadStream(path) }, event.threadID, () => fs.unlinkSync(path));
  });
};
