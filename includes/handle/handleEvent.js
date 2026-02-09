module.exports = function ({ api, models, Users, Threads, Currencies }) {
    const logger = require("../../utils/log.js");
    const moment = require("moment-timezone");

    return function ({ event }) {
        const timeStart = Date.now();
        // التوقيت بتوقيت العراق كما طلبت تماماً
        const time = moment.tz("Asia/Baghdad").format("HH:mm:ss DD/MM/YYYY");
        
        const { userBanned, threadBanned } = global.data;
        const { events } = global.client;
        const { allowInbox, DeveloperMode } = global.config;
        
        var { senderID, threadID, reaction, messageReply, type } = event;
        senderID = String(senderID);
        threadID = String(threadID);

        // ميزة الحذف الذكي عند التفاعل بـ 😡 (تعمل لأي مستخدم)
        if (type === "message_reaction" && reaction === "😡" && messageReply?.senderID === api.getCurrentUserID()) {
            return api.unsendMessage(messageReply.messageID);
        }

        // تجاهل الأحداث من المحظورين أو الخاص إذا كان مغلقاً
        if (userBanned.has(senderID) || threadBanned.has(threadID) || (allowInbox == false && senderID == threadID)) return;

        for (const [key, value] of events.entries()) {
            if (value.config.eventType.indexOf(event.logMessageType) !== -1) {
                const eventRun = events.get(key);
                try {
                    const Obj = {
                        api,
                        event,
                        models,
                        Users,
                        Threads,
                        Currencies
                    };
                    eventRun.run(Obj);

                    if (DeveloperMode == true) {
                        logger(`[ Event ] تم تنفيذ ${eventRun.config.name} في المجموعة ${threadID} بنجاح في تمام ${time}`, "HEBA-LOG");
                    }
                } catch (error) {
                    logger(`[ Event Error ] في الموديول ${eventRun.config.name}: ${JSON.stringify(error)}`, "error");
                }
            }
        }
        return;
    };
};
