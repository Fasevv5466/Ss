module.exports = function ({ api, models, Users, Threads, Currencies }) {
    const logger = require("../../utils/log.js");
    const moment = require("moment-timezone");
    
    // نظام الردود المتقدم
    const ADVANCED_REPLY_SYSTEM = {
        replyChains: new Map(),
        userReplyPatterns: new Map(),
        conversationAnalytics: new Map(),
        
        async analyzeReply(event) {
            const { messageReply, threadID, senderID, messageID } = event;
            
            const analysis = {
                originalMessage: messageReply.messageID,
                replyMessage: messageID,
                sender: senderID,
                thread: threadID,
                timestamp: Date.now(),
                timeDelta: Date.now() - (messageReply.timestamp * 1000 || Date.now()),
                chainLength: await this.getChainLength(threadID, messageReply.messageID),
                conversationDepth: await this.getConversationDepth(threadID, senderID)
            };
            
            // تحديث سلاسل الردود
            this.updateReplyChain(analysis);
            
            // تحديث أنماط المستخدم
            this.updateUserPatterns(analysis);
            
            return analysis;
        },
        
        async getChainLength(threadID, originalMessageID) {
            const chainKey = `${threadID}_${originalMessageID}`;
            const chain = this.replyChains.get(chainKey) || [];
            return chain.length + 1;
        },
        
        async getConversationDepth(threadID, userID) {
            const userKey = `${threadID}_${userID}`;
            const userReplies = this.userReplyPatterns.get(userKey) || [];
            
            // حساب عمق المحادثة بناءً على تواتر الردود
            if (userReplies.length === 0) return 1;
            
            const recentHour = Date.now() - (60 * 60 * 1000);
            const recentReplies = userReplies.filter(r => r.timestamp > recentHour);
            
            if (recentReplies.length > 10) return 3; // محادثة عميقة
            if (recentReplies.length > 5) return 2;  // محادثة متوسطة
            return 1; // محادثة سطحية
        },
        
        updateReplyChain(analysis) {
            const chainKey = `${analysis.thread}_${analysis.originalMessage}`;
            const chain = this.replyChains.get(chainKey) || [];
            
            chain.push({
                replyID: analysis.replyMessage,
                sender: analysis.sender,
                timestamp: analysis.timestamp
            });
            
            // الاحتفاظ بآخر 10 ردود في السلسلة
            if (chain.length > 10) {
                chain.shift();
            }
            
            this.replyChains.set(chainKey, chain);
            
            // تحديث التحليلات
            this.updateConversationAnalytics(analysis.thread, chain.length);
        },
        
        updateUserPatterns(analysis) {
            const userKey = `${analysis.thread}_${analysis.sender}`;
            const userReplies = this.userReplyPatterns.get(userKey) || [];
            
            userReplies.push({
                timestamp: analysis.timestamp,
                replyTo: analysis.originalMessage,
                timeDelta: analysis.timeDelta
            });
            
            // الاحتفاظ بآخر 50 رد للمستخدم
            if (userReplies.length > 50) {
                userReplies.shift();
            }
            
            this.userReplyPatterns.set(userKey, userReplies);
        },
        
        updateConversationAnalytics(threadID, chainLength) {
            const analytics = this.conversationAnalytics.get(threadID) || {
                totalReplies: 0,
                longestChain: 0,
                averageChain: 0,
                activeUsers: new Set(),
                chains: []
            };
            
            analytics.totalReplies++;
            analytics.longestChain = Math.max(analytics.longestChain, chainLength);
            analytics.chains.push(chainLength);
            analytics.averageChain = analytics.chains.reduce((a, b) => a + b, 0) / analytics.chains.length;
            
            this.conversationAnalytics.set(threadID, analytics);
        },
        
        async getReplyContext(threadID, messageID) {
            // البحث عن سلسلة الرد التي تنتمي لها هذه الرسالة
            for (const [key, chain] of this.replyChains.entries()) {
                if (key.startsWith(`${threadID}_`)) {
                    const inChain = chain.find(reply => reply.replyID === messageID);
                    if (inChain) {
                        return {
                            chainLength: chain.length,
                            participants: [...new Set(chain.map(r => r.sender))],
                            duration: chain.length > 0 ? 
                                Date.now() - chain[0].timestamp : 0,
                            isActive: this.isChainActive(chain)
                        };
                    }
                }
            }
            
            return null;
        },
        
        isChainActive(chain) {
            if (chain.length === 0) return false;
            const lastReply = chain[chain.length - 1];
            return Date.now() - lastReply.timestamp < 5 * 60 * 1000; // 5 دقائق
        },
        
        async generateConversationReport(threadID) {
            const analytics = this.conversationAnalytics.get(threadID);
            if (!analytics) return null;
            
            const activeChains = await this.getActiveChains(threadID);
            
            return {
                summary: `💬 ${analytics.totalReplies} رد في ${analytics.chains.length} سلسلة محادثة`,
                stats: {
                    longestChain: analytics.longestChain,
                    averageChain: Math.round(analytics.averageChain * 10) / 10,
                    activeUsers: analytics.activeUsers.size,
                    activeChains: activeChains.length
                },
                recommendations: this.generateConversationRecommendations(analytics, activeChains)
            };
        },
        
        async getActiveChains(threadID) {
            const activeChains = [];
            
            for (const [key, chain] of this.replyChains.entries()) {
                if (key.startsWith(`${threadID}_`) && this.isChainActive(chain)) {
                    activeChains.push({
                        chainID: key.split('_')[1],
                        length: chain.length,
                        lastActive: chain[chain.length - 1].timestamp,
                        participants: [...new Set(chain.map(r => r.sender))]
                    });
                }
            }
            
            return activeChains;
        },
        
        generateConversationRecommendations(analytics, activeChains) {
            const recommendations = [];
            
            if (activeChains.length > 3) {
                recommendations.push("🎯 محادثات نشطة جداً، حافظ على التفاعل!");
            }
            
            if (analytics.averageChain < 2) {
                recommendations.push("💡 حاول تطوير المحادثات لتصير أطول");
            }
            
            if (analytics.activeUsers.size < 5 && analytics.totalReplies > 20) {
                recommendations.push("👥 عدد قليل من المشاركين، شجع الآخرين على المشاركة");
            }
            
            return recommendations.length > 0 ? recommendations : ["✅ المحادثات جيدة جداً!"];
        }
    };

    return async function ({ event }) {
        if (!event.messageReply) return;
        
        const { handleReply, commands } = global.client;
        const { messageID, threadID, messageReply } = event;
        
        // تحليل الرد
        const replyAnalysis = await ADVANCED_REPLY_SYSTEM.analyzeReply(event);
        
        if (handleReply.length !== 0) {
            const indexOfHandle = handleReply.findIndex(e => e.messageID == messageReply.messageID);
            if (indexOfHandle < 0) return;
            
            const indexOfMessage = handleReply[indexOfHandle];
            const handleNeedExec = commands.get(indexOfMessage.name);
            
            if (!handleNeedExec) {
                return api.sendMessage({
                    body: `❌ الأمر المرتبط بهذا الرد غير موجود\n` +
                          `🔍 الرسالة الأصلية: ${messageReply.messageID}\n` +
                          `📌 حاول مرة أخرى`
                }, threadID, messageID);
            }
            
            try {
                var getText2;
                if (handleNeedExec.languages && typeof handleNeedExec.languages == 'object') {
                    getText2 = (...value) => {
                        const reply = handleNeedExec.languages || {};
                        if (!reply.hasOwnProperty(global.config.language)) {
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
                    handleReply: indexOfMessage,
                    models: models,
                    getText: getText2,
                    // إضافة الأنظمة المتقدمة
                    replySystem: ADVANCED_REPLY_SYSTEM,
                    replyAnalysis: replyAnalysis,
                    getConversationContext: async () => 
                        await ADVANCED_REPLY_SYSTEM.getReplyContext(threadID, messageReply.messageID),
                    generateReport: async () => 
                        await ADVANCED_REPLY_SYSTEM.generateConversationReport(threadID)
                };
                
                handleNeedExec.handleReply(Obj);
                
                // تسجيل النجاح
                logger(
                    `✅ رد تم معالجته: ${handleNeedExec.config.name} في سلسلة طولها ${replyAnalysis.chainLength}`,
                    "REPLY-HANDLED"
                );
                
                return;
            } catch (error) {
                logger(`❌ خطأ في معالجة الرد: ${error.message}`, "error");
                
                // محاولة إرسال رسالة خطأ مفيدة
                const errorMsg = `⚠️ خطأ في معالجة الرد\n\n` +
                               `📌 الأمر: ${handleNeedExec?.config?.name || "غير معروف"}\n` +
                               `🔧 الخطأ: ${error.message}\n` +
                               `⏰ وقت الرد: ${moment(replyAnalysis.timestamp).format("HH:mm:ss")}\n` +
                               `🔄 جرب مرة أخرى أو اتصل بالمطور`;
                
                return api.sendMessage(errorMsg, threadID, messageID);
            }
        }
    };
};
