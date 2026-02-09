const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports.config = {
  name: "داتا",
  version: "3.0.0",
  hasPermssion: 2,
  credits: "ايمن",
  description: "نسخ احتياطي واستعادة الداتا (رفع وتحميل)",
  commandCategory: "developer",
  usages: "داتا (للتحميل) أو رد على ملف (للرفع)",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID, senderID, type, messageReply } = event;

  // التحقق من المطور
  if (!global.config.ADMINBOT.includes(senderID)) return;

  // --- الجزء الأول: رفع الداتا (عند الرد على ملف) ---
  if (type === "message_reply") {
    const attachment = messageReply.attachments[0];
    if (!attachment || !attachment.url || !attachment.filename.endsWith(".json")) {
      return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 ━━ ⌬\n\n❌ يرجى الرد على ملف بصيغة .json فقط!", threadID, messageID);
    }

    api.setMessageReaction("⏳", messageID, () => {}, true);

    try {
      const fileName = attachment.filename;
      // محاولة تحديد مسار الملف تلقائياً (يبحث في المجلدات الأساسية)
      const possiblePaths = [
        path.join(__dirname, "..", "..", "includes", "database", fileName),
        path.join(__dirname, "..", "..", fileName),
        path.join(__dirname, "..", "database", fileName),
        path.join(process.cwd(), fileName)
      ];

      let targetPath = possiblePaths.find(p => p.includes("database") || p.includes("config.json"));
      
      // إذا لم يجد مساراً ذكياً، يرفعه في المجلد الرئيسي أو حسب اسم الملف
      if (!targetPath) targetPath = path.join(process.cwd(), fileName);

      const response = await axios.get(attachment.url, { responseType: "arraybuffer" });
      fs.writeFileSync(targetPath, Buffer.from(response.data));

      api.setMessageReaction("✅", messageID, () => {}, true);
      return api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 𝗗𝗔𝗧𝗔 ━━ ⌬\n\n✅ تم رفع وتحديث الملف: ${fileName}\n⚠️ يرجى إعادة تشغيل البوت لتفعيل التغييرات.`, threadID, messageID);
    } catch (e) {
      return api.sendMessage(`❌ فشل رفع الملف: ${e.message}`, threadID, messageID);
    }
  }

  // --- الجزء الثاني: تحميل الداتا (عند كتابة الأمر فقط) ---
  api.setMessageReaction("📥", messageID, () => {}, true);
  
  const filesToBackup = [
    './config.json',
    './includes/database/users.json',
    './includes/database/threads.json',
    './includes/database/data.json'
  ];

  let attachments = [];
  filesToBackup.forEach(file => {
    if (fs.existsSync(file)) attachments.push(fs.createReadStream(file));
  });

  if (attachments.length === 0) return api.sendMessage("❌ لم يتم العثور على ملفات داتا.", threadID, messageID);

  return api.sendMessage({
    body: "⌬ ━━ 𝗞𝗜𝗥𝗔 𝗗𝗔𝗧𝗔 ━━ ⌬\n\n✅ إليك ملفات الداتا الحالية.\n💡 لرفع داتا جديدة، قم بالرد على الملف الميم بـ '.داتا'",
    attachment: attachments
  }, threadID, () => api.setMessageReaction("✅", messageID, () => {}, true), messageID);
};
