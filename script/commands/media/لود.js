module.exports.config = {
    name: "لود",
    version: "1.0.0",
    hasPermssion: 2, // للمطور فقط
    credits: "Ayman",
    description: "إدارة التحميل التلقائي للروابط",
    commandCategory: "developer",
    usages: ".لود [تفعيل/تعطيل]",
    cooldowns: 5
};

module.exports.run = async function({ api, event, args, Threads }) {
    const { threadID, messageID, senderID } = event;
    
    // التحقق من المطور
    if (!global.config.ADMINBOT.includes(senderID.toString())) {
        return api.sendMessage(`◈ ──« رفـض »── ◈\n◯ خاص بالمطور فقط\n◈ ─────── ◈`, threadID, messageID);
    }
    
    if (!args[0] || !['تفعيل', 'تعطيل'].includes(args[0])) {
        return api.sendMessage(`◈ ──« خـطأ »── ◈\n◯ الاستخدام: .لود [تفعيل/تعطيل]\n◈ ─────── ◈`, threadID, messageID);
    }
    
    try {
        api.setMessageReaction("⏳", messageID, () => {}, true);
        
        const status = args[0] === 'تفعيل';
        await Threads.setData(threadID, { autoDownload: status });
        
        api.setMessageReaction("✅", messageID, () => {}, true);
        return api.sendMessage(`◈ ──« الـتـحميل »── ◈\n◯ الحالة: ${status ? 'تفعيل التحميل التلقائي' : 'تعطيل التحميل التلقائي'}\n◯ المفعول: سارٍ الآن\n◈ ─────── ◈`, threadID, messageID);
        
    } catch(error) {
        api.setMessageReaction("❌", messageID, () => {}, true);
        return api.sendMessage(`❌ خطأ: ${error.message}`, threadID, messageID);
    }
};
