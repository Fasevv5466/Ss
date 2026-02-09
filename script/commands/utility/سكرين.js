module.exports.config = {
  name: "سكرين",
  version: "1.1.0",
  hasPermssion: 0,
  credits: "ايمن",
  description: "التقاط صورة لموقع ويب (يدعم الرد)",
  commandCategory: "utility",
  usages: "سكرين [الرابط] أو بالرد على رابط",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const fs = require("fs-extra");
  const axios = require("axios");
  const { threadID, messageID, type, messageReply } = event;

  // 1. تحديد الرابط سواء من الأرجومنت أو من الرد على رسالة
  let url = args[0];
  if (type === "message_reply") {
    // محاولة استخراج الرابط من نص الرسالة المردود عليها
    const regex = /(https?:\/\/[^\s]+)/g;
    const found = messageReply.body.match(regex);
    if (found) url = found[0];
  }

  if (!url) {
    return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 ━━ ⌬\n\n❌ يرجى إدخال رابط أو الرد على رسالة تحتوي على رابط موقع.", threadID, messageID);
  }

  // التأكد من أن الرابط يبدأ بـ http أو https
  if (!url.startsWith("http")) url = "https://" + url;

  try {
    const waitMsg = await api.sendMessage(`⏳ جاري التقاط صورة للموقع: ${url}...`, threadID);

    const path = __dirname + `/cache/screen_${Date.now()}.png`;
    
    // استخدام API thum.io القوي لالتقاط الصور
    const screenshotUrl = `https://image.thum.io/get/width/1920/crop/800/noanimate/${url}`;
    
    const response = await axios.get(screenshotUrl, { responseType: 'arraybuffer' });
    fs.writeFileSync(path, Buffer.from(response.data, 'utf-8'));

    api.unsendMessage(waitMsg.messageID);

    api.sendMessage(
      { 
        body: `⌬ ━━ 𝗞𝗜𝗥𝗔 𝗦𝗖𝗥𝗘𝗘𝗡 ━━ ⌬\n\n✅ تم التقاط الصورة بنجاح\n🔗 الموقع: ${url}`,
        attachment: fs.createReadStream(path) 
      },
      threadID,
      () => fs.unlinkSync(path),
      messageID
    );
  } catch (error) {
    console.error(error);
    return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 ━━ ⌬\n\n❌ فشل التقاط الصورة. تأكد من أن الموقع يعمل أو أن الرابط صحيح.", threadID, messageID);
  }
};
