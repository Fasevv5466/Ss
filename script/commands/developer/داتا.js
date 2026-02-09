const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports.config = {
  name: "داتا",
  version: "3.5.0",
  hasPermssion: 2,
  credits: "ايمن",
  description: "نسخ احتياطي واستعادة (threads, users, currencies)",
  commandCategory: "developer",
  usages: "داتا (للتحميل) أو رد على ملف (للرفع)",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID, senderID, type, messageReply } = event;

  // التحقق من المطور
  if (!global.config.ADMINBOT.includes(senderID)) return;

  // الملفات المستهدفة فقط
  const targetFiles = [
    'threads.json',
    'users.json',
    'currencies.json'
  ];

  // المسار المتوقع للملفات (تعديل حسب مسار قاعدة بيانات سكربتك)
  const dbPath = path.join(__dirname, "..", "..", "includes", "database");

  // --- الجزء الأول: رفع الداتا (عند الرد على ملف) ---
  if (type === "message_reply") {
    const attachment = messageReply.attachments[0];
    
    // التحقق من أن المرفق هو ملف json وبدون تعقيدات في الاسم
    if (!attachment || attachment.type !== "file" || !attachment.filename.endsWith(".json")) {
       return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 ━━ ⌬\n\n❌ يرجى الرد على ملف (.json) حصراً من الملفات المدعومة.", threadID, messageID);
    }

    const fileName = attachment.filename;
    if (!targetFiles.includes(fileName)) {
      return api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 ━━ ⌬\n\n❌ يمكن استبدال هذه الملفات فقط:\n${targetFiles.join(", ")}`, threadID, messageID);
    }

    api.setMessageReaction("⏳", messageID, () => {}, true);

    try {
      const fullPath = path.join(dbPath, fileName);
      const response = await axios.get(attachment.url, { responseType: "arraybuffer" });
      
      fs.ensureDirSync(dbPath);
      fs.writeFileSync(fullPath, Buffer.from(response.data));

      api.setMessageReaction("✅", messageID, () => {}, true);
      api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 𝗗𝗔𝗧𝗔 ━━ ⌬\n\n✅ تم تحديث ${fileName} بنجاح.\n🔄 يتم الآن إعادة تشغيل البوت لتطبيق البيانات...`, threadID);
      
      // إعادة تشغيل البوت تلقائياً لتحديث الداتا
      setTimeout(() => process.exit(1), 2000);

    } catch (e) {
      return api.sendMessage(`❌ فشل الرفع: ${e.message}`, threadID, messageID);
    }
    return;
  }

  // --- الجزء الثاني: تحميل الداتا (عند كتابة الأمر) ---
  api.setMessageReaction("📥", messageID, () => {}, true);
  
  let attachments = [];
  let foundFiles = [];

  targetFiles.forEach(file => {
    const fullPath = path.join(dbPath, file);
    if (fs.existsSync(fullPath)) {
      attachments.push(fs.createReadStream(fullPath));
      foundFiles.push(file);
    }
  });

  if (attachments.length === 0) return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 ━━ ⌬\n\n❌ لم يتم العثور على أي ملفات داتا في المسار المحدد.", threadID, messageID);

  const bodyMsg = `⌬ ━━ 𝗞𝗜𝗥𝗔 𝗗𝗔𝗧𝗔 ━━ ⌬\n\n✅ تم إنشاء النسخة الاحتياطية بنجاح\n\n📦 الملفات المرفقة:\n${foundFiles.map(f => `• ${f}`).join("\n")}\n\n💡 لرفع ملف جديد، قم بالرد عليه واكتب "داتا"`;

  return api.sendMessage({
    body: bodyMsg,
    attachment: attachments
  }, threadID, (err) => {
    if (!err) api.setMessageReaction("✅", messageID, () => {}, true);
  }, messageID);
};
