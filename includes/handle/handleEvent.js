/**
 * ═══════════════════════════════════════════════════════════
 * 🔧 handleEvent.js - نسخة محسّنة ومصححة
 * ═══════════════════════════════════════════════════════════
 * الغرض: معالجة جميع أحداث Events بشكل صحيح
 * التحسينات: error handling + logging + دعم الطريقتين
 * ═══════════════════════════════════════════════════════════
 */

module.exports = function ({ api, models, Users, Threads, Currencies }) {
    const logger = require("../../utils/log.js");
    const moment = require("moment-timezone");

    return async function ({ event }) {
        const timeStart = Date.now();
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
                    return;
                    
                } catch (error) {
                    console.error(`   ❌ فشل الحذف: ${error.message}`);
                    
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
        // ⚙️ معالجة الأحداث - النسخة المحسّنة
        // ════════════════════════════════════════════════════════════
        
        const currentEventType = event.type || event.logMessageType;
        let processedEvents = 0;
        
        // Logging للتتبع (في وضع التطوير فقط)
        if (DeveloperMode) {
            console.log(`\n📊 ═══ handleEvent Debug ═══`);
            console.log(`   Event Type: ${currentEventType}`);
            console.log(`   Thread: ${threadID}`);
            console.log(`   Sender: ${senderID}`);
            console.log(`   Loaded Events: ${events.size}`);
        }
        
        for (const [eventName, eventModule] of events.entries()) {
            
            // التحقق من وجود eventType
            if (!eventModule.config || !eventModule.config.eventType) {
                if (DeveloperMode) {
                    console.log(`   ⚠️ ${eventName}: مفقود eventType`);
                }
                continue;
            }
            
            const eventTypes = eventModule.config.eventType;
            
            // التحقق من تطابق نوع الحدث
            if (!eventTypes.includes(currentEventType)) {
                continue;
            }
            
            try {
                // إنشاء كائن الحدث
                const eventObject = {
                    api,
                    event,
                    models,
                    Users,
                    Threads,
                    Currencies
                };
                
                // تنفيذ الحدث (دعم الطريقتين)
                if (typeof eventModule.run === 'function') {
                    await eventModule.run(eventObject);
                    processedEvents++;
                    
                } else if (typeof eventModule.handleEvent === 'function') {
                    await eventModule.handleEvent(eventObject);
                    processedEvents++;
                    
                } else {
                    console.warn(`⚠️ Event ${eventName} لا يحتوي على run أو handleEvent`);
                    continue;
                }

                // تسجيل النجاح في وضع التطوير
                if (DeveloperMode) {
                    const executionTime = Date.now() - timeStart;
                    logger(
                        `✅ Event: ${eventName} | ` +
                        `Type: ${currentEventType} | ` +
                        `Time: ${executionTime}ms | ` +
                        `Thread: ${threadID}`, 
                        "EVENT"
                    );
                }
                
            } catch (error) {
                console.error(`\n❌ ═══ خطأ في Event: ${eventName} ═══`);
                console.error(`   الوقت: ${time}`);
                console.error(`   المجموعة: ${threadID}`);
                console.error(`   النوع: ${currentEventType}`);
                console.error(`   الخطأ: ${error.message}`);
                console.error(`   Stack:\n${error.stack}\n`);
                
                logger(
                    `❌ Event Error: ${eventName} - ${error.message}`, 
                    "error"
                );
            }
        }
        
        // Logging النتيجة النهائية
        if (DeveloperMode && processedEvents > 0) {
            const totalTime = Date.now() - timeStart;
            console.log(`   ✅ معالجة: ${processedEvents} events في ${totalTime}ms`);
            console.log(`   ═══════════════════════════\n`);
        } else if (DeveloperMode && processedEvents === 0) {
            console.log(`   ℹ️ لم يتم معالجة أي events لهذا النوع`);
            console.log(`   ═══════════════════════════\n`);
        }
        
        return;
    };
};

/**
 * ═══════════════════════════════════════════════════════════
 * 📝 التحسينات في هذه النسخة:
 * ═══════════════════════════════════════════════════════════
 * 
 * ✅ دعم كامل لـ run و handleEvent
 * ✅ error handling شامل لكل event
 * ✅ logging مفصّل في وضع التطوير
 * ✅ قياس وقت التنفيذ
 * ✅ التحقق من صحة الهيكل قبل التنفيذ
 * ✅ رسائل خطأ واضحة ومفصلة
 * ✅ عدّاد للـ events المعالجة
 * ✅ نظام حذف رسائل محسّن مع إعادة محاولة
 * 
 * ═══════════════════════════════════════════════════════════
 */
