const path = require("path");
const { addMoney } = require(path.join(process.cwd(), "includes", "mongodb.js"));

module.exports.config = {
    name: "زيادة",
    version: "1.4.1",
    hasPermssion: 2,
    credits: "أيمن",
    description: "شحن رصيد مع فحص دقيق للمفتاح",
    commandCategory: "Developer",
    usages: "[المبلغ]",
    cooldowns: 2
};

module.exports.run = async function({ api, event, args }) {
    // جلب المفتاح من global.config
    const masterKey = global.config.MODEL_API_KEY;

    // طباعة المفتاح في الكونسول للتأكد (سيظهر في التيرمينال عندك)
    console.log("Master Key from Config:", masterKey);

    if (!masterKey) {
        return api.sendMessage("❌ لم أجد MODEL_API_KEY في ملف config.json!", event.threadID);
    }

    const amount = parseInt(args[0]) || 5000;

    try {
        const newBalance = await addMoney(event.senderID, amount);
        return api.sendMessage(`✨ 𝗞𝗜𝗥𝗔 𝗖𝗟𝗢𝗨𝗗 ✨\n\n✅ تم الاتصال بالسحابة\n💰 الرصيد الجديد: ${newBalance.toLocaleString()}$`, event.threadID, event.messageID);
    } catch (err) {
        return api.sendMessage(`❌ فشل الاتصال: ${err.message}`, event.threadID);
    }
};
