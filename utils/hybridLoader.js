/**
 * 🔧 نظام تحميل الأوامر الهجين لـ KIRA
 * يدعم صيغتي KIRA و GoatBot معاً
 * 
 * استبدل دالة تحميل الأوامر في index.js بهذا الكود
 */

// ========== دالة تحميل الأوامر الهجينة ==========

async function loadCommands() {
    const commandsPath = join(global.client.mainPath, 'script', 'commands');
    
    // التحقق من وجود المجلد
    if (!existsSync(commandsPath)) {
        logger.loader("Commands folder not found!", "error");
        return;
    }
    
    // الحصول على جميع المجلدات (الفئات)
    const categories = readdirSync(commandsPath).filter(item => {
        const itemPath = join(commandsPath, item);
        return require('fs').statSync(itemPath).isDirectory();
    });
    
    logger.loader(`📁 Found ${categories.length} categories`);
    
    let totalLoaded = 0;
    let totalFailed = 0;
    
    // معالجة كل فئة
    for (const category of categories) {
        const categoryPath = join(commandsPath, category);
        const commands = readdirSync(categoryPath).filter(cmd => cmd.endsWith('.js'));
        
        logger.loader(`📂 Loading category: ${category} (${commands.length} commands)`);
        
        // معالجة كل أمر في الفئة
        for (const commandFile of commands) {
            // تخطي الأوامر المعطلة
            if (global.config.commandDisabled.includes(commandFile)) {
                continue;
            }
            
            try {
                const commandPath = join(categoryPath, commandFile);
                delete require.cache[require.resolve(commandPath)]; // مسح الكاش
                const module = require(commandPath);
                
                // ========== التعرف على نوع الأمر ==========
                
                let commandData = null;
                let commandType = null;
                
                // 1️⃣ صيغة KIRA الأصلية
                if (module.config && module.run) {
                    commandData = {
                        config: module.config,
                        run: module.run,
                        handleEvent: module.handleEvent || null,
                        handleReply: module.handleReply || null,
                        handleReaction: module.handleReaction || null
                    };
                    commandType = 'KIRA';
                }
                
                // 2️⃣ صيغة GoatBot
                else if (module.config && module.onStart) {
                    commandData = {
                        config: convertGoatBotConfig(module.config),
                        run: createGoatBotWrapper(module),
                        handleEvent: module.onChat ? createEventWrapper(module.onChat) : null,
                        handleReply: null,
                        handleReaction: module.onReaction ? createReactionWrapper(module.onReaction) : null
                    };
                    commandType = 'GoatBot';
                }
                
                // 3️⃣ صيغة غير مدعومة
                else {
                    throw new Error('Unsupported command format');
                }
                
                // ========== التسجيل ==========
                
                const commandName = commandData.config.name;
                global.client.commands.set(commandName, commandData);
                
                // تسجيل الأسماء البديلة (aliases)
                if (commandData.config.aliases && Array.isArray(commandData.config.aliases)) {
                    for (const alias of commandData.config.aliases) {
                        global.client.commands.set(alias, commandData);
                    }
                }
                
                totalLoaded++;
                logger.loader(`  ✅ ${commandName} [${commandType}]`);
                
            } catch (error) {
                totalFailed++;
                logger.loader(`  ❌ ${commandFile}: ${error.message}`, "error");
            }
        }
    }
    
    logger.loader(`\n📊 Summary: ${totalLoaded} loaded, ${totalFailed} failed\n`);
}

// ========== دوال التحويل ==========

/**
 * تحويل config من GoatBot إلى KIRA
 */
function convertGoatBotConfig(goatConfig) {
    return {
        name: goatConfig.name,
        version: goatConfig.version || '1.0',
        hasPermssion: goatConfig.role || 0,
        credits: goatConfig.author || 'Unknown',
        description: (goatConfig.description && goatConfig.description.en) || goatConfig.description || '',
        commandCategory: goatConfig.category || 'general',
        usages: goatConfig.guide || goatConfig.name,
        cooldowns: goatConfig.countDown || 5,
        aliases: goatConfig.aliases || []
    };
}

/**
 * إنشاء wrapper لـ onStart من GoatBot
 */
function createGoatBotWrapper(module) {
    return async function(params) {
        const { api, event, args, Users, Threads, Currencies } = params;
        const { threadID, messageID, senderID } = event;
        
        // ========== محاكاة واجهة GoatBot ==========
        
        // كائن message
        const message = {
            reply: async (text, callback) => {
                return api.sendMessage(text, threadID, callback || (() => {}), messageID);
            },
            send: async (text, tid = threadID) => {
                return api.sendMessage(text, tid);
            },
            reaction: async (emoji, mid = messageID) => {
                return api.setMessageReaction(emoji, mid, () => {}, true);
            },
            unsend: async (mid = messageID) => {
                return api.unsendMessage(mid);
            },
            edit: async (text, mid) => {
                // KIRA لا يدعم التعديل، نرسل رسالة جديدة
                return api.sendMessage(`📝 ${text}`, threadID);
            }
        };
        
        // كائن usersData
        const usersData = {
            get: async (uid, field) => {
                try {
                    const data = await Users.getData(uid);
                    if (field) {
                        return data[field] !== undefined ? data[field] : (field === 'money' ? 0 : null);
                    }
                    return data;
                } catch (e) {
                    return field ? (field === 'money' ? 0 : null) : {};
                }
            },
            set: async (uid, updates) => {
                try {
                    const data = await Users.getData(uid);
                    Object.assign(data, updates);
                    await Users.setData(uid, data);
                    return true;
                } catch (e) {
                    return false;
                }
            }
        };
        
        // كائن threadsData
        const threadsData = {
            get: async (tid, field) => {
                try {
                    const data = await Threads.getData(tid);
                    return field ? (data[field] || null) : data;
                } catch (e) {
                    return field ? null : {};
                }
            },
            set: async (tid, updates) => {
                try {
                    const data = await Threads.getData(tid);
                    Object.assign(data, updates);
                    await Threads.setData(tid, data);
                    return true;
                } catch (e) {
                    return false;
                }
            }
        };
        
        // دالة getLang
        const getLang = function(key, ...replacements) {
            let text = key;
            
            // محاولة الحصول على الترجمة من module.langs
            if (module.langs) {
                const lang = global.config.language || 'ar';
                if (module.langs[lang] && module.langs[lang][key]) {
                    text = module.langs[lang][key];
                } else if (module.langs.en && module.langs.en[key]) {
                    text = module.langs.en[key];
                }
            }
            
            // استبدال المتغيرات
            replacements.forEach((val, i) => {
                text = text.replace(new RegExp(`%${i + 1}`, 'g'), val);
            });
            
            return text;
        };
        
        // كائن الأحداث
        const eventObj = {
            ...event,
            mentions: event.mentions || {}
        };
        
        // ========== استدعاء الدالة الأصلية ==========
        
        try {
            await module.onStart({
                api,
                event: eventObj,
                args,
                message,
                usersData,
                threadsData,
                getLang,
                Users,
                Threads,
                Currencies,
                commandName: module.config.name
            });
        } catch (error) {
            console.error(`[${module.config.name}] Error:`, error);
            return api.sendMessage(
                `❌ حدث خطأ في تنفيذ الأمر:\n${error.message}`,
                threadID,
                messageID
            );
        }
    };
}

/**
 * إنشاء wrapper لـ onChat
 */
function createEventWrapper(onChatFunction) {
    return async function(params) {
        const { api, event, Users, Threads } = params;
        
        const message = {
            reply: (text) => api.sendMessage(text, event.threadID, event.messageID)
        };
        
        const usersData = {
            get: async (uid, field) => {
                const data = await Users.getData(uid);
                return field ? data[field] : data;
            }
        };
        
        const threadsData = {
            get: async (tid, field) => {
                const data = await Threads.getData(tid);
                return field ? data[field] : data;
            }
        };
        
        return await onChatFunction({
            api,
            event,
            message,
            usersData,
            threadsData
        });
    };
}

/**
 * إنشاء wrapper لـ onReaction
 */
function createReactionWrapper(onReactionFunction) {
    return async function(params) {
        const { api, event, Users, Threads } = params;
        
        const message = {
            reply: (text) => api.sendMessage(text, event.threadID)
        };
        
        const usersData = {
            get: async (uid, field) => {
                const data = await Users.getData(uid);
                return field ? data[field] : data;
            }
        };
        
        return await onReactionFunction({
            api,
            event,
            message,
            usersData
        });
    };
}

// ========== التعليمات ==========

/*
📝 كيفية الاستخدام:

1️⃣ في ملف index.js، استبدل قسم تحميل الأوامر بهذا:

    // استبدل هذا الجزء:
    const commandsPath = join(global.client.mainPath, 'script', 'commands');
    const categories = readdirSync(commandsPath)...
    
    // بهذا:
    await loadCommands();

2️⃣ أضف هذه الدوال في بداية الملف (بعد requires):

    const { loadCommands, convertGoatBotConfig, createGoatBotWrapper, ... } = require('./utils/hybridLoader.js');
    
    أو انسخ كل الدوال مباشرة في index.js

3️⃣ الآن يمكنك نسخ أوامر GoatBot مباشرة دون تحويل!

    cp Goat-Bot-V2-fixed-main/scripts/cmds/balance.js KIRA-main/script/commands/economy/
    
    وسيعمل مباشرة! ✨

*/

module.exports = {
    loadCommands,
    convertGoatBotConfig,
    createGoatBotWrapper,
    createEventWrapper,
    createReactionWrapper
};
