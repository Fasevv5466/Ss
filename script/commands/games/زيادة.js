const fs = require("fs");
const path = require("path");

module.exports.config = {
    name: "زيادة",
    version: "1.1.5",
    hasPermssion: 2,
    credits: "أيمن",
    description: "شحن رصيد للمطور في MongoDB",
    commandCategory: "Developer",
    usages: "[المبلغ]",
    cooldowns: 2
};

module.exports.run = async function({ api, event, args }) {
    // مصفوفة بالمسارات المحتملة للملف
    const possiblePaths = [
        path.join(process.cwd(), "Includes", "mongodb.js"),
        path.join(process.cwd(), "includes", "mongodb.js"),
        path.join(__dirname, "../../../Includes/mongodb.js"),
        path.join(__dirname, "../../../includes/mongodb.js")
    ];

    let mongoPath = possiblePaths.find(p => fs.existsSync(p));

    if (!mongoPath) {
        return api.sendMessage("❌ لم يتم العثور على ملف mongodb.js في أي مكان! تأكد من وجود المجلد والملف وصحة الإملاء.", event.threadID);
    }

    try {
        const { addMoney } = require(mongoPath);
        const amount = parseInt(args[0]) || 5000;
        const newBalance = await addMoney(event.senderID, amount);
        return api.sendMessage(`✅ [MONGODB]\nتم الاتصال بنجاح.\n💰 رصيدك الحالي: ${newBalance}$`, event.threadID, event.messageID);
    } catch (err) {
        return api.sendMessage(`❌ خطأ داخلي: ${err.message}`, event.threadID);
    }
};
