const path = require("path");
const { addMoney } = require(path.join(process.cwd(), "includes", "mongodb.js"));

module.exports.config = {
    name: "زيادة",
    version: "1.4.0",
    hasPermssion: 2,
    credits: "أيمن",
    description: "شحن رصيد مع التحقق من مفتاح Atlas API",
    commandCategory: "Developer",
    usages: "[المبلغ]",
    cooldowns: 2
};

module.exports.run = async function({ api, event, args }) {
    // جلب المفتاح من config.json
    const masterKey = global.config.MODEL_API_KEY;

    // التحقق من وجود المفتاح (إثبات الربط)
    if (!masterKey || !masterKey.startsWith("al-wr4D")) { // التحقق من بداية المفتاح الذي ظهر بالصورة
        return api.sendMessage("⚠️ خطأ: مفتاح Atlas API غير صالح أو غير مرتبط بالكونفج!", event.threadID);
    }

    const amount = parseInt(args[0]) || 5000;

    try {
        // تنفيذ الإضافة في قاعدة البيانات السحابية
        const newBalance = await addMoney(event.senderID, amount);

        return api.sendMessage(
            `✨ ━━ 𝗞𝗜𝗥𝗔 𝗖𝗟𝗢𝗨𝗗 ━━ ✨\n\n` +
            `🔑 تم التحقق من الـ API Key بنجاح\n` +
            `📡 الاتصال: سحابي (Project 0)\n\n` +
            `✅ تم إضافة ${amount.toLocaleString()}$ برصيدك.\n` +
            `💰 الإجمالي الحالي: ${newBalance.toLocaleString()}$`, 
            event.threadID, event.messageID
        );

    } catch (err) {
        return api.sendMessage(`❌ فشل الاتصال بالسحابة: ${err.message}`, event.threadID);
    }
};
