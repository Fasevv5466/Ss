module.exports.config = {
    name: "autotimer",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "ايمن",
    description: "সেট করা সময় অনুযায়ী স্বয়ংক্রিয়ভাবে বার্তাগুলি পাঠানো হবে!",
    commandCategory: "utility",
    usages: "autotimer",
    cooldowns: 5
};

module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
    const { threadID, messageID } = event;
    
    try {
        api.sendMessage(
            "⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\n⚠️ الأمر قيد التطوير",
            threadID,
            messageID
        );
    } catch (error) {
        console.error(error);
        api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\n❌ حدث خطأ", threadID, messageID);
    }
};
