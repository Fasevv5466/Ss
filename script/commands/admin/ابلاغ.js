module.exports.config = {
    name: "ابلاغ",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Ayman",
    description: "إرسال رسالة أو بلاغ إلى مشرفي المجموعة",
    commandCategory: "admin",
    usages: ".ابلاغ [نص الرسالة]",
    cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID, senderID } = event;
    
    if (!args[0]) {
        return api.sendMessage(`◈ ───« اسـتـخـدام خـاطـئ »─── ◈
│
◯ │ يرجى كتابة رسالتك الموجهة للمشرفين
◯ │ مثال: .ابلاغ توجد مشكلة في المجموعة
│
◈ ─────────────── ◈`, threadID, messageID);
    }
    
    try {
        api.setMessageReaction("⏳", messageID, () => {}, true);
        
        const threadInfo = await api.getThreadInfo(threadID);
        const admins = threadInfo.adminIDs.map(a => a.id);
        
        if (admins.length === 0) {
            return api.sendMessage(`◈ ───« تـنـبـيـه »─── ◈
│
◯ │ لا يوجد مشرفون معينون في هذه المجموعة
│
◈ ─────────────── ◈`, threadID, messageID);
        }
        
        const message = args.join(" ");
        const userInfo = await api.getUserInfo(senderID);
        const userName = userInfo[senderID]?.name || "عضو مجهول";
        
        const msgToAdmin = `◈ ───« بـلاغ جـديـد »─── ◈
│
◯ │ 👤 المرسل: ${userName}
◯ │ 🔢 المعرف (ID): ${senderID}
◯ │ 👥 المجموعة: ${threadInfo.threadName || "غير مسمى"}
◯ │ 📝 محتوى البلاغ: ${message}
│
◈ ─────────────── ◈`;
        
        let sentCount = 0;
        for (const adminID of admins) {
            try {
                await api.sendMessage(msgToAdmin, adminID);
                sentCount++;
            } catch(e) {}
        }
        
        api.setMessageReaction("✅", messageID, () => {}, true);
        return api.sendMessage(`◈ ───« حـالـة الإرسـال »─── ◈
│
◯ │ ✅ تم إرسال رسالتك بنجاح
◯ │ 👑 المشرفون المستلمون: ${sentCount}/${admins.length}
◯ │ ⏳ سيتم مراجعة طلبك قريباً
│
◈ ─────────────── ◈`, threadID, messageID);
        
    } catch(error) {
        api.setMessageReaction("❌", messageID, () => {}, true);
        return api.sendMessage(`◈ ───« خـطـأ »─── ◈
│
◯ │ ${error.message}
◯ │ الأمر المستدعى: ابلاغ
│
◈ ─────────────── ◈`, threadID, messageID);
    }
};
