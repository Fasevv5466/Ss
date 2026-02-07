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
            return {
                confidence: 0.95,
                suggestedCommand: this.findBestMatch(commandName),
                timestamp: Date.now()
            };
        } catch (e) {
            return { confidence: 0.7, error: e.message };
        }
    },
    
    findBestMatch(commandName) {
        const commands = Array.from(global.client.commands.keys());
        if (commands.length === 0) return null;
        const matches = stringSimilarity.findBestMatch(commandName, commands);
        return matches.bestMatch.rating > 0.5 ? matches.bestMatch.target : null;
    }
};

module.exports = function ({ api, models, Users, Threads, Currencies }) {
    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    
    // نظام التخزين المتقدم (إحصائيات)
    const ADVANCED_CACHE = {
        userStats: new Map(),
        commandStats: new Map(),
        groupStats: new Map(),
        
        async recordUsage(userID, commandName, threadID) {
            const timestamp = Date.now();
            if (!this.userStats.has(userID)) {
                this.userStats.set(userID, { totalCommands: 0, commands: {}, lastActive: timestamp });
            }
            const userStat = this.userStats.get(userID);
            userStat.totalCommands++;
            if (!userStat.commands[commandName]) userStat.commands[commandName] = 0;
            userStat.commands[commandName]++;
        }
    };

    return async function ({ event }) {
        const dateNow = Date.now();
        const { PREFIX, ADMINBOT, DeveloperMode } = global.config;
        const { userBanned, threadBanned, threadInfo, threadData } = global.data;
        const { commands, cooldowns } = global.client;

        var { body, senderID, threadID, messageID } = event;
        if (!body) return;

        senderID = String(senderID);
        threadID = String(threadID);
        
        // 1. نظام الحماية من الإغراق (Flood Control)
        if (!global.client.flood) global.client.flood = new Map();
        const userMsgs = global.client.flood.get(senderID) || [];
        userMsgs.push(dateNow);
        const recentMsgs = userMsgs.filter(t => dateNow - t < 5000);
        global.client.flood.set(senderID, recentMsgs);
        if (recentMsgs.length > 8 && !ADMINBOT.includes(senderID)) {
            return api.sendMessage("🛡️ حماية: أرسلت رسائل كثيرة! انتظر قليلاً.", threadID, messageID);
        }

        const threadSetting = threadData.get(threadID) || {};
        const prefix = threadSetting.hasOwnProperty("PREFIX") ? threadSetting.PREFIX : PREFIX;
        const prefixRegex = new RegExp(`^(<@!?${senderID}>|${escapeRegex(prefix)})\\s*`);
        const [matchedPrefix] = body.match(prefixRegex) || [null];
        
        // نظام المنشن الذكي إذا لم توجد بادئة
        if (!matchedPrefix) {
            if (body.includes(`@${api.getCurrentUserID()}`)) {
                return api.sendMessage("✨ نعم؟ كيف يمكنني مساعدتك؟", threadID, messageID);
            }
            return;
        }

        const args = body.slice(matchedPrefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        var command = commands.get(commandName);
        
        // === نظام الرد المخصص عند الخطأ (طلبك الجديد) ===
        if (!command && commandName.length > 0) {
            const aiAnalysis = await AI_SYSTEM.analyzeCommand({ senderID, threadID }, commandName);
            if (aiAnalysis.suggestedCommand) {
                return api.sendMessage(`⚠️ تقصد (${aiAnalysis.suggestedCommand})؟ اكتب الامر صح والا كتبت اسمك بالمذكرة 📝`, threadID, messageID);
            } else {
                return api.sendMessage(`❌ الأمر "${commandName}" غير موجود.. اكتب الامر صح والا كتبت اسمك بالمذكرة 📝`, threadID, messageID);
            }
        } else if (commandName.length === 0) return;

        // التحقق من الحظر والصلاحيات
        if (threadBanned.has(threadID) && !ADMINBOT.includes(senderID)) return;
        if (userBanned.has(senderID) && !ADMINBOT.includes(senderID)) return;

        var permssion = 0;
        try {
            const threadInfoo2 = threadInfo.get(threadID) || (await Threads.getInfo(threadID));
            const isAdmin = threadInfoo2.adminIDs.find(el => el.id == senderID);
            if (ADMINBOT.includes(senderID)) permssion = 3;
            else if (isAdmin) permssion = 1;
        } catch (e) { permssion = 0; }

        if (command.config.hasPermssion > permssion) {
            return api.sendMessage(`🔒 صلاحيتك لا تسمح باستخدام الأمر: ${command.config.name}`, threadID, messageID);
        }

        // نظام التبريد (Cooldown)
        if (!cooldowns.has(command.config.name)) cooldowns.set(command.config.name, new Map());
        const timestamps = cooldowns.get(command.config.name);
        const cooldownAmount = (command.config.cooldowns || 1) * 1000;
        if (timestamps.has(senderID) && dateNow < timestamps.get(senderID) + cooldownAmount) {
            return api.sendMessage(`⏳ انتظر ${Math.ceil((timestamps.get(senderID) + cooldownAmount - dateNow) / 1000)} ثانية.`, threadID, messageID);
        }

        try {
            await ADVANCED_CACHE.recordUsage(senderID, command.config.name, threadID);
            await command.run({ api, event, args, Users, Threads, Currencies, permssion });
            timestamps.set(senderID, dateNow);
        } catch (error) {
            console.error(error);
            api.sendMessage("❌ حدث خطأ داخلي أثناء تنفيذ الأمر", threadID, messageID);
        }
    };
};
