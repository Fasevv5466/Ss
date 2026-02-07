module.exports.config = {
    name: "رسائل",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Ayman",
    description: "عرض إحصائيات الرسائل في المجموعة",
    commandCategory: "utility",
    usages: ".رسائل [@منشن/الكل]",
    cooldowns: 5
};

module.exports.run = async function({ api, event, args, Threads, Users }) {
    const { threadID, messageID, senderID, mentions } = event;
    
    try {
        api.setMessageReaction("⏳", messageID, () => {}, true);
        
        const threadData = await Threads.getData(threadID);
        const members = threadData.members || [];
        
        if (args[0] === 'الكل') {
            const sorted = members
                .filter(m => m.count > 0)
                .sort((a, b) => b.count - a.count)
                .slice(0, 10);
            
            if (sorted.length === 0) {
                return api.sendMessage(`◈ ───« الـإحـصـائـيـات »─── ◈
│
◯ │ 📭 لا توجد رسائل مسجلة حالياً
│
◈ ─────────────── ◈`, threadID, messageID);
            }
            
            let msg = `◈ ───« الـإحـصـائـيـات »─── ◈
│
◯ │ 📊 قائمة الأعضاء الـ 10 الأكثر تفاعلاً
│
`;
            
            sorted.forEach((member, i) => {
                msg += `◯ │ ${i+1}. ${member.name}\n`;
                msg += `◯ │   📨 عدد الرسائل: ${member.count}\n│\n`;
            });
            
            msg += `◈ ─────────────── ◈`;
            
            api.setMessageReaction("✅", messageID, () => {}, true);
            return api.sendMessage(msg, threadID, messageID);
        }
        else if (Object.keys(mentions).length > 0) {
            const targetID = Object.keys(mentions)[0];
            const member = members.find(m => m.userID === targetID);
            
            if (!member) {
                return api.sendMessage(`◈ ───« مـعـلـومـات الـعـضـو »─── ◈
│
◯ │ 👤 ${mentions[targetID]}
◯ │ 📨 عدد الرسائل: 0
◯ │ 📊 الترتيب: غير مصنف
│
◈ ─────────────── ◈`, threadID, messageID);
            }
            
            const allCounts = members.map(m => m.count || 0);
            const rank = allCounts.filter(c => c > (member.count || 0)).length + 1;
            
            api.setMessageReaction("✅", messageID, () => {}, true);
            return api.sendMessage(`◈ ───« مـعـلـومـات الـعـضـو »─── ◈
│
◯ │ 👤 ${member.name}
◯ │ 📨 عدد الرسائل: ${member.count || 0}
◯ │ 📊 الترتيب: ${rank} من أصل ${members.length}
│
◈ ─────────────── ◈`, threadID, messageID);
        }
        else {
            const member = members.find(m => m.userID === senderID);
            const allCounts = members.map(m => m.count || 0);
            const rank = member ? allCounts.filter(c => c > (member.count || 0)).length + 1 : 'غير مصنف';
            
            api.setMessageReaction("✅", messageID, () => {}, true);
            return api.sendMessage(`◈ ───« إحـصـائـيـاتـك الـشـخـصـيـة »─── ◈
│
◯ │ 👤 العضو: أنت
◯ │ 📨 عدد الرسائل: ${member?.count || 0}
◯ │ 📊 الترتيب الحالي: ${rank} من أصل ${members.length}
│
◈ ─────────────── ◈`, threadID, messageID);
        }
        
    } catch(error) {
        api.setMessageReaction("❌", messageID, () => {}, true);
        return api.sendMessage(`◈ ───« خـطـأ »─── ◈
│
◯ │ ${error.message}
◯ │ الأمر المستدعى: رسائل
│
◈ ─────────────── ◈`, threadID, messageID);
    }
};
