module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
    const { threadID, messageID, senderID } = event;
    
    const userData = await Users.getData(senderID);
    const now = Date.now();
    const lastWork = userData.lastWork || 0;
    const cooldown = 60 * 60 * 1000;
    
    if (now - lastWork < cooldown) {
        const remaining = cooldown - (now - lastWork);
        const minutes = Math.floor(remaining / (60 * 1000));
        
        return api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\nعد بعد ${minutes} دقيقة`, threadID, messageID);
    }
    
    const jobs = [
        "مبرمج", "طبيب", "مهندس", "معلم", "فنان",
        "كاتب", "سائق", "طباخ", "حارس", "بائع"
    ];
    
    const job = jobs[Math.floor(Math.random() * jobs.length)];
    const amount = Math.floor(Math.random() * 300) + 100;
    
    await Currencies.increaseMoney(senderID, amount);
    userData.lastWork = now;
    await Users.setData(senderID, userData);
    
    return api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\nعملت كـ ${job} وحصلت على ${amount.toLocaleString()} دولار!`, threadID, messageID);
};

module.exports.config = {
    name: "عمل",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "ايمن",
    description: "العمل لكسب المال",
    commandCategory: "utility",
    usages: "عمل",
    cooldowns: 5
};
