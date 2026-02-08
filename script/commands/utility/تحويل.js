module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
    const { threadID, messageID, senderID, mentions } = event;
    
    if (Object.keys(mentions).length === 0) {
        return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\nعليك عمل منشن للشخص", threadID, messageID);
    }
    
    const amount = parseInt(args[0]);
    if (isNaN(amount) || amount <= 0) {
        return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\nاكتب مبلغاً صحيحاً", threadID, messageID);
    }
    
    const senderBalance = await Currencies.getData(senderID);
    if (!senderBalance || senderBalance.money < amount) {
        return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\nرصيدك غير كافي", threadID, messageID);
    }
    
    const targetID = Object.keys(mentions)[0];
    const targetName = mentions[targetID].replace("@", "");
    
    await Currencies.decreaseMoney(senderID, amount);
    await Currencies.increaseMoney(targetID, amount);
    
    return api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\nتم تحويل ${amount.toLocaleString()} دولار إلى ${targetName}`, threadID, messageID);
};

module.exports.config = {
    name: "تحويل",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "ايمن",
    description: "تحويل الأموال",
    commandCategory: "utility",
    usages: "تحويل [المبلغ] [@منشن]",
    cooldowns: 5
};
