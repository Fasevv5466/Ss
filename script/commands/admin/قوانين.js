module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
    const { threadID, messageID, senderID } = event;
    
    const action = args[0];
    const threadData = await Threads.getData(threadID);
    
    if (action === "set") {
        const rules = args.slice(1).join(" ");
        if (!rules) {
            return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 ADMIN ━━ ⌬\n\nاكتب القوانين", threadID, messageID);
        }
        
        threadData.rules = rules;
        await Threads.setData(threadID, threadData);
        
        return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 ADMIN ━━ ⌬\n\nتم تعيين القوانين", threadID, messageID);
    }
    
    const rules = threadData.rules || "لم يتم تعيين قوانين بعد";
    return api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 ADMIN ━━ ⌬\n\nقوانين المجموعة:\n\n${rules}`, threadID, messageID);
};

module.exports.config = {
    name: "قوانين",
    version: "2.0.0",
    hasPermssion: 1,
    credits: "ايمن",
    description: "عرض أو تعيين قوانين المجموعة",
    commandCategory: "admin",
    usages: "قوانين | قوانين set [القوانين]",
    cooldowns: 5
};
