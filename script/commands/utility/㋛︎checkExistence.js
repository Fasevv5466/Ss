// ═══════════════════════════════════════════════════════════
// 👑 KIRA - existence
// المطور: Ayman ♛
// الوصف: يغادر البوت تلقائياً إذا لم يكن الشخص المحدد موجوداً
// ═══════════════════════════════════════════════════════════

module.exports.config = {
    name: "existence",
  aliases: [],
    version: "1.1.0",
    hasPermssion: 0,
    credits: "Ayman ♛",
    description: "يغادر البوت تلقائياً إذا لم يكن الشخص المحدد موجوداً",
    commandCategory: "utility",
    usages: "",
    cooldowns: 5
};

module.exports.handleEvent = async function({ api, event }) {
    const { threadID, isGroup } = event;
    const REQUIRED_USER_ID = "61577861540407"; // معرف الشخص المطلوب

    if (isGroup) {
        try {
            const threadInfo = await api.getThreadInfo(threadID);
            const isRequiredUserHere = threadInfo.participantIDs.includes(REQUIRED_USER_ID);

            if (!isRequiredUserHere) {
                // رسالة وداع هادئة
                await api.sendMessage("تنبيه: الشخص المطلوب غير موجود. البوت سيغادر المجموعة.", threadID);
                
                // مغادرة المجموعة
                return api.removeUserFromGroup(api.getCurrentUserID(), threadID);
            }
        } catch (e) {
            console.log("خطأ في التحقق من وجود الشخص المطلوب:", e);
        }
    }
};

module.exports.run = async function() {
    // هذا الحدث يعمل تلقائيًا عند كل رسالة، لا يحتاج تشغيل يدوي
};
