module.exports.config = {
    name: "نادي_الكل",
    version: "5.0.0",
    hasPermssion: 1,
    credits: "Kira Supreme",
    description: "نظام المنشن الذكي المتقدم - أقوى نظام في العالم",
    commandCategory: "الإدارة",
    usages: [
        ".نادي_الكل [رسالة] - منشن جميع الأعضاء",
        ".نادي_الكل ادمنية [رسالة] - منشن المشرفين فقط",
        ".نادي_الكل بنات [رسالة] - منشن البنات",
        ".نادي_الكل شباب [رسالة] - منشن الشباب",
        ".نادي_الكل نشطين [رسالة] - منشن النشطين",
        ".نادي_الكل احصائيات - إحصائيات المنشن",
        ".نادي_الكل تحديث - تحديث بيانات الأعضاء"
    ],
    cooldowns: 30
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID, senderID } = event;
    
    try {
        // تحميل نظام المنشن
        const SupremeMentionSystem = require('../../../systems/mentions');
        const mentionSystem = new SupremeMentionSystem(api);
        await mentionSystem.initialize();
        
        const command = args[0] ? args[0].toLowerCase() : '';
        const message = args.slice(1).join(' ') || '📢 إشعار مهم من الإدارة';
        
        // التحقق من الصلاحيات
        const threadInfo = await api.getThreadInfo(threadID);
        const isAdmin = threadInfo.adminIDs.some(admin => admin.id === senderID) ||
                       (global.config.ADMINBOT || []).includes(senderID.toString());
        
        if (!isAdmin) {
            return api.sendMessage({
                body: `⛔ صلاحية مرفوضة!\n\n` +
                      `🔒 هذا الأمر للمشرفين فقط\n` +
                      `👤 أنت: ${await global.data.userName.get(senderID) || "عضو"}\n` +
                      `💡 تحتاج إلى صلاحية أدمن في المجموعة`
            }, threadID, messageID);
        }
        
        // 🔧 الأوامر الخاصة
        switch (command) {
            case 'احصائيات':
            case 'إحصائيات':
            case 'stats':
                const stats = mentionSystem.getStats();
                const history = mentionSystem.mentionHistory.get(threadID) || [];
                
                const statsMsg = `📊 إحصائيات المنشن الذكي\n\n` +
                               `🎯 الإجمالي: ${stats.totalMentions}\n` +
                               `✅ الناجحة: ${stats.successfulMentions}\n` +
                               `❌ الفاشلة: ${stats.failedMentions}\n` +
                               `📈 نسبة النجاح: ${stats.successRate}\n\n` +
                               `💾 الكاش:\n` +
                               `👤 مستخدمين: ${stats.cachedUsers}\n` +
                               `👥 مجموعات: ${stats.cachedGroups}\n\n` +
                               `📅 آخر 5 منشنات:\n` +
                               `${history.slice(-5).map((h, i) => 
                                   `${i+1}. ${h.count} منشن (${h.type})`
                               ).join('\n')}`;
                
                return api.sendMessage(statsMsg, threadID, messageID);
                
            case 'تحديث':
            case 'refresh':
            case 'تحديث البيانات':
                await api.sendMessage({
                    body: `🔄 جاري تحديث بيانات الأعضاء...`
                }, threadID, messageID);
                
                await mentionSystem.refreshCache(threadID);
                
                return api.sendMessage({
                    body: `✅ تم تحديث بيانات الأعضاء بنجاح!\n` +
                          `👥 عدد الأعضاء الجديد: ${threadInfo.participantIDs.length}`
                }, threadID, messageID);
                
            case 'مساعدة':
            case 'help':
                return api.sendMessage({
                    body: `📖 مساعدة أمر نادي_الكل\n\n` +
                          `🎯 ${this.config.usages.join('\n🎯 ')}\n\n` +
                          `💡 أمثلة:\n` +
                          `• .نادي_الكل اجتماع مهم غداً\n` +
                          `• .نادي_الكل ادمنية اجتماع المشرفين\n` +
                          `• .نادي_الكل احصائيات\n` +
                          `• .نادي_الكل تحديث`
                }, threadID, messageID);
        }
        
        // 🎯 أنواع المنشن المختلفة
        let result;
        
        switch (command) {
            case 'ادمنية':
            case 'مشرفين':
            case 'المشرفين':
            case 'ادمن':
                result = await mentionSystem.mentionCategory(threadID, "admins", {
                    message: `👑 منشن المشرفين:\n${message}`,
                    tagEach: true
                });
                break;
                
            case 'بنات':
            case 'فتيات':
            case 'بنات فقط':
                result = await mentionSystem.mentionCategory(threadID, "girls", {
                    message: `👧 منشن البنات:\n${message}`,
                    tagEach: true
                });
                break;
                
            case 'شباب':
            case 'اولاد':
            case 'شباب فقط':
                result = await mentionSystem.mentionCategory(threadID, "boys", {
                    message: `👦 منشن الشباب:\n${message}`,
                    tagEach: true
                });
                break;
                
            case 'نشطين':
            case 'النشطين':
            case 'نشطاء':
                result = await mentionSystem.mentionCategory(threadID, "active", {
                    message: `⚡ منشن النشطين:\n${message}`,
                    tagEach: true,
                    maxMentions: 30
                });
                break;
                
            default:
                // منشن الجميع
                result = await mentionSystem.mentionAll(threadID, {
                    message: `📢 إشعار عام:\n\n${message}\n\n` +
                            `👤 المرسل: ${await global.data.userName.get(senderID) || "الإدارة"}\n` +
                            `👥 عدد الأعضاء: ${threadInfo.participantIDs.length}\n` +
                            `🕒 الوقت: ${new Date().toLocaleTimeString('ar-IQ')}`,
                    tagEach: false,
                    maxMentions: Math.min(threadInfo.participantIDs.length, 50)
                });
        }
        
        // 📊 عرض النتائج
        if (result.success) {
            const successMsg = `✅ تم المنشن بنجاح!\n\n` +
                             `📊 الإحصائيات:\n` +
                             `👥 تم منشن: ${result.mentioned} عضو\n` +
                             `📝 من أصل: ${result.totalUsers} عضو\n` +
                             `📌 الرسالة: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}\n\n` +
                             `🎯 نظام المنشن الذكي يعمل بكفاءة!`;
            
            await api.sendMessage(successMsg, threadID, messageID);
            
            // إرسال تقرير للمطور
            if (global.config.ADMINBOT?.[0] && result.mentioned > 20) {
                const report = `📈 تقرير منشن كبير\n\n` +
                              `👥 المجموعة: ${threadInfo.threadName || threadID}\n` +
                              `👤 المنشئ: ${await global.data.userName.get(senderID) || senderID}\n` +
                              `🎯 العدد: ${result.mentioned} عضو\n` +
                              `📊 النسبة: ${((result.mentioned / result.totalUsers) * 100).toFixed(1)}%\n` +
                              `🕒 الوقت: ${new Date().toLocaleString('ar-IQ')}`;
                
                api.sendMessage(report, global.config.ADMINBOT[0]);
            }
            
        } else {
            throw new Error(result.error || "فشل غير معروف في المنشن");
        }
        
    } catch (error) {
        console.error("Mention System Error:", error);
        
        const errorMsg = `❌ خطأ في نظام المنشن!\n\n` +
                        `🔧 الخطأ: ${error.message}\n` +
                        `💡 الحلول المقترحة:\n` +
                        `1. تحقق من صلاحيات البوت\n` +
                        `2. تأكد من وجود أعضاء في المجموعة\n` +
                        `3. جرب الأمر: .نادي_الكل تحديث\n` +
                        `4. إذا استمر الخطأ، اتصل بالمطور`;
        
        return api.sendMessage(errorMsg, threadID, messageID);
    }
};

module.exports.handleReaction = async function ({ api, event, reactionSystem }) {
    // يمكن إضافة تفاعلات رد فعل هنا
};

module.exports.handleReply = async function ({ api, event, replySystem }) {
    // يمكن إضافة معالجة ردود هنا
};
