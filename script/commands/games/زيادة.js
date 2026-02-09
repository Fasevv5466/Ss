const { addMoney } = require("../../includes/mongodb");

module.exports.config = {
    name: "زيادة",
    version: "1.0.0",
    hasPermssion: 2, // للمطور فقط
    credits: "أيمن",
    description: "زيادة رصيدك لتجربة MongoDB",
    commandCategory: "الـمطـور",
    usages: "[المبلغ]",
    cooldowns: 2
};

module.exports.run = async function({ api, event, args }) {
    const amount = parseInt(args[0]) || 1000;
    const newBalance = await addMoney(event.senderID, amount);
    return api.sendMessage(`✅ تم إضافة ${amount}$ إلى حسابك بنجاح في MongoDB!\n💰 رصيدك الحالي أصبح: ${newBalance}$`, event.threadID);
};
