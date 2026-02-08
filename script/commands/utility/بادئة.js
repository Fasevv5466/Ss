module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
    const { threadID, messageID } = event;
    
    const prefix = global.config.PREFIX || ".";
    
    return api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\nالبادئة الحالية: ${prefix}`, threadID, messageID);
};

module.exports.config = {
    name: "بادئة",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "ايمن",
    description: "عرض بادئة البوت",
    commandCategory: "utility",
    usages: "بادئة",
    cooldowns: 3
};
