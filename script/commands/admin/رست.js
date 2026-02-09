module.exports.config = {
  name: "رست",
  version: "1.0.0",
  hasPermssion: 2,
  credits: "ايمن",
  description: "رست تشغيل البوت",
  commandCategory: "admin",
  usages: "رست",
  cooldowns: 5
};

module.exports.run = async function({ api, event }) {
  const { threadID, messageID, senderID } = event;
  const adminBot = global.config.ADMINBOT[0];

  if (senderID !== adminBot) {
    return api.sendMessage(
      "⌬ ━━ 𝗞𝗜𝗥𝗔 ADMIN ━━ ⌬\n\n❌ هذا الأمر مخصص للمطور فقط",
      threadID,
      messageID
    );
  }

  try {
    await api.sendMessage(
      "⌬ ━━ 𝗞𝗜𝗥𝗔 ADMIN ━━ ⌬\n\n🔄 جاري إعادة تشغيل البوت...",
      threadID,
      messageID
    );

    setTimeout(() => {
      process.exit(1);
    }, 2000);

  } catch (error) {
    console.error("إعادة - خطأ:", error);
    return api.sendMessage(
      `⌬ ━━ 𝗞𝗜𝗥𝗔 ADMIN ━━ ⌬\n\n❌ حدث خطأ أثناء إعادة التشغيل\n📝 ${error.message}`,
      threadID,
      messageID
    );
  }
};
