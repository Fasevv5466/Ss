module.exports.config = {
    name: "فلوسي",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Ayman",
    description: "عرض الرصيد المالي",
    commandCategory: "utility",
    usages: ".فلوسي [@منشن]",
    cooldowns: 3
};

module.exports.run = async function({ api, event, args, Currencies, Users }) {
    const { threadID, messageID, senderID, mentions } = event;
    
    try {
        api.setMessageReaction("⏳", messageID, () => {}, true);
        
        let targetID = senderID;
        let name = "أنت";
        
        if (Object.keys(mentions).length > 0) {
            targetID = Object.keys(mentions)[0];
            name = mentions[targetID].replace("@", "");
        }
        else if (args[0] && !isNaN(args[0])) {
            targetID = args[0];
            const userInfo = await Users.getInfo(targetID);
            name = userInfo.name || "مستخدم";
        }
        
        const moneyData = await Currencies.getData(targetID);
        const money = moneyData.money || 0;
        
        api.setMessageReaction("✅", messageID, () => {}, true);
        
        return api.sendMessage(`◈ ──« الـرصـيـد »── ◈
◯ الشخص: ${name}
◯ الرصيد: ${money}$
◯ الحالة: متوفر
◈ ─────── ◈`, threadID, messageID);
        
    } catch(error) {
        api.setMessageReaction("❌", messageID, () => {}, true);
        return api.sendMessage(`❌ خطأ: ${error.message}`, threadID, messageID);
    }
};
