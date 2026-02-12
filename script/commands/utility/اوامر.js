module.exports.config = {
  name: "اوامر",
  version: "10.3.0",
  hasPermssion: 0,
  credits: "ayman",
  description: "قائمة الأوامر بنظام الرد المباشر",
  commandCategory: "utility",
  usages: "اوامر",
  cooldowns: 5
};

module.exports.handleReply = async function({ api, event, handleReply }) {
  const { threadID, messageID, body, senderID } = event;
  
  // التأكد أن الشخص اللي رد هو نفسه اللي طلب الأمر
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

  // معالجة خيار الرجوع
  if (body.toLowerCase() === "رجوع" || body === "رجـوع") {
     api.unsendMessage(handleReply.messageID);
     return module.exports.run({ api, event });
  }

  const choice = categories[body];
  if (!choice) return; // إذا الرد مو رقم من القائمة يتجاهله

  // جلب الأوامر المتاحة في السيرفر وتصفيتها حسب الفئة
  const categoryCommands = [];
  for (const [name, command] of global.client.commands) {
    if (command.config.commandCategory.toLowerCase() === choice.id.toLowerCase()) {
      categoryCommands.push(command.config.name);
    }
  }

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
      name: "اوامر", // يجب أن يطابق اسم الكوماند تماماً
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
    if (err) return;
    global.client.handleReply.push({
      name: "اوامر",
      messageID: info.messageID,
      author: senderID
    });
  }, messageID);
};
