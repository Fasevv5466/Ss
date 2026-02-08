module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
    const { threadID, messageID, senderID } = event;
    
    const balance = await Currencies.getData(senderID);
    const money = balance ? balance.money : 0;
    const userData = await Users.getData(senderID);
    const name = await Users.getNameUser(senderID);
    
    let rank = "مبتدئ";
    if (money >= 10000) rank = "محترف";
    if (money >= 50000) rank = "خبير";
    if (money >= 100000) rank = "أسطوري";
    
    const message = `⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\nالاسم: ${name}\nالرصيد: ${money.toLocaleString()} دولار\nالرتبة: ${rank}\nالمعرف: ${senderID}`;
    
    return api.sendMessage(message, threadID, messageID);
};

module.exports.config = {
    name: "رانك",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "ايمن",
    description: "عرض معلومات الرانك",
    commandCategory: "utility",
    usages: "رانك",
    cooldowns: 5
};
