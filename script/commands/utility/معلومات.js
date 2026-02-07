// ✓معلومات.js
module.exports.config = {
    name: "معلومات",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "ayman",
    description: "عرض معلومات المجموعة أو المستخدم",
    commandCategory: "Utility",
    usages: ".معلومات [مجموعة/شخص]",
    cooldowns: 3
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID, senderID } = event;
    const { BOTNAME } = global.config;
    
    try {
        if (args[0] === "مجموعة") {
            const info = await api.getThreadInfo(threadID);
            const participants = info.participantIDs.length;
            const admins = info.adminIDs ? info.adminIDs.length : 0;
            
            const msg = `📓 ───────────────
  ┝  [01] اسم المجموعة: ${info.threadName}
  ┝  [02] عدد الأعضاء: ${participants}
  ┝  [03] عدد المسؤولين: ${admins}
  ┝  [04] نوع المجموعة: ${info.isGroup ? "مجموعة عادية" : "محادثة فردية"}
📓 ───────────────`;
            
            return api.sendMessage(msg, threadID, messageID);
        }
        
        // معلومات الشخص
        const userInfo = await api.getUserInfo(senderID);
        const user = userInfo[senderID];
        
        const msg = `📓 ───────────────
  ┝  [01] الاسم: ${user.name}
  ┝  [02] آيدي: ${senderID}
  ┝  [03] البوت: ${BOTNAME}
  ┝  [04] حالته: ${user.isOnline ? "🟢 متصل" : "⚫ غير متصل"}
📓 ───────────────`;
        
        return api.sendMessage(msg, threadID, messageID);
        
    } catch (error) {
        return api.sendMessage("❌ حدث خطأ أثناء جلب المعلومات", threadID, messageID);
    }
};
