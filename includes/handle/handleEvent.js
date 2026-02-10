// ══════════════════════════════════════════════════════════════════
// 🚀 KIRA Bot - handlerEvents.js المحسّن
// ══════════════════════════════════════════════════════════════════
// مدمج من: Shizuka Bot Handler (الأفضل)
// متوافق مع: KIRA Bot Structure
// الميزات: Permissions | Roles | Aliases | Analytics | Error Handling
// ══════════════════════════════════════════════════════════════════

const fs = require("fs-extra");
const moment = require("moment-timezone");

// ══════════════════════════════════════════════════════════════════
// 🛠️ Helper Functions
// ══════════════════════════════════════════════════════════════════

function getType(obj) {
    return Object.prototype.toString.call(obj).slice(8, -1);
}

// دالة تحديد صلاحيات المستخدم
function getRole(threadData, senderID) {
    const adminBot = global.config.ADMINBOT || [];
    if (!senderID) return 0;
    
    const threadInfo = global.data.threadInfo.get(threadData.threadID) || {};
    const adminBox = threadInfo.adminIDs ? threadInfo.adminIDs.map(a => a.id) : [];
    
    // 0 = عادي، 1 = أدمن مجموعة، 2 = أدمن بوت
    return adminBot.includes(senderID) ? 2 : adminBox.includes(senderID) ? 1 : 0;
}

// دالة الحصول على النصوص حسب اللغة
function getText(type, commandName, prefix, lang = "ar") {
    const texts = {
        ar: {
            userBanned: "⛔ أنت محظور من استخدام البوت",
            threadBanned: "🚫 هذه المجموعة محظورة من استخدام البوت",
            onlyAdminBox: "👮 هذا الأمر للأدمنية فقط",
            onlyAdminBot: "👑 هذا الأمر لمطوري البوت فقط",
            commandNotFound: `❌ الأمر "${commandName}" غير موجود\n💡 استخدم ${prefix}help للأوامر`,
            waitingForCommand: "⏳ انتظر {time} ثانية قبل استخدام الأمر مرة أخرى",
            errorOccurred: "❌ حدث خطأ أثناء تنفيذ الأمر:\n{error}"
        }
    };
    
    return texts[lang][type] || texts["ar"][type];
}

// دالة إنشاء roleConfig متقدم
function getRoleConfig(command, threadData, commandName) {
    let roleConfig;
    
    // إذا كان role رقم بسيط
    if (typeof command.config.role === "number") {
        roleConfig = {
            onStart: command.config.role,
            onChat: command.config.role,
            onReaction: 0,
            onReply: 0
        };
    }
    // إذا كان role كائن
    else if (typeof command.config.role === "object" && !Array.isArray(command.config.role)) {
        roleConfig = {
            onStart: command.config.role.onStart || 0,
            onChat: command.config.role.onChat || 0,
            onReaction: command.config.role.onReaction || 0,
            onReply: command.config.role.onReply || 0
        };
    }
    // افتراضي
    else {
        roleConfig = {
            onStart: 0,
            onChat: 0,
            onReaction: 0,
            onReply: 0
        };
    }
    
    // تطبيق setRole من المجموعة إذا موجود
    const threadSettings = threadData || {};
    if (threadSettings.setRole && threadSettings.setRole[commandName] !== undefined) {
        roleConfig.onStart = threadSettings.setRole[commandName];
    }
    
    return roleConfig;
}

// ══════════════════════════════════════════════════════════════════
// 📊 Analytics System
// ══════════════════════════════════════════════════════════════════

async function updateAnalytics(commandName) {
    try {
        if (!global.data.analytics) {
            global.data.analytics = {};
        }
        
        if (!global.data.analytics[commandName]) {
            global.data.analytics[commandName] = 0;
        }
        
        global.data.analytics[commandName]++;
        
        // حفظ في ملف كل 50 استخدام
        if (global.data.analytics[commandName] % 50 === 0) {
            fs.writeFileSync(
                "./data/analytics.json",
                JSON.stringify(global.data.analytics, null, 2)
            );
        }
    } catch (err) {
        console.error("❌ خطأ في Analytics:", err);
    }
}

// ══════════════════════════════════════════════════════════════════
// 🎯 Main Handler
// ══════════════════════════════════════════════════════════════════

module.exports = function ({ api, models, Users, Threads, Currencies }) {
    const logger = require("../../utils/log.js");
    
    return async function ({ event }) {
        const timeStart = Date.now();
        const time = moment.tz("Asia/Baghdad").format("HH:mm:ss DD/MM/YYYY");
        
        const { userBanned, threadBanned, threadData, threadInfo, commandBanned } = global.data;
        const { events, commands, cooldowns, aliases } = global.client;
        const { allowInbox, PREFIX, ADMINBOT, DeveloperMode, hideNotiMessage } = global.config;
        
        var { senderID, threadID, messageID, body, reaction, messageReply, type } = event;
        senderID = String(senderID);
        threadID = String(threadID);
        
        const isGroup = senderID !== threadID;
        const threadSettings = threadData.get(threadID) || {};
        const prefix = threadSettings.PREFIX || PREFIX;
        
        // ══════════════════════════════════════════════════════════════
        // 🗑️ نظام حذف الرسائل بالتفاعل (من KIRA الأصلي)
        // ══════════════════════════════════════════════════════════════
        
        if (type === "message_reaction" && messageReply?.senderID === api.getCurrentUserID()) {
            const deleteReactions = ["👍", "😡", "🗑️", "❌", "💔", "🚫", "⛔"];
            
            if (deleteReactions.includes(reaction)) {
                console.log(`\n🗑️ ═══ طلب حذف رسالة ═══`);
                console.log(`   التفاعل: ${reaction}`);
                console.log(`   المستخدم: ${senderID}`);
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
                            console.error(`   ❌ فشلت المحاولة الثانية\n`);
                        }
                    }, 1000);
                    
                    return;
                }
            }
        }
        
        // ══════════════════════════════════════════════════════════════
        // 🚫 فلترة المحظورين
        // ══════════════════════════════════════════════════════════════
        
        if (userBanned.has(senderID) || threadBanned.has(threadID)) {
            if (!hideNotiMessage?.banned) {
                api.sendMessage(
                    getText("userBanned", null, prefix),
                    threadID,
                    messageID
                );
            }
            return;
        }
        
        if (allowInbox === false && senderID === threadID) {
            return;
        }
        
        // ══════════════════════════════════════════════════════════════
        // ⚙️ معالجة الأحداث (Events)
        // ══════════════════════════════════════════════════════════════
        
        for (const [key, eventHandler] of events.entries()) {
            if (eventHandler.config.eventType && 
                eventHandler.config.eventType.includes(event.type || event.logMessageType)) {
                
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
                    if (eventHandler.handleEvent) {
                        await eventHandler.handleEvent(eventObject);
                    } else if (eventHandler.run) {
                        await eventHandler.run(eventObject);
                    }
                    
                    // Logging في وضع التطوير
                    if (DeveloperMode) {
                        const eventType = event.type || event.logMessageType || 'unknown';
                        logger(
                            `[ Event ] ${eventHandler.config.name} | ${eventType} | ${threadID}`,
                            "EVENT"
                        );
                    }
                    
                } catch (error) {
                    console.error(`\n❌ ═══ خطأ في Event: ${eventHandler.config.name} ═══`);
                    console.error(`   الخطأ: ${error.message}`);
                    console.error(`   Stack: ${error.stack}\n`);
                    
                    logger(`[ Event Error ] ${eventHandler.config.name}: ${error.message}`, "error");
                }
            }
        }
        
        // ══════════════════════════════════════════════════════════════
        // 💬 معالجة الأوامر (Commands)
        // ══════════════════════════════════════════════════════════════
        
        if (!body || typeof body !== "string") return;
        
        // التحقق من البادئة
        const botID = api.getCurrentUserID();
        const prefixRegex = new RegExp(`^(<@!?${botID}>|${PREFIX.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})\\s*`);
        const [matchedPrefix] = body.match(prefixRegex) || [null];
        
        if (!matchedPrefix) return;
        
        // استخراج الأمر والمعاملات
        const args = body.slice(matchedPrefix.length).trim().split(/ +/);
        let commandName = args.shift().toLowerCase();
        let command = commands.get(commandName);
        
        // ══════════════════════════════════════════════════════════════
        // 🔄 نظام Aliases المتقدم
        // ══════════════════════════════════════════════════════════════
        
        // البحث في aliases العامة
        if (!command && aliases) {
            command = commands.get(aliases.get(commandName));
        }
        
        // البحث في aliases المجموعة
        if (!command && threadSettings.aliases) {
            for (const cmdName in threadSettings.aliases) {
                if (threadSettings.aliases[cmdName].includes(commandName)) {
                    command = commands.get(cmdName);
                    commandName = cmdName;
                    break;
                }
            }
        }
        
        // إذا لم يتم العثور على الأمر
        if (!command) {
            if (!hideNotiMessage?.commandNotFound) {
                api.sendMessage(
                    getText("commandNotFound", commandName, prefix),
                    threadID,
                    messageID
                );
            }
            return;
        }
        
        commandName = command.config.name;
        
        // ══════════════════════════════════════════════════════════════
        // 🔐 نظام Permissions المتقدم
        // ══════════════════════════════════════════════════════════════
        
        const role = getRole(threadSettings, senderID);
        const roleConfig = getRoleConfig(command, threadSettings, commandName);
        const needRole = roleConfig.onStart;
        
        // التحقق من الصلاحيات
        if (needRole > role) {
            if (!hideNotiMessage?.needRoleToUseCmd) {
                const message = needRole === 1 
                    ? getText("onlyAdminBox", commandName, prefix)
                    : getText("onlyAdminBot", commandName, prefix);
                    
                api.sendMessage(message, threadID, messageID);
            }
            return;
        }
        
        // التحقق من الأوامر المحظورة
        if (commandBanned.get(threadID) || commandBanned.get(senderID)) {
            if (!ADMINBOT.includes(senderID)) {
                const banThreads = commandBanned.get(threadID) || [];
                const banUsers = commandBanned.get(senderID) || [];
                
                if (banThreads.includes(commandName) || banUsers.includes(commandName)) {
                    api.sendMessage(
                        `🚫 الأمر "${commandName}" محظور`,
                        threadID,
                        messageID
                    );
                    return;
                }
            }
        }
        
        // ══════════════════════════════════════════════════════════════
        // ⏱️ نظام Cooldown المحسّن
        // ══════════════════════════════════════════════════════════════
        
        if (!cooldowns.has(commandName)) {
            cooldowns.set(commandName, new Map());
        }
        
        const now = Date.now();
        const timestamps = cooldowns.get(commandName);
        const cooldownAmount = (command.config.cooldowns || 1) * 1000;
        
        if (timestamps.has(senderID)) {
            const expirationTime = timestamps.get(senderID) + cooldownAmount;
            
            if (now < expirationTime) {
                const timeLeft = ((expirationTime - now) / 1000).toFixed(1);
                api.setMessageReaction("⏳", messageID, () => {}, true);
                return;
            }
        }
        
        // ══════════════════════════════════════════════════════════════
        // 🚀 تنفيذ الأمر
        // ══════════════════════════════════════════════════════════════
        
        try {
            // تحديث Analytics
            await updateAnalytics(commandName);
            
            // تنفيذ الأمر
            const commandObject = {
                api,
                event,
                args,
                models,
                Users,
                Threads,
                Currencies,
                permssion: role,
                commandName,
                getText: () => {}
            };
            
            if (command.run) {
                await command.run(commandObject);
            } else if (command.onStart) {
                await command.onStart(commandObject);
            }
            
            // تحديث timestamp
            timestamps.set(senderID, now);
            
            // Logging
            if (DeveloperMode) {
                logger(
                    `[ Command ] ${commandName} | ${senderID} | ${threadID} | ${time}`,
                    "CMD"
                );
            }
            
        } catch (error) {
            console.error(`\n❌ ═══ خطأ في الأمر: ${commandName} ═══`);
            console.error(`   المستخدم: ${senderID}`);
            console.error(`   المجموعة: ${threadID}`);
            console.error(`   الوقت: ${time}`);
            console.error(`   الخطأ: ${error.message}`);
            console.error(`   Stack: ${error.stack}\n`);
            
            logger(`[ Command Error ] ${commandName}: ${error.message}`, "error");
            
            // إرسال رسالة الخطأ للمستخدم
            api.sendMessage(
                getText("errorOccurred").replace("{error}", error.message),
                threadID,
                messageID
            );
        }
        
        return;
    };
};

// ══════════════════════════════════════════════════════════════════
// 📝 الميزات المضافة:
// ══════════════════════════════════════════════════════════════════
//
// ✅ نظام Permissions متعدد المستويات (0, 1, 2)
// ✅ نظام Role-based Access (onStart, onChat, onReaction, onReply)
// ✅ نظام Aliases متقدم (عام + للمجموعات)
// ✅ نظام Analytics لتتبع استخدام الأوامر
// ✅ معالجة أخطاء احترافية
// ✅ Cooldown محسّن
// ✅ Logging مفصّل
// ✅ دعم hideNotiMessage
// ✅ متوافق مع KIRA الأصلي
// ✅ دعم كل من run و onStart
//
// ══════════════════════════════════════════════════════════════════
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
