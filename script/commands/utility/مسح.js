// ✓مسح.js
module.exports.config = {
    name: "مسح",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "ayman",
    description: "مسح رسائل المجموعة",
    commandCategory: "utility",
    usages: ".مسح [العدد]",
    cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID } = event;
    
    try {
        const amount = parseInt(args[0]) || 10;
        
        if (amount > 100) {
            return api.sendMessage(`📓 ───────────────
  ┝   1. الحد الأقصى: 100 رسالة
📓 ───────────────`, threadID, (err, info) => {
                if (!err) {
                    api.setMessageReaction("👍", info.messageID, () => {}, true);
                }
            }, messageID);
        }
        
        const messages = await api.getThreadHistory(threadID, amount + 1);
        const messageIDs = messages.map(m => m.messageID);
        
        await api.deleteMessages(threadID, messageIDs);
        
        const confirmation = await api.sendMessage(`📓 ───────────────
  ┝   1. تم مسح ${amount} رسالة
📓 ───────────────`, threadID, (err, info) => {
            if (!err) {
                api.setMessageReaction("👍", info.messageID, () => {}, true);
            }
        });
        
        setTimeout(() => {
            api.deleteMessage(confirmation.messageID);
        }, 3000);
        
    } catch (error) {
        return api.sendMessage(`📓 ───────────────
  ┝   1. خطأ: ليس لديك الصلاحية
📓 ───────────────`, threadID, (err, info) => {
            if (!err) {
                api.setMessageReaction("👍", info.messageID, () => {}, true);
            }
        }, messageID);
    }
};
