// ✓تأثير.js
const fs = require("fs-extra");
const jimp = require("jimp");
const path = require("path");
const axios = require("axios");

module.exports.config = {
  name: "تاثير",
  version: "1.3.0",
  hasPermssion: 0,
  credits: "ayman",
  description: "إضافة تأثيرات على الصور",
  commandCategory: "Media",
  usages: ".تاثير <رقم>",
  cooldowns: 8
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;

  api.setMessageReaction("⌛", messageID, () => {}, true);

  const effects = {
    "1": { name: "تعتيم", fn: img => img.blur(5) },
    "2": { name: "أبيض وأسود", fn: img => img.greyscale() },
    "3": { name: "عكس الألوان", fn: img => img.invert() },
    "4": { name: "سيبيا", fn: img => img.sepia() },
    "5": { name: "بكسلة", fn: img => img.pixelate(8) },
    "6": { name: "سطوع", fn: img => img.brightness(0.2) },
    "7": { name: "تباين", fn: img => img.contrast(0.5) },
    "8": { name: "أحمر", fn: img => img.color([{ apply: "red", params: [100] }]) },
    "9": { name: "أزرق", fn: img => img.color([{ apply: "blue", params: [100] }]) },
    "10": { name: "أخضر", fn: img => img.color([{ apply: "green", params: [100] }]) }
  };

  if (!args[0]) {
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage(`📓 ───────────────
  ┝   1. التأثيرات المتاحة:
  ┝   2. 1- تعتيم   2- أبيض وأسود
  ┝   3. 3- عكس    4- سيبيا
  ┝   4. 5- بكسلة  6- سطوع
  ┝   5. 7- تباين  8- أحمر
  ┝   6. 9- أزرق   10- أخضر
📓 ───────────────
رد على صورة واكتب: .تاثير [رقم]`, threadID, messageID);
  }

  const effect = effects[args[0]];
  if (!effect) {
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage(`📓 ───────────────
  ┝   1. رقم التأثير غير صحيح
📓 ───────────────`, threadID, messageID);
  }

  if (!event.type === "message_reply" || !event.messageReply.attachments || !event.messageReply.attachments[0]) {
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage(`📓 ───────────────
  ┝   1. يجب الرد على صورة
📓 ───────────────`, threadID, messageID);
  }

  try {
    const imgURL = event.messageReply.attachments[0].url;
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    const imgPath = path.join(cacheDir, `effect_${Date.now()}.jpg`);
    const res = await axios.get(imgURL, { responseType: "arraybuffer" });
    fs.writeFileSync(imgPath, res.data);

    const image = await jimp.read(imgPath);
    await effect.fn(image);
    await image.writeAsync(imgPath);

    api.sendMessage(
      {
        body: `📓 ───────────────
  ┝   1. تم تطبيق التأثير
  ┝   2. النوع: ${effect.name}
📓 ───────────────`,
        attachment: fs.createReadStream(imgPath)
      },
      threadID,
      () => {
        fs.unlinkSync(imgPath);
        api.setMessageReaction("✅", messageID, () => {}, true);
      },
      messageID
    );

  } catch (e) {
    api.setMessageReaction("❌", messageID, () => {}, true);
    api.sendMessage(`📓 ───────────────
  ┝   1. خطأ أثناء معالجة الصورة
📓 ───────────────`, threadID, messageID);
  }
};
