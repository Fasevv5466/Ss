module.exports.config = {
    name: "thread",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "ايمن",
    description: "أمر كيرا",
    commandCategory: "admin",
    usages: "thread",
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
