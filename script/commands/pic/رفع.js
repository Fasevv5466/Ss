const axios = require("axios");

module.exports.config = {
  name: "رفع",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "ايمن",
  description: "رفع الملفات إلى Catbox",
  commandCategory: "pic",
  usages: "قم بالرد على صورة أو فيديو أو صوت",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
  const { threadID, messageID, messageReply } = event;

  try {
    const attachment = messageReply?.attachments[0];
    
    if (!attachment || !attachment.url) {
      return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\n⚠️ يرجى الرد على ملف مرفق (صورة/فيديو/صوت) لرفعه", threadID, messageID);
    }

    const waitMsg = await api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\n⏳ جاري رفع الملف، يرجى الانتظار...", threadID);

    const baseApiUrl = "https://catbox-mnib.onrender.com";
    const { data } = await axios.get(`${baseApiUrl}/catbox`, {
      params: { url: attachment.url }
    });

    api.unsendMessage(waitMsg.messageID);

    if (data && data.url) {
      return api.sendMessage(
        `⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\n \n\n \n${data.url}`,
        threadID,
        messageID
      );
    } else {
      throw new Error("فشل الحصول على رابط الملف");
    }

  } catch (error) {
    console.error("رفع - خطأ:", error);
    return api.sendMessage(
      `⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\n❌ حدث خطأ أثناء رفع الملف\n📝 ${error.message}`,
      threadID,
      messageID
    );
  }
};
