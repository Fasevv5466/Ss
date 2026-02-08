module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
    const { threadID, messageID } = event;
    
    const prefix = global.config.PREFIX || ".";
    
    if (args[0]) {
        return api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\nلعرض قائمة الأوامر استخدم: ${prefix}مساعدة`, threadID, messageID);
    }
    
    const message = `⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\nقائمة الأوامر الرئيسية:\n\n📥 التحميل:\n• ${prefix}يوت - تحميل من يوتيوب\n• ${prefix}تيك - تحميل من تيك توك\n• ${prefix}انستا - تحميل من انستغرام\n• ${prefix}تحميل - تحميل شامل\n\n🎮 الألعاب:\n• ${prefix}سلوت - ماكينة الحظ\n• ${prefix}خمن - تخمين الرقم\n• ${prefix}صراحة - صراحة وجرأة\n\n🎨 الصور:\n• ${prefix}بينترست - بحث صور\n• ${prefix}صورة - صورة الحساب\n\n🛠 الأدوات:\n• ${prefix}جي - الذكاء الاصطناعي\n• ${prefix}بي - Pi AI\n• ${prefix}طقس - حالة الطقس\n• ${prefix}ترجم - ترجمة النصوص\n• ${prefix}معلومات - معلومات المجموعة\n• ${prefix}ابتايم - إحصائيات البوت\n• ${prefix}رصيد - عرض الرصيد\n• ${prefix}معرف - معرف الحساب\n\n👥 الإدارة:\n• ${prefix}طرد - طرد عضو\n• ${prefix}حظر - حظر من البوت\n• ${prefix}الكل - منشن جماعي\n\n💝 الترفيه:\n• ${prefix}عناق - عناق شخص\n• ${prefix}زواج - طلب زواج\n• ${prefix}توافق - نسبة التوافق\n\n🎬 الميديا:\n• ${prefix}البوم - ألبوم الفيديوهات\n• ${prefix}تطوير - تحسين الصور\n\n👨‍💻 المطور:\n• ${prefix}المطور - معلومات المطور`;
    
    return api.sendMessage(message, threadID, messageID);
};

module.exports.config = {
    name: "مساعدة",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "ايمن",
    description: "قائمة الأوامر",
    commandCategory: "utility",
    usages: "مساعدة",
    cooldowns: 5
};
