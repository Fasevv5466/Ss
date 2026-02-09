const path = require("path");
const mongoPath = path.join(process.cwd(), "includes", "mongodb.js");
const { getUserData } = require(mongoPath);

module.exports.config = {
    name: "بنكي",
    version: "2.7.1",
    hasPermssion: 0,
    credits: "أيمن",
    description: "عرض رصيدك السحابي",
    commandCategory: "games", // تم التعديل هنا 🎮
    usages: "",
    cooldowns: 5
};

module.exports.run = async function({ api, event }) {
    const { threadID, messageID, senderID } = event;
    try {
        const userData = await getUserData(senderID);
        const money = userData.currency.money || 0;
        const exp = userData.currency.exp || 0;
        const info = await api.getUserInfo(senderID);
        const name = info[senderID].name;

        return api.sendMessage({
            body: `⌬ ━━━ 𝗞𝗜𝗥𝗔 𝗕𝗔𝗡𝗞 ━━━ ⌬\n\n` +
                  `👑 العضو: ${name}\n` +
                  `💰 الرصيد: ${money.toLocaleString()} $\n` +
                  `🌟 الخبرة: ${exp}\n\n` +
                  `💡 اكتب (تحويل [المبلغ]) بالرد أو المنشن لتحويل المال للأعضاء.\n\n` +
                  `⌬ ━━━━━━━━━━━━━━ ⌬`,
            mentions: [{ tag: name, id: senderID }]
        }, threadID, messageID);
    } catch (err) {
        return api.sendMessage(`❌ فشل في جلب بيانات البنك.`, threadID, messageID);
    }
};
