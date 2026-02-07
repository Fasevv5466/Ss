module.exports.config = {
    name: "بطاقة",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Ayman",
    description: "تخصيص مظهر بطاقة المستخدم",
    commandCategory: "utility",
    usages: ".بطاقة [الخلفية/اللون] [القيمة]",
    cooldowns: 5
};

module.exports.run = async function({ api, event, args, Threads }) {
    const { threadID, messageID, senderID } = event;
    
    if (!args[0]) {
        return api.sendMessage(`◈ ───« اسـتـخـدام خـاطـئ »─── ◈
│
◯ │ الاستخدام: .بطاقة [الخلفية/اللون] [القيمة]
◯ │ مثال: .بطاقة الخلفية #FF0000
◯ │ مثال: .بطاقة اللون أزرق
│
◈ ─────────────── ◈`, threadID, messageID);
    }
    
    try {
        api.setMessageReaction("⏳", messageID, () => {}, true);
        
        const type = args[0];
        const value = args.slice(1).join(" ");
        
        const data = await Threads.getData(threadID) || {};
        data.cardSettings = data.cardSettings || {};
        data.cardSettings[senderID] = data.cardSettings[senderID] || {};
        
        if (type === 'الخلفية') {
            data.cardSettings[senderID].background = value;
        } else if (type === 'اللون') {
            data.cardSettings[senderID].color = value;
        } else {
            return api.sendMessage(`◈ ───« خـطـأ »─── ◈
│
◯ │ الخيارات المتاحة: الخلفية أو اللون فقط
│
◈ ─────────────── ◈`, threadID, messageID);
        }
        
        await Threads.setData(threadID, data);
        
        api.setMessageReaction("✅", messageID, () => {}, true);
        return api.sendMessage(`◈ ───« تـحـديـث الـمـظـهـر »─── ◈
│
◯ │ ✅ تم تغيير ${type} البطاقة بنجاح
◯ │ 🎨 القيمة الجديدة: ${value || 'الافتراضية'}
◯ │ 👁️ ستظهر التغييرات في المرة القادمة
│
◈ ─────────────── ◈`, threadID, messageID);
        
    } catch(error) {
        api.setMessageReaction("❌", messageID, () => {}, true);
        return api.sendMessage(`◈ ───« خـطـأ »─── ◈
│
◯ │ ${error.message}
◯ │ الأمر المستدعى: بطاقة
│
◈ ─────────────── ◈`, threadID, messageID);
    }
};
