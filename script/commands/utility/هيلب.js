const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "هلب",
  version: "3.0.0",
  hasPermssion: 0,
  credits: "ايمن",
  description: "قائمة المساعدة الذكية",
  commandCategory: "utility",
  usages: "هلب",
  cooldowns: 5
};

module.exports.run = async ({ api, event }) => {
  const { threadID, messageID, senderID } = event;
  const cats = ["developer", "admin", "utility", "media", "pic", "games", "fun"];
  const labels = ["المطور", "الأدمن", "أدوات", "وسائط", "صور", "ألعاب", "مرح"];

  let msg = "⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n";
  labels.forEach((l, i) => msg += `\n${i + 1}. ${l}`);
  msg += "\n\nالرد برقم الفئة لعرض الأوامر";

  return api.sendMessage(msg, threadID, (e, info) => {
    global.client.handleReply.push({
      name: this.config.name,
      messageID: info.messageID,
      author: senderID,
      cats
    });
  }, messageID);
};

module.exports.handleReply = async ({ api, event, handleReply }) => {
  const { body, senderID, threadID, messageID } = event;
  if (senderID !== handleReply.author) return;

  const index = parseInt(body) - 1;
  const cat = handleReply.cats[index];
  if (!cat) return;

  // حذف القائمة السابقة لتنظيف الدردشة
  api.unsendMessage(handleReply.messageID);

  const cmds = Array.from(global.client.commands.values())
    .filter(c => c.config.commandCategory.toLowerCase() === cat)
    .map(c => c.config.name);

  let msg = `⌬ ━━ 𝗞𝗜𝗥𝗔 ${cat.toUpperCase()} ━━ ⌬\n\n`;
  msg += cmds.map((n, i) => `『 ${i + 1} 』 ${global.config.PREFIX}${n}`).join("\n");
  msg += `\n\nعدد الأوامر: ${cmds.length}`;

  return api.sendMessage(msg, threadID, messageID);
};
