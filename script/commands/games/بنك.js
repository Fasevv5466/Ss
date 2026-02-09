const { getUserData } = require("../../includes/mongodb");

module.exports.config = {
    name: "بنك",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "أيمن",
    description: "فحص رصيدك في MongoDB",
    commandCategory: "المال",
    usages: "",
    cooldowns: 5
};

module.exports.run = async function({ api, event }) {
    const { user, currency } = await getUserData(event.senderID);
    return api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 𝗕𝗔𝗡𝗞 ━━ ⌬\n\n💰 رصيدك: ${currency.money}$ \n🌟 الخبرة: ${currency.exp}\n📅 تاريخ الانضمام: ${user.createdAt.toLocaleDateString()}`, event.threadID);
};
