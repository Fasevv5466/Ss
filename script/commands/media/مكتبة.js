const axios = require("axios");

module.exports.config = {
    name: "مكتبة",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Ayman",
    description: "قائمة تصنيفات الفيديو",
    commandCategory: "media",
    usages: ".مكتبة [الصفحة]",
    cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID } = event;
    
    try {
        api.setMessageReaction("⏳", messageID, () => {}, true);
        
        const categories = [
            "🎬 مقاطع كوميدية",
            "🕌 مقاطع دينية", 
            "😢 مقاطع حزينة",
            "🌟 مقاطع أنمي",
            "🏃 مقاطع رياضية",
            "😎 مقاطع منوعة",
            "💑 مقاطع حب",
            "🌸 مقاطع جمالية",
            "🚗 مقاطع سيارات"
        ];
        
        const page = parseInt(args[0]) || 1;
        const limit = 5;
        const total = Math.ceil(categories.length / limit);
        
        if (page < 1 || page > total) {
            return api.sendMessage(`❌ الصفحات المتوفرة من 1 إلى ${total}`, threadID, messageID);
        }
        
        const start = (page - 1) * limit;
        const current = categories.slice(start, start + limit);
        
        let msg = `◈ ──« الـمكتبة »── ◈\n◯ الصفحة: ${page}/${total}\n\n`;
        
        current.forEach((item, i) => {
            msg += `${start + i + 1}. ${item}\n`;
        });
        
        msg += `\n◯ للتالي: .مكتبة ${page + 1}\n◈ ─────── ◈`;
        
        api.setMessageReaction("✅", messageID, () => {}, true);
        return api.sendMessage(msg, threadID, messageID);
        
    } catch(error) {
        api.setMessageReaction("❌", messageID, () => {}, true);
        return api.sendMessage(`❌ خطأ: ${error.message}`, threadID, messageID);
    }
};
