module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
    const { threadID, messageID, mentions, senderID, messageReply } = event;
    
    let targetID = senderID;
    let targetName = await Users.getNameUser(senderID);
    
    if (Object.keys(mentions).length > 0) {
        targetID = Object.keys(mentions)[0];
        targetName = mentions[targetID].replace("@", "");
    } else if (messageReply) {
        targetID = messageReply.senderID;
        targetName = await Users.getNameUser(targetID);
    }
    
    return api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\nالاسم: ${targetName}\nالمعرف: ${targetID}`, threadID, messageID);
};

module.exports.config = {
    name: "معرف",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "ايمن",
    description: "عرض معرف المستخدم",
    commandCategory: "utility",
    usages: "معرف [@منشن أو رد]",
    cooldowns: 3
};
