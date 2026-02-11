const path = require("path");

module.exports.config = {
    name: "توقع",
    version: "1.2.0",
    hasPermssion: 0,
    credits: "ayman",
    description: "لعبة الصناديق العملاقة بخط عريض - النسخة المصححة",
    commandCategory: "games",
    usages: "[المبلغ]",
    cooldowns: 10
};

// دالة تحويل الخط إلى خشن (Math Bold) لضمان العمل بدون أخطاء سورس
const heavyTitle = (text) => {
    const keys = {
        "A":"𝗔","B":"𝗕","C":"𝗖","D":"𝗗","E":"𝗘","F":"𝗙","G":"𝗚","H":"𝗛","I":"𝗜","J":"𝗝","K":"𝗞","L":"𝗟","M":"𝗠","N":"𝗡","O":"𝗢","P":"𝗣","Q":"𝗤","R":"𝗥","S":"𝗦","T":"𝗧","U":"𝗨","V":"𝗩","W":"𝗪","X":"𝗫","Y":"𝗬","Z":"𝗭",
        "a":"𝗮","b":"𝗯","c":"𝗰","d":"𝗱","e":"𝗲","f":"𝗳","g":"𝗴","h":"𝗵","i":"𝗶","j":"𝗷","k":"𝗸","l":"𝗹","m":"𝗺","n":"𝗻","o":"𝗼","p":"𝗽","q":" strip","r":"𝗿","s":"𝘀","t":"𝘁","u":"𝘂","v":"𝘃","w":"𝘄","x":"𝗘","y":"𝘆","z":"𝘇",
        "0":"𝟬","1":"𝟭","2":"𝟮","3":"𝟯","4":"𝟰","5":"𝟱","6":"𝟲","7":"𝟳","8":"𝟴","9":"𝟵"
    };
    return text.split("").map(char => keys[char] || char).join("");
};

const boldText = (text) => {
    const keys = {" ": " "}; // دالة مبسطة للبولد لضمان عدم توقف الكود
    return text; // يمكنك استبدالها بدالة البولد الخاصة بسورسك إذا كانت تعمل
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID, senderID } = event;
    const mongodb = require(path.join(process.cwd(), "includes", "mongodb.js"));
    
    const header = `⌬ ━━━━━━━━━━━━ ⌬\n   ${heavyTitle("KIRA MEGA BOXES")}\n⌬ ━━━━━━━━━━━━ ⌬`;

    try {
        const userData = await mongodb.getUserData(senderID);
        if (!userData) return api.sendMessage("❌ فشل الاتصال بقاعدة البيانات", threadID, messageID);

        let balance = userData.currency.money;
        let bet = args[0];

        if (!bet || isNaN(bet) || parseInt(bet) < 100) {
            return api.sendMessage(`${header}\n\n⚠️ يرجى كتابة مبلغ الرهان (أقل شيء 100)\nمثال: .توقع 1000`, threadID, messageID);
        }
        bet = parseInt(bet);

        if (bet > balance) {
            return api.sendMessage(`${header}\n\n❌ رصيدك غير كافٍ!\nتحتاج إلى ${bet - balance}$ إضافية.`, threadID, messageID);
        }

        const msg = `${header}\n\n` +
            `👤 اللاعب: ${userData.user.name}\n` +
            `💰 الرهان: ${bet}$\n\n` +
            `🎁 اختر صندوقك بحذر، الكنز ينتظرك!\n\n` +
            `1️⃣ 📦 ${heavyTitle("BOX 01")}\n` +
            `2️⃣ 📦 ${heavyTitle("BOX 02")}\n` +
            `3️⃣ 📦 ${heavyTitle("BOX 03")}\n\n` +
            `📥 رد برقم الصندوق لاختياره!`;

        return api.sendMessage(msg, threadID, (error, info) => {
            if (error) return console.log(error);
            global.client.handleReply.push({
                name: this.config.name,
                messageID: info.messageID,
                author: senderID,
                bet: bet
            });
        }, messageID);

    } catch (e) {
        console.log(e);
        api.sendMessage("❌ عطل في النظام البنكي.", threadID, messageID);
    }
};

module.exports.handleReply = async function({ api, event, handleReply }) {
    const { threadID, messageID, senderID, body } = event;
    const { author, bet } = handleReply;
    if (senderID != author) return;

    const mongodb = require(path.join(process.cwd(), "includes", "mongodb.js"));
    
    const headerWin = `⌬ ━━━━━━━━━━━━ ⌬\n   ${heavyTitle("KIRA TREASURE")}\n⌬ ━━━━━━━━━━━━ ⌬`;
    const headerLose = `⌬ ━━━━━━━━━━━━ ⌬\n     ${heavyTitle("KIRA BOOM")}\n⌬ ━━━━━━━━━━━━ ⌬`;

    const choice = parseInt(body);
    if (isNaN(choice) || choice < 1 || choice > 3) return api.sendMessage("❌ اختر رقم من 1 إلى 3 فقط!", threadID, messageID);

    api.unsendMessage(handleReply.messageID);
    api.setMessageReaction("🎲", messageID, () => {}, true);

    const winningBox = Math.floor(Math.random() * 3) + 1;
    const isWin = (choice === winningBox);

    try {
        if (isWin) {
            const prize = bet * 3;
            await mongodb.addMoney(senderID, prize);
            
            const winMsg = `${headerWin}\n\n` +
                `✨ اختيار أسطوري!\n` +
                `📦 فتحت الصندوق (${choice}) ووجدت الكنز!\n\n` +
                `💰 الربح: +${prize}$\n` +
                `🥳 مبروك يا بطل!`;
            
            api.setMessageReaction("✅", messageID, () => {}, true);
            return api.sendMessage(winMsg, threadID, messageID);
            
        } else {
            await mongodb.removeMoney(senderID, bet);
            
            const loseMsg = `${headerLose}\n\n` +
                `💥 انفجار مدوي!\n` +
                `📦 الصندوق رقم (${choice}) كان فخاً!\n\n` +
                `🗑️ الخسارة: -${bet}$\n` +
                `💡 الصندوق الذهبي كان: [ ${winningBox} ]`;
                
            api.setMessageReaction("❌", messageID, () => {}, true);
            return api.sendMessage(loseMsg, threadID, messageID);
        }
    } catch (e) {
        console.log(e);
        api.sendMessage("❌ خطأ في تحديث البيانات المالية.", threadID, messageID);
    }
};
