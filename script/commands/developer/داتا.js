const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports.config = {
  name: "داتا",
  version: "3.6.0",
  hasPermssion: 2,
  credits: "ايمن",
  description: "نسخ احتياطي واستعادة ملفات الداتا الأساسية",
  commandCategory: "developer",
  usages: "داتا (للتحميل) أو رد على ملف (للرفع)",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID, senderID, type, messageReply } = event;

  if (!global.config.ADMINBOT.includes(senderID)) return;

  const targetFiles = ['threads.json', 'users.json', 'currencies.json'];

  // دالة ذكية للبحث عن مسار الملف في المشروع
  const findFilePath = (name) => {
    const paths = [
      path.join(process.cwd(), 'includes', 'database', name),
      path.join(process.cwd(), 'database', name),
      path.join(process.cwd(), 'modules', 'commands', 'cache', name),
      path.join(process.cwd(), name)
    ];
    return paths.find(p => fs.existsSync(p)) || paths[0]; 
  };

  // --- الجزء الأول: رفع الداتا (الرد على ملف) ---
  if (type === "message_reply") {
    const attachment = messageReply.attachments[0];
    
    if (!attachment || !attachment.filename.endsWith(".json")) {
       return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 ━━ ⌬\n\n❌ يرجى الرد على ملف بصيغة .json", threadID, messageID);
    }

    const fileName = attachment.filename;
    if (!targetFiles.includes(fileName)) {
      return api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 ━━ ⌬\n\n❌ يمكنك فقط رفع: ${targetFiles.join(", ")}`, threadID, messageID);
    }

    try {
      api.setMessageReaction("⏳", messageID, () => {}, true);
      const savePath = findFilePath(fileName);
      const response = await axios.get(attachment.url, { responseType: "arraybuffer" });
      
      fs.ensureDirSync(path.dirname(savePath));
      fs.writeFileSync(savePath, Buffer.from(response.data));

      api.setMessageReaction("✅", messageID, () => {}, true);
      api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 𝗗𝗔𝗧𝗔 ━━ ⌬\n\n✅ تم تحديث ${fileName} بنجاح.\n🔄 يتم الآن إعادة التشغيل...`, threadID);
      
      setTimeout(() => process.exit(1), 2000);
    } catch (e) {
      return api.sendMessage(`❌ فشل الرفع: ${e.message}`, threadID, messageID);
    }
    return;
  }

  // --- الجزء الثاني: تحميل الداتا (إرسال الملفات) ---
  api.setMessageReaction("📥", messageID, () => {}, true);
  
  let attachments = [];
  let foundFiles = [];

  targetFiles.forEach(file => {
    const fullPath = findFilePath(file);
    if (fs.existsSync(fullPath)) {
      attachments.push(fs.createReadStream(fullPath));
      foundFiles.push(file);
    }
  });

  if (attachments.length === 0) {
    return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 ━━ ⌬\n\n❌ لم يجد البوت ملفات (users, threads, currencies) في المجلدات الرئيسية.", threadID, messageID);
  }

  return api.sendMessage({
    body: `⌬ ━━ 𝗞𝗜𝗥𝗔 𝗗𝗔𝗧𝗔 ━━ ⌬\n\n✅ تم استخراج الداتا بنجاح\n\n📦 الملفات:\n${foundFiles.map(f => `• ${f}`).join("\n")}\n\n💡 للرفع: رد على الملف بكلمة "داتا"`,
    attachment: attachments
  }, threadID, (err) => {
    if (!err) api.setMessageReaction("✅", messageID, () => {}, true);
  }, messageID);
};
