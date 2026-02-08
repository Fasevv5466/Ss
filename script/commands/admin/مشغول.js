module.exports.config = {
    name: "مشغول",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "ايمن",
    description: "تفعيل وضع عدم الإزعاج",
    commandCategory: "admin",
    usages: "مشغول [السبب] | مشغول off",
    cooldowns: 5
};

module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
    api, event, args, Users, Threads, Currencies, models }) {
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
