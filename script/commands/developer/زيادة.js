const path = require("path");
const { addMoney } = require(path.join(process.cwd(), "includes", "mongodb.js"));

module.exports.config = {
    name: "زيادة",
    version: "2.5.0",
    hasPermssion: 2,
    credits: "أيمن",
    description: "شحن رصيد (المبلغ أولاً ثم الشخص)",
    commandCategory: "Developer",
    usages: ".زيادة [المبلغ] [@منشن/آيدي/رد]",
    cooldowns: 2
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID, senderID, type, messageReply, mentions } = event;

    // التحقق من وجود المفتاح في الكونفج
    const masterKey = global.config.MODEL_API_KEY;
    if (!masterKey) return api.sendMessage("❌ خطأ: لم يتم العثور على MODEL_API_KEY!", threadID, messageID);

    let targetID, amount;

    // 1. استخراج المبلغ (دائماً هو أول كلمة بعد الأمر)
    amount = parseInt(args[0]);

    // 2. تحديد المستهدف بناءً على ترتيبك المطلوب
    if (type == "message_reply") { 
        // الحالة: .زيادة 5000 (رد على رسالة)
        targetID = messageReply.senderID;
    } 
    else if (Object.keys(mentions).length > 0) { 
        // الحالة: .زيادة 5000 @فلان
        targetID = Object.keys(mentions)[0];
    } 
    else if (args.length >= 2) { 
        // الحالة: .زيادة 50000 ايدي
        targetID = args[1];
    } 
    else { 
        // الحالة: .زيادة (يزيد لنفسك إذا لم يحدد شخص)
        targetID = senderID;
        if (isNaN(amount)) amount = 5000; // مبلغ افتراضي إذا كتب زيادة فقط
    }

    if (isNaN(amount)) return api.sendMessage("⚠️ يرجى كتابة المبلغ أولاً! مثال: .زيادة 5000 @فلان", threadID, messageID);

    try {
        // التنفيذ في السحابة
        const newBalance = await addMoney(targetID, amount);
        
        return api.sendMessage(
            `✨ 𝗞𝗜𝗥𝗔 𝗖𝗟𝗢𝗨𝗗 ✨\n\n` +
            `✅ تم الشحن بنجاح\n` +
            `👤 المستلم: ${targetID}\n` +
            `💰 المبلغ: +${amount.toLocaleString()}$\n` +
            `🏦 الرصيد الحالي: ${newBalance.toLocaleString()}$`, 
            threadID, messageID
        );
    } catch (err) {
        return api.sendMessage(`❌ فشل الاتصال بالسحابة: ${err.message}`, threadID, messageID);
    }
};
