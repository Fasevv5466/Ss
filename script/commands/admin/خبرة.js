 const path = require("path");

module.exports.config = {
    name: "خبرة",
    version: "1.0.0",
    hasPermssion: 2, // للمطورين والمشرفين فقط
    credits: "ayman",
    description: "إضافة نقاط خبرة للمستخدمين من KiraDB",
    commandCategory: "admin",
    usages: "[@tag / id] [المبلغ]",
    cooldowns: 2
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID, senderID, mentions } = event;
    const mongodb = require(path.join(process.cwd(), "includes", "mongodb.js"));

    // دالة الخط الخشن النيوني
    const heavy = (text) => {
        const keys = {
            "A":"𝗔","B":"𝗕","C":"𝗖","D":"𝗗","E":"𝗘","F":"𝗙","G":"𝗚","H":"𝗛","I":"𝗜","J":"𝗝","K":"𝗞","L":"𝗟","M":"𝗠","N":"𝗡","O":"𝗢","P":"𝗣","Q":"𝗤","R":"𝗥","S":"𝗦","T":"𝗧","U":"𝗨","V":"𝗩","W":"𝗪","X":"𝗫","Y":"𝗬","Z":"𝗭",
            "a":"𝗮","b":"𝗯","c":"𝗰","d":"𝗱","e":"𝗲","f":"𝗳","g":"𝗴","h":"𝗵","i":"𝗶","j":"𝗷","k":"𝗸","l":"𝗹","m":"𝗺","n":"𝗻","o":"𝗼","p":"𝗽","q":"𝗾","r":"𝗿","s":"𝘀","t":"𝘁","u":"𝘂","v":"𝘃","w":"𝘄","x":"𝘅","y":"𝘆","z":"𝘇",
            "0":"𝟬","1":"𝟭","2":"𝟮","3":"𝟯","4":"𝟰","5":"𝟱","6":"𝟲","7":"𝟳","8":"𝟴","9":"𝟵"
        };
        return text.split("").map(char => keys[char] || char).join("");
    };

    const bold = (text) => global.utils.toBoldSans(text);
    const header = `⌬ ━━━━━━━━━━━━ ⌬\n   ${heavy("𝗞𝗜𝗥𝗔 𝗫𝗣 𝗦𝗬𝗦𝗧𝗘𝗠")}\n⌬ ━━━━━━━━━━━━ ⌬`;

    try {
        let targetID, xpToAdd;

        // التحقق من المدخلات (تاغ أو آيدي)
        if (Object.keys(mentions).length > 0) {
            targetID = Object.keys(mentions)[0];
            xpToAdd = parseInt(args[args.length - 1]);
        } else {
            targetID = args[0];
            xpToAdd = parseInt(args[1]);
        }

        if (isNaN(xpToAdd)) {
            return api.sendMessage(`${header}\n\n⚠️ ${bold("خطأ:")} يرجى تحديد كمية الـ XP المطلوبة.\nمثال: .زيادة_خبرة @tag 5000`, threadID, messageID);
        }

        const userData = await mongodb.getUserData(targetID);
        if (!userData) return api.sendMessage("❌ هذا العضو غير مسجل في قاعدة البيانات.", threadID, messageID);

        // إضافة الخبرة في المونغو
        // ملاحظة: تأكد أن ملف mongodb.js يحتوي على دالة addExp أو استخدمنا التعديل المباشر
        userData.currency.exp += xpToAdd;
        await mongodb.updateUserData(targetID, { "currency.exp": userData.currency.exp });

        api.setMessageReaction("⚡", messageID, () => {}, true);
        
        const successMsg = `${header}\n\n` +
            `✨ ${heavy("𝗦𝗨𝗖𝗖𝗘𝗦𝗦")}\n` +
            `👤 ${bold("المستلم:")} ${userData.user.name}\n` +
            `⚡ ${bold("تم إضافة:")} +${xpToAdd.toLocaleString()} XP\n` +
            `📊 ${bold("الإجمالي:")} ${userData.currency.exp.toLocaleString()} XP\n\n` +
            `🔥 ${heavy("𝗞𝗜𝗥𝗔 𝗣𝗢𝗪𝗘𝗥 𝗨𝗣")}`;

        return api.sendMessage(successMsg, threadID, messageID);

    } catch (e) {
        console.error(e);
        api.sendMessage("❌ فشل تحديث مستويات الخبرة.", threadID, messageID);
    }
};
