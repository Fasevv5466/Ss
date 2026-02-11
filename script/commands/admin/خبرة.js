const path = require("path");

module.exports.config = {
    name: "خبرة",
    version: "1.2.0",
    hasPermssion: 2,
    credits: "ayman",
    description: "إضافة نقاط خبرة للمستخدمين عبر addExp",
    commandCategory: "admin",
    usages: "[@tag / id] [المبلغ]",
    cooldowns: 2
};

// دالة الخط الخشن البسيطة
const heavy = (text) => {
    const keys = {"0":"𝟬","1":"𝟭","2":"𝟮","3":"𝟯","4":"𝟰","5":"𝟱","6":"𝟲","7":"𝟳","8":"𝟴","9":"𝟵"};
    return text.toString().split("").map(char => keys[char] || char).join("");
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID, mentions } = event;
    const mongodb = require(path.join(process.cwd(), "includes", "mongodb.js"));

    try {
        let targetID, xpToAdd;

        // تحديد الشخص والمبلغ
        if (Object.keys(mentions).length > 0) {
            targetID = Object.keys(mentions)[0];
            xpToAdd = parseInt(args[args.length - 1]);
        } else {
            targetID = args[0];
            xpToAdd = parseInt(args[1]);
        }

        if (isNaN(xpToAdd)) return api.sendMessage("⚠️ يرجى كتابة مبلغ صحيح.", threadID, messageID);

        // استخدام دالة addExp الموجودة في ملف المونغو الخاص بك
        const result = await mongodb.addExp(targetID, xpToAdd);
        
        if (!result) return api.sendMessage("❌ فشل تحديث البيانات في قاعدة البيانات.", threadID, messageID);

        let msg = `--- تحديث الخبرة ---\n\n` +
                  `تم إضافة: +${xpToAdd.toLocaleString()} XP\n` +
                  `المستوى الحالي: ${heavy(result.level.toString())}\n` +
                  `الرتبة: ${result.rank.emoji} ${result.rank.name}`;

        if (result.isLevelUp) {
            msg += `\n\n🆙 ارتفاع مستوى!\nمكافأة: +${result.bonusMoney}$`;
        }

        api.setMessageReaction("✅", messageID, () => {}, true);
        return api.sendMessage(msg, threadID, messageID);

    } catch (e) {
        console.error(e);
        api.sendMessage("❌ حدث خطأ في النظام.", threadID, messageID);
    }
};
