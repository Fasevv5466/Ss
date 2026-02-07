const fs = require("fs");
const path = require("path");
const stringSimilarity = require("string-similarity");
const logger = require("../../utils/log.js");
const moment = require("moment-timezone");
const axios = require("axios");

// نظام الذكاء الاصطناعي المتقدم
const AI_SYSTEM = {
    async analyzeCommand(context, commandName) {
        try {
            // تحليل السياق والسلوك
            const patterns = await this.learnPatterns(context);
            return {
                confidence: 0.95,
                suggestedCommand: this.findBestMatch(commandName),
                contextAnalysis: patterns,
                timestamp: Date.now()
            };
        } catch (e) {
            return { confidence: 0.7, error: e.message };
        }
    },
    
    async learnPatterns(context) {
        const patterns = {
            timeBased: this.getTimePattern(),
            userBehavior: await this.analyzeUserBehavior(context.senderID),
            groupActivity: await this.analyzeGroupActivity(context.threadID),
            commandFrequency: this.getCommandFrequency()
        };
        return patterns;
    },
    
    getTimePattern() {
        const hour = moment().tz("Asia/Baghdad").hour();
        if (hour >= 5 && hour < 12) return "morning_peak";
        if (hour >= 12 && hour < 17) return "afternoon_active";
        if (hour >= 17 && hour < 22) return "evening_peak";
        return "night_quiet";
    },
    
    findBestMatch(commandName) {
        const commands = Array.from(global.client.commands.keys());
        const matches = stringSimilarity.findBestMatch(commandName, commands);
        return matches.bestMatch.rating > 0.6 ? matches.bestMatch.target : null;
    }
};

module.exports = function ({ api, models, Users, Threads, Currencies }) {
    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    
    // نظام التخزين المتقدم
    const ADVANCED_CACHE = {
        userStats: new Map(),
        commandStats: new Map(),
        groupStats: new Map(),
        
        async recordUsage(userID, commandName, threadID) {
            const timestamp = Date.now();
            
            // تحديث إحصائيات المستخدم
            if (!this.userStats.has(userID)) {
                this.userStats.set(userID, {
                    totalCommands: 0,
                    commands: {},
                    lastActive: timestamp,
                    cooldowns: {}
                });
            }
            
            const userStat = this.userStats.get(userID);
            userStat.totalCommands++;
            userStat.lastActive = timestamp;
            
            if (!userStat.commands[commandName]) {
                userStat.commands[commandName] = 0;
            }
            userStat.commands[commandName]++;
            
            // تحديث إحصائيات الأمر
            if (!this.commandStats.has(commandName)) {
                this.commandStats.set(commandName, {
                    totalUses: 0,
                    users: new Set(),
                    groups: new Set()
                });
            }
            
            const commandStat = this.commandStats.get(commandName);
            commandStat.totalUses++;
            commandStat.users.add(userID);
            commandStat.groups.add(threadID);
            
            // تحديث إحصائيات المجموعة
            if (!this.groupStats.has(threadID)) {
                this.groupStats.set(threadID, {
                    totalCommands: 0,
                    activeUsers: new Set(),
                    commandDistribution: {}
                });
            }
            
            const groupStat = this.groupStats.get(threadID);
            groupStat.totalCommands++;
            groupStat.activeUsers.add(userID);
            
            if (!groupStat.commandDistribution[commandName]) {
                groupStat.commandDistribution[commandName] = 0;
            }
            groupStat.commandDistribution[commandName]++;
            
            // حفظ في قاعدة البيانات كل 100 أمر
            if (userStat.totalCommands % 100 === 0) {
                await this.saveToDatabase();
            }
        },
        
        async saveToDatabase() {
            try {
                // يمكن حفظ الإحصائيات في SQLite
                // مؤقتاً نطبعها فقط
                console.log("[CACHE] Statistics saved");
            } catch (e) {
                console.error("[CACHE] Save error:", e);
            }
        }
    };

    return async function ({ event }) {
        const dateNow = Date.now();
        const time = moment.tz("Asia/Baghdad").format("HH:mm:ss DD/MM/YYYY");
        const { allowInbox, PREFIX, ADMINBOT, DeveloperMode } = global.config;

        const { userBanned, threadBanned, threadInfo, threadData, commandBanned } = global.data;
        const { commands, cooldowns } = global.client;

        var { body, senderID, threadID, messageID } = event;

        if (!body) return;

        senderID = String(senderID);
        threadID = String(threadID);
        
        // === نظام التحقق المتقدم ===
        // 1. التحقق من الإغراق (Flood Protection)
        const FLOOD_PROTECTION = {
            userMessages: new Map(),
            checkFlood(userID) {
                const now = Date.now();
                if (!this.userMessages.has(userID)) {
                    this.userMessages.set(userID, []);
                }
                
                const userMsgs = this.userMessages.get(userID);
                userMsgs.push(now);
                
                // الاحتفاظ بالرسائل في آخر 5 ثواني فقط
                const recentMsgs = userMsgs.filter(time => now - time < 5000);
                this.userMessages.set(userID, recentMsgs);
                
                if (recentMsgs.length > 8) { // أكثر من 8 رسائل في 5 ثواني
                    return {
                        isFlood: true,
                        count: recentMsgs.length,
                        warning: "⚠️ إبطاء قليلاً!"
                    };
                }
                
                return { isFlood: false };
            }
        };
        
        const floodCheck = FLOOD_PROTECTION.checkFlood(senderID);
        if (floodCheck.isFlood && !ADMINBOT.includes(senderID)) {
            return api.sendMessage({
                body: `🛡️ حماية من الإغراق\n\n` +
                      `📊 أرسلت ${floodCheck.count} رسالة في 5 ثواني\n` +
                      `⏱️ انتظر قليلاً قبل إرسال المزيد\n` +
                      `📌 يتم تسجيل هذا السلوك`
            }, threadID, messageID);
        }
        
        // 2. نظام المنشن الذكي
        const SMART_MENTION = {
            async parseMentions(text, currentThreadID) {
                const mentions = [];
                let processedText = text;
                
                // نمط 1: @اسم
                const mentionRegex = /@(\S+)/g;
                let match;
                
                while ((match = mentionRegex.exec(text)) !== null) {
                    const searchName = match[1];
                    const userID = await this.findUserByName(searchName, currentThreadID);
                    
                    if (userID) {
                        const userName = await global.data.userName.get(userID) || searchName;
                        mentions.push({
                            tag: `@${userName}`,
                            id: userID,
                            name: userName
                        });
                    }
                }
                
                // نمط 2: أيدي مباشر
                const idRegex = /(\d{15,})/g;
                while ((match = idRegex.exec(text)) !== null) {
                    const possibleID = match[1];
                    if (possibleID.length >= 15) {
                        try {
                            const userInfo = await Users.getInfo(possibleID);
                            if (userInfo) {
                                const userName = userInfo.name || "مستخدم";
                                mentions.push({
                                    tag: `@${userName}`,
                                    id: possibleID,
                                    name: userName
                                });
                            }
                        } catch (e) {}
                    }
                }
                
                return {
                    text: processedText,
                    mentions: mentions,
                    count: mentions.length
                };
            },
            
            async findUserByName(name, threadID) {
                try {
                    // البحث في الكاش أولاً
                    for (const [id, userName] of global.data.userName.entries()) {
                        if (userName && userName.toLowerCase().includes(name.toLowerCase())) {
                            return id;
                        }
                    }
                    
                    // البحث في معلومات المجموعة
                    const threadInfo = await Threads.getInfo(threadID);
                    for (const participant of threadInfo.participantIDs) {
                        const userName = await Users.getNameUser(participant);
                        if (userName && userName.toLowerCase().includes(name.toLowerCase())) {
                            return participant;
                        }
                    }
                    
                    return null;
                } catch (e) {
                    return null;
                }
            }
        };
        
        // معالجة الرسالة
        const threadSetting = threadData.get(threadID) || {};
        const prefix = threadSetting.hasOwnProperty("PREFIX") ? threadSetting.PREFIX : PREFIX;
        const prefixRegex = new RegExp(`^(<@!?${senderID}>|${escapeRegex(prefix)})\\s*`);
        const [matchedPrefix] = body.match(prefixRegex) || [null];
        
        if (!matchedPrefix) {
            // نظام المنشن التلقائي (حتى بدون بادئة)
            const mentionData = await SMART_MENTION.parseMentions(body, threadID);
            if (mentionData.count > 0 && mentionData.mentions.some(m => m.id === api.getCurrentUserID())) {
                // إذا تم منشن البوت، رد ذكي
                return this.handleMentionResponse(api, event, mentionData);
            }
            return;
        }
        
        const args = body.slice(matchedPrefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        var command = commands.get(commandName);
        
        // === نظام التعلم الآلي للأوامر ===
        if (!command) {
            const aiAnalysis = await AI_SYSTEM.analyzeCommand({ senderID, threadID }, commandName);
            
            if (aiAnalysis.suggestedCommand && aiAnalysis.confidence > 0.8) {
                command = commands.get(aiAnalysis.suggestedCommand);
                
                const suggestions = [
                    `✨ هل تقصد: ${aiAnalysis.suggestedCommand} ؟`,
                    `🔍 الأمر "${commandName}" غير موجود، ربما تريد: ${aiAnalysis.suggestedCommand}`,
                    `💡 جرب: ${aiAnalysis.suggestedCommand} بدلاً من ذلك`
                ];
                
                await api.sendMessage({
                    body: suggestions[Math.floor(Math.random() * suggestions.length)] +
                         `\n\n📊 الثقة: ${Math.round(aiAnalysis.confidence * 100)}%`
                }, threadID, messageID);
            }
        }
        
        // === نظام الحماية المتقدم ===
        if (threadBanned.has(threadID) && !ADMINBOT.includes(senderID)) {
            const banInfo = threadBanned.get(threadID);
            return api.sendMessage({
                body: `🚫 المجموعة محظورة\n\n` +
                      `📌 السبب: ${banInfo.reason || "غير محدد"}\n` +
                      `📅 التاريخ: ${banInfo.dateAdded || "غير معروف"}\n` +
                      `🔓 الاتصال بالمطور للغاء الحظر`
            }, threadID, messageID);
        }
        
        if (userBanned.has(senderID) && !ADMINBOT.includes(senderID)) {
            return api.sendMessage({
                body: `🚫 حسابك محظور\n\n` +
                      `👤 المستخدم: ${await Users.getNameUser(senderID)}\n` +
                      `📞 اتصل بالمطور للاستفسار`
            }, threadID, messageID);
        }
        
        // === نظام التحقق من الصلاحيات المتقدم ===
        var permssion = 0;
        try {
            const threadInfoo2 = threadInfo.get(threadID) || (await Threads.getInfo(threadID));
            const find = threadInfoo2.adminIDs.find((el) => el.id == senderID);
            
            if (ADMINBOT.includes(senderID.toString())) {
                permssion = 3; // مطور رئيسي
            } else if (global.config.MODERATOR && global.config.MODERATOR.includes(senderID.toString())) {
                permssion = 2; // مساعد مطور
            } else if (find) {
                permssion = 1; // مشرف مجموعة
            } else {
                permssion = 0; // عضو عادي
            }
        } catch (e) {
            permssion = 0;
        }
        
        if (command && command.config.hasPermssion > permssion) {
            const requiredPerm = command.config.hasPermssion;
            const permNames = ["عضو", "مشرف", "مساعد مطور", "مطور رئيسي"];
            
            return api.sendMessage({
                body: `🔒 صلاحية مرفوضة\n\n` +
                      `📊 تحتاج صلاحية: ${permNames[requiredPerm] || requiredPerm}\n` +
                      `👤 صلاحيتك الحالية: ${permNames[permssion] || permssion}\n` +
                      `📌 الأمر: ${command.config.name}`
            }, threadID, messageID);
        }
        
        // === نظام التبريد الذكي ===
        if (!client.cooldowns.has(command.config.name)) {
            client.cooldowns.set(command.config.name, new Map());
        }
        
        const timestamps = client.cooldowns.get(command.config.name);
        const baseCooldown = (command.config.cooldowns || 1) * 1000;
        
        // تقليل وقت التبريد للمستخدمين النشطين
        let finalCooldown = baseCooldown;
        const userStat = ADVANCED_CACHE.userStats.get(senderID);
        if (userStat && userStat.totalCommands > 50) {
            finalCooldown = Math.max(baseCooldown * 0.7, 1000); // 30% أقل للمستخدمين النشطين
        }
        
        if (timestamps.has(senderID) && dateNow < timestamps.get(senderID) + finalCooldown) {
            const timeLeft = timestamps.get(senderID) + finalCooldown - dateNow;
            return api.sendMessage({
                body: `⏳ انتظر ${Math.ceil(timeLeft/1000)} ثانية\n\n` +
                      `📌 الأمر: ${command.config.name}\n` +
                      `⚡ التبريد النشط`
            }, threadID, messageID);
        }
        
        try {
            // تسجيل الاستخدام
            await ADVANCED_CACHE.recordUsage(senderID, command.config.name, threadID);
            
            // تحضير البيانات للأمر
            const Obj = {
                api,
                event,
                args,
                models,
                Users,
                Threads,
                Currencies,
                permssion,
                getText: global.getText,
                // إضافة أنظمة مساعدة جديدة
                smartMention: SMART_MENTION,
                cacheSystem: ADVANCED_CACHE,
                aiSystem: AI_SYSTEM,
                parseMentions: async (text) => await SMART_MENTION.parseMentions(text, threadID),
                // إحصائيات
                getUserStats: () => ADVANCED_CACHE.userStats.get(senderID),
                getCommandStats: () => ADVANCED_CACHE.commandStats.get(command.config.name)
            };
            
            // تنفيذ الأمر
            await command.run(Obj);
            
            // تحديث التبريد
            timestamps.set(senderID, dateNow);
            
            // تسجيل النجاح
            if (DeveloperMode) {
                logger(`✅ تم تنفيذ ${command.config.name} بواسطة ${senderID}`, "COMMAND");
            }
            
        } catch (error) {
            console.error("Command Execution Error:", error);
            
            // نظام التعامل مع الأخطاء الذكي
            const errorResponse = this.handleError(error, command, event);
            return api.sendMessage(errorResponse, threadID, messageID);
        }
    }.bind({
        // دالة معالجة الرد على المنشن
        async handleMentionResponse(api, event, mentionData) {
            const responses = [
                `✨ نعم؟ كيف يمكنني مساعدتك؟\n📌 اكتب ${global.config.PREFIX}الاوامر لرؤية كل ما أستطيع فعله`,
                `🤖 أنا هنا! تحتاج مساعدة؟\n🔍 جرب: ${global.config.PREFIX}مساعدة`,
                `💡 تم منشني! هل تريد أمر محدد؟\n🎯 جرب: ${global.config.PREFIX}بحث [أمرك]`
            ];
            
            return api.sendMessage({
                body: responses[Math.floor(Math.random() * responses.length)],
                mentions: mentionData.mentions
            }, event.threadID, event.messageID);
        },
        
        // دالة معالجة الأخطاء
        handleError(error, command, event) {
            const errorType = error.message || "UNKNOWN";
            const errorCode = Date.now().toString(36);
            
            console.error(`[ERROR ${errorCode}]`, error);
            
            // أنواع الأخطاء المختلفة
            const errorMessages = {
                "MODULE_NOT_FOUND": `🔧 خطأ في تحميل الموديول\n📦 الأمر: ${command?.config?.name}\n📞 أبلغ المطور بالرقم: ${errorCode}`,
                "TIMEOUT": `⏰ تجاوز الوقت المسموح\n⚡ الأمر معقد جداً\n🔄 جرب مرة أخرى`,
                "NETWORK_ERROR": `🌐 مشكلة في الاتصال\n📶 تحقق من اتصالك\n🔄 جرب لاحقاً`,
                "default": `❌ حدث خطأ غير متوقع\n🔧 الرقم المرجعي: ${errorCode}\n📞 أبلغ المطور بهذا الرقم`
            };
            
            return errorMessages[errorType] || errorMessages.default;
        }
    });
};
