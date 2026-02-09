module.exports.config = {
  name: "اوامر",
  version: "3.0.0",
  hasPermssion: 0,
  credits: "ايمن",
  description: "عرض الأوامر مقسمة حسب الفئة بالرد بالرقم",
  commandCategory: "utility",
  usages: "اوامر",
  cooldowns: 5
};

module.exports.handleEvent = async function({ api, event }) {
  const { reaction, messageReply } = event;
  if (reaction === "😡" && messageReply?.senderID === api.getCurrentUserID()) {
    return api.unsendMessage(messageReply.messageID);
  }
};

module.exports.handleReply = async function({ api, event, handleReply }) {
  const { threadID, messageID, body } = event;
  const { commands } = global.client;
  const { categories, type } = handleReply;

  if (type === "chooseCategory") {
    const index = parseInt(body) - 1;
    if (isNaN(index) || index < 0 || index >= categories.length) {
      return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 ━━ ⌬\n\nالرقم غير صحيح، يرجى اختيار رقم من القائمة أعلاه.", threadID, messageID);
    }

    const category = categories[index];
    const categoryCommands = Array.from(commands.values()).filter(cmd => cmd.config.commandCategory === category);
    
    let msg = `⌬ ━━ 𝗞𝗜𝗥𝗔 ${category.toUpperCase()} ━━ ⌬\n\n`;
    msg += `الأوامر المتاحة في هذه الفئة:\n`;
    msg += `» ${categoryCommands.map(cmd => cmd.config.name).join("، ")}\n\n`;
    msg += `💡 رد بـ (😡) لحذف هذه الرسالة.`;

    api.unsendMessage(handleReply.messageID);
    return api.sendMessage(msg, threadID, messageID);
  }
};

module.exports.run = async function({ api, event }) {
  const { threadID, messageID } = event;
  const { commands } = global.client;

  // استخراج الفئات الفريدة من الأوامر
  const categories = [];
  for (const cmd of commands.values()) {
    const category = cmd.config.commandCategory;
    if (!categories.includes(category)) {
      categories.push(category);
    }
  }

  let msg = `⌬ ━━ 𝗞𝗜𝗥𝗔 𝗛𝗘𝗟𝗣 ━━ ⌬\n\n`;
  msg += `لديك ${commands.size} أمراً متاحاً.\n`;
  msg += `يرجى الرد برقم الفئة لعرض أوامرها:\n\n`;

  categories.forEach((cat, i) => {
    msg += `${i + 1}. 【 ${cat.toUpperCase()} 】\n`;
  });

  return api.sendMessage(msg, threadID, (err, info) => {
    global.client.handleReply.push({
      name: this.config.name,
      messageID: info.messageID,
      categories: categories,
      type: "chooseCategory"
    });
  }, messageID);
};
