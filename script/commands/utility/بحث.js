// ✓بحث.js
module.exports.config = {
    name: "بحث",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "ayman",
    description: "بحث في ويكيبيديا",
    commandCategory: "Utility",
    usages: ".بحث [موضوع]",
    cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID } = event;
    const axios = require('axios');
    
    if (!args[0]) {
        return api.sendMessage("📓 ───────────────\n  ┝  [01] اكتب الموضوع للبحث\n📓 ───────────────", threadID, messageID);
    }
    
    const query = args.join(" ");
    
    try {
        const response = await axios.get(`https://ar.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
        const data = response.data;
        
        if (data.title && data.extract) {
            const msg = `📓 ───────────────
  ┝  [01] العنوان: ${data.title}
  ┝  [02] الوصف: ${data.extract.substring(0, 300)}...
  
📓 ───────────────`;
            
            return api.sendMessage(msg, threadID, messageID);
        } else {
            return api.sendMessage("📓 ───────────────\n  ┝  [01] لم يتم العثور على نتائج\n📓 ───────────────", threadID, messageID);
        }
        
    } catch (error) {
        return api.sendMessage("📓 ───────────────\n  ┝  [01] خطأ في البحث\n📓 ───────────────", threadID, messageID);
    }
};
