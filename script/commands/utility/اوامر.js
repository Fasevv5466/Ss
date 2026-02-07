const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "اوامر",
    version: "3.0.0",
    hasPermssion: 0,
    credits: "Ayman",
    description: "قائمة الأوامر العراقية مع صلاحيات الوصول",
    commandCategory: "utility",
    usages: ".اوامر",
    cooldowns: 3
};

// فئات الأوامر العراقية المعدلة
const CATEGORIES = {
    "games": {
        arabicName: "ألعاب",
        keywords: ["العاب", "لعبة", "لعب", "تسلية", "ألعاب", "ترفيه", "games"],
        permission: 0,
        emoji: "🎮"
    },
    "utility": {
        arabicName: "خدمات", 
        keywords: ["خدمات", "ادوات", "ميديا", "تحميل", "بحث", "أدوات", "utility"],
        permission: 0,
        emoji: "⚙️"
    },
    "media": {
        arabicName: "وسائط",
        keywords: ["افلام", "انمي", "فيلم", "أفلام", "مسلسل", "فيديو", "media"],
        permission: 0,
        emoji: "🎬"
    },
    "pic": {
        arabicName: "صور",
        keywords: ["صور", "تصميم", "لوغو", "صورة", "فن", "صورة", "pic"],
        permission: 0,
        emoji: "🖼️"
    },
    "social": {
        arabicName: "تواصل",
        keywords: ["اسلاميات", "دين", "قران", "قرآن", "إسلامي", "تواصل", "social"],
        permission: 0,
        emoji: "💬"
    },
    "admin": {
        arabicName: "إدارة",
        keywords: ["نظام", "ضبط", "ادارة", "ادمن", "مسؤولية", "المسؤولين", "admin", "Admin", "ادمن"],
        permission: 1,
        emoji: "👑"
    },
    "developer": {
        arabicName: "مطور",
        keywords: ["مطور", "المطور", "المنشئ", "مبرمج", "developer", "dev"],
        permission: 2,
        emoji: "👨‍💻"
    }
};

// تصنيف الأوامر العراقية الجديدة
const IRAQI_COMMANDS = {
    "ألعاب": [
        "لعبة_الذكاء", "اضرب_شخص", "ميم_مقارنة", "شات_فيك"
    ],
    "خدمات": [
        "حالت_البوت", "فلوسي", "معلومات_الجروب", "كلم_المطور", 
        "دكان_الاوامر", "احصائيات_الرسايل", "شكل_البطاقة", "ذكي_كيرا",
        "ارفع_كاتبوكس"
    ],
    "وسائط": [
        "مكتبة_الفيديو", "فيديو_ذكي", "دور_انمي", "فيديو_سيارات", 
        "داونلود_اتوماتيك"
    ],
    "صور": [
        "صورت_الشخصية", "عدل_صورة"
    ],
    "تواصل": [
        "كلم_المطور", "كلم_الادمن"
    ],
    "إدارة": [
        "مود_الادمن", "طلبات_الصداقة", "رتب_شخص", "نادي_الكل",
        "حماية_الجروب", "كنية_اتوماتيك", "كلام_ممنوع", "اطرد_شخص",
        "شيل_رسايل", "نظف_الاعضاء"
    ],
    "مطور": [
        "نسخة_حماية", "ارفع_ملف", "ادارة_الاوامر", "ادارة_الاحداث"
    ]
};

// تحديد الفئة الرئيسية للأمر العراقي
function getMainCategory(cmdName) {
    if (!cmdName) return "utility";
    
    // تحقق أولاً من الأوامر العراقية المعروفة
    for (const [category, commands] of Object.entries(IRAQI_COMMANDS)) {
        if (commands.includes(cmdName)) {
            // البحث عن الكود الأساسي للفئة
            for (const [engCat, data] of Object.entries(CATEGORIES)) {
                if (data.arabicName === category) {
                    return engCat;
                }
            }
        }
    }
    
    // إذا لم يكن معروفاً، رجوع للنظام القديم
    const category = cmdName.toLowerCase().trim();
    for (const [mainCat, data] of Object.entries(CATEGORIES)) {
        if (data.keywords.some(keyword => category.includes(keyword))) {
            return mainCat;
        }
    }
    
    return "utility";
}

// التحقق من الصلاحية
function hasPermission(userPermission, requiredPermission) {
    return userPermission >= requiredPermission;
}

// الحصول على صلاحية المستخدم
async function getUserPermission(api, event) {
    const { senderID, threadID } = event;
    try {
        const config = global.config || {};
        const botAdmins = config.ADMINBOT || config.MODERATOR || [];
        
        if (botAdmins.includes(senderID.toString())) {
            return 2; // مطور
        }
        
        try {
            const threadInfo = await api.getThreadInfo(threadID);
            const adminIDs = threadInfo.adminIDs.map(admin => admin.id);
            if (adminIDs.includes(senderID)) return 1; // مشرف مجموعة
        } catch(e) {
            console.log("خطأ في جلب معلومات المجموعة:", e.message);
        }
        
        return 0; // مستخدم عادي
    } catch (e) { 
        console.log("خطأ في صلاحيات المستخدم:", e.message);
        return 0; 
    }
}

// الحصول على الفئات المتاحة للمستخدم
async function getAccessibleCategories(userPermission) {
    const accessibleCategories = [];
    for (const [category, data] of Object.entries(CATEGORIES)) {
        if (hasPermission(userPermission, data.permission)) {
            accessibleCategories.push({
                eng: category,
                arabic: data.arabicName,
                emoji: data.emoji
            });
        }
    }
    return accessibleCategories;
}

// الحصول على عدد الأوامر في كل فئة
function getCategoryStats(userPermission) {
    const stats = {};
    
    // حساب الأوامر العراقية
    for (const [arabicCategory, commands] of Object.entries(IRAQI_COMMANDS)) {
        // البحث عن الفئة الإنجليزية المقابلة
        for (const [engCat, data] of Object.entries(CATEGORIES)) {
            if (data.arabicName === arabicCategory && hasPermission(userPermission, data.permission)) {
                stats[engCat] = commands.length;
                break;
            }
        }
    }
    
    return stats;
}

// التشغيل الرئيسي للأمر
module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID, senderID } = event;
    
    try {
        await api.setMessageReaction("⏳", messageID, () => {}, true);
        
        const userPermission = await getUserPermission(api, event);
        const accessibleCategories = await getAccessibleCategories(userPermission);
        const categoryStats = getCategoryStats(userPermission);
        
        if (accessibleCategories.length === 0) {
            await api.setMessageReaction("❌", messageID, () => {}, true);
            return api.sendMessage(`◈ ───« خـطـأ »─── ◈
│
◯ │ ليس لديك صلاحية لعرض الأوامر
│
◈ ─────────────── ◈`, threadID, messageID);
        }
        
        let message = `◈ ───« أوامـر كـيـرا »─── ◈
│
◯ │ 👤 صلاحيتك: ${userPermission === 2 ? 'مطور' : userPermission === 1 ? 'مشرف' : 'عضو'}
◯ │ 📊 اختر رقم الفئة:
│
◯ │ 0. إغلاق القائمة
│`;

        accessibleCategories.forEach((category, index) => {
            const count = categoryStats[category.eng] || 0;
            message += `\n◯ │ ${index + 1}. ${category.emoji} ${category.arabic} (${count} أمر)`;
        });

        message += `\n│
◈ ─────────────── ◈
◯ │ رد برقم الفئة
◯ │ مثال: رد بـ 1`;

        const sentMessage = await api.sendMessage(message, threadID);
        await api.setMessageReaction("✅", messageID, () => {}, true);
        
        global.client.handleReply.push({
            name: this.config.name,
            messageID: sentMessage.messageID,
            author: senderID,
            step: "choose_category",
            categories: accessibleCategories,
            userPermission: userPermission,
            categoryStats: categoryStats
        });
        
    } catch (error) {
        console.error("خطأ في أمر الأوامر:", error);
        await api.setMessageReaction("❌", messageID, () => {}, true);
        return api.sendMessage(
            `◈ ───« خـطـأ »─── ◈
│
◯ │ ${error.message || "حدث خطأ في جلب البيانات"}
◯ │ الأمر: اوامر
│
◈ ─────────────── ◈`,
            threadID, 
            messageID
        );
    }
};

// معالجة الردود
module.exports.handleReply = async function({ api, event, handleReply }) {
    const { threadID, body, senderID, messageID } = event;
    
    // التحقق من أن المرسل هو نفسه صاحب الطلب
    if (handleReply.author !== senderID) {
        return api.sendMessage(`◈ ───« رفـض »─── ◈
│
◯ │ هذا الرد ليس لك
│
◈ ─────────────── ◈`, threadID, messageID);
    }
    
    const input = body.trim();
    
    try { 
        await api.unsendMessage(handleReply.messageID); 
    } catch(e) {
        console.log("لم أستطع حذف الرسالة:", e.message);
    }
    
    if (handleReply.step === "choose_category") {
        if (input === "0") {
            await api.setMessageReaction("✅", messageID, () => {}, true);
            return api.sendMessage(`◈ ───« إغـلاق »─── ◈
│
◯ │ تم إغلاق قائمة الأوامر
◯ │ للعرض مجدداً: .اوامر
│
◈ ─────────────── ◈`, threadID, messageID);
        }
        
        const choice = parseInt(input);
        
        if (!isNaN(choice) && choice >= 1 && choice <= handleReply.categories.length) {
            const selectedCategory = handleReply.categories[choice - 1];
            const arabicCategory = selectedCategory.arabic;
            
            // الحصول على أوامر هذه الفئة
            const categoryCommands = IRAQI_COMMANDS[arabicCategory] || [];
            
            if (categoryCommands.length === 0) {
                await api.setMessageReaction("❌", messageID, () => {}, true);
                return api.sendMessage(
                    `◈ ───« فـئـة فـارغـة »─── ◈
│
◯ │ ${selectedCategory.emoji} ${arabicCategory}
◯ │ لا توجد أوامر في هذه الفئة حالياً
│
◈ ─────────────── ◈`,
                    threadID,
                    messageID
                );
            }
            
            let categoryMessage = `◈ ───« ${selectedCategory.emoji} ${arabicCategory} »─── ◈
│
◯ │ عدد الأوامر: ${categoryCommands.length}
◯ │ البادئة: ${global.config.PREFIX || "."}
│
◯ │ 📋 قائمة الأوامر:
│`;

            // عرض الأوامر مع وصف
            categoryCommands.forEach((cmd, i) => {
                categoryMessage += `\n◯ │ ${i + 1}. ${global.config.PREFIX || "."}${cmd}`;
                
                // إضافة وصف بسيط للأمر
                const descriptions = {
                    "حالت_البوت": "فحص حالة البوت",
                    "فلوسي": "عرض رصيدك",
                    "معلومات_الجروب": "معلومات المجموعة",
                    "كلم_المطور": "تواصل مع المطور",
                    "دكان_الاوامر": "عرض الأوامر المتاحة",
                    "مود_الادمن": "وضع الأدمنية فقط",
                    "نادي_الكل": "منشن جميع الأعضاء",
                    "فيديو_ذكي": "إنشاء فيديو بالذكاء الاصطناعي",
                    "صورت_الشخصية": "صورة شخصية أنمي",
                    "لعبة_الذكاء": "لعبة ذكاء وتخمين",
                    "ارفع_ملف": "رفع ملفات (للمطور)",
                    "نسخة_حماية": "نسخة احتياطية (للمطور)"
                };
                
                if (descriptions[cmd]) {
                    categoryMessage += ` - ${descriptions[cmd]}`;
                }
            });

            categoryMessage += `\n│
◈ ─────────────── ◈
◯ │ للعودة: رد بـ 0
◯ │ للخروج: تجاهل الرسالة`;

            await api.setMessageReaction("⏳", messageID, () => {}, true);
            const sentCategoryMessage = await api.sendMessage(categoryMessage, threadID);
            await api.setMessageReaction("✅", messageID, () => {}, true);
            
            global.client.handleReply.push({
                name: this.config.name,
                messageID: sentCategoryMessage.messageID,
                author: senderID,
                step: "view_category",
                previousStep: "choose_category",
                previousData: handleReply
            });
        } else {
            await api.setMessageReaction("❌", messageID, () => {}, true);
            return api.sendMessage(
                `◈ ───« خـطـأ »─── ◈
│
◯ │ الرقم غير صحيح
◯ │ يجب أن يكون بين 1 و ${handleReply.categories.length}
│
◈ ─────────────── ◈`,
                threadID,
                messageID
            );
        }
    } 
    else if (handleReply.step === "view_category") {
        if (input === "0") {
            // العودة للقائمة الرئيسية
            return module.exports.run({ 
                api, 
                event: { ...event, messageID: Date.now().toString() }, 
                args: [] 
            });
        }
        // تجاهل أي رد آخر غير 0
    }
};

// إضافة handleReaction للدعم الكامل
module.exports.handleReaction = async function({ api, event, handleReaction }) {
    // يمكن إضافة تفاعلات إضافية هنا إذا لزم الأمر
};
