module.exports.config = {
  name: "اوامر",
  version: "1.5.0",
  hasPermssion: 0,
  credits: "ايمن",
  description: "عرض قائمة أوامر بوت كيرا حسب الفئات",
  commandCategory: "utility",
  usages: "اوامر",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
  const { threadID, messageID, senderID } = event;

  // تعريف الفئات بالعربي وما يقابلها بالسيستم
  const categories = [
    { name: "المطور", key: "developer" },
    { name: "الأدمن", key: "admin" },
    { name: "أدوات", key: "utility" },
    { name: "وسائط", key: "media" },
    { name: "صور", key: "pic" },
    { name: "ألعاب", key: "games" },
    { name: "مرح", key: "fun" }
  ];

  let msg = "⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\n🤖 مرحباً بك في أوامر كيرا\nإليك قائمة الفئات المتاحة:\n";
  
  categories.forEach((cat, index) => {
    msg += `\n${index + 1}. فئة الـ ${cat.name}`;
  });

  msg += "\n\n🔹 رد على الرسالة برقم الفئة لعرض أوامرها.";

  return api.sendMessage(msg, threadID, (error, info) => {
    global.client.handleReply.push({
      name: this.config.name,
      messageID: info.messageID,
      author: senderID,
      categories
    });
  }, messageID);
};

module.exports.handleReply = async function({ api, event, handleReply }) {
  const { threadID, messageID, body, senderID } = event;
  const { author, categories, messageID: replyMsgID } = handleReply;

  // التحقق من أن الشخص الذي طلب الأوامر هو من يرد
  if (senderID !== author) return;

  const index = parseInt(body) - 1;
  if (isNaN(index) || index < 0 || index >= categories.length) {
    return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n❌ يرجى اختيار رقم صحيح من القائمة.", threadID, messageID);
  }

  const selectedCategory = categories[index];
  const allCommands = Array.from(global.client.commands.values());
  
  // تصفية الأوامر حسب الفئة المختارة
  const categoryCommands = allCommands.filter(cmd => 
    cmd.config.commandCategory.toLowerCase() === selectedCategory.key
  );

  api.unsendMessage(replyMsgID); // حذف قائمة الفئات لتنظيم الشات

  let msg = `⌬ ━━ 𝗞𝗜𝗥𝗔 ${selectedCategory.key.toUpperCase()} ━━ ⌬\n\n`;
  
  if (categoryCommands.length === 0) {
    msg += "⚠️ لا توجد أوامر متوفرة في هذه الفئة حالياً.";
  } else {
    msg += `📜 أوامر فئة ${selectedCategory.name}:\n`;
    categoryCommands.forEach((cmd, i) => {
      msg += `\n${i + 1}. [ ${global.config.PREFIX}${cmd.config.name} ]\n🔹 ${cmd.config.description}\n`;
    });
  }

  msg += "\n\n⌬ ━━━━━━━━━━━━━━ ⌬";

  return api.sendMessage(msg, threadID, messageID);
};
