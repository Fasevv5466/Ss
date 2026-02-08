module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
    const { threadID, messageID, senderID, mentions } = event;
    
    if (Object.keys(mentions).length === 0) {
        return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 ADMIN ━━ ⌬\n\nعليك عمل منشن للشخص المراد حظره", threadID, messageID);
    }
    
    const threadData = await Threads.getData(threadID);
    if (!threadData.bannedUsers) threadData.bannedUsers = [];
    
    for (const userID in mentions) {
        if (!threadData.bannedUsers.includes(userID)) {
            threadData.bannedUsers.push(userID);
        }
    }
    
    await Threads.setData(threadID, threadData);
    
    return api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 ADMIN ━━ ⌬\n\nتم حظر ${Object.keys(mentions).length} شخص من استخدام البوت`, threadID, messageID);
};

module.exports.config = {
    name: "حظر",
    version: "2.0.0",
    hasPermssion: 1,
    credits: "ايمن",
    description: "حظر شخص من استخدام البوت",
    commandCategory: "admin",
    usages: "حظر [@منشن]",
    cooldowns: 3
};
