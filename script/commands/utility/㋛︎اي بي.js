// ═══════════════════════════════════════════════════════════
// 👑 KIRA - تيد
// المطور: Ayman ♛
// الوصف: عرض المعرف الرقمي الخاص بالمجموعة
// ═══════════════════════════════════════════════════════════

module.exports.config = {
  name: "تيد",
  aliases: [],
  version: "1.1.0", 
  hasPermssion: 0,
  credits: "Ayman ♛",
  description: "عرض المعرف الرقمي الخاص بالمجموعة", 
  commandCategory: "utility",
  usages: "",
  cooldowns: 2
};

module.exports.run = async function({ api, event }) {
  const { threadID, messageID } = event;
  
  // تنسيق الرسالة لتكون واضحة وفخمة سيدي
  let msg = `┏━━━━━━ 🆔 ━━━━━━┓\n` +
            `   مُـعـرِّف الـمـجـمـوعـة\n` +
            `┗━━━━━━ 🆔 ━━━━━━┛\n\n` +
            ` ${threadID}\n\n` +
            `————————————————\n` +
            `👑 نظام السيادة الرقمي`;

  return api.sendMessage(msg, threadID, messageID);
};
