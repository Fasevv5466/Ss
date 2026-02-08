module.exports.config = {
  name: "اوامر",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "ايمن",
  description: "قائمة الأوامر",
  commandCategory: "utility",
  usages: "اوامر",
  cooldowns: 5
};

module.exports.run = async ({ api, event, senderID }) => {
  const categories = ["developer", "admin", "utility", "media", "pic", "games", "fun"];
  const arabicLabels = ["المطور", "الأدمن", "أدوات", "وسائط", "صور", "ألعاب", "مرح"];

  let msg = "⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n";
  arabicLabels.forEach((label, i) => msg += `\n${i + 1}. ${label}`);
  msg += "\n\nالرد برقم الفئة";

  return api.sendMessage(msg, event.threadID, (err, info) => {
    global.client.handleReply.push({
      name: this.config.name,
      messageID: info.messageID,
      author: event.senderID,
      categories
    });
  }, event.messageID);
};

module.exports.handleReply = async ({ api, event, handleReply }) => {
  const { threadID, messageID, body, senderID } = event;
  if (senderID !== handleReply.author) return;

  const index = parseInt(body) - 1;
  const category = handleReply.categories[index];
  if (!category) return api.sendMessage("❌ رقم غير صالح", threadID, messageID);

  api.unsendMessage(handleReply.messageID);

  const cmds = Array.from(global.client.commands.values())
    .filter(c => c.config.commandCategory.toLowerCase() === category);

  let msg = `⌬ ━━ 𝗞𝗜𝗥𝗔 ${category.toUpperCase()} ━━ ⌬\n`;
  cmds.forEach((c, i) => msg += `\n${i + 1}. ${global.config.PREFIX}${c.config.name}`);
  
  return api.sendMessage(msg + "\n\n⌬ ━━━━━━━━━━━━━━ ⌬", threadID, messageID);
};
