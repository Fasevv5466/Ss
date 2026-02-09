const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports.config = {
  name: "داتا",
  version: "4.1.0",
  hasPermssion: 2,
  credits: "ايمن",
  description: "نسخ احتياطي واستعادة ملفات JSON",
  commandCategory: "developer",
  usages: "داتا (للتحميل) أو رد على ملف (للرفع)",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID, senderID, type, messageReply } = event;

  if (!global.config.ADMINBOT.includes(senderID)) return;

  // الملفات المطلوبة
  const targetFiles = ['threads.json', 'users.json', 'currencies.json'];
  
  // تحديد المجلدات المحتملة يدوياً لضمان الدقة
  const possibleDirs = [
    path.join(process.cwd(), 'includes', 'database'),
    path.join(process.cwd(), 'database'),
    path.join(process.cwd(), 'modules', 'commands', 'cache'),
    process.cwd()
  ];

  // دالة البحث عن مسار الملف
  const getFilePath = (name) => {
    for (const dir of possibleDirs) {
      const fullPath = path.join(dir, name);
      if (fs.existsSync(fullPath)) return fullPath;
    }
    return null;
  };

  // --- الجزء الأول: الرفع (عند الرد) ---
  if (type === "message_reply") {
    const attachment = messageReply.attachments[0];
    if (!attachment || !attachment.filename.endsWith(".json")) {
      return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 ━━ ⌬\n\n❌ يرجى الرد على ملف .json حصراً.", threadID, messageID);
    }

    const fileName = attachment.filename;
    api.setMessageReaction("⏳", messageID, () => {}, true);

    try {
      // إذا الملف موجود نحدثه في مكانه، إذا مش موجود نرفعه في أول مسار متاح
      const savePath = getFilePath(fileName) || path.join(possibleDirs[0], fileName);
      const response = await axios.get(attachment.url, { responseType: "arraybuffer" });
      
      fs.ensureDirSync(path.dirname(savePath));
      fs.writeFileSync(savePath, Buffer.from(response.data));

      api.setMessageReaction("✅", messageID, () => {}, true);
      api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 𝗗𝗔𝗧𝗔 ━━ ⌬\n\n✅ تم تحديث [ ${fileName} ] بنجاح.\n🔄 سيتم إعادة التشغيل الآن...`, threadID);
      
      setTimeout(() => process.exit(1), 2000);
    } catch (e) {
      return api.sendMessage(`❌ فشل في الرفع: ${e.message}`, threadID, messageID);
    }
    return;
  }

  // --- الجزء الثاني: التحميل (إرسال الملفات) ---
  api.setMessageReaction("📥", messageID, () => {}, true);
  
  let attachments = [];
  let foundList = "";

  for (const name of targetFiles) {
    const fullPath = getFilePath(name);
    if (fullPath) {
      attachments.push(fs.createReadStream(fullPath));
      foundList += `• ${name}\n`;
    }
  }

  if (attachments.length === 0) {
    return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 ━━ ⌬\n\n❌ لم يتم العثور على الملفات المطلوبة.\nتأكد من وجود مجلد database أو includes.", threadID, messageID);
  }

  return api.sendMessage({
    body: `⌬ ━━ 𝗞𝗜𝗥𝗔 𝗗𝗔𝗧𝗔 ━━ ⌬\n\n✅ تم العثور على الداتا:\n${foundList}\n💡 للرفع: رد على الملف بكلمة "داتا"`,
    attachment: attachments
  }, threadID, () => api.setMessageReaction("✅", messageID, () => {}, true), messageID);
};
