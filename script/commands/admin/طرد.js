module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
    const { threadID, messageID, senderID, mentions } = event;
    
    const threadInfo = await api.getThreadInfo(threadID);
    const botID = api.getCurrentUserID();
    
    if (!threadInfo.adminIDs.some(admin => admin.id == botID)) {
        return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 ADMIN ━━ ⌬\n\nالبوت يحتاج صلاحيات المشرف", threadID, messageID);
    }
    
    if (Object.keys(mentions).length === 0) {
        return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 ADMIN ━━ ⌬\n\nعليك عمل منشن للشخص المراد طرده", threadID, messageID);
    }
    
    for (const userID in mentions) {
        if (threadInfo.adminIDs.some(admin => admin.id == userID)) {
            return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 ADMIN ━━ ⌬\n\nلا يمكن طرد المشرفين", threadID, messageID);
        }
        
        await api.removeUserFromGroup(userID, threadID);
    }
    
    return api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 ADMIN ━━ ⌬\n\nتم طرد ${Object.keys(mentions).length} شخص`, threadID, messageID);
};

module.exports.config = {
    name: "طرد",
    version: "2.0.0",
    hasPermssion: 1,
    credits: "ايمن",
    description: "طرد شخص من المجموعة",
    commandCategory: "admin",
    usages: "طرد [@منشن]",
    cooldowns: 3
};
