const path = require("path");
const mongoPath = path.join(process.cwd(), "includes", "mongodb.js");
const { Currency } = require(mongoPath);

module.exports.config = {
    name: "xpUpdate",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "أيمن",
    description: "زيادة XP تلقائياً مع كل رسالة",
    commandCategory: "System",
    usages: "",
    cooldowns: 0 // بدون كول داون ليعمل مع كل رسالة
};

module.exports.handleEvent = async function({ api, event }) {
    const { senderID, type } = event;

    // التأكد أنها رسالة عادية وليست من بوت
    if (type !== "message" && type !== "message_reply") return;
    if (senderID == api.getCurrentUserID()) return;

    try {
        // زيادة 2 XP مباشرة في MongoDB
        await Currency.findOneAndUpdate(
            { userID: senderID },
            { 
                $inc: { exp: 2 }, // زيادة بمقدار 2
                $setOnInsert: { money: 0, lastDaily: 0 } // إذا كان الحساب جديداً
            },
            { upsert: true, new: true }
        );
        
        // ملاحظة: لم أضع رسالة تأكيد لكي لا يزعج البوت الأعضاء في كل رسالة!
    } catch (err) {
        console.error("XP Error:", err.message);
    }
};

module.exports.run = async function({ api, event }) {
    // هذه الدالة نتركها فارغة لأننا نعتمد على handleEvent
};

