module.exports.config = {
  name: "اوامر",
  version: "8.0.0",
  hasPermssion: 0,
  credits: "ايمن",
  description: "عرض الأوامر بالفئات (برمجة إنجليزية واجهة عربية)",
  commandCategory: "utility", // هنا الفئة بالإنجليزية كما طلبت
  usages: "اوامر",
  cooldowns: 5
};

module.exports.handleEvent = async function({ api, event }) {
  const { reaction, messageReply } = event;
  // حذف الرسالة بصمت عند التفاعل بـ 😡
  if (reaction === "😡" && messageReply?.senderID === api.getCurrentUserID()) {
    return api.unsendMessage(messageReply.messageID);
  }
};

module.exports.handleReply = async function({ api, event, handleReply }) {
  const { threadID, messageID, body } = event;
  const { commands } = global.client;
  
  // خريطة الربط بين الرقم والفئة الإنجليزية والاسم العربي
  const categories = {
    "1": { id: "fun", name: "الـتـرفـيـه" },
    "2": { id: "admin", name: "الإدارة" },
    "3": { id: "developer", name: "الـمـطـور" },
    "4": { id: "games", name: "الألـعـاب" },
    "5": { id: "media", name: "الـوسـائط" },
    "6": { id: "pic", name: "الـصـور" },
    "7": { id: "utility", name: "الـخدمات" }
  };

  const choice = categories[body];

  if (!choice) {
    return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 ━━ ⌬\n\nعذراً، اختر رقماً من 1 إلى 7 فقط", threadID, messageID);
  }

  // جلب الأوامر التي تنتمي للفئة الإنجليزية المحددة
  const categoryCommands = Array.from(commands.values())
    .filter(cmd => cmd.config.commandCategory.toLowerCase() === choice.id)
    .map(cmd => cmd.config.name);

  let msg = `⌬ ━━ 𝗞𝗜𝗥𝗔 ${choice.name} ━━ ⌬\n\n`;
  msg += categoryCommands.length > 0 
    ? `» ${categoryCommands.join("، ")}` 
    : "لا توجد أوامر في هذه الفئة حالياً.";

  // حذف القائمة الرئيسية عند الرد
  api.unsendMessage(handleReply.messageID);
  
  return api.sendMessage(msg, threadID, messageID);
};

module.exports.run = async function({ api, event }) {
  const { threadID, messageID } = event;

  const menu = `⌬ ━━ 𝗞𝗜𝗥𝗔 𝗛𝗘𝗟𝗣 ━━ ⌬\n\n` +
               `مرحباً بك، رد برقم الفئة المطلوبة:\n\n` +
               `𝟭. 【 الـتـرفـيـه 】\n` +
               `𝟮. 【 الإدارة 】\n` +
               `𝟯. 【 الـمـطـور 】\n` +
               `𝟰. 【 الألـعـاب 】\n` +
               `𝟱. 【 الـوسـائط 】\n` +
               `𝟲. 【 الـصـور 】\n` +
               `𝟳. 【 الـخدمات 】`;

  return api.sendMessage(menu, threadID, (err, info) => {
    global.client.handleReply.push({
      name: this.config.name,
      messageID: info.messageID,
      author: event.senderID
    });
  }, messageID);
};
