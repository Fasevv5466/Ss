module.exports.config = {
    name: "افلام",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "ايمن",
    description: "صور افلام عشوائيه",
    commandCategory: "pic",
    usages: " ",
    cooldowns: 10
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
