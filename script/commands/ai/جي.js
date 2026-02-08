module.exports.config = {
    name: "جي",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "ايمن",
    description: "محادثة مع الذكاء الاصطناعي",
    commandCategory: "ai",
    usages: "جي [سؤالك]",
    cooldowns: 5
};

module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
    api, event, args, Users, Threads, Currencies, models }) {
        const { threadID, messageID, senderID } = event;
        
        const query = args.join(" ");
        if (!query) {
            return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\nاكتب سؤالك", threadID, messageID);
        }
        
        api.setMessageReaction("⏳", messageID, () => {}, true);
        
        try {
            const response = await axios.get(`https://api.popcat.xyz/chatbot?msg=${encodeURIComponent(query)}&owner=KIRA&botname=كيرا`, { timeout: 30000 });
            
            api.setMessageReaction("✅", messageID, () => {}, true);
            
            return api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\n${response.data.response || response.data.answer || "لم أفهم سؤالك"}`, threadID, messageID);
            
        } catch (error) {
            api.setMessageReaction("❌", messageID, () => {}, true);
            return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\nفشل الاتصال بالذكاء الاصطناعي", threadID, messageID);
        }
};
