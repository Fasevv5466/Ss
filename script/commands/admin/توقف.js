// ✓توقف.js
module.exports.config = {
    name: "توقف",
    version: "1.0.0",
    hasPermssion: 2,
    credits: "ayman",
    description: "إيقاف تشغيل البوت",
    commandCategory: "Admin",
    usages: ".توقف [السبب]",
    cooldowns: 0
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID, senderID } = event;
    const adminBot = global.config.ADMINBOT[0];
    
    if (String(senderID) !== String(adminBot)) {
        return api.sendMessage("📓 ───────────────\n  ┝  [01] هذا الأمر للمطور فقط\n📓 ───────────────", threadID, messageID);
    }
    
    const reason = args.join(" ") || "بدون سبب محدد";
    
    const msg = `📓 ───────────────
  ┝  [01] جاري إيقاف البوت...
  ┝  [02] السبب: ${reason}
📓 ───────────────`;
    
    await api.sendMessage(msg, threadID, messageID);
    
    // إيقاف البوت بعد 2 ثانية
    setTimeout(() => {
        process.exit(0);
    }, 2000);
};
