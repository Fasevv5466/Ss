module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
    const { threadID, messageID } = event;
    
    const now = new Date();
    const baghdadTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Baghdad"}));
    
    const hours = baghdadTime.getHours().toString().padStart(2, '0');
    const minutes = baghdadTime.getMinutes().toString().padStart(2, '0');
    const seconds = baghdadTime.getSeconds().toString().padStart(2, '0');
    
    const day = baghdadTime.getDate();
    const month = baghdadTime.getMonth() + 1;
    const year = baghdadTime.getFullYear();
    
    const message = `⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\nالوقت الحالي (بغداد):\n\nالساعة: ${hours}:${minutes}:${seconds}\nالتاريخ: ${day}/${month}/${year}`;
    
    return api.sendMessage(message, threadID, messageID);
};

module.exports.config = {
    name: "وقت",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "ايمن",
    description: "عرض الوقت والتاريخ",
    commandCategory: "utility",
    usages: "وقت",
    cooldowns: 3
};
