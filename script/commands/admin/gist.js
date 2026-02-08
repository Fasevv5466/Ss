module.exports.config = {
    name: "gist",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "ايمن",
    description: "Convert code into link",
    commandCategory: "admin",
    usages: "gist",
    cooldowns: 5
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
