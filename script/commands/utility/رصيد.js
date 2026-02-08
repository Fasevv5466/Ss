module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
    const { threadID, messageID, mentions, senderID } = event;
    
    let targetID = senderID;
    let targetName = await Users.getNameUser(senderID);
    
    if (Object.keys(mentions).length > 0) {
        targetID = Object.keys(mentions)[0];
        targetName = mentions[targetID].replace("@", "");
    }
    
    const balance = await Currencies.getData(targetID);
    const money = balance ? balance.money : 0;
    
    return api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\nالاسم: ${targetName}\nالرصيد: ${money.toLocaleString()} دولار`, threadID, messageID);
};

module.exports.config = {
    name: "رصيد",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "ايمن",
    description: "عرض رصيد المستخدم",
    commandCategory: "utility",
    usages: "رصيد [@منشن]",
    cooldowns: 3
};
