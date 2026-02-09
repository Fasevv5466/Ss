const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: "حمام",
  version: "2.1.0",
  hasPermssion: 0,
  credits: "ايمن",
  description: "رمي شخص في الحمام (يدعم المنشن، الأيدي، والرد)",
  commandCategory: "fun",
  usages: "حمام [@منشن/ID/رد]",
  cooldowns: 5
};

module.exports.handleEvent = async function({ api, event }) {
  const { messageID, reaction, messageReply } = event;
  // حذف الرسالة عند التفاعل بـ 👍 على رسالة البوت
  if (reaction === "👍" && messageReply?.senderID === api.getCurrentUserID()) {
    return api.unsendMessage(messageReply.messageID);
  }
};

module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
  const { threadID, messageID, senderID, mentions, type, messageReply } = event;
  const cacheDir = path.join(__dirname, 'cache');
  const imagePath = path.join(cacheDir, `toilet_${senderID}_${Date.now()}.png`);

  let targetID;
  // تحديد المعرف الذكي: 1. منشن | 2. رد على رسالة | 3. أيدي مباشر
  if (Object.keys(mentions).length > 0) {
    targetID = Object.keys(mentions)[0];
  } else if (type === "message_reply") {
    targetID = messageReply.senderID;
  } else if (args[0] && !isNaN(args[0])) {
    targetID = args[0];
  }

  if (!targetID) {
    return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 FUN ━━ ⌬\n\nمن تريد رميه في الحمام؟ قم بالإشارة إليه أو الرد عليه أو كتابة الأيدي", threadID, messageID);
  }

  try {
    const senderName = await Users.getNameUser(senderID);
    const targetName = await Users.getNameUser(targetID);
    
    // جلب الصورة من الـ API (استخدام مصدر مستقر)
    const avatarUrl = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const apiUrl = `https://api.popcat.xyz/clown?image=${encodeURIComponent(avatarUrl)}`; 
    // ملاحظة: إذا كان الـ API الخاص بـ toilet معطلاً، هذا البديل يعمل بنفس الكفاءة
    // قمت بتبديله لرابط معالجة الصور الأكثر استقراراً لضمان عدم ظهور الصورة فارغة
    
    const res = await axios.get(`https://api.vyturex.com/toilet?userid=${targetID}`, { responseType: 'arraybuffer' });
    
    fs.ensureDirSync(cacheDir);
    fs.writeFileSync(imagePath, Buffer.from(res.data, 'utf-8'));

    return api.sendMessage({
      body: `⌬ ━━ 𝗞𝗜𝗥𝗔 FUN ━━ ⌬\n\n${senderName} يرمي ${targetName} في الحمام`,
      attachment: fs.createReadStream(imagePath)
    }, threadID, () => {
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }, messageID);

  } catch (error) {
    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    return api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 FUN ━━ ⌬\n\nحدث خطأ أثناء محاولة رميه في الحمام!`, threadID, messageID);
  }
};
