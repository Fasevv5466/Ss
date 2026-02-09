const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports.config = {
  name: "داتا",
  version: "4.0.0",
  hasPermssion: 2,
  credits: "ايمن",
  description: "نسخ احتياطي واستعادة الداتا بالبحث الشامل",
  commandCategory: "developer",
  usages: "داتا (للتحميل) أو رد على ملف (للرفع)",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID, senderID, type, messageReply } = event;

  if (!global.config.ADMINBOT.includes(senderID)) return;

  const targetFiles = ['threads.json', 'users.json', 'currencies.json'];

  // دالة البحث الشامل في كل مجلدات البوت
  function globalSearch(fileName) {
    const root = process.cwd();
    let foundPath = null;

    function search(dir) {
      if (foundPath) return;
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        if (fullPath.includes("node_modules")) continue; // تخطي مجلد المكتبات
        
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          search(fullPath);
        } else if (item === fileName) {
          foundPath = fullPath;
          return;
        }
      }
    }

    try {
      search(root);
    } catch (e) {}
    return foundPath;
  }

  // --- الجزء الأول: رفع الداتا (عند الرد) ---
  if (type === "message_reply") {
    const attachment = messageReply.attachments[0];
    if (!attachment || !attachment.filename.endsWith(".json")) {
       return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 ━━ ⌬\n\n❌ رد على ملف .json", threadID, messageID);
    }

    const fileName = attachment.filename;
    api.setMessageReaction("⏳", messageID, () => {}, true);

    try {
      const savePath = globalSearch(fileName) || path.join(process.cwd(), fileName);
      const response = await axios.get(attachment.url, { responseType: "arraybuffer" });
      
      fs.ensureDirSync(path.dirname(savePath));
      fs.writeFileSync(savePath, Buffer.from(response.data));

      api.setMessageReaction("✅", messageID, () => {}, true);
      api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 𝗗𝗔𝗧𝗔 ━━ ⌬\n\n✅ تم تحديث [ ${fileName} ]\n📍 المسار: ${savePath}\n🔄 يتم الآن إعادة التشغيل...`, threadID);
      
      setTimeout(() => process.exit(1), 2000);
    } catch (e) {
      return api.sendMessage(`❌ فشل: ${e.message}`, threadID, messageID);
    }
    return;
  }

  // --- الجزء الثاني: تحميل الداتا (إرسال الملفات) ---
  api.setMessageReaction("📥", messageID, () => {}, true);
  
  let attachments = [];
  let foundDetails = "";

  for (const name of targetFiles) {
    const fullPath = globalSearch(name);
    if (fullPath) {
      attachments.push(fs.createReadStream(fullPath));
      foundDetails += `• ${name}\n`;
    }
  }

  if (attachments.length === 0) {
    return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 ━━ ⌬\n\n❌ لم يتم العثور على الملفات المطلوبة نهائياً في مجلد البوت.\nتأكد أن السكربت يستخدم ملفات JSON للتخزين.", threadID, messageID);
  }

  return api.sendMessage({
    body: `⌬ ━━ 𝗞𝗜𝗥𝗔 𝗗𝗔𝗧𝗔 ━━ ⌬\n\n✅ تم العثور على الملفات:\n${foundDetails}\n💡 للرفع: رد على الملف بكلمة "داتا"`,
    attachment: attachments
  }, threadID, () => api.setMessageReaction("✅", messageID, () => {}, true), messageID);
};
