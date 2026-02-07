// ✓ميمز.js
module.exports.config = {
    name: "ميمز",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "ayman",
    description: "إرسال ميمز عشوائي",
    commandCategory: "Fun",
    usages: ".ميمز",
    cooldowns: 3
};

module.exports.run = async function({ api, event }) {
    const { threadID, messageID } = event;
    
    // قائمة روابط ميمز (يمكن إضافة المزيد)
    const memes = [
        "https://i.imgur.com/example1.jpg",
        "https://i.imgur.com/example2.jpg",
        "https://i.imgur.com/example3.gif",
        // أضف رواقع حقيقية هنا
    ];
    
    const randomMeme = memes[Math.floor(Math.random() * memes.length)];
    
    try {
        await api.sendMessage({
            body: "📓 ───────────────\n  ┝  [01] ميمز عشوائي 🎭\n📓 ───────────────",
            attachment: await global.utils.getStreamFromURL(randomMeme)
        }, threadID, messageID);
        
    } catch (error) {
        return api.sendMessage("📓 ───────────────\n  ┝  [01] خطأ في تحميل الميمز\n📓 ───────────────", threadID, messageID);
    }
};
