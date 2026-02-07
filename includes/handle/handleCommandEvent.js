module.exports = function ({ api, models, Users, Threads, Currencies }) {
    const logger = require("../../utils/log.js");
    
    // نظام تحليل الأحداث المتقدم
    const EVENT_ANALYZER = {
        eventsLog: new Map(),
        
        async analyzeEvent(event) {
            const analysis = {
                type: event.logMessageType || event.type,
                timestamp: Date.now(),
                threadID: event.threadID,
                senderID: event.senderID,
                significance: this.calculateSignificance(event),
                potentialActions: await this.suggestActions(event),
                needsAttention: this.needsImmediateAttention(event)
            };
            
            // تسجيل الحدث
            this.logEvent(analysis);
            
            return analysis;
        },
        
        calculateSignificance(event) {
            const significantEvents = [
                "log:subscribe", "log:unsubscribe", 
                "log:thread-name", "log:thread-admins"
            ];
            
            if (significantEvents.includes(event.logMessageType)) {
                return "HIGH";
            }
            
            if (event.logMessageData?.addedParticipants?.some(p => p.userFbId === api.getCurrentUserID())) {
                return "CRITICAL";
            }
            
            return "LOW";
        },
        
        async suggestActions(event) {
            const actions = [];
            
            switch (event.logMessageType) {
                case "log:subscribe":
                    actions.push("SEND_WELCOME");
                    actions.push("UPDATE_DATABASE");
                    break;
                    
                case "log:unsubscribe":
                    if (event.logMessageData?.leftParticipantFbId === api.getCurrentUserID()) {
                        actions.push("LOG_BAN");
                        actions.push("NOTIFY_ADMIN");
                    } else {
                        actions.push("UPDATE_DATABASE");
                    }
                    break;
                    
                case "log:thread-name":
                    actions.push("UPDATE_THREAD_INFO");
                    break;
                    
                case "log:thread-admins":
                    actions.push("UPDATE_ADMIN_LIST");
                    break;
            }
            
            return actions;
        },
        
        needsImmediateAttention(event) {
            // الأحداث التي تحتاج رد فوري
            const urgentEvents = [
                "log:unsubscribe:bot",
                "log:subscribe:bot"
            ];
            
            return urgentEvents.some(ue => event.logMessageType?.includes(ue));
        },
        
        logEvent(analysis) {
            const threadEvents = this.eventsLog.get(analysis.threadID) || [];
            threadEvents.push(analysis);
            
            // الاحتفاظ بآخر 100 حدث لكل مجموعة
            if (threadEvents.length > 100) {
                threadEvents.shift();
            }
            
            this.eventsLog.set(analysis.threadID, threadEvents);
        },
        
        getEventHistory(threadID, limit = 10) {
            return this.eventsLog.get(threadID)?.slice(-limit) || [];
        }
    };

    return function ({ event }) {
        const { allowInbox } = global.config;
        const { userBanned, threadBanned } = global.data;
        const { commands, eventRegistered } = global.client;
        
        var { senderID, threadID } = event;
        var senderID = String(senderID);
        var threadID = String(threadID);
        
        // التحقق من الحظر
        if (userBanned.has(senderID) || threadBanned.has(threadID) || (allowInbox == false && senderID == threadID)) {
            return;
        }
        
        // تحليل الحدث
        EVENT_ANALYZER.analyzeEvent(event).then(analysis => {
            if (analysis.significance === "CRITICAL") {
                logger(`🚨 حدث حرج: ${analysis.type} في ${threadID}`, "EVENT-ALERT");
            }
            
            // إشعار المطور بالأحداث المهمة
            if (analysis.significance === "HIGH" || analysis.significance === "CRITICAL") {
                if (global.config.ADMINBOT?.[0]) {
                    const adminMsg = `📊 حدث جديد\n\n` +
                                   `🎯 النوع: ${analysis.type}\n` +
                                   `👥 المجموعة: ${threadID}\n` +
                                   `📈 الأهمية: ${analysis.significance}\n` +
                                   `⏰ الوقت: ${new Date().toLocaleTimeString('ar-IQ')}`;
                    
                    api.sendMessage(adminMsg, global.config.ADMINBOT[0]);
                }
            }
        });
        
        // معالجة الأحداث المسجلة
        for (const eventReg of eventRegistered) {
            const cmd = commands.get(eventReg);
            
            if (!cmd) continue;
            
            // التحقق مما إذا كان الحدث يتطابق مع هذا الأمر
            if (cmd.config.eventType && !cmd.config.eventType.includes(event.logMessageType)) {
                continue;
            }
            
            try {
                // إعداد الدالة getText الخاصة بالأحداث
                var getText2;
                if (cmd.languages && typeof cmd.languages == 'object') {
                    getText2 = (...values) => {
                        const commandModule = cmd.languages || {};
                        if (!commandModule.hasOwnProperty(global.config.language)) {
                            return `⚠️ اللغة ${global.config.language} غير مدعومة في ${cmd.config.name}`;
                        }
                        
                        var lang = cmd.languages[global.config.language][values[0]] || '';
                        for (var i = values.length; i > 1; i--) {
                            const expReg = RegExp('%' + i, 'g');
                            lang = lang.replace(expReg, values[i]);
                        }
                        return lang;
                    };
                } else {
                    getText2 = () => {};
                }
                
                // تنفيذ الحدث
                const Obj = {
                    event,
                    api,
                    models,
                    Users,
                    Threads,
                    Currencies,
                    getText: getText2,
                    eventAnalyzer: EVENT_ANALYZER,
                    eventHistory: EVENT_ANALYZER.getEventHistory(threadID, 5)
                };
                
                if (cmd.handleEvent) {
                    cmd.handleEvent(Obj);
                }
                
                // تسجيل التنفيذ الناجح
                logger(`✅ حدث ${event.logMessageType} تم معالجته بواسطة ${cmd.config.name}`, "EVENT");
                
            } catch (error) {
                logger(`❌ خطأ في معالجة الحدث ${cmd.config.name}: ${error.message}`, "error");
                
                // إرسال تقرير خطأ للمطور
                if (global.config.DeveloperMode) {
                    const errorReport = `🔧 خطأ في الحدث\n\n` +
                                      `📌 الموديول: ${cmd.config.name}\n` +
                                      `🎯 الحدث: ${event.logMessageType}\n` +
                                      `📝 الخطأ: ${error.message}\n` +
                                      `👥 المجموعة: ${threadID}`;
                    
                    if (global.config.ADMINBOT?.[0]) {
                        api.sendMessage(errorReport, global.config.ADMINBOT[0]);
                    }
                }
            }
        }
    };
};
