const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "هيلب",
  version: "4.0.0",
  hasPermssion: 0,
  credits: "ايمن",
  description: "قائمة مساعدة كيرا بالصور",
  commandCategory: "utility",
  usages: "هيلب",
  cooldowns: 5
};

module.exports.run = async ({ api, event }) => {
  const { threadID, messageID, senderID } = event;
  const cats = ["developer", "admin", "utility", "media", "pic", "games", "fun"];
  const labels = ["المطور", "الأدمن", "أدوات", "وسائط", "صور", "ألعاب", "مرح"];

  // رابط صورة الخلفية للقائمة (يمكنك استبداله بأي رابط تريده)
  const imgUrl = "https://i.imgur.com/uG9M7S0.jpg"; 
  const cachePath = path.join(__dirname, "cache", "help_main.jpg");

  try {
    const res = await axios.get(imgUrl, { responseType: "arraybuffer" });
    fs.outputFileSync(cachePath, Buffer.from(res.data));

    let msg = "⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n";
    labels.forEach((l, i) => msg += `\n${i + 1}. فـئة ${l}`);
    msg += "\n\nالرد برقم الفئة لعرض الأوامر";

    return api.sendMessage({
      body: msg,
      attachment: fs.createReadStream(cachePath)
    }, threadID, (e, info) => {
      if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
      global.client.handleReply.push({
        name: this.config.name,
        messageID: info.messageID,
        author: senderID,
        cats
      });
    }, messageID);
  } catch (err) {
    return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\nحدث خطأ في جلب الصورة، سأرسل القائمة نصية:\n" + labels.join("\n"), threadID, messageID);
  }
};

module.exports.handleReply = async ({ api, event, handleReply }) => {
  const { body, senderID, threadID, messageID } = event;
  if (senderID !== handleReply.author) return;

  const index = parseInt(body) - 1;
  const cat = handleReply.cats[index];
  if (!cat) return;

  api.unsendMessage(handleReply.messageID);

  const cmds = Array.from(global.client.commands.values())
    .filter(c => c.config.commandCategory.toLowerCase() === cat)
    .map(c => c.config.name);

  let msg = `⌬ ━━ 𝗞𝗜𝗥𝗔 ${cat.toUpperCase()} ━━ ⌬\n\n`;
  if (cmds.length === 0) {
    msg += "⚠️ لا توجد أوامر حالياً.";
  } else {
    msg += cmds.map((n, i) => `『 ${i + 1} 』 ${global.config.PREFIX}${n}`).join("\n");
  }

  return api.sendMessage(msg, threadID, messageID);
};
