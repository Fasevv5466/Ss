// ✓صوت.js
module.exports.config = {
    name: "صوت",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "ayman",
    description: "إنشاء استفتاء أو تصويت",
    commandCategory: "Utility",
    usages: ".صوت [السؤال] | [الخيار1] | [الخيار2]",
    cooldowns: 3
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID, body } = event;
    const prefix = global.config.PREFIX;
    
    const text = body.slice(body.indexOf(args[0]));
    
    if (!text.includes("|")) {
        const msg = `📓 ───────────────
  ┝  [01] الاستخدام: ${prefix}صوت [السؤال] | [خيار1] | [خيار2]
  ┝  [02] مثال: ${prefix}صوت أفضل لون؟ | أزرق | أحمر
📓 ───────────────`;
        return api.sendMessage(msg, threadID, messageID);
    }
    
    const parts = text.split("|").map(p => p.trim());
    const question = parts[0];
    const options = parts.slice(1);
    
    if (options.length < 2) {
        return api.sendMessage("📓 ───────────────\n  ┝  [01] يجب إضافة خيارين على الأقل\n📓 ───────────────", threadID, messageID);
    }
    
    let pollMessage = `📓 ───────────────\n  ┝  [01] ${question}\n\n`;
    
    options.forEach((option, index) => {
        pollMessage += `  ┝  [${index + 2}] ${option}\n`;
    });
    
    pollMessage += "📓 ───────────────\n🎯 اضغط على التفاعل المناسب للتصويت";
    
    // إرسال الاستفتاء
    const sentMsg = await api.sendMessage(pollMessage, threadID, messageID);
    
    // إضافة تفاعلات للتصويت
    const reactions = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
    
    for (let i = 0; i < Math.min(options.length, 10); i++) {
        await api.setMessageReaction(reactions[i], sentMsg.messageID, () => {}, true);
    }
};
