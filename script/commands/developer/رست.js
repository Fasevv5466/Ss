module.exports.config = {
  name: "رست",
  version: "1.0.0",
  hasPermssion: 2,
  credits: "Heba",
  description: "إعادة تشغيل البوت",
  commandCategory: "developer",
  usages: "رست",
  cooldowns: 5
};

module.exports.run = async ({ api, event }) => {
  const { threadID, messageID, senderID, body } = event;

  const prefix = global.config.PREFIX || ".";
  if (!body.startsWith(prefix)) return;

  const config = global.config || {};
  const botAdmins = config.MODERATORS || config.MODERATOR || [];
  
  if (!botAdmins.includes(senderID.toString())) {
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage(
      `◈ ───« رفـض »─── ◈
│
◯ │ هـذا الأمـر
◯ │ لـلـمـطـور
◯ │ فـقـط
│
◈ ─────────────── ◈`,
      threadID, 
      messageID
    );
  }

  api.setMessageReaction("⏳", messageID, () => {}, true);
  
  return api.sendMessage(
    `◈ ───« إعـادة »─── ◈
│
◯ │ جـاري
◯ │ إعـادة
◯ │ الـتـشـغـيـل
│
◈ ─────────────── ◈`,
    threadID, 
    () => {
      setTimeout(() => {
        process.exit(1);
      }, 1500);
    }, 
    messageID
  );
};
