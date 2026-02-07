const axios = require("axios");

module.exports.config = {
    name: "ميدوريا",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Ayman",
    description: "إنشاء صورة شخصية أنمي",
    commandCategory: "pic",
    usages: ".ميدوريا [رقم] [النص]",
    cooldowns: 10
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID } = event;
    
    if (args.length < 2) {
        return api.sendMessage(`◈ ──« خـطأ »── ◈\n◯ الاستخدام: .ميدوريا [الرقم] [النص]\n◯ مثال: .ميدوريا 1 كيرا\n◈ ─────── ◈`, threadID, messageID);
    }
    
    try {
        api.setMessageReaction("⏳", messageID, () => {}, true);
        
        const id = parseInt(args[0]);
        const text = args.slice(1).join(" ");
        
        if (isNaN(id) || id < 1 || id > 50) {
            return api.sendMessage("❌ اختر رقماً بين 1 و 50", threadID, messageID);
        }
        
        const response = await axios.get(`https://api.kenliejugarap.com/avatar/?id=${id}&text=${encodeURIComponent(text)}`, {
            responseType: 'stream'
        });
        
        api.setMessageReaction("✅", messageID, () => {}, true);
        
        return api.sendMessage({
            body: `◈ ──« الـصورة »── ◈\n◯ تم التصميم بنجاح\n◯ النص: ${text}\n◈ ─────── ◈`,
            attachment: response.data
        }, threadID, messageID);
        
    } catch(error) {
        api.setMessageReaction("❌", messageID, () => {}, true);
        return api.sendMessage(`❌ خطأ: ${error.message}`, threadID, messageID);
    }
};
