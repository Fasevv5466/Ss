module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
    const { threadID, messageID, senderID, mentions } = event;
    
    if (Object.keys(mentions).length === 0) {
        return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 FUN ━━ ⌬\n\nعليك عمل منشن لشخص", threadID, messageID);
    }
    
    const targetID = Object.keys(mentions)[0];
    const senderName = await Users.getNameUser(senderID);
    const targetName = mentions[targetID].replace("@", "");
    
    const percentage = Math.floor(Math.random() * 101);
    const hearts = "❤️".repeat(Math.floor(percentage / 10));
    
    let message = "";
    if (percentage < 20) message = "حب ضعيف جداً 💔";
    else if (percentage < 40) message = "حب ضعيف";
    else if (percentage < 60) message = "حب متوسط 💕";
    else if (percentage < 80) message = "حب قوي 💖";
    else message = "حب حقيقي 💗";
    
    return api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 FUN ━━ ⌬\n\n${senderName} 💘 ${targetName}\n\n${hearts}\n\nنسبة الحب: ${percentage}%\n${message}`, threadID, messageID);
};

module.exports.config = {
    name: "حب",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "ايمن",
    description: "حساب نسبة الحب",
    commandCategory: "fun",
    usages: "حب [@منشن]",
    cooldowns: 5
};
