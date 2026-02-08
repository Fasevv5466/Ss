module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
    const { threadID, messageID, senderID, messageReply } = event;
    
    if (!messageReply) {
        return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\nرد على الرسالة المراد حذفها", threadID, messageID);
    }
    
    const botID = api.getCurrentUserID();
    if (messageReply.senderID !== botID) {
        return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\nيمكن حذف رسائل البوت فقط", threadID, messageID);
    }
    
    api.unsendMessage(messageReply.messageID);
    return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\nتم حذف الرسالة", threadID, messageID);
};

module.exports.config = {
    name: "حذف",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "ايمن",
    description: "حذف رسالة البوت",
    commandCategory: "utility",
    usages: "حذف [رد_على_رسالة]",
    cooldowns: 3
};
