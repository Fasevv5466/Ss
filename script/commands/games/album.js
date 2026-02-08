module.exports.config = {
    name: "album",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "ايمن",
    description: "Displays album options for selection.",
    commandCategory: "games",
    usages: "album",
    cooldowns: 5
};

module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
    const { threadID, messageID } = event;
    
    try {
        api.sendMessage(
            "⌬ ━━ 𝗞𝗜𝗥𝗔 GAMES ━━ ⌬\n\n⚠️ الأمر قيد التطوير",
            threadID,
            messageID
        );
    } catch (error) {
        console.error(error);
        api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 GAMES ━━ ⌬\n\n❌ حدث خطأ", threadID, messageID);
    }
};
