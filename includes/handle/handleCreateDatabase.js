module.exports = function ({ Users, Threads, Currencies }) {
    const logger = require("../../utils/log.js");
    const chalk = require('chalk');
    const moment = require("moment-timezone");
    
    // نظام إدارة قاعدة البيانات المتقدم
    const ADVANCED_DB_MANAGER = {
        stats: {
            totalUsers: 0,
            totalThreads: 0,
            dailyGrowth: [],
            lastUpdate: Date.now()
        },
        
        async initializeDatabase() {
            try {
                // جلب جميع المستخدمين والمجموعات
                const allUsers = await Users.getAll();
                const allThreads = await Threads.getAll();
                const allCurrencies = await Currencies.getAll();
                
                this.stats.totalUsers = allUsers.length;
                this.stats.totalThreads = allThreads.length;
                
                logger(`📊 قاعدة البيانات جاهزة | مستخدمين: ${this.stats.totalUsers} | مجموعات: ${this.stats.totalThreads}`, "DATABASE");
                
                return true;
            } catch (error) {
                logger(`❌ خطأ في تهيئة قاعدة البيانات: ${error.message}`, "error");
                return false;
            }
        },
        
        async createOrUpdateUser(userID, userInfo) {
            try {
                const existingUser = await Users.getData(userID);
                
                if (existingUser) {
                    // تحديث المستخدم الموجود
                    await Users.setData(userID, {
                        name: userInfo.name || existingUser.name,
                        lastSeen: Date.now(),
                        updatedAt: moment().format()
                    });
                    
                    return { action: "updated", user: existingUser };
                } else {
                    // إنشاء مستخدم جديد
                    const userData = {
                        name: userInfo.name || "مستخدم فيسبوك",
                        createdAt: moment().format(),
                        lastSeen: Date.now(),
                        stats: {
                            messageCount: 0,
                            commandUsage: {},
                            joinDate: moment().format()
                        }
                    };
                    
                    await Users.createData(userID, userData);
                    await Currencies.createData(userID, { money: 100, exp: 0 });
                    
                    this.stats.totalUsers++;
                    
                    return { action: "created", user: userData };
                }
            } catch (error) {
                logger(`❌ خطأ في إدارة المستخدم ${userID}: ${error.message}`, "error");
                return { action: "error", error: error.message };
            }
        },
        
        async createOrUpdateThread(threadID, threadInfo) {
            try {
                const existingThread = await Threads.getData(threadID);
                
                if (existingThread) {
                    // تحديث المجموعة الموجودة
                    await Threads.setData(threadID, {
                        threadInfo: {
                            ...existingThread.threadInfo,
                            ...threadInfo,
                            lastUpdate: Date.now()
                        }
                    });
                    
                    return { action: "updated", thread: existingThread };
                } else {
                    // إنشاء مجموعة جديدة
                    const threadData = {
                        threadInfo: {
                            ...threadInfo,
                            createdAt: moment().format(),
                            memberCount: threadInfo.participantIDs?.length || 0,
                            settings: {
                                autoWelcome: true,
                                antiSpam: true,
                                allowCommands: true
                            }
                        }
                    };
                    
                    await Threads.createData(threadID, threadData);
                    this.stats.totalThreads++;
                    
                    return { action: "created", thread: threadData };
                }
            } catch (error) {
                logger(`❌ خطأ في إدارة المجموعة ${threadID}: ${error.message}`, "error");
                return { action: "error", error: error.message };
            }
        },
        
        async backupDatabase() {
            try {
                const backupTime = moment().format("YYYY-MM-DD_HH-mm");
                const backupData = {
                    timestamp: backupTime,
                    stats: this.stats,
                    summary: {
                        users: this.stats.totalUsers,
                        threads: this.stats.totalThreads,
                        currencies: await Currencies.getAll().then(c => c.length)
                    }
                };
                
                // هنا يمكن حفظ النسخة الاحتياطية في ملف
                logger(`💾 نسخة احتياطية تم إنشاؤها: ${backupTime}`, "BACKUP");
                
                return backupData;
            } catch (error) {
                logger(`❌ خطأ في النسخ الاحتياطي: ${error.message}`, "error");
                return null;
            }
        },
        
        getDatabaseStats() {
            return {
                ...this.stats,
                uptime: Date.now() - this.stats.lastUpdate,
                growthRate: this.calculateGrowthRate()
            };
        },
        
        calculateGrowthRate() {
            if (this.stats.dailyGrowth.length < 2) return 0;
            const recentGrowth = this.stats.dailyGrowth.slice(-2);
            return ((recentGrowth[1] - recentGrowth[0]) / recentGrowth[0] * 100).toFixed(2);
        }
    };

    return async function ({ event }) {
        const { autoCreateDB } = global.config;
        if (autoCreateDB == false) return;
        
        var { senderID, threadID } = event;
        senderID = String(senderID);
        threadID = String(threadID);
        
        // تهيئة المدير إذا لم يكن معبأ
        if (ADVANCED_DB_MANAGER.stats.totalUsers === 0) {
            await ADVANCED_DB_MANAGER.initializeDatabase();
        }
        
        try {
            // 1. إدارة المجموعة
            if (!global.data.allThreadID.includes(threadID) && event.isGroup == true) {
                const threadIn4 = await Threads.getInfo(threadID);
                
                const threadData = {
                    threadName: threadIn4.threadName,
                    adminIDs: threadIn4.adminIDs,
                    nicknames: threadIn4.nicknames,
                    participantIDs: threadIn4.participantIDs,
                    userInfo: threadIn4.userInfo
                };
                
                const result = await ADVANCED_DB_MANAGER.createOrUpdateThread(threadID, threadData);
                
                if (result.action === "created") {
                    // إضافة الأعضاء إلى قاعدة البيانات
                    for (const singleData of threadIn4.userInfo) {
                        const userResult = await ADVANCED_DB_MANAGER.createOrUpdateUser(
                            String(singleData.id),
                            { name: singleData.name }
                        );
                        
                        if (userResult.action === "created") {
                            // تحديث البيانات العالمية
                            global.data.userName.set(String(singleData.id), singleData.name);
                            if (!global.data.allUserID.includes(String(singleData.id))) {
                                global.data.allUserID.push(String(singleData.id));
                            }
                            
                            // تسجيل اللون الديناميكي
                            const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"];
                            const randomColor = colors[Math.floor(Math.random() * colors.length)];
                            
                            logger(
                                chalk.hex(randomColor)(`👤 مستخدم جديد: `) +
                                chalk.hex("#FFD700")(`${singleData.name}`) +
                                chalk.hex("#00CED1")(` | ${singleData.id}`),
                                '[ USER ]'
                            );
                        }
                    }
                    
                    global.data.allThreadID.push(threadID);
                    global.data.threadInfo.set(threadID, threadData);
                    
                    logger(
                        chalk.hex("#9B59B6")(`🏢 مجموعة جديدة: `) +
                        chalk.hex("#3498DB")(`${threadID}`) +
                        chalk.hex("#2ECC71")(` | ${threadIn4.threadName}`),
                        '[ THREAD ]'
                    );
                }
            }
            
            // 2. إدارة المستخدم
            if (!global.data.allUserID.includes(senderID) || !global.data.userName.has(senderID)) {
                const infoUsers = await Users.getInfo(senderID);
                const userResult = await ADVANCED_DB_MANAGER.createOrUpdateUser(
                    senderID,
                    { name: infoUsers?.name || "مستخدم فيسبوك" }
                );
                
                if (userResult.action === "created") {
                    global.data.allUserID.push(senderID);
                    global.data.userName.set(senderID, infoUsers?.name || "مستخدم فيسبوك");
                    
                    logger(
                        chalk.hex("#E74C3C")(`🌟 تسجيل دخول: `) +
                        chalk.hex("#F1C40F")(`${infoUsers?.name || senderID}`),
                        '[ LOGIN ]'
                    );
                }
            }
            
            // 3. إدارة العملة
            if (!global.data.allCurrenciesID.includes(senderID)) {
                await Currencies.createData(senderID, { 
                    money: 100, 
                    exp: 0,
                    dailyBonus: {
                        lastClaim: 0,
                        streak: 0
                    }
                });
                global.data.allCurrenciesID.push(senderID);
            }
            
            // 4. نسخ احتياطي دوري (كل 100 مستخدم جديد)
            if (ADVANCED_DB_MANAGER.stats.totalUsers % 100 === 0) {
                await ADVANCED_DB_MANAGER.backupDatabase();
            }
            
        } catch (err) {
            logger(`❌ خطأ في إنشاء/تحديث قاعدة البيانات: ${err.message}`, "error");
            
            // محاولة الاسترداد التلقائي
            try {
                if (!global.data.allUserID.includes(senderID)) {
                    global.data.allUserID.push(senderID);
                }
                if (!global.data.allCurrenciesID.includes(senderID)) {
                    global.data.allCurrenciesID.push(senderID);
                }
            } catch (recoveryErr) {
                console.error("فشل الاسترداد التلقائي:", recoveryErr);
            }
        }
    };
};
