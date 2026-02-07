module.exports.config = {
    name: "شكوى",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Ayman",
    description: "إرسال شكوى للمطور",
    commandCategory: "utility",
    usages: ".شكوى [النص]",
    cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID, senderID } = event;
    
    if (!args[0]) {
        return api.sendMessage(`◈ ──« خـطأ »── ◈
◯ اكتب رسالتك
◯ مثال: .شكوى يوجد خلل
◈ ─────── ◈`, threadID, messageID);
    }
    
    try {
        api.setMessageReaction("⏳", messageID, () => {}, true);
        
        const message = args.join(" ");
        const developerID = global.config.ADMINBOT[0];
        
        if (!developerID) return api.sendMessage("❌ آيدي المطور غير متوفر", threadID);
        
        const userInfo = await api.getUserInfo(senderID);
        const userName = userInfo[senderID]?.name || "مجهول";
        
        const msgToDev = `◈ ─« شكوى جديدة »─ ◈
◯ من: ${userName}
◯ آيدي: ${senderID}
◯ جروب: ${threadID}
◯ نص: ${message}
◈ ──────── ◈`;
        
        await api.sendMessage(msgToDev, developerID);
        
        api.setMessageReaction("✅", messageID, () => {}, true);
        return api.sendMessage(`◈ ──« تـم »── ◈
◯ تم الإرسال للمطور
◯ سيتم الرد قريباً
◈ ─────── ◈`, threadID, messageID);
        
    } catch(error) {
        api.setMessageReaction("❌", messageID, () => {}, true);
        return api.sendMessage(`❌ خطأ: ${error.message}`, threadID, messageID);
    }
};
