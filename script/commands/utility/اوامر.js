module.exports.config = {
  name: "help", // غيرت الاسم للإنجليزية لضمان قبول الرد في السيرفر
  version: "10.4.0",
  hasPermssion: 0,
  credits: "ayman",
  description: "قائمة الأوامر بنظام الرد المباشر",
  commandCategory: "utility",
  usages: "help",
  cooldowns: 5,
  aliases: ["اوامر", "الأوامر", "أوامر"] // تقدر تطلبه بكلمة اوامر عادي
};

module.exports.handleReply = async function({ api, event, handleReply }) {
  const { threadID, messageID, body, senderID } = event;
  
  // التحقق من هوية المستخدم
  if (String(senderID) !== String(handleReply.author)) return;

  const header = `⌬ ━━━━━━━━━━━━ ⌬`;
  const categories = {
    "1": { id: "fun", name: "الـتـرفـيـه" },
    "2": { id: "admin", name: "الإدارة" },
    "3": { id: "developer", name: "الـمـطـور" },
    "4": { id: "games", name: "الألـعـاب" },
    "5": { id: "media", name: "الـوسـائـط" },
    "6": { id: "pic", name: "الـصـور" },
    "7": { id: "utility", name: "الـخـدمـات" }
  };

  if (body.toLowerCase() === "رجوع" || body === "رجـوع") {
     api.unsendMessage(handleReply.messageID);
     return module.exports.run({ api, event });
  }

  const choice = categories[body];
  if (!choice) return;

  // جلب الأوامر
  const commands = Array.from(global.client.commands.values());
  const categoryCommands = commands
    .filter(cmd => cmd.config.commandCategory.toLowerCase() === choice.id.toLowerCase())
    .map(cmd => cmd.config.name);

  api.unsendMessage(handleReply.messageID);

  if (categoryCommands.length === 0) {
    return api.sendMessage(`${header}\n⚠️ لا تـوجـد أوامـر فـي فـئـة [ ${choice.name} ]\n${header}`, threadID, messageID);
  }

  const msg = `${header}\n      📁 فـئـة: ${choice.name}\n${header}\n\n` +
              `⪼ ${categoryCommands.join(" - ")}\n\n` +
              `💠 عـدد الأوامـر: ${categoryCommands.length}\n` +
              `💠 لـلـعـودة أرسـل: رجـوع\n` +
              `${header}`;

  return api.sendMessage(msg, threadID, (err, info) => {
    global.client.handleReply.push({
      name: "help", // نستخدم نفس الاسم البرمجي
      messageID: info.messageID,
      author: senderID
    });
  }, messageID);
};

module.exports.run = async function({ api, event }) {
  const { threadID, messageID, senderID } = event;
  const header = `⌬ ━━━━━━━━━━━━ ⌬\n      📜 قـائـمـة الأوامـر\n⌬ ━━━━━━━━━━━━ ⌬`;

  const menu = `${header}\n\n` +
               `1 ≻ الـتـرفـيـه\n` +
               `2 ≻ الإدارة\n` +
               `3 ≻ الـمـطـور\n` +
               `4 ≻ الألـعـاب\n` +
               `5 ≻ الـوسـائـط\n` +
               `6 ≻ الـصـور\n` +
               `7 ≻ الـخـدمـات\n\n` +
               `⪼ رد بـرقـم الـفـئـة لـلـعـرض.\n` +
               `⌬ ━━━━━━━━━━━━ ⌬`;

  return api.sendMessage(menu, threadID, (err, info) => {
    global.client.handleReply.push({
      name: "help",
      messageID: info.messageID,
      author: senderID
    });
  }, messageID);
};
