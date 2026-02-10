const path = require("path");
const mongoPath = path.join(process.cwd(), "includes", "mongodb.js");
const mongoDB = require(mongoPath);

module.exports = {
    config: {
        name: "xpControl",
        eventType: ["message", "message_reply"], // يراقب كل أنواع الرسائل
        version: "2.1.0",
        author: "Kira AI"
    },

    handleEvent: async function({ api, event }) {
        const { senderID, body, type } = event;
        const prefix = global.config.PREFIX || ".";

        // 1. تجاهل رسائل البوت، الرسائل الفارغة، والأوامر (التي تبدأ ببريفكس)
        if (!senderID || 
            senderID == api.getCurrentUserID() || 
            !body || 
            body.startsWith(prefix) || 
            type == "log:subscribe" || 
            type == "log:unsubscribe") return;

        try {
            // 2. تحديث السحابة (MongoDB) مباشرة باستخدام دالة addExp اللي ربطناها
            // نزيد 2 XP لكل رسالة في صمت تام
            await mongoDB.addExp(senderID, 2);

            // تم التحديث بنجاح في قاعدة بيانات KiraDB
        } catch (err) {
            console.error("⌬ ━━ [XP CLOUD ERROR] ━━ ⌬");
            console.error(`ID: ${senderID} | Error: ${err.message}`);
        }
    }
};
