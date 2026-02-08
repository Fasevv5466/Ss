const axios = require('axios');

module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
    const { threadID, messageID } = event;
    
    const query = args.join(" ");
    if (!query) {
        return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\nاكتب ما تريد البحث عنه", threadID, messageID);
    }
    
    try {
        const response = await axios.get(`https://ar.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
        const data = response.data;
        
        if (!data.extract) throw new Error("لم يتم العثور على نتائج");
        
        let message = `⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\n${data.title}\n\n${data.extract}`;
        
        if (data.content_urls && data.content_urls.desktop) {
            message += `\n\nالرابط: ${data.content_urls.desktop.page}`;
        }
        
        return api.sendMessage(message, threadID, messageID);
        
    } catch (error) {
        return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\nلم يتم العثور على نتائج", threadID, messageID);
    }
};

module.exports.config = {
    name: "ويكي",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "ايمن",
    description: "البحث في ويكيبيديا",
    commandCategory: "utility",
    usages: "ويكي [الكلمة]",
    cooldowns: 5
};
