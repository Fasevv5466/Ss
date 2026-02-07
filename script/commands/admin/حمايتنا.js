module.exports.config = {
    name: "حمايتنا",
    version: "1.1.0",
    hasPermssion: 2, // للمطور فقط
    credits: "Ayman",
    description: "تفعيل حماية المجموعة (الاسم والصورة) مباشرة",
    commandCategory: "developer",
    usages: ".حمايتنا [تفعيل/تعطيل]",
    cooldowns: 5
};

module.exports.run = async function({ api, event, args, Threads }) {
    const { threadID, messageID, senderID } = event;
    
    // التحقق من صلاحية المطور
    if (!global.config.ADMINBOT.includes(senderID.toString())) {
        return api.sendMessage(`◈ ──« رفـض »── ◈\n◯ خاص بالمطور فقط\n◈ ─────── ◈`, threadID, messageID);
    }
    
    if (!args[0]) {
        return api.sendMessage(`◈ ──« خـطأ »── ◈\n◯ الاستخدام: .حمايتنا [تفعيل/تعطيل]\n◈ ─────── ◈`, threadID, messageID);
    }
    
    try {
        api.setMessageReaction("⏳", messageID, () => {}, true);
        
        const action = args[0];
        const status = action === 'تفعيل';
        
        if (action !== 'تفعيل' && action !== 'تعطيل') {
            return api.sendMessage("❌ اختر 'تفعيل' أو 'تعطيل' فقط", threadID, messageID);
        }

        const data = await Threads.getData(threadID) || {};
        data.protection = data.protection || {};
        
        // تفعيل أو تعطيل الكل مباشرة
        data.protection['الصورة'] = status;
        data.protection['الاسم'] = status;
        
        await Threads.setData(threadID, data);
        
        api.setMessageReaction("✅", messageID, () => {}, true);
        return api.sendMessage(`◈ ──« الـحـماية »── ◈\n◯ الحالة: ${status ? 'تم تفعيل الكل ✅' : 'تم تعطيل الكل ❌'}\n◯ تشمل: الاسم والصورة\n◈ ─────── ◈`, threadID, messageID);
        
    } catch(error) {
        api.setMessageReaction("❌", messageID, () => {}, true);
        return api.sendMessage(`❌ خطأ: ${error.message}`, threadID, messageID);
    }
};
