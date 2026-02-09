const path = require("path");
const fs = require("fs");
const axios = require("axios");
const mongoPath = path.join(process.cwd(), "includes", "mongodb.js");
const { getUserData } = require(mongoPath);

module.exports.config = {
    name: "بنكي",
    version: "3.2.0",
    hasPermssion: 0,
    credits: "أيمن",
    description: "عرض الرصيد بتصميم مختصر ومرتب",
    commandCategory: "games",
    usages: "",
    cooldowns: 5
};

module.exports.run = async function({ api, event }) {
    const { threadID, messageID, senderID } = event;

    try {
        const userData = await getUserData(senderID);
        if (!userData || !userData.currency) {
            return api.sendMessage("⚠️ لا توجد بيانات، تفاعل لإنشاء حساب!", threadID, messageID);
        }

        const money = userData.currency.money || 0;
        const exp = userData.currency.exp || 0;

        // --- نظام الرتب بناءً على الـ XP ---
        let rank = "";
        if (exp >= 0 && exp < 200) rank = "مبتدئ";
        else if (exp >= 200 && exp < 300) rank = "مقاتل";
        else if (exp >= 300 && exp < 500) rank = "مطنوخ";
        else if (exp >= 500 && exp < 700) rank = "أسطورة";
        else if (exp >= 700 && exp < 1500) rank = "ملياردير";
        else if (exp >= 1500 && exp < 3000) rank = "كيان آخر";
        else rank = "حاكم كوني";

        const info = await api.getUserInfo(senderID);
        const name = info[senderID].name;
        const avatarUrl = `https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

        const cacheDir = path.join(__dirname, 'cache');
        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
        const avatarPath = path.join(cacheDir, `${senderID}_avatar.png`);
        
        const getAvatar = (await axios.get(avatarUrl, { responseType: 'arraybuffer' })).data;
        fs.writeFileSync(avatarPath, Buffer.from(getAvatar, 'utf-8'));

        // التنسيق الجديد المختصر حسب طلبك [العضو - الرتبة الرقم - الرصيد]
        const msg = {
            body: `⌬ ━━━ 𝗞𝗜𝗥𝗔 𝗕𝗔𝗡𝗞 ━━━ ⌬\n\n` +
                  `👤 العضو: ${name}\n` +
                  `🎖️ الرتبة: ${rank} (${exp})\n` +
                  `💰 الرصيد: ${money.toLocaleString()} $\n\n` +
                  `💡 اكتب (تحويل [المبلغ]) بالرد للتحويل.\n\n` +
                  `⌬ ━━━━━━━━━━━━━━ ⌬`,
            attachment: fs.createReadStream(avatarPath),
            mentions: [{ tag: name, id: senderID }]
        };

        return api.sendMessage(msg, threadID, () => {
            if (fs.existsSync(avatarPath)) fs.unlinkSync(avatarPath);
        }, messageID);

    } catch (err) {
        return api.sendMessage(`❌ فشل في جلب بيانات البنك.`, threadID, messageID);
    }
};
