module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
    const { threadID, messageID, participantIDs } = event;
    
    const mentions = {};
    let body = args.join(" ") || "تاغ جماعي";
    
    for (const id of participantIDs) {
        mentions[id] = "@";
        body = `${mentions[id]} ` + body;
    }
    
    return api.sendMessage({
        body: `⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\n${body}`,
        mentions: Object.keys(mentions).map(id => ({ tag: "@", id }))
    }, threadID, messageID);
};

module.exports.config = {
    name: "الكل",
    version: "2.0.0",
    hasPermssion: 1,
    credits: "ايمن",
    description: "عمل منشن جماعي لكل أعضاء المجموعة",
    commandCategory: "utility",
    usages: "الكل [رسالة]",
    cooldowns: 10
};
