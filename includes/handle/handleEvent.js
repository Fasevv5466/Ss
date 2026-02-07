module.exports = function ({ api, models, Users, Threads, Currencies }) {
    const logger = require("../../utils/log.js");
    const moment = require("moment-timezone");
    
    // نظام تحليل الأحداث في الوقت الحقيقي
    const REAL_TIME_ANALYZER = {
        eventPatterns: new Map(),
        anomalyDetection: new Map(),
        
        async analyzeRealTime(event) {
            const analysis = {
                eventType: event.logMessageType,
                threadID: event.threadID,
                senderID: event.senderID,
                timestamp: Date.now(),
                riskScore: 0,
                recommendations: [],
                autoActions: []
            };
            
            // تحليل الأنماط
            const patterns = await this.detectPatterns(event);
            analysis.patterns = patterns;
            
            // كشف الشذوذ
            const anomalies = this.detectAnomalies(event);
            analysis.anomalies = anomalies;
            
            // حساب درجة الخطورة
            analysis.riskScore = this.calculateRiskScore(event, patterns, anomalies);
            
            // توليد التوصيات
            analysis.recommendations = await this.generateRecommendations(event, analysis);
            
            // تحديد الإجراءات التلقائية
            analysis.autoActions = this.determineAutoActions(analysis);
            
            return analysis;
        },
        
        async detectPatterns(event) {
            const patterns = [];
            const threadID = event.threadID;
            
            // نمط 1: تكرار الأحداث
            const eventKey = `${threadID}_${event.logMessageType}`;
            const eventCount = this.eventPatterns.get(eventKey) || 0;
            this.eventPatterns.set(eventKey, eventCount + 1);
            
            if (eventCount > 5) {
                patterns.push({
                    type: "EVENT_REPETITION",
                    count: eventCount,
                    severity: "MEDIUM"
                });
            }
            
            // نمط 2: تغيير الإدارة المتكرر
            if (event.logMessageType === "log:thread-admins") {
                patterns.push({
                    type: "ADMIN_CHANGE",
                    action: event.logMessageData?.ADMIN_EVENT,
                    target: event.logMessageData?.TARGET_ID
                });
            }
            
            return patterns;
        },
        
        detectAnomalies(event) {
            const anomalies = [];
            const hour = moment().tz("Asia/Baghdad").hour();
            
            // شذوذ 1: أحداث في أوقات غير معتادة
            if (hour >= 1 && hour <= 5) {
                anomalies.push({
                    type: "UNUSUAL_TIME",
                    hour: hour,
                    severity: "LOW"
                });
            }
            
            // شذوذ 2: خروج متكرر
            if (event.logMessageType === "log:unsubscribe") {
                const leftUser = event.logMessageData?.leftParticipantFbId;
                const anomalyKey = `LEAVE_${threadID}_${leftUser}`;
                const leaveCount = this.anomalyDetection.get(anomalyKey) || 0;
                
                if (leaveCount > 2) {
                    anomalies.push({
                        type: "FREQUENT_LEAVER",
                        user: leftUser,
                        count: leaveCount,
                        severity: "HIGH"
                    });
                }
                
                this.anomalyDetection.set(anomalyKey, leaveCount + 1);
            }
            
            return anomalies;
        },
        
        calculateRiskScore(event, patterns, anomalies) {
            let score = 0;
            
            // نقاط لأنواع الأحداث
            const eventScores = {
                "log:unsubscribe": 30,
                "log:subscribe": 20,
                "log:thread-admins": 25,
                "log:thread-name": 10
            };
            
            score += eventScores[event.logMessageType] || 5;
            
            // إضافة نقاط للأنماط
            patterns.forEach(pattern => {
                if (pattern.severity === "HIGH") score += 30;
                if (pattern.severity === "MEDIUM") score += 15;
                if (pattern.severity === "LOW") score += 5;
            });
            
            // إضافة نقاط للشذوذ
            anomalies.forEach(anomaly => {
                if (anomaly.severity === "HIGH") score += 40;
                if (anomaly.severity === "MEDIUM") score += 20;
                if (anomaly.severity === "LOW") score += 10;
            });
            
            return Math.min(score, 100);
        },
        
        async generateRecommendations(event, analysis) {
            const recommendations = [];
            
            if (analysis.riskScore > 70) {
                recommendations.push("🔴 إرسال تنبيه عاجل للمطور");
                recommendations.push("📊 تسجيل الحدث في السجلات الحرجة");
            }
            
            if (analysis.riskScore > 50) {
                recommendations.push("🟡 مراقبة المجموعة عن كثب");
                recommendations.push("👥 التحقق من سلوك الأعضاء");
            }
            
            if (event.logMessageType === "log:unsubscribe" && 
                event.logMessageData?.leftParticipantFbId === api.getCurrentUserID()) {
                recommendations.push("🚨 البوت تم طرده من المجموعة");
                recommendations.push("📞 الاتصال الفوري بالمطور");
            }
            
            return recommendations;
        },
        
        determineAutoActions(analysis) {
            const actions = [];
            
            if (analysis.riskScore > 80) {
                actions.push("LOG_CRITICAL_EVENT");
                actions.push("NOTIFY_ADMIN_IMMEDIATELY");
            }
            
            if (analysis.anomalies.some(a => a.type === "FREQUENT_LEAVER" && a.severity === "HIGH")) {
                actions.push("FLAG_USER");
            }
            
            return actions;
        }
    };

    return async function ({ event }) {
        const timeStart = Date.now();
        const time = moment.tz("Asia/Baghdad").format("HH:mm:ss DD/MM/YYYY");
        
        const { userBanned, threadBanned } = global.data;
        const { events } = global.client;
        const { allowInbox, DeveloperMode } = global.config;
        
        var { senderID, threadID } = event;
        senderID = String(senderID);
        threadID = String(threadID);
        
        // تجاهل الأحداث من المحظورين أو الخاص إذا كان مغلقاً
        if (userBanned.has(senderID) || threadBanned.has(threadID) || (allowInbox == false && senderID == threadID)) {
            return;
        }
        
        // تحليل الحدث في الوقت الحقيقي
        const realTimeAnalysis = await REAL_TIME_ANALYZER.analyzeRealTime(event);
        
        // معالجة الإجراءات التلقائية
        if (realTimeAnalysis.autoActions.includes("NOTIFY_ADMIN_IMMEDIATELY") && global.config.ADMINBOT?.[0]) {
            const alertMsg = `🚨 تنبيه عاجل\n\n` +
                           `🎯 الحدث: ${event.logMessageType}\n` +
                           `👥 المجموعة: ${threadID}\n` +
                           `📊 درجة الخطورة: ${realTimeAnalysis.riskScore}/100\n` +
                           `⏰ الوقت: ${time}`;
            
            api.sendMessage(alertMsg, global.config.ADMINBOT[0]);
        }
        
        // البحث عن الأحداث المسجلة للتعامل مع هذا الحدث
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
                        Currencies,
                        // إضافة الأنظمة المتقدمة
                        realTimeAnalyzer: REAL_TIME_ANALYZER,
                        analysis: realTimeAnalysis,
                        // أدوات مساعدة
                        getTime: () => time,
                        getRiskLevel: () => realTimeAnalysis.riskScore > 70 ? "HIGH" : realTimeAnalysis.riskScore > 40 ? "MEDIUM" : "LOW"
                    };
                    
                    // تنفيذ الحدث
                    eventRun.run(Obj);
                    
                    // تسجيل التنفيذ الناجح
                    const execTime = Date.now() - timeStart;
                    
                    if (DeveloperMode == true) {
                        logger(
                            `[ EVENT ] ${eventRun.config.name} تم في ${execTime}ms | ` +
                            `المجموعة: ${threadID} | الخطورة: ${realTimeAnalysis.riskScore}`,
                            "EVENT-LOG"
                        );
                    }
                    
                } catch (error) {
                    logger(`[ EVENT ERROR ] ${eventRun.config.name}: ${error.message}`, "error");
                    
                    // إرسال تقرير الخطأ
                    if (DeveloperMode) {
                        const errorReport = `🔧 خطأ في الحدث\n\n` +
                                          `📌 الموديول: ${eventRun.config.name}\n` +
                                          `🎯 الحدث: ${event.logMessageType}\n` +
                                          `📝 الخطأ: ${error.message}\n` +
                                          `👥 المجموعة: ${threadID}\n` +
                                          `📊 درجة الخطورة: ${realTimeAnalysis.riskScore}`;
                        
                        if (global.config.ADMINBOT?.[0]) {
                            api.sendMessage(errorReport, global.config.ADMINBOT[0]);
                        }
                    }
                }
            }
        }
        
        return;
    };
};
