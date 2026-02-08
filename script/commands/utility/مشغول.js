if (!global.client.busyList) global.client.busyList = {};

module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
    const { threadID, messageID, senderID } = event;

    if (args[0] === "off") {
        const userData = await Users.getData(senderID);
        delete userData.busy;
        await Users.setData(senderID, userData);
        return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\nتم إيقاف وضع عدم الإزعاج", threadID, messageID);
    }

    const reason = args.join(" ") || "";
    const userData = await Users.getData(senderID);
    userData.busy = reason;
    await Users.setData(senderID, userData);

    return api.sendMessage(
        `⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\nتم تفعيل وضع عدم الإزعاج${reason ? `\nالسبب: ${reason}` : ""}`,
        threadID, messageID
    );
};

module.exports.handleEvent = async function({ api, event, Users, Threads, Currencies, models }) {
    const { mentions, threadID, messageID } = event;

    if (!mentions || Object.keys(mentions).length === 0) return;

    const arrayMentions = Object.keys(mentions);

    for (const userID of arrayMentions) {
        const userData = await Users.getData(userID);
        const reasonBusy = userData.busy || false;
        
        if (reasonBusy !== false) {
            const userName = mentions[userID].replace("@", "");
            const msg = reasonBusy 
                ? `⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\nالمستخدم ${userName} مشغول حالياً\nالسبب: ${reasonBusy}`
                : `⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\nالمستخدم ${userName} مشغول حالياً`;
            
            return api.sendMessage(msg, threadID, messageID);
        }
    }
};

module.exports.config = {
    name: "مشغول",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "ايمن",
    description: "تفعيل وضع عدم الإزعاج",
    commandCategory: "utility",
    usages: "مشغول [السبب] | مشغول off",
    cooldowns: 5
};
