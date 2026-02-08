module.exports.config = {
    name: "bank",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "ايمن",
    description: "Manage your virtual bank account",
    commandCategory: "admin",
    usages: "bank",
    cooldowns: 5
};

module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
    const { threadID, messageID } = event;
    
    try {
        // منطق الأمر الأصلي
        api.sendMessage(
            "⌬ ━━ 𝗞𝗜𝗥𝗔 ADMIN ━━ ⌬\n\n⚠️ الأمر قيد التحديث",
            threadID,
            messageID
        );
    } catch (error) {
        console.error(error);
        api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 ADMIN ━━ ⌬\n\n❌ حدث خطأ", threadID, messageID);
    }
};
