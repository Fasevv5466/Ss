const axios = require("axios");
const fs = require("fs-extra");

module.exports.config = {
  name: "ارسل",
  version: "1.4.1",
  hasPermssion: 2,
  credits: "ايمن",
  description: "إرسال رسالة جماعية ✨",
  commandCategory: "developer",
  usages: ".ارسل [النص]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
  const { threadID, messageID, senderID, type, messageReply } = event;

  // جلب الأيدي من الكونفيج
  const DEV_ID = global.config.ADMINBOT[0] || "61577861540407"; 
  
  if (String(senderID) !== String(DEV_ID)) return api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 DEVELOPER ━━ ⌬\n\n⚠️ هذا الأمر مخصص لمطوري فقط.`, threadID, messageID);

  let content = args.join(" ");
  if (!content && type !== "message_reply") return api.sendMessage("⚠️ اكتب نصاً للإرسال.", threadID, messageID);

  const allThreads = await api.getThreadList(100, null, ["INBOX"]);
  const targetIDs = allThreads.filter(t => t.isGroup).map(g => g.threadID);
  
  let count = 0;
  let path = __dirname + `/cache/broadcast.png`;
  let hasAttachment = false;

  if (type === "message_reply" && messageReply.attachments && messageReply.attachments[0].type === "photo") {
    const getImg = (await axios.get(messageReply.attachments[0].url, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(path, Buffer.from(getImg, "utf-8"));
    hasAttachment = true;
  }

  for (const id of targetIDs) {
    try {
      let msgObject = { body: `⌬ ━━ 𝗞𝗜𝗥𝗔 BROADCAST ━━ ⌬\n\n📢 رسالة من المطور:\n\n${content}` };
      if (hasAttachment) msgObject.attachment = fs.createReadStream(path);
      await api.sendMessage(msgObject, id);
      count++;
    } catch (e) {}
  }

  if (fs.existsSync(path)) fs.unlinkSync(path);
  return api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 DEVELOPER ━━ ⌬\n\n✅ تم الإرسال لـ ${count} مجموعة.`, threadID, messageID);
};
