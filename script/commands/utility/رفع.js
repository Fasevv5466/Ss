const axios = require("axios");

module.exports.config = {
  name: "رابط",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "ايمن",
  description: "رفع الصور إلى Imgur",
  commandCategory: "utility",
  usages: "قم بالرد على صورة",
  cooldowns: 5
};

module.exports.run = async function({ api, event }) {
  const { threadID, messageID, messageReply } = event;

  try {
    const attachment = messageReply?.attachments[0];

    if (!attachment || attachment.type !== "photo") {
      return api.sendMessage(
        "⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\n⚠️ يرجى الرد على صورة لرفعها",
        threadID,
        messageID
      );
    }

    const waitMsg = await api.sendMessage(
      "⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\n⏳ جاري رفع الصورة...",
      threadID
    );

    const apiUrl = "https://catbox-mnib.onrender.com/imgur";
    const { data } = await axios.get(apiUrl, {
      params: { url: attachment.url }
    });

    api.unsendMessage(waitMsg.messageID);

    if (!data || !data.link) {
      throw new Error("فشل رفع الصورة");
    }

    return api.sendMessage(
      `⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\n✅ تم رفع الصورة بنجاح\n\n🔗 الرابط:\n${data.link}`,
      threadID,
      messageID
    );

  } catch (error) {
    console.error("رابط - خطأ:", error);
    return api.sendMessage(
      `⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\n❌ حدث خطأ أثناء رفع الصورة\n📝 ${error.message}`,
      threadID,
      messageID
    );
  }
};
