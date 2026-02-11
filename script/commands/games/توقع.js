const path = require("path");
const fs = require("fs-extra");

module.exports.config = {
    name: "توقع",
    version: "1.1.0",
    hasPermssion: 0,
    credits: "ayman",
    description: "لعبة الصناديق العملاقة بخط عريض",
    commandCategory: "games",
    usages: "[المبلغ]",
    cooldowns: 10
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID, senderID } = event;
    const mongodb = require(path.join(process.cwd(), "includes", "mongodb.js"));
    
    // دوال الخط الخشن
    const boldText = (text) => global.utils.toBoldSans(text);
    const heavyTitle = (text) => global.utils.toBoldMath(text); // الخط الخشن الرياضي
    
    const header = `⌬ ━━━━━━━━━━━━ ⌬\n   ${heavyTitle("𝗞𝗜𝗥𝗔 𝗠𝗘𝗚𝗔 𝗕𝗢𝗫𝗘𝗦")}\n⌬ ━━━━━━━━━━━━ ⌬`;

    try {
        const userData = await mongodb.getUserData(senderID);
        if (!userData) return api.sendMessage("❌ فشل الاتصال بقاعدة البيانات", threadID, messageID);

        let balance = userData.currency.money;
        let bet = args[0];

        if (!bet || isNaN(bet) || parseInt(bet) < 100) {
            return api.sendMessage(`${header}\n\n⚠️ ${boldText("تنبيه:")} أقل رهان هو 100$\nمثال: .توقع 1000`, threadID, messageID);
        }
        bet = parseInt(bet);

        if (bet > balance) {
            return api.sendMessage(`${header}\n\n❌ ${boldText("رصيدك غير كافٍ!")}\nتحتاج إلى ${bet - balance}$ إضافية.`, threadID, messageID);
        }

        const msg = `${header}\n\n` +
            `👤 ${boldText("اللاعب:")} ${userData.user.name}\n` +
            `💰 ${boldText("الرهان:")} ${bet}$\n\n` +
            `🎁 اختر صندوقك بحذر، الكنز ينتظرك!\n\n` +
            `1️⃣ 📦 ${heavyTitle("𝗕𝗢𝗫 𝟬𝟭")}\n` +
            `2️⃣ 📦 ${heavyTitle("𝗕𝗢𝗫 𝟬𝟮")}\n` +
            `3️⃣ 📦 ${heavyTitle("𝗕𝗢𝗫 𝟬𝟯")}\n\n` +
            `📥 ${boldText("رد برقم الصندوق لاختياره!")}`;

        return api.sendMessage(msg, threadID, (error, info) => {
            global.client.handleReply.push({
                name: this.config.name,
                messageID: info.messageID,
                author: senderID,
                bet: bet
            });
        }, messageID);

    } catch (e) {
        api.sendMessage("❌ عطل في النظام البنكي.", threadID, messageID);
    }
};

module.exports.handleReply = async function({ api, event, handleReply }) {
    const { threadID, messageID, senderID, body } = event;
    const { author, bet } = handleReply;
    if (senderID != author) return;

    const mongodb = require(path.join(process.cwd(), "includes", "mongodb.js"));
    const boldText = (text) => global.utils.toBoldSans(text);
    const heavyTitle = (text) => global.utils.toBoldMath(text);

    const headerWin = `⌬ ━━━━━━━━━━━━ ⌬\n   ${heavyTitle("𝗞𝗜𝗥𝗔 𝗧𝗥𝗘𝗔𝗦𝗨𝗥𝗘")}\n⌬ ━━━━━━━━━━━━ ⌬`;
    const headerLose = `⌬ ━━━━━━━━━━━━ ⌬\n     ${heavyTitle("𝗞𝗜𝗥𝗔 𝗕𝗢𝗢𝗠")}\n⌬ ━━━━━━━━━━━━ ⌬`;

    const choice = parseInt(body);
    if (isNaN(choice) || choice < 1 || choice > 3) return;

    api.unsendMessage(handleReply.messageID);
    api.setMessageReaction("🎲", messageID, () => {}, true);

    const winningBox = Math.floor(Math.random() * 3) + 1;
    const isWin = (choice === winningBox);

    try {
        if (isWin) {
            const prize = bet * 3;
            await mongodb.addMoney(senderID, prize);
            
            const winMsg = `${headerWin}\n\n` +
                `✨ ${boldText("اختيار أسطوري!")}\n` +
                `📦 فتحت الصندوق (${choice}) ووجدت الكنز!\n\n` +
                `💰 ${boldText("الربح:")} +${prize}$\n` +
                `🥳 مبروك يا بطل!`;
            
            api.setMessageReaction("✅", messageID, () => {}, true);
            return api.sendMessage(winMsg, threadID, messageID);
            
        } else {
            await mongodb.removeMoney(senderID, bet);
            
            const loseMsg = `${headerLose}\n\n` +
                `💥 ${boldText("انفجار مدوي!")}\n` +
                `📦 الصندوق رقم (${choice}) كان فخاً!\n\n` +
                `🗑️ ${boldText("الخسارة:")} -${bet}$\n` +
                `💡 الصندوق الذهبي كان: [ ${winningBox} ]`;
                
            api.setMessageReaction("❌", messageID, () => {}, true);
            return api.sendMessage(loseMsg, threadID, messageID);
        }
    } catch (e) {
        api.sendMessage("❌ خطأ في تحديث البيانات.", threadID, messageID);
    }
};
