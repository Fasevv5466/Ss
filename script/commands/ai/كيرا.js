module.exports.config = {
    name: "كيرا",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "ايمن",
    description: "نوفا — بنت عراقية ذكية وساخرة ومخلصة للمطور",
    commandCategory: "ai",
    usages: ".كيرا [النص]",
    cooldowns: 3
};

module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
    const { threadID, messageID } = event;
    
    try {
        api.sendMessage(
            "⌬ ━━ 𝗞𝗜𝗥𝗔 AI ━━ ⌬\n\n⚠️ الأمر قيد التطوير",
            threadID,
            messageID
        );
    } catch (error) {
        console.error(error);
        api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 AI ━━ ⌬\n\n❌ حدث خطأ", threadID, messageID);
    }
};
