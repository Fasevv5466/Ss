module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
    const { threadID, messageID } = event;
    
    const threadInfo = await api.getThreadInfo(threadID);
    const adminCount = threadInfo.adminIDs.length;
    const memberCount = threadInfo.participantIDs.length;
    const threadName = threadInfo.threadName || "بدون اسم";
    
    const message = `⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\nمعلومات المجموعة:\n\nالاسم: ${threadName}\nالأعضاء: ${memberCount}\nالمشرفين: ${adminCount}\nID: ${threadID}`;
    
    return api.sendMessage(message, threadID, messageID);
};

module.exports.config = {
    name: "معلومات",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "ايمن",
    description: "معلومات المجموعة",
    commandCategory: "utility",
    usages: "معلومات",
    cooldowns: 5
};
