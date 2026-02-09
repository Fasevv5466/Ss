const path = require("path");
const mongoPath = path.join(process.cwd(), "includes", "mongodb.js");
const { Currency, getUserData } = require(mongoPath);

module.exports.config = {
    name: "xpControl",
    eventType: ["message", "message_reply"],
    version: "1.2.0",
    credits: "أيمن",
    description: "تحديث الـ XP واللقب تلقائياً عند الوصول لفل جديد"
};

module.exports.run = async function({ api, event }) {
    const { senderID, body, threadID, type } = event;

    if (senderID == api.getCurrentUserID() || !body || type == "log:subscribe") return;

    try {
        // 1. تحديث الـ XP في السحابة
        const updatedUser = await Currency.findOneAndUpdate(
            { userID: senderID },
            { $inc: { exp: 2 } },
            { upsert: true, new: true }
        );

        const currentExp = updatedUser.exp;

        // 2. التحقق إذا وصل لفل جديد (كل 100 XP)
        // إذا كان باقي قسمة الـ XP على 100 هو 0 أو 2 (لأنه يزيد 2 كل مرة)
        if (currentExp % 100 === 0 || currentExp % 100 === 2) {
            
            // جلب اسم الشخص
            const info = await api.getUserInfo(senderID);
            const nameUser = info[senderID].name;

            // تحديث اللقب: NAME | XP: 100
            const newNickname = `${nameUser} | XP: ${currentExp}`;
            
            await api.changeNickname(newNickname, threadID, senderID);
            
            // إرسال رسالة مباركة بسيطة (اختياري)
            // api.sendMessage(`🎊 مبروك يا ${nameUser}! وصلت لفل جديد: ${Math.floor(currentExp/100) + 1}`, threadID);
        }

    } catch (err) {
        console.error("❌ [XP & Nickname Error]:", err.message);
    }
};
