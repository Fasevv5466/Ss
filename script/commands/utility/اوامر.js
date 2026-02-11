module.exports.config = {
  name: "اوامر",
  version: "10.0.0",
  hasPermssion: 0,
  credits: "ayman",
  description: "قائمة الأوامر التفاعلية بالرد مع الخط الخشن",
  commandCategory: "system",
  usages: "[اوامر]",
  cooldowns: 5
};

module.exports.handleEvent = async function({ api, event }) {
  const { type, reaction, messageReply } = event;
  if (type === "message_reaction" && reaction === "😡" && messageReply?.senderID === api.getCurrentUserID()) {
    return api.unsendMessage(messageReply.messageID);
  }
};

module.exports.handleReply = async function({ api, event, handleReply }) {
  const { threadID, messageID, body, senderID } = event;
  const { author, type } = handleReply;
  if (senderID !== author) return;

  const bold = (text) => global.utils.toBoldSans(text);
  const heavy = (text) => global.utils.toBoldMath(text);
  
  // خريطة التصنيفات
  const categories = {
    "1": { id: "fun", name: "الـتـرفـيـه" },
    "2": { id: "admin", name: "الإدارة" },
    "3": { id: "developer", name: "الـمـطـور" },
    "4": { id: "games", name: "الألـعـاب" },
    "5": { id: "media", name: "الـوسـائط" },
    "6": { id: "pic", name: "الـصـور" },
    "7": { id: "utility", name: "الـخدمات" }
  };

  // العودة للقائمة الرئيسية إذا رد بكلمة "رجوع"
  if (body.toLowerCase() === "رجوع") {
     api.unsendMessage(handleReply.messageID);
     return module.exports.run({ api, event });
  }

  const choice = categories[body];
  if (!choice) return;

  const allCommands = Array.from(global.client.commands.values());
  const categoryCommands = allCommands
    .filter(cmd => cmd.config.commandCategory.toLowerCase() === choice.id.toLowerCase())
    .map(cmd => cmd.config.name);

  const msg = `⌬ ━━━━━━━━━━━━ ⌬\n   ${heavy(`𝗞𝗜𝗥𝗔 - ${choice.id.toUpperCase()}`)}\n⌬ ━━━━━━━━━━━━ ⌬\n\n` +
              `» ${bold(categoryCommands.join(" - "))}\n\n` +
              `✨ ${bold("عدد الأوامر:")} ${categoryCommands.length}\n` +
              `🔙 ${bold("رد بكلمة [رجوع] للعودة للقائمة.")}`;

  api.unsendMessage(handleReply.messageID);
  return api.sendMessage(msg, threadID, (err, info) => {
    global.client.handleReply.push({
      name: this.config.name,
      messageID: info.messageID,
      author: senderID,
      type: "category"
    });
  }, messageID);
};

module.exports.run = async function({ api, event }) {
  const { threadID, messageID, senderID } = event;
  const heavy = (text) => global.utils.toBoldMath(text);
  const bold = (text) => global.utils.toBoldSans(text);

  const menu = `⌬ ━━━━━━━━━━━━ ⌬\n      ${heavy("𝗞𝗜𝗥𝗔 𝗛𝗘𝗟𝗣")}\n⌬ ━━━━━━━━━━━━ ⌬\n\n` +
               `مرحباً بك، رد برقم الفئة المطلوبة:\n\n` +
               `𝟭. 【 ${heavy("الـتـرفـيـه")} 】\n` +
               `𝟮. 【 ${heavy("الإدارة")} 】\n` +
               `𝟯. 【 ${heavy("الـمـطـور")} 】\n` +
               `𝟰. 【 ${heavy("الألـعـاب")} 】\n` +
               `𝟱. 【 ${heavy("الـوسـائط")} 】\n` +
               `𝟲. 【 ${heavy("الـصـور")} 】\n` +
               `𝟳. 【 ${heavy("الـخدمات")} 】\n\n` +
               `💡 ${bold("قم بالرد بالرقم لتصفح الأوامر.")}`;

  return api.sendMessage(menu, threadID, (err, info) => {
    global.client.handleReply.push({
      name: this.config.name,
      messageID: info.messageID,
      author: senderID,
      type: "main"
    });
  }, messageID);
};
