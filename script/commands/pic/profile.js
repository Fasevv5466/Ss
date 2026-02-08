module.exports.config = {
    name: "profile",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "ايمن",
    description: "PROFILE image",
    commandCategory: "pic",
    usages: "profile",
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
