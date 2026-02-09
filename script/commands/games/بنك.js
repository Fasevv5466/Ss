const path = require("path");
// الربط بمجلد includes (بالصغير) كما في صورتك
const mongoPath = path.join(process.cwd(), "includes", "mongodb.js");
const { getUserData } = require(mongoPath);

module.exports.config = {
    name: "بنكي",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "أيمن",
    description: "عرض رصيدك السحابي بتصميم فخم",
    commandCategory: "games",
    usages: "",
    cooldowns: 5
};

module.exports.run = async function({ api, event }) {
    const { threadID, messageID, senderID } = event;

    try {
        // جلب البيانات مباشرة من MongoDB
        const { currency } = await getUserData(senderID);
        
        // تنسيق الرقم بفاصلة (مثلاً 10,000,000)
        const formattedMoney = currency.money.toLocaleString();

        const msg = {
            body: `⌬ ━━━ 𝗞𝗜𝗥𝗔 𝗕𝗔𝗡𝗞 ━━━ ⌬\n\n` +
                  `👤 الحساب: @${senderID}\n` +
                  `💰 الرصيد الحالي: ${formattedMoney} $\n` +
                  `🌟 مستوى الخبرة: ${currency.exp}\n` +
                  `✨ الحالة: مرتبط بالسحابة ☁️\n\n` +
                  `📅 تحديث: ${new Date(currency.updatedAt).toLocaleDateString('ar-EG')}\n` +
                  `⌬ ━━━━━━━━━━━━━━ ⌬`,
            attachment: await global.utils.getStreamFromURL("https://files.catbox.moe/wmanqs.jpg")
        };

        return api.sendMessage(msg, threadID, messageID);

    } catch (err) {
        console.error(err);
        return api.sendMessage("❌ عذراً أيمن، فشل البنك في الاتصال بالسحابة!", threadID, messageID);
    }
};
