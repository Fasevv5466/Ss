module.exports.config = {
    name: "أيدي",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "ايمن",
    description: "عرض الأيدي على فيسبوك",
    commandCategory: "media",
    usages: "أيدي [@إشارة أو رد أو رابط]",
    cooldowns: 5
};

module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
    api, event, args, Users, Threads, Currencies, models }) {
        const { threadID, messageID, senderID, mentions, messageReply } = event;
        
        if (Object.keys(mentions).length > 0) {
            let msg = "⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\n";
            for (const uid of Object.keys(mentions)) {
                const name = mentions[uid].replace("@", "");
                msg += `${name}: ${uid}\n`;
            }
            return api.sendMessage(msg, threadID, messageID);
        }
        
        if (messageReply) {
            const uid = messageReply.senderID;
            const userData = await Users.getData(uid);
            const name = userData.name || "المستخدم";
            return api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\n${name}: ${uid}`, threadID, messageID);
        }
        
        if (args[0] && args[0].match(/^https?:\/\//)) {
            try {
                const url = args[0];
                const match = url.match(/(?:profile\.php\?id=|facebook\.com\/)([0-9]+)/);
                if (match) {
                    return api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\nالأيدي: ${match[1]}`, threadID, messageID);
                }
            } catch (error) {
                return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\nرابط غير صالح", threadID, messageID);
            }
        }
        
        return api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\nأيديك: ${senderID}`, threadID, messageID);
};
