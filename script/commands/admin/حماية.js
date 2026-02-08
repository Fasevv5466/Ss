module.exports.config = {
    name: "حماية",
    version: "2.0.0",
    hasPermssion: 1,
    credits: "ايمن",
    description: "حماية الكروب من تغيير الادمنية",
    commandCategory: "admin",
    usages: "حماية",
    cooldowns: 0
};

module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
    const { threadID, messageID } = event;
    
    try {
        api.sendMessage(
            "⌬ ━━ 𝗞𝗜𝗥𝗔 ADMIN ━━ ⌬\n\n⚠️ الأمر قيد التطوير",
            threadID,
            messageID
        );
    } catch (error) {
        console.error(error);
        api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 ADMIN ━━ ⌬\n\n❌ حدث خطأ", threadID, messageID);
    }
};
