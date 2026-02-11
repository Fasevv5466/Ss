const path = require("path");
const mongoPath = path.join(process.cwd(), "includes", "mongodb.js");
const mongoDB = require(mongoPath);

module.exports = {
    config: {
        name: "xpControl",
        eventType: ["message", "message_reply"],
        version: "3.0.0",
        author: "Kira AI - Enhanced by Ayman",
        description: "نظام XP محسّن مع إشعارات Level Up"
    },

    handleEvent: async function({ api, event }) {
        const { senderID, body, type, threadID } = event;
        const prefix = global.config.PREFIX || ".";

        // 1. تجاهل رسائل البوت، الرسائل الفارغة، والأوامر
        if (!senderID || 
            senderID == api.getCurrentUserID() || 
            !body || 
            body.trim().length === 0 ||
            body.startsWith(prefix) || 
            type == "log:subscribe" || 
            type == "log:unsubscribe") {
            return;
        }

        try {
            // 2. حساب XP بناءً على طول الرسالة
            const baseXP = 2;
            const lengthBonus = Math.min(Math.floor(body.length / 50), 3); // بونص حسب الطول (ماكس 3)
            const totalXP = baseXP + lengthBonus;

            // 3. تحديث MongoDB وجلب النتيجة
            const result = await mongoDB.addExp(senderID, totalXP);

            if (!result) return;

            // 4. إشعار Level Up
            if (result.isLevelUp) {
                const { level, rank, bonusMoney } = result;
                
                let message = `🎉 ━━━━ 𝗟𝗘𝗩𝗘𝗟 𝗨𝗣 ━━━━ 🎉\n\n`;
                message += `👤 مبروك!\n`;
                message += `⭐ المستوى الجديد: ${level}\n`;
                message += `${rank.emoji} الرتبة: ${rank.name}\n`;
                
                if (bonusMoney > 0) {
                    message += `💰 مكافأة: +${bonusMoney.toLocaleString()} $\n`;
                }
                
                message += `\n✨ استمر في التفاعل للوصول للمستوى التالي!`;

                api.sendMessage(message, threadID);
            }

            // 5. إشعار خاص للرتب الكبيرة (اختياري)
            if (result.isLevelUp && result.level % 10 === 0) {
                setTimeout(() => {
                    api.sendMessage(
                        `🌟 ━━━━━━━━━━━━━━ 🌟\n\n` +
                        `🏆 إنجاز استثنائي!\n` +
                        `تهانينا على الوصول للمستوى ${result.level}!\n\n` +
                        `${result.rank.emoji} أنت الآن ${result.rank.name}!`,
                        threadID
                    );
                }, 1500);
            }

        } catch (err) {
            console.error("⌬ ━━ [XP CLOUD ERROR] ━━ ⌬");
            console.error(`Timestamp: ${new Date().toISOString()}`);
            console.error(`User ID: ${senderID}`);
            console.error(`Thread ID: ${threadID}`);
            console.error(`Message Length: ${body?.length || 0}`);
            console.error(`Error: ${err.message}`);
            console.error(`Stack: ${err.stack}`);
        }
    }
};
