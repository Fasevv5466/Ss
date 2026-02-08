// ═══════════════════════════════════════════════════════════
// 👑 KIRA - جزاء
// المطور: Ayman ♛
// الوصف: لعبة ركلات الجزاء الإمبراطورية - راهن على لاعبك المفضل
// ═══════════════════════════════════════════════════════════

const axios = require("axios");

module.exports.config = {
    name: "جزاء",
  aliases: [],
    version: "2.0.0",
    hasPermssion: 0,
    credits: "Ayman ♛",
    description: "لعبة ركلات الجزاء الإمبراطورية - راهن على لاعبك المفضل",
    commandCategory: "games",
    usages: "[المبلغ]",
    cooldowns: 5
};

module.exports.run = async ({ api, event, args, Currencies }) => {
    const { threadID, messageID, senderID } = event;
    const out = (msg, attachment) => api.sendMessage({ body: msg, attachment }, threadID, messageID);

    if (args[0] == "هلب") {
        let img = (await axios.get("https://i.imgur.com/VYf0UGv.jpg", { responseType: "stream" })).data;
        return out("◈ ───『 تـعـلـيـمات الـجـزاء 』─── ◈\n\n◯ قم بكتابة (جزاء + مبلغ الرهان)\n◉ اختر لاعباً من القائمة الظاهرة\n◉ انتظر نتيجة التسديد لمعرفة ربحك\n———————————————\n◈ ─────────────── ◈", img);
    }

    const betAmount = parseInt(args[0]);
    if (isNaN(betAmount) || betAmount < 50) {
        return api.sendMessage("◈ ───『 تـنـبـيـه مـلـكـي 』─── ◈\n\n◯ سيدي، يجب الرهان بمبلغ 50$ أو أكثر لبدء المباراة!\n———————————————\n◈ ─────────────── ◈", threadID, messageID);
    }

    const userData = await Currencies.getData(senderID);
    if (userData.money < betAmount) {
        return api.sendMessage(`◈ ───『 عـجز مـالـي 』─── ◈\n\n◯ سيدي، خزنتك لا تحتوي على ${betAmount}$\n◉ رصيدك الحالي هو: ${userData.money}$\n———————————————\n◈ ─────────────── ◈`, threadID, messageID);
    }

    await Currencies.decreaseMoney(senderID, betAmount);

    const players = [
        { name: "ميغيل سالغادو", mult: 1 }, { name: "سامي خضيرة", mult: 2 },
        { name: "أوليه سولشار", mult: 12 }, { name: "ماتيو كوفاتشيتش", mult: 144 },
        { name: "ستيفن ماكمانامان", mult: 1880 }, { name: "برناردو سيلفا", mult: 2880 },
        { name: "روي كين", mult: 2990 }, { name: "يان أوبلاك", mult: 3880 },
        { name: "سيرخيو راموس", mult: 6890 }, { name: "كريستيانو رونالدو", mult: 14400 }
    ];

    let menu = `◈ ───『 مـلـعـب الإمـبـراطـوريـة 』─── ◈\n\n◯ اخـتـر هـدافـك الـمـفـضـل :\n`;
    players.forEach((p, i) => {
        menu += `◉ ${i + 1}. ${p.name} [x${p.mult}]\n`;
    });
    menu += `———————————————\n◯ رد بـرقـم الـلاعب للـتـسـديـد\n◈ ─────────────── ◈`;

    let gif = (await axios.get("https://i.postimg.cc/bJ60WRwL/20220728-113119.gif", { responseType: "stream" })).data;

    return api.sendMessage({ body: menu, attachment: gif }, threadID, (err, info) => {
        global.client.handleReply.push({
            name: this.config.name,
            messageID: info.messageID,
            author: senderID,
            betAmount
        });
    }, messageID);
};

module.exports.handleReply = async ({ api, event, handleReply, Currencies, Users }) => {
    const { threadID, senderID, messageID, body } = event;
    const { betAmount, author } = handleReply;

    if (author !== senderID) return api.sendMessage("⚠️ سيدي، هذه المباراة ليست لك!", threadID, messageID);
    if (isNaN(body) || body < 1 || body > 10) return api.sendMessage("⚠️ اختر رقماً من 1 إلى 10 سيدي!", threadID, messageID);

    const playerIdx = parseInt(body) - 1;
    const multipliers = [1, 2, 12, 144, 1880, 2880, 2990, 3880, 6890, 14400];
    const winImages = [
        "https://static.dw.com/image/17768558_403.jpg",
        "http://c.files.bbci.co.uk/F7A3/production/_119559336__119558692_ole262.jpg",
        "https://cdn.al-ain.com/images/2021/12/03/138-014428-cristiano-ronaldo-800-goals-manchester-united_700x400.jpg"
    ];

    api.unsendMessage(handleReply.messageID);
    api.sendMessage("◈ ───『 جـاري الـتـسـديـد.. ⚽ 』─── ◈", threadID);

    setTimeout(async () => {
        // احتمالية الفوز (كلما زاد الربح قلت الفرصة)
        const chance = Math.random() * 100;
        const winThreshold = 100 / (playerIdx + 1.5); // معادلة توازن احتمالية الربح
        const isWin = chance < winThreshold;

        if (isWin) {
            const prize = betAmount * multipliers[playerIdx];
            await Currencies.increaseMoney(senderID, prize);
            let img = (await axios.get(winImages[2], { responseType: "stream" })).data;
            return api.sendMessage({
                body: `◈ ───『 هـــــــدف مـلـكـي! ⚽ 』─── ◈\n\n◯ الـنـتـيـجـة : تـسـجيـل بـنـجـاح ✅\n◉ الـجـائـزة : ${prize.toLocaleString()}$\n———————————————\n◈ ─────────────── ◈`,
                attachment: img
            }, threadID, messageID);
        } else {
            let img = (await axios.get("https://cdni.rt.com/media/pics/2019.04/original/5cb6d09d95a5979c608b45e6.jpg", { responseType: "stream" })).data;
            return api.sendMessage({
                body: `◈ ───『 ركـلـة ضـائـعـة.. ❌ 』─── ◈\n\n◯ الـنـتـيـجـة : خـارج الـمـرمـى\n◉ الـخـسـارة : ${betAmount}$\n———————————————\n◈ ─────────────── ◈`,
                attachment: img
            }, threadID, messageID);
        }
    }, 3000);
};
