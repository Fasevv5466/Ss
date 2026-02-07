module.exports = function ({ api, models, Users, Threads, Currencies }) {
    const logger = require("../../utils/log.js");
    
    // نظام التفاعلات المتقدم
    const ADVANCED_REACTION_SYSTEM = {
        reactionAnalytics: new Map(),
        userReactionPatterns: new Map(),
        popularReactions: new Map(),
        
        async analyzeReaction(event) {
            const { reaction, senderID, userID, threadID, messageID } = event;
            
            const analysis = {
                reaction: reaction,
                sender: senderID,
                target: userID,
                thread: threadID,
                message: messageID,
                timestamp: Date.now(),
                sentiment: this.analyzeSentiment(reaction),
                popularity: await this.checkPopularity(threadID, reaction),
                pattern: await this.detectPattern(senderID, reaction, threadID)
            };
            
            // تحديث التحليلات
            this.updateAnalytics(analysis);
            
            return analysis;
        },
        
        analyzeSentiment(reaction) {
            const sentimentMap = {
                "😍": "EXTREMELY_POSITIVE",
                "❤️": "VERY_POSITIVE",
                "👍": "POSITIVE",
                "😮": "SURPRISE",
                "😢": "SAD",
                "😠": "ANGRY",
                "😂": "HAPPY"
            };
            
            return sentimentMap[reaction] || "NEUTRAL";
        },
        
        async checkPopularity(threadID, reaction) {
            const key = `${threadID}_${reaction}`;
            const count = this.popularReactions.get(key) || 0;
            this.popularReactions.set(key, count + 1);
            
            // إذا كان التفاعل شائعاً في هذه المجموعة
            return count > 5 ? "POPULAR" : count > 2 ? "COMMON" : "RARE";
        },
        
        async detectPattern(senderID, reaction, threadID) {
            const userKey = `${senderID}_${threadID}`;
            const userReactions = this.userReactionPatterns.get(userKey) || [];
            
            userReactions.push({
                reaction,
                timestamp: Date.now()
            });
            
            // الاحتفاظ بآخر 20 تفاعل
            if (userReactions.length > 20) {
                userReactions.shift();
            }
            
            this.userReactionPatterns.set(userKey, userReactions);
            
            // تحليل النمط
            if (userReactions.length >= 5) {
                const recentReactions = userReactions.slice(-5);
                const reactionTypes = recentReactions.map(r => r.reaction);
                
                // تحقق من التكرار
                const uniqueReactions = [...new Set(reactionTypes)];
                if (uniqueReactions.length === 1) {
                    return { type: "REPETITIVE", reaction: uniqueReactions[0] };
                }
                
                // تحقق من التنوع
                if (uniqueReactions.length >= 4) {
                    return { type: "DIVERSE", count: uniqueReactions.length };
                }
            }
            
            return { type: "NORMAL" };
        },
        
        updateAnalytics(analysis) {
            const threadKey = `${analysis.thread}_${analysis.reaction}`;
            const currentCount = this.reactionAnalytics.get(threadKey) || 0;
            this.reactionAnalytics.set(threadKey, currentCount + 1);
        },
        
        getReactionStats(threadID) {
            const stats = {
                total: 0,
                byReaction: {},
                topReaction: null,
                sentimentDistribution: {}
            };
            
            // جمع إحصائيات المجموعة
            for (const [key, count] of this.reactionAnalytics.entries()) {
                if (key.startsWith(`${threadID}_`)) {
                    const reaction = key.split('_')[1];
                    stats.total += count;
                    stats.byReaction[reaction] = count;
                }
            }
            
            // إيجاد أكثر تفاعل شيوعاً
            if (Object.keys(stats.byReaction).length > 0) {
                stats.topReaction = Object.entries(stats.byReaction)
                    .sort((a, b) => b[1] - a[1])[0];
            }
            
            return stats;
        },
        
        async generateReactionReport(threadID) {
            const stats = this.getReactionStats(threadID);
            const userCount = this.getActiveUsers(threadID);
            
            return {
                summary: `📊 ${stats.total} تفاعل في هذه المجموعة`,
                topReaction: stats.topReaction ? 
                    `🎯 أكثر تفاعل: ${stats.topReaction[0]} (${stats.topReaction[1]} مرة)` : 
                    "لا توجد تفاعلات بعد",
                activeUsers: userCount,
                recommendation: this.generateRecommendation(stats)
            };
        },
        
        getActiveUsers(threadID) {
            const users = new Set();
            
            for (const [key] of this.userReactionPatterns.entries()) {
                if (key.endsWith(`_${threadID}`)) {
                    users.add(key.split('_')[0]);
                }
            }
            
            return users.size;
        },
        
        generateRecommendation(stats) {
            if (stats.total === 0) return "شجع الأعضاء على التفاعل أكثر!";
            
            if (stats.topReaction && stats.topReaction[1] > stats.total * 0.5) {
                return "التفاعل متنوع، جيد جداً!";
            }
            
            return "حاول تنويع التفاعلات";
        }
    };

    return function ({ event }) {
        const { handleReaction, commands } = global.client;
        const { messageID, threadID, reaction, userID, senderID } = event;
        
        // تحليل التفاعل
        ADVANCED_REACTION_SYSTEM.analyzeReaction(event).then(analysis => {
            // تسجيل التفاعلات المهمة
            if (analysis.sentiment === "EXTREMELY_POSITIVE" || analysis.sentiment === "VERY_POSITIVE") {
                logger(
                    `❤️ تفاعل إيجابي قوي: ${analysis.reaction} من ${senderID} في ${threadID}`,
                    "REACTION"
                );
            }
        });
        
        if (handleReaction.length !== 0) {
            const indexOfHandle = handleReaction.findIndex(e => e.messageID == messageID);
            if (indexOfHandle < 0) return;
            
            const indexOfMessage = handleReaction[indexOfHandle];
            const handleNeedExec = commands.get(indexOfMessage.name);

            if (!handleNeedExec) {
                return api.sendMessage({
                    body: `❌ الأمر المرتبط بهذا التفاعل غير موجود\n` +
                          `🔍 التفاعل: ${reaction}\n` +
                          `📌 رسالة: ${messageID}`
                }, threadID, messageID);
            }
            
            try {
                var getText2;
                if (handleNeedExec.languages && typeof handleNeedExec.languages == 'object') {
                    getText2 = (...value) => {
                        const react = handleNeedExec.languages || {};
                        if (!react.hasOwnProperty(global.config.language)) {
                            return api.sendMessage(
                                global.getText('handleCommand', 'notFoundLanguage', handleNeedExec.config.name), 
                                threadID, 
                                messageID
                            );
                        }
                        
                        var lang = handleNeedExec.languages[global.config.language][value[0]] || '';
                        for (var i = value.length; i > 2; i--) {
                            const expReg = RegExp('%' + i, 'g');
                            lang = lang.replace(expReg, value[i]);
                        }
                        return lang;
                    };
                } else {
                    getText2 = () => {};
                }
                
                const Obj = {
                    api,
                    event,
                    models,
                    Users,
                    Threads,
                    Currencies,
                    handleReaction: indexOfMessage,
                    models: models,
                    getText: getText2,
                    // إضافة الأنظمة المتقدمة
                    reactionSystem: ADVANCED_REACTION_SYSTEM,
                    reactionAnalysis: await ADVANCED_REACTION_SYSTEM.analyzeReaction(event),
                    getReactionStats: () => ADVANCED_REACTION_SYSTEM.getReactionStats(threadID)
                };
                
                handleNeedExec.handleReaction(Obj);
                
                // تسجيل النجاح
                logger(
                    `✅ تفاعل تم معالجته: ${handleNeedExec.config.name} بواسطة ${senderID}`,
                    "REACTION-HANDLED"
                );
                
                return;
            } catch (error) {
                logger(`❌ خطأ في معالجة التفاعل: ${error.message}`, "error");
                
                return api.sendMessage({
                    body: `⚠️ خطأ في معالجة التفاعل\n` +
                          `📌 الأمر: ${handleNeedExec?.config?.name || "غير معروف"}\n` +
                          `🔧 الخطأ: ${error.message}\n` +
                          `🔄 جرب مرة أخرى`
                }, threadID, messageID);
            }
        }
    };
};
