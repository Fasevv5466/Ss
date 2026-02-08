const axios = require('axios');

module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
    const { threadID, messageID } = event;
    
    const text = args.join(" ");
    if (!text) {
        return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\nاكتب النص المراد ترجمته", threadID, messageID);
    }
    
    try {
        const response = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ar&dt=t&q=${encodeURIComponent(text)}`);
        
        const translated = response.data[0].map(item => item[0]).join('');
        const sourceLang = response.data[2] || 'auto';
        
        return api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\nالترجمة:\n${translated}\n\nمن: ${sourceLang}`, threadID, messageID);
        
    } catch (error) {
        return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\nفشلت الترجمة", threadID, messageID);
    }
};

module.exports.config = {
    name: "ترجم",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "ايمن",
    description: "ترجمة النصوص إلى العربية",
    commandCategory: "utility",
    usages: "ترجم [النص]",
    cooldowns: 3
};
