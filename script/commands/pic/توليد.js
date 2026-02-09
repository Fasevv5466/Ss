const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "توليد",
  version: "1.0.0",
  hasPermssion: 2,
  credits: "ايمن",
  description: "توليد صور بواسطة Flux Pro",
  commandCategory: "pic",
  usages: "[وصف الصورة]",
  cooldowns: 15
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const adminBot = global.config.ADMINBOT[0];

  if (senderID !== adminBot) {
    return api.sendMessage(
      "⌬ ━━ 𝗞𝗜𝗥𝗔 PIC ━━ ⌬\n\n⭐ هذا الأمر مخصص للمطور فقط",
      threadID,
      messageID
    );
  }

  const prompt = args.join(" ");

  if (!prompt) {
    return api.sendMessage(
      "⌬ ━━ 𝗞𝗜𝗥𝗔 PIC ━━ ⌬\n\n📝 الاستخدام: توليد [وصف الصورة]\n\n💡 مثال: توليد beautiful sunset over mountains",
      threadID,
      messageID
    );
  }

  try {
    const waitMsg = await api.sendMessage(
      "⌬ ━━ 𝗞𝗜𝗥𝗔 PIC ━━ ⌬\n\n⏳ جاري توليد الصورة، يرجى الانتظار...\n\n📝 الوصف: " + prompt,
      threadID
    );

    const apiUrl = "https://catbox-mnib.onrender.com/flux";
    const response = await axios.get(apiUrl, {
      params: { prompt },
      responseType: "arraybuffer"
    });

    const cachePath = path.join(__dirname, "cache", `flux_${Date.now()}.png`);
    
    if (!fs.existsSync(path.join(__dirname, "cache"))) {
      fs.mkdirSync(path.join(__dirname, "cache"), { recursive: true });
    }

    fs.writeFileSync(cachePath, response.data);

    api.unsendMessage(waitMsg.messageID);

    await api.sendMessage(
      {
        body: `⌬ ━━ 𝗞𝗜𝗥𝗔 PIC ━━ ⌬\n\n✅ تم توليد الصورة بنجاح\n\n📝 الوصف: ${prompt}`,
        attachment: fs.createReadStream(cachePath)
      },
      threadID,
      () => fs.unlinkSync(cachePath),
      messageID
    );

  } catch (error) {
    console.error("توليد - خطأ:", error);
    return api.sendMessage(
      `⌬ ━━ 𝗞𝗜𝗥𝗔 PIC ━━ ⌬\n\n❌ حدث خطأ أثناء توليد الصورة\n📝 ${error.message}`,
      threadID,
      messageID
    );
  }
};
