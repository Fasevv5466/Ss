module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
    const { threadID, messageID, senderID } = event;
    
    const userData = await Users.getData(senderID);
    const now = Date.now();
    const lastDaily = userData.lastDaily || 0;
    const cooldown = 24 * 60 * 60 * 1000;
    
    if (now - lastDaily < cooldown) {
        const remaining = cooldown - (now - lastDaily);
        const hours = Math.floor(remaining / (60 * 60 * 1000));
        const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
        
        return api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\nعد بعد ${hours} ساعة و ${minutes} دقيقة`, threadID, messageID);
    }
    
    const amount = Math.floor(Math.random() * 1000) + 500;
    
    await Currencies.increaseMoney(senderID, amount);
    userData.lastDaily = now;
    await Users.setData(senderID, userData);
    
    return api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\nحصلت على ${amount.toLocaleString()} دولار!`, threadID, messageID);
};

module.exports.config = {
    name: "يومي",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "ايمن",
    description: "مكافأة يومية",
    commandCategory: "utility",
    usages: "يومي",
    cooldowns: 5
};
