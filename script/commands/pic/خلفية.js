module.exports.config = {
    name: "خلفية",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "ايمن",
    description: "خلفيات ب 1000 دولار",
    commandCategory: "pic",
    usages: "صور انمي4k ب 100$",
    cooldowns: 5
};

module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
    const { threadID, messageID } = event;
    
    try {
        api.sendMessage(
            "⌬ ━━ 𝗞𝗜𝗥𝗔 PIC ━━ ⌬\n\n⚠️ الأمر قيد التطوير",
            threadID,
            messageID
        );
    } catch (error) {
        console.error(error);
        api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 PIC ━━ ⌬\n\n❌ حدث خطأ", threadID, messageID);
    }
};
