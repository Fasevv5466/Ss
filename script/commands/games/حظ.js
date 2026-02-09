const { addMoney, removeMoney, getUserData } = require("../../includes/mongodb");

module.exports.config = {
    name: "حظ",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "أيمن",
    description: "لعبة حظ لتجربة رصيد MongoDB",
    commandCategory: "العاب",
    usages: "[المبلغ]",
    cooldowns: 10
};

module.exports.run = async function({ api, event, args }) {
    const bet = parseInt(args[0]);
    if (isNaN(bet) || bet <= 0) return api.sendMessage("اكتب مبلغ الرهان أولاً!", event.threadID);

    const { currency } = await getUserData(event.senderID);
    if (currency.money < bet) return api.sendMessage("رصيدك في البنك لا يكفي!", event.threadID);

    const win = Math.random() > 0.5;
    if (win) {
        const prize = bet * 2;
        await addMoney(event.senderID, prize);
        return api.sendMessage(`🥳 مبروك! فزت بـ ${prize}$ وتم تحديث رصيدك في السحابة.`, event.threadID);
    } else {
        await removeMoney(event.senderID, bet);
        return api.sendMessage(`😢 للأسف خسرت ${bet}$. تم خصمها من محفظة MongoDB الخاصة بك.`, event.threadID);
    }
};
