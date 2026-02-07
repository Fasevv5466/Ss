module.exports.config = {
    name: "مح",
    version: "1.0.0",
    hasPermssion: 2, // للمطور فقط
    credits: "Ayman",
    description: "إزالة عضو من المجموعة (للمطور)",
    commandCategory: "developer",
    usages: ".مح [@منشن]",
    cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID, mentions, senderID } = event;
    
    // التحقق من أن المستخدم هو المطور
    if (!global.config.ADMINBOT.includes(senderID.toString())) {
        return api.sendMessage(`◈ ──« رفـض »── ◈\n◯ خاص بالمطور فقط\n◈ ─────── ◈`, threadID, messageID);
    }
    
    if (Object.keys(mentions).length === 0) {
        return api.sendMessage(`◈ ──« خـطأ »── ◈\n◯ يرجى منشن العضو\n◈ ─────── ◈`, threadID, messageID);
    }
    
    try {
        api.setMessageReaction("⏳", messageID, () => {}, true);
        
        const targetID = Object.keys(mentions)[0];
        const name = mentions[targetID].replace("@", "");
        
        await api.removeUserFromGroup(targetID, threadID);
        
        api.setMessageReaction("✅", messageID, () => {}, true);
        return api.sendMessage(`◈ ──« إزالـة »── ◈\n◯ العضو: ${name}\n◯ الحالة: تم الطرد بواسطة المطور\n◈ ─────── ◈`, threadID, messageID);
        
    } catch(error) {
        api.setMessageReaction("❌", messageID, () => {}, true);
        return api.sendMessage(`❌ خطأ: ${error.message}`, threadID, messageID);
    }
};
