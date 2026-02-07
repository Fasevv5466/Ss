const fs = require("fs-extra");
const path = require("path");

class SupremeMentionSystem {
    constructor(api) {
        this.api = api;
        this.userCache = new Map();
        this.groupCache = new Map();
        this.mentionHistory = new Map();
        this.stats = {
            totalMentions: 0,
            successfulMentions: 0,
            failedMentions: 0
        };
    }

    async initialize() {
        console.log("[MENTION] نظام المنشن المتقدم جاهز");
        return this;
    }

    // 🔥 النظام الأساسي للمنشن
    async parseMentions(text, threadID) {
        const mentions = [];
        let processedText = text;
        
        // 1. اكتشاف @منشن العادي
        const mentionRegex = /@(\S+)/g;
        let match;
        
        while ((match = mentionRegex.exec(text)) !== null) {
            const searchTerm = match[1];
            const userData = await this.resolveMention(searchTerm, threadID);
            
            if (userData.found) {
                mentions.push({
                    tag: `@${userData.name}`,
                    id: userData.id,
                    name: userData.name,
                    confidence: userData.confidence
                });
                
                // استبدال في النص
                processedText = processedText.replace(match[0], `@${userData.name}`);
            } else {
                mentions.push({
                    tag: `@${searchTerm}`,
                    id: null,
                    name: searchTerm,
                    confidence: 0,
                    notFound: true
                });
            }
        }
        
        // 2. اكتشاف الأرقام (أيدي)
        const idRegex = /(\d{15,})/g;
        while ((match = idRegex.exec(processedText)) !== null) {
            const possibleID = match[1];
            if (possibleID.length >= 15) {
                try {
                    const userInfo = await this.api.getUserInfo(possibleID);
                    if (userInfo && userInfo[possibleID]) {
                        const userName = userInfo[possibleID].name || "مستخدم";
                        mentions.push({
                            tag: `@${userName}`,
                            id: possibleID,
                            name: userName,
                            type: "direct_id"
                        });
                    }
                } catch (e) {
                    // تجاهل الخطأ
                }
            }
        }
        
        // 3. تحديث الإحصائيات
        this.stats.totalMentions += mentions.length;
        this.stats.successfulMentions += mentions.filter(m => m.id).length;
        this.stats.failedMentions += mentions.filter(m => !m.id).length;
        
        // 4. حفظ السجل
        this.saveMentionHistory(threadID, mentions);
        
        return {
            text: processedText,
            mentions: mentions,
            count: mentions.length,
            successful: mentions.filter(m => m.id).length,
            failed: mentions.filter(m => !m.id).length
        };
    }

    // 🔍 البحث عن المستخدم بذكاء
    async resolveMention(searchTerm, threadID) {
        searchTerm = searchTerm.toLowerCase().trim();
        
        // 1. التحقق من الكاش أولاً
        if (this.userCache.has(searchTerm)) {
            const cached = this.userCache.get(searchTerm);
            if (cached.expiry > Date.now()) {
                return { found: true, ...cached.data };
            }
        }
        
        // 2. البحث في المجموعة الحالية
        const groupUsers = await this.getGroupUsers(threadID);
        
        // البحث الدقيق
        let bestMatch = null;
        let bestScore = 0;
        
        for (const user of groupUsers) {
            const score = this.calculateMatchScore(searchTerm, user.name);
            if (score > bestScore) {
                bestScore = score;
                bestMatch = user;
            }
        }
        
        // 3. إذا وجدنا تطابق جيد
        if (bestMatch && bestScore > 0.6) {
            const result = {
                id: bestMatch.id,
                name: bestMatch.name,
                confidence: bestScore
            };
            
            // تخزين في الكاش
            this.userCache.set(searchTerm, {
                data: result,
                expiry: Date.now() + (30 * 60 * 1000) // 30 دقيقة
            });
            
            return { found: true, ...result };
        }
        
        // 4. البحث العالمي (إذا كان ID)
        if (/^\d+$/.test(searchTerm) && searchTerm.length >= 15) {
            try {
                const userInfo = await this.api.getUserInfo(searchTerm);
                if (userInfo && userInfo[searchTerm]) {
                    const userName = userInfo[searchTerm].name || "مستخدم";
                    
                    const result = {
                        id: searchTerm,
                        name: userName,
                        confidence: 0.9
                    };
                    
                    return { found: true, ...result };
                }
            } catch (e) {
                // فشل البحث
            }
        }
        
        return { found: false, confidence: 0 };
    }

    // 📊 حساب درجة المطابقة
    calculateMatchScore(searchTerm, userName) {
        const userNameLower = userName.toLowerCase();
        
        // مطابقة كاملة
        if (userNameLower === searchTerm) return 1.0;
        
        // مطابقة جزئية
        if (userNameLower.includes(searchTerm)) return 0.8;
        if (searchTerm.includes(userNameLower)) return 0.7;
        
        // مطابقة الكلمات
        const userNameWords = userNameLower.split(/\s+/);
        const searchWords = searchTerm.split(/\s+/);
        
        let wordMatches = 0;
        for (const searchWord of searchWords) {
            for (const userNameWord of userNameWords) {
                if (userNameWord.includes(searchWord) || searchWord.includes(userNameWord)) {
                    wordMatches++;
                    break;
                }
            }
        }
        
        if (wordMatches > 0) {
            return wordMatches / Math.max(userNameWords.length, searchWords.length);
        }
        
        return 0;
    }

    // 👥 جلب أعضاء المجموعة
    async getGroupUsers(threadID) {
        // التحقق من الكاش أولاً
        if (this.groupCache.has(threadID)) {
            const cached = this.groupCache.get(threadID);
            if (cached.expiry > Date.now()) {
                return cached.users;
            }
        }
        
        try {
            const threadInfo = await this.api.getThreadInfo(threadID);
            const users = threadInfo.participantIDs.map(id => ({
                id: id,
                name: threadInfo.nicknames?.[id] || 
                      threadInfo.userInfo?.find(u => u.id === id)?.name || 
                      "مستخدم"
            }));
            
            // تخزين في الكاش
            this.groupCache.set(threadID, {
                users: users,
                expiry: Date.now() + (5 * 60 * 1000) // 5 دقائق
            });
            
            return users;
        } catch (error) {
            console.error("خطأ في جلب أعضاء المجموعة:", error);
            return [];
        }
    }

    // 🎯 المنشن الجماعي المتقدم
    async mentionAll(threadID, options = {}) {
        const {
            message = "إشعار عام 📢",
            tagEach = false,
            maxMentions = 50,
            delay = 100,
            customFilter = null
        } = options;
        
        try {
            const users = await this.getGroupUsers(threadID);
            
            // تطبيق الفلتر المخصص
            let filteredUsers = users;
            if (customFilter) {
                filteredUsers = [];
                for (const user of users) {
                    if (await customFilter(user.id)) {
                        filteredUsers.push(user);
                    }
                }
            }
            
            // تحديد العدد الأقصى
            const usersToMention = filteredUsers.slice(0, maxMentions);
            
            if (usersToMention.length === 0) {
                return { success: false, error: "لا يوجد مستخدمين للمنشن" };
            }
            
            // إعداد المنشنات
            const mentions = usersToMention.map(user => ({
                tag: `@${user.name}`,
                id: user.id,
                name: user.name
            }));
            
            // إعداد الرسالة
            let finalMessage = message;
            if (tagEach) {
                finalMessage += "\n\n" + mentions.map(m => m.tag).join(' ');
            }
            
            // إرسال الرسالة
            const result = await this.api.sendMessage({
                body: finalMessage,
                mentions: tagEach ? mentions : undefined
            }, threadID);
            
            // تسجيل السجل
            this.saveMentionHistory(threadID, mentions, "mass_mention");
            
            return {
                success: true,
                mentioned: usersToMention.length,
                totalUsers: users.length,
                messageID: result.messageID
            };
            
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // 🔧 منشن فئات محددة
    async mentionCategory(threadID, category, options = {}) {
        const categories = {
            "admins": async (users) => {
                const threadInfo = await this.api.getThreadInfo(threadID);
                const adminIDs = threadInfo.adminIDs.map(admin => admin.id);
                return users.filter(user => adminIDs.includes(user.id));
            },
            "active": async (users) => {
                // هنا يمكن إضافة منطق للتحقق من النشاط
                return users.slice(0, Math.min(users.length, 20));
            },
            "girls": async (users) => {
                // يمكن إضافة تحليل الجندر إذا كان متاحاً
                return users; // مؤقتاً كل المستخدمين
            },
            "boys": async (users) => {
                return users; // مؤقتاً كل المستخدمين
            }
        };
        
        if (!categories[category]) {
            return { success: false, error: "فئة غير معروفة" };
        }
        
        const users = await this.getGroupUsers(threadID);
        const filteredUsers = await categories[category](users);
        
        return this.mentionAll(threadID, {
            ...options,
            customFilter: (userID) => filteredUsers.some(u => u.id === userID)
        });
    }

    // 💾 حفظ سجل المنشنات
    saveMentionHistory(threadID, mentions, type = "normal") {
        const history = this.mentionHistory.get(threadID) || [];
        
        history.push({
            timestamp: Date.now(),
            mentions: mentions,
            type: type,
            count: mentions.length
        });
        
        // الاحتفاظ بآخر 100 منشن
        if (history.length > 100) {
            history.shift();
        }
        
        this.mentionHistory.set(threadID, history);
    }

    // 📈 إحصائيات النظام
    getStats() {
        return {
            ...this.stats,
            successRate: this.stats.totalMentions > 0 ? 
                (this.stats.successfulMentions / this.stats.totalMentions * 100).toFixed(1) + '%' : '0%',
            cachedUsers: this.userCache.size,
            cachedGroups: this.groupCache.size
        };
    }

    // 🔄 تحديث البيانات
    async refreshCache(threadID = null) {
        if (threadID) {
            this.groupCache.delete(threadID);
            await this.getGroupUsers(threadID); // إعادة التحميل
        } else {
            this.userCache.clear();
            this.groupCache.clear();
        }
        
        return { success: true, message: "تم تحديث الكاش" };
    }
}

module.exports = SupremeMentionSystem;
