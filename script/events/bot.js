const fs = require('fs-extra');
const path = require('path');

const STATE_PATH = path.join(process.cwd(), "Heba_DB", "bot_states.json");

module.exports.config = {
    name: "botController",
    eventType: ["message"],
    version: "1.0.0",
    credits: "النظام",
    description: "التحكم بحالة ردود البوت"
};

module.exports.run = async function({ api, event }) {
    try {
        const { threadID, senderID, body, type } = event;
        
        // تجاهل الرسائل الخاصة
        if (type === "message" && (!body || !threadID)) {
            return;
        }
        
        // تحميل حالات البوت
        let botStates = { restrict1: false, restrict2: false, mute: false };
        if (fs.existsSync(STATE_PATH)) {
            botStates = fs.readJsonSync(STATE_PATH);
        }
        
        const DEVELOPER_ID = "61577861540407";
        
        // ◈ ───『 تقيد1: البوت لا يرد على احد 』─── ◈
        if (botStates.restrict1 === true) {
            // البوت لا يرد على اي احد
            return;
        }
        
        // ◈ ───『 تقيد2: البوت لا يرد على المستخدمين 』─── ◈
        if (botStates.restrict2 === true && senderID !== DEVELOPER_ID) {
            // البوت لا يرد الا على المطور
            return;
        }
        
        // ◈ ───『 سكوت: البوت مكتوم كليا 』─── ◈
        if (botStates.mute === true) {
            // البوت لا يرد على اي رسالة
            return;
        }
        
    } catch (error) {
        // تجاهل الاخطاء في النظام
        console.error("⚠️ خطأ في تحكم البوت:", error.message);
    }
};
