const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports.config = {
  name: "داتا",
  version: "4.5.0",
  hasPermssion: 2,
  credits: "ايمن",
  description: "نسخ احتياطي واستعادة بيانات (Threads, Users, Currencies)",
  commandCategory: "developer",
  usages: "داتا (للتحميل) أو رد على ملف (للرفع)",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID, senderID, type, messageReply } = event;

  // التحقق من المطور
  if (!global.config.ADMINBOT.includes(senderID)) return;

  // تحديد الملفات والبيانات المستهدفة
  const backupFiles = {
    "threads.json": global.data.allThreadID || {},
    "users.json": global.data.allUserID || {},
    "currencies.json": global.data.allCurrenciesID || {}
  };

  const tmpDir = path.join(__dirname, "cache", "backup");

  // --- الجزء الأول: الرفع والاستعادة (عند الرد على ملف) ---
  if (type === "message_reply") {
    const attachment = messageReply.attachments[0];
    
    if (!attachment || !attachment.filename || !attachment.filename.endsWith(".json")) {
      return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 ━━ ⌬\n\n❌ يرجى الرد على ملف بصيغة .json حصراً.", threadID, messageID);
    }

    const fileName = attachment.filename;
    if (!Object.keys(backupFiles).includes(fileName)) {
      return api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 ━━ ⌬\n\n❌ يمكنك فقط رفع هذه الملفات:\n${Object.keys(backupFiles).join(", ")}`, threadID, messageID);
    }

    api.setMessageReaction("⏳", messageID, () => {}, true);

    try {
      // البحث عن مسار الملف في السيرفر (database أو المجلد الرئيسي)
      const possiblePaths = [
        path.join(process.cwd(), "includes", "database", fileName),
        path.join(process.cwd(), "database", fileName),
        path.join(process.cwd(), fileName)
      ];
      
      let targetPath = possiblePaths.find(p => fs.existsSync(p)) || possiblePaths[0];

      const response = await axios.get(attachment.url, { responseType: "arraybuffer" });
      fs.ensureDirSync(path.dirname(targetPath));
      fs.writeFileSync(targetPath, Buffer.from(response.data));

      api.setMessageReaction("✅", messageID, () => {}, true);
      api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 𝗗𝗔𝗧𝗔 ━━ ⌬\n\n✅ تم استعادة الملف [ ${fileName} ] بنجاح.\n🔄 جاري إعادة التشغيل لتحديث البيانات...`, threadID);
      
      // إعادة تشغيل البوت لتحديث الـ global.data
      setTimeout(() => process.exit(1), 2000);
      return;
    } catch (e) {
      return api.sendMessage(`❌ فشل الرفع: ${e.message}`, threadID, messageID);
    }
  }

  // --- الجزء الثاني: النسخ الاحتياطي (عند كتابة الأمر) ---
  api.setMessageReaction("📥", messageID, () => {}, true);

  try {
    fs.ensureDirSync(tmpDir);
    let attachments = [];

    for (const [name, data] of Object.entries(backupFiles)) {
      const filePath = path.join(tmpDir, name);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      attachments.push(fs.createReadStream(filePath));
    }

    const bodyMsg = "⌬ ━━ 𝗞𝗜𝗥𝗔 𝗗𝗔𝗧𝗔 ━━ ⌬\n\n✅ تم إنشاء النسخة الاحتياطية بنجاح\n\n📦 الملفات المرفقة:\n" + 
                    Object.keys(backupFiles).map(f => `• ${f}`).join("\n") + 
                    "\n\n💡 للرفع: قم بالرد على أي ملف بكلمة 'داتا'";

    return api.sendMessage({
      body: bodyMsg,
      attachment: attachments
    }, threadID, () => {
      // تنظيف الملفات المؤقتة بعد الإرسال
      Object.keys(backupFiles).forEach(name => {
        const p = path.join(tmpDir, name);
        if (fs.existsSync(p)) fs.unlinkSync(p);
      });
      api.setMessageReaction("✅", messageID, () => {}, true);
    }, messageID);

  } catch (error) {
    console.error(error);
    return api.sendMessage("❌ فشل تصدير البيانات.", threadID, messageID);
  }
};
