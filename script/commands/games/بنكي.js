const path = require("path");
const mongoPath = path.join(process.cwd(), "includes", "mongodb.js");
const { getUserData } = require(mongoPath);

module.exports.config = {
    name: "بنكي",
    version: "2.2.0",
    hasPermssion: 0,
    credits: "أيمن",
    description: "عرض رصيدك السحابي (نسخة سريعة)",
    commandCategory: "Economy",
    usages: "",
    cooldowns: 5
};

module.exports.run = async function({ api, event }) {
    const { threadID, messageID, senderID } = event;

    try {
        // جلب البيانات مباشرة من MongoDB
        const userData = await getUserData(senderID);
        
        if (!userData || !userData.currency) {
            return api.sendMessage("⚠️ لم يتم العثور على بيانات سحابية، جرب شحن رصيدك أولاً.", threadID, messageID);
        }

        const money = userData.currency.money || 0;
        const exp = userData.currency.exp || 0;
        const lastUpdate = userData.currency.updatedAt || new Date();

        // رسالة نصية مرتبة بالكامل بدون صور
        const msg = `⌬ ━━━ 𝗞𝗜𝗥𝗔 𝗕𝗔𝗡𝗞 ━━━ ⌬\n\n` +
                    `👤 الحساب: @${senderID}\n` +
                    `💰 الرصيد: ${money.toLocaleString()} $\n` +
                    `🌟 الخبرة: ${exp}\n` +
                    `✨ الحالة: متصل بالسحابة ✅\n\n` +
                    `📅 التحديث: ${new Date(lastUpdate).toLocaleString('ar-EG')}\n` +
                    `⌬ ━━━━━━━━━━━━━━ ⌬`;

        return api.sendMessage(msg, threadID, messageID);

    } catch (err) {
        console.error("Bank Error:", err);
        return api.sendMessage(`❌ فشل الاتصال: ${err.message}`, threadID, messageID);
    }
};
