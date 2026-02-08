module.exports.config = {
    name: "getlink",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "ايمن",
    description: "𝗚𝗲𝘁 𝗱𝗼𝘄𝗻𝗹𝗼𝗮𝗱 𝘂𝗿𝗹 𝗳𝗿𝗼𝗺 𝘃𝗶𝗱𝗲𝗼, 𝗮𝘂𝗱𝗶𝗼 𝘀𝗲𝗻𝘁 𝗳𝗿𝗼𝗺 𝗴𝗿𝗼𝘂𝗽",
    commandCategory: "games",
    usages: "getlink",
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
