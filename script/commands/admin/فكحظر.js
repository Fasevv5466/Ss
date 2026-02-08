module.exports.config = {
    name: "فكحظر",
    version: "2.0.0",
    hasPermssion: 1,
    credits: "ايمن",
    description: "فك حظر شخص",
    commandCategory: "admin",
    usages: "فكحظر [@منشن]",
    cooldowns: 3
};

module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
    api, event, args, Users, Threads, Currencies, models }) {
        const { threadID, messageID, senderID, mentions } = event;
        
        if (Object.keys(mentions).length === 0) {
            return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 ADMIN ━━ ⌬\n\nعليك عمل منشن للشخص المراد فك حظره", threadID, messageID);
        }
        
        const threadData = await Threads.getData(threadID);
        if (!threadData.bannedUsers) threadData.bannedUsers = [];
        
        for (const userID in mentions) {
            const index = threadData.bannedUsers.indexOf(userID);
            if (index !== -1) {
                threadData.bannedUsers.splice(index, 1);
            }
        }
        
        await Threads.setData(threadID, threadData);
        
        return api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 ADMIN ━━ ⌬\n\nتم فك حظر ${Object.keys(mentions).length} شخص`, threadID, messageID);
};
