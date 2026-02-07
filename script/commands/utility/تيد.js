module.exports.config = {
    name: "تيد",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Ayman",
    description: "عرض بيانات المجموعة باختصار",
    commandCategory: "utility",
    usages: ".تيد",
    cooldowns: 5
};

module.exports.run = async function({ api, event }) {
    const { threadID, messageID } = event;
    
    try {
        api.setMessageReaction("⏳", messageID, () => {}, true);
        
        const threadInfo = await api.getThreadInfo(threadID);
        const males = threadInfo.userInfo.filter(u => u.gender === "MALE").length;
        const females = threadInfo.userInfo.filter(u => u.gender === "FEMALE").length;
        
        const msg = `◈ ──« مـعـلـومات »── ◈
◯ الاسم: ${threadInfo.threadName}
◯ الآيدي: ${threadID}
◯ الأعضاء: ${threadInfo.participantIDs.length}
◯ ذكور: ${males} | إناث: ${females}
◯ المشرفون: ${threadInfo.adminIDs.length}
◯ الرمز: ${threadInfo.emoji || 'افتراضي'}
◯ الموافقة: ${threadInfo.approvalMode ? 'مفعل' : 'معطل'}
◈ ─────── ◈`;
        
        api.setMessageReaction("✅", messageID, () => {}, true);
        return api.sendMessage(msg, threadID, messageID);
        
    } catch(error) {
        api.setMessageReaction("❌", messageID, () => {}, true);
        return api.sendMessage(`❌ خطأ: ${error.message}`, threadID, messageID);
    }
};
