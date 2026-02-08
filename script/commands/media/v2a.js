module.exports.config = {
    name: "v2a",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "ايمن",
    description: "Convert Video to audio ",
    commandCategory: "media",
    usages: "v2a",
    cooldowns: 5
};

module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
    const { threadID, messageID } = event;
    
    try {
        api.sendMessage(
            "⌬ ━━ 𝗞𝗜𝗥𝗔 MEDIA ━━ ⌬\n\n⚠️ الأمر قيد التطوير",
            threadID,
            messageID
        );
    } catch (error) {
        console.error(error);
        api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 MEDIA ━━ ⌬\n\n❌ حدث خطأ", threadID, messageID);
    }
};
