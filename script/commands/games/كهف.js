const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports.config = {
    name: "كهف",
    version: "1.0.2",
    hasPermssion: 0,
    credits: "Ayman",
    description: "العمل في الكهوف للحصول على الأموال",
    commandCategory: "games",
    cooldowns: 30 // مدة الانتظار بالثواني
};

module.exports.onLoad = async () => {
    const dir = __dirname + `/cache/`;
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(dir + "cave.jpg")) {
        const res = await axios.get("https://i.postimg.cc/N0D5CTrg/Picsart-22-07-11-15-11-59-573.png", { responseType: "arraybuffer" });
        fs.writeFileSync(dir + "cave.jpg", Buffer.from(res.data));
    }
};

module.exports.handleReply = async ({ event, api, handleReply }) => {
    const { threadID, messageID, senderID, body } = event;
    if (handleReply.author != senderID) return api.sendMessage("⪼ اكعد راحة هذا مو شغلك!", threadID, messageID);

    const header = `⌬ ━━━━━━━━━━━━ ⌬`;
    const mongodb = require(path.join(process.cwd(), "includes", "mongodb.js"));
    
    // مبالغ عشوائية بين 500 و 5000
    const reward = Math.floor(Math.random() * 4501) + 500;
    const countries = {
        "1": "فيتنام",
        "2": "الصين",
        "3": "اليابان",
        "4": "تايلاند",
        "5": "أمريكا",
        "6": "كمبوديا"
    };

    if (!(body in countries)) {
        return api.sendMessage("⚠️ اخـتـر رقـم مـن 1 إلـى 6 فـقـط.", threadID, messageID);
    }

    const country = countries[body];
    await mongodb.addMoney(senderID, reward);
    api.unsendMessage(handleReply.messageID);

    return api.sendMessage(
        `${header}\n` +
        `✅ تـم الـعـمـل بـنـجـاح!\n` +
        `⪼ الـمـكـان: كـهـوف [ ${country} ]\n` +
        `⪼ الـمـبـلـغ: ${reward}$\n` +
        `${header}`, 
        threadID, messageID
    );
};

module.exports.run = async ({ event, api }) => {
    const { threadID, messageID, senderID } = event;
    const header = `⌬ ━━━━━━━━━━━━ ⌬\n      🕳️ أنـظـمـة الـكـهـوف\n⌬ ━━━━━━━━━━━━ ⌬`;
    const cachePath = __dirname + `/cache/cave.jpg`;

    const msg = {
        body: `${header}\n\n` +
            `1 ≻ فـيـتـنـام\n` +
            `2 ≻ الـصـيـن\n` +
            `3 ≻ الـيـابـان\n` +
            `4 ≻ تـايـلانـد\n` +
            `5 ≻ أمـريـكـا\n` +
            `6 ≻ كـمـبـوديـا\n\n` +
            `⪼ رد عـلـى الـرسـالـة بـرقـم الـدولـة.\n` +
            `⌬ ━━━━━━━━━━━━ ⌬`,
        attachment: fs.createReadStream(cachePath)
    };

    return api.sendMessage(msg, threadID, (err, info) => {
        global.client.handleReply.push({
            name: "كهف",
            author: senderID,
            messageID: info.messageID
        });
    }, messageID);
};
