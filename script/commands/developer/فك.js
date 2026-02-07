module.exports = {
    config: {
        name: "فك",
        version: "1.0",
        author: "XVK1C",
        role: 2, // للمشرفين فقط
        shortDescription: "إلغاء تقييد البوت",
        longDescription: "يسمح للبوت بالرد على جميع المستخدمين مرة أخرى",
        category: "developer",
        guide: {
            body: ".فك",
            example: ".فك"
        }
    },
    
    onStart: async function ({ api, event, args }) {
        const { ADMINBOT } = global.config;
        const senderID = String(event.senderID);
        
        if (!ADMINBOT.includes(senderID)) {
            return api.sendMessage("❌ هذا الأمر للمشرفين فقط", event.threadID, event.messageID);
        }
        
        global.config.BOT_RESTRICTED = false;
        
        // حفظ الإعدادات في ملف (اختياري)
        const fs = require('fs');
        const path = require('path');
        const configPath = path.join(__dirname, '../../../config.json');
        
        try {
            let config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            config.BOT_RESTRICTED = false;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        } catch (e) {
            console.log("⚠️ لم يتم حفظ الإعدادات في الملف");
        }
        
        return api.sendMessage(
            "🔓 تم إلغاء وضع التقييد\n" +
            "✅ الآن البوت يرد على جميع المستخدمين\n" +
            `🔒 للتقييد مرة أخرى: ${global.config.PREFIX}تقيد`,
            event.threadID,
            event.messageID
        );
    }
};
