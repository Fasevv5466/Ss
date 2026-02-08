module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
    const { threadID, messageID, senderID, mentions } = event;
    
    if (Object.keys(mentions).length === 0) {
        return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 FUN ━━ ⌬\n\nعليك عمل منشن لشخص", threadID, messageID);
    }
    
    const targetID = Object.keys(mentions)[0];
    const senderName = await Users.getNameUser(senderID);
    const targetName = mentions[targetID].replace("@", "");
    
    const percentage = Math.floor(Math.random() * 101);
    let message = "";
    
    if (percentage < 20) {
        message = "نسبة توافق ضعيفة جداً";
    } else if (percentage < 40) {
        message = "نسبة توافق ضعيفة";
    } else if (percentage < 60) {
        message = "نسبة توافق متوسطة";
    } else if (percentage < 80) {
        message = "نسبة توافق جيدة";
    } else {
        message = "نسبة توافق ممتازة";
    }
    
    const hearts = "❤️".repeat(Math.floor(percentage / 10));
    
    return api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 FUN ━━ ⌬\n\n${senderName} 💕 ${targetName}\n\n${hearts}\n\nنسبة التوافق: ${percentage}%\n${message}`, threadID, messageID);
};

module.exports.config = {
    name: "توافق",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "ايمن",
    description: "حساب نسبة التوافق بين شخصين",
    commandCategory: "fun",
    usages: "توافق [@منشن]",
    cooldowns: 5
};
