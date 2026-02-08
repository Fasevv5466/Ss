// ═══════════════════════════════════════════════════════════
// 👑 KIRA - تكنو
// المطور: Ayman ♛
// الوصف: واجهة تكنو سكورية تعتمد على Global Commands
// ═══════════════════════════════════════════════════════════

const { setTimeout } = require("timers/promises");

module.exports.config = {
  name: "تكنو",
  aliases: [],
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Ayman ♛",
  description: "واجهة تكنو سكورية تعتمد على Global Commands",
  commandCategory: "utility",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, Commands }) {
  const { threadID, messageID, senderID } = event;

  const categories = {
    "1": "تحليلي",
    "2": "تفاعلي",
    "3": "صور",
    "4": "سيبراني",
    "5": "ذكاء"
  };

  let msg =
`◈ ───『 T E C H N O 』─── ◈
│ واجهة النظام الأسود ⚙️

`;

  for (const i in categories) {
    msg += `${i} ⟢ ${categories[i]}\n`;
  }

  msg += `
◯ رد بالرقم فقط
◈ ─────────────── ◈`;

  const sent = await api.sendMessage(msg, threadID, messageID);

  global.client.handleReply.push({
    name: this.config.name,
    author: senderID,
    messageID: sent.messageID,
    categories
  });

  setTimeout(120000).then(() => api.unsendMessage(sent.messageID));
};

module.exports.handleReply = async function ({ api, event, handleReply, Commands }) {
  const { threadID, messageID, senderID, body } = event;
  if (senderID !== handleReply.author) return;

  const category = handleReply.categories[body.trim()];
  if (!category) {
    return api.sendMessage("⚠️ رقم غير صحيح.", threadID, messageID);
  }

  const cmds = Array.from(Commands.values())
    .filter(cmd => cmd.config.commandCategory === category)
    .map(cmd => cmd.config.name);

  let msg =
`◈ ───『 ${category} | TECHNO 』─── ◈

`;

  msg += cmds.length
    ? cmds.join(" │ ")
    : "لا توجد أوامر في هذه الفئة حالياً";

  msg += `
  
◈ ─────────────── ◈
│←› عدد الأوامر: ${cmds.length}
│←› Core: TECHNO
│←› Dev: Ayman
`;

  const sent = await api.sendMessage(msg, threadID, messageID);
  setTimeout(120000).then(() => api.unsendMessage(sent.messageID));
};
