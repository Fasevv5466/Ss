const path = require("path");
const fs = require("fs-extra");

module.exports = {
    config: {
        name: "xpControl",
        eventType: ["message", "message_reply", "message_reaction"],
        version: "2.0.0",
        author: "Kira AI"
    },

    handleEvent: async function({ api, event, Currencies }) {
        const { senderID, threadID, type, body } = event;

        // تجاهل رسائل البوت أو الأحداث الفارغة
        if (!senderID || senderID == api.getCurrentUserID() || type === "log:unsubscribe") return;

        try {
            // 1. زيادة الـ XP باستخدام الدالة الممررة من الهاندلر أو المونغو مباشرة
            // نزيد 2 XP لكل رسالة
            const mongoPath = path.join(process.cwd(), "includes", "mongodb.js");
            const mongoDB = require(mongoPath);
            
            const currentExp = await mongoDB.addExp(senderID, 2);

            // 2. التحقق من "اللفل الجديد" (كل 100 XP)
            // نستخدم الشرط (100) لضمان التحديث مرة واحدة عند كل مئة
            if (currentExp > 0 && currentExp % 100 === 0) {
                
                // جلب اسم المستخدم من قاعدة البيانات أو الفيسبوك
                const userData = await mongoDB.getUserData(senderID);
                const nameUser = userData.user.name || "عضو كيرا";
                
                // تحويل النص لـ Bold Sans باستخدام زخرفة كيرا
                const bold = (text) => global.utils.toBoldSans(text);

                // 3. تحديث اللقب في المجموعة
                const newNickname = `${nameUser} | XP: ${currentExp}`;
                
                await api.changeNickname(newNickname, threadID, senderID);

                // 4. إرسال تنبيه الفخامة (اختياري - يمكنك حذفه إذا أردت صمتاً)
                const msg = `⌬ ━━━ ${bold("LEVEL UP")} ━━━ ⌬\n\n✨ مبروك يا ${nameUser}\n🆙 ارتفع مستواك إلى: [ XP: ${currentExp} ]\n\n⌬ ━━━━━━━━━━━━━━ ⌬`;
                
                api.sendMessage(msg, threadID);
            }

        } catch (err) {
            console.error("❌ [XP Error]:", err.message);
        }
    }
};
