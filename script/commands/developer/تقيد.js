module.exports = {
    config: {
        name: "تقيد",
        version: "1.0",
        author: "XVK1C",
        role: 2, // للمشرفين فقط
        shortDescription: "تقييد البوت من الرد على المستخدمين",
        longDescription: "يوقف البوت عن الرد على جميع المستخدمين باستثناء المشرفين",
        category: "developer",
        guide: {
            body: ".تقيد",
            example: ".تقيد"
        }
    },
    
    onStart: async function ({ api, event, args }) {
        const { ADMINBOT } = global.config;
        const senderID = String(event.senderID);
        
        if (!ADMINBOT.includes(senderID)) {
            return api.sendMessage("❌ هذا الأمر للمشرفين فقط", event.threadID, event.messageID);
        }
        
        global.config.BOT_RESTRICTED = true;
        
        // حفظ الإعدادات في ملف (اختياري)
        const fs = require('fs');
        const path = require('path');
        const configPath = path.join(__dirname, '../../../config.json');
        
        try {
            let config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            config.BOT_RESTRICTED = true;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        } catch (e) {
            console.log("⚠️ لم يتم حفظ الإعدادات في الملف");
        }
        
        return api.sendMessage(
            "🔒 تم تفعيل وضع التقييد\n" +
            "📌 الآن البوت لن يرد على أي مستخدم عادي\n" +
            "👑 فقط المشرفون يمكنهم استخدام الأوامر\n" +
            `🔓 لإلغاء التقييد: ${global.config.PREFIX}فك`,
            event.threadID,
            event.messageID
        );
    }
};
