// ════════════════════════════════════════════════════════════
// 🔧 إصلاح handleEvent.js - نسخة محسّنة
// ════════════════════════════════════════════════════════════
//
// استبدل محتوى: includes/handle/handleEvent.js بهذا الكود
//
// ════════════════════════════════════════════════════════════

module.exports = function ({ api, models, Users, Threads, Currencies }) {
    const logger = require("../../utils/log.js");
    const moment = require("moment-timezone");

    return async function ({ event }) {
        const timeStart = Date.now();
        // التوقيت بتوقيت العراق
        const time = moment.tz("Asia/Baghdad").format("HH:mm:ss DD/MM/YYYY");
        
        const { userBanned, threadBanned } = global.data;
        const { events } = global.client;
        const { allowInbox, DeveloperMode } = global.config;
        
        var { senderID, threadID, reaction, messageReply, type } = event;
        senderID = String(senderID);
        threadID = String(threadID);

        // ════════════════════════════════════════════════════════════
        // 🗑️ نظام حذف رسائل البوت المُحسّن
        // ════════════════════════════════════════════════════════════
        
        if (type === "message_reaction" && messageReply?.senderID === api.getCurrentUserID()) {
            // قائمة التفاعلات التي تؤدي للحذف
            const deleteReactions = ["👍", "😡", "🗑️", "❌", "💔", "🚫", "⛔"];
            
            if (deleteReactions.includes(reaction)) {
                console.log(`\n🗑️ ═══ طلب حذف رسالة ═══`);
                console.log(`   التفاعل: ${reaction}`);
                console.log(`   المستخدم: ${senderID}`);
                console.log(`   الرسالة: ${messageReply.messageID}`);
                console.log(`   الوقت: ${time}`);
                
                try {
                    await api.unsendMessage(messageReply.messageID);
                    console.log(`   ✅ تم الحذف بنجاح!\n`);
                    return; // توقف عن معالجة الأحداث الأخرى
                    
                } catch (error) {
                    console.error(`   ❌ فشل الحذف: ${error.message}`);
                    
                    // محاولة ثانية بعد ثانية
                    setTimeout(async () => {
                        try {
                            await api.unsendMessage(messageReply.messageID);
                            console.log(`   ✅ تم الحذف في المحاولة الثانية!\n`);
                        } catch (retryError) {
                            console.error(`   ❌ فشلت المحاولة الثانية: ${retryError.message}\n`);
                        }
                    }, 1000);
                    
                    return;
                }
            }
        }

        // ════════════════════════════════════════════════════════════
        // 🚫 فلترة المحظورين
        // ════════════════════════════════════════════════════════════
        
        if (userBanned.has(senderID) || threadBanned.has(threadID) || 
            (allowInbox == false && senderID == threadID)) {
            return;
        }

        // ════════════════════════════════════════════════════════════
        // ⚙️ معالجة الأحداث
        // ════════════════════════════════════════════════════════════
        
        for (const [key, value] of events.entries()) {
            if (value.config.eventType && 
                value.config.eventType.includes(event.type || event.logMessageType)) {
                
                const eventRun = events.get(key);
                
                try {
                    const eventObject = {
                        api,
                        event,
                        models,
                        Users,
                        Threads,
                        Currencies
                    };
                    
                    // تنفيذ الحدث
                    if (eventRun.handleEvent) {
                        await eventRun.handleEvent(eventObject);
                    } else if (eventRun.run) {
                        await eventRun.run(eventObject);
                    }

                    // تسجيل في وضع التطوير
                    if (DeveloperMode == true) {
                        const eventType = event.type || event.logMessageType || 'unknown';
                        logger(
                            `[ Event ] ${eventRun.config.name} | ` +
                            `النوع: ${eventType} | ` +
                            `المجموعة: ${threadID} | ` +
                            `${time}`, 
                            "EVENT"
                        );
                    }
                    
                } catch (error) {
                    console.error(`\n❌ ═══ خطأ في Event: ${eventRun.config.name} ═══`);
                    console.error(`   الوقت: ${time}`);
                    console.error(`   المجموعة: ${threadID}`);
                    console.error(`   الخطأ: ${error.message}`);
                    console.error(`   Stack: ${error.stack}\n`);
                    
                    logger(
                        `[ Event Error ] ${eventRun.config.name}: ${error.message}`, 
                        "error"
                    );
                }
            }
        }
        
        return;
    };
};

// ════════════════════════════════════════════════════════════
// 📝 التحسينات في هذه النسخة:
// ════════════════════════════════════════════════════════════
//
// ✅ نظام حذف محسّن مع إعادة محاولة تلقائية
// ✅ دعم 7 تفاعلات مختلفة للحذف
// ✅ Logging مفصّل لتتبع الأخطاء
// ✅ معالجة async/await صحيحة
// ✅ توافق مع handleEvent و run في الأحداث
// ✅ عدم معالجة أحداث أخرى بعد الحذف
//
// ════════════════════════════════════════════════════════════
