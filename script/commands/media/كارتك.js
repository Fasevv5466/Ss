const axios = require("axios");

module.exports.config = {
    name: "كارتك",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Ayman",
    description: "البحث عن مقاطع أنمي",
    commandCategory: "media",
    usages: ".كارتك [اسم الأنمي]",
    cooldowns: 10
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID } = event;
    
    if (!args[0]) {
        return api.sendMessage(`◈ ──« خـطأ »── ◈\n◯ يرجى كتابة اسم الأنمي\n◈ ─────── ◈`, threadID, messageID);
    }
    
    try {
        api.setMessageReaction("⏳", messageID, () => {}, true);
        
        const query = encodeURIComponent(args.join(" ") + " anime");
        const response = await axios.get(`https://api.kenliejugarap.com/tiktoksearch/?search=${query}`);
        
        if (!response.data?.videos?.length) {
            return api.sendMessage("❌ لم يتم العثور على نتائج.", threadID, messageID);
        }
        
        const video = response.data.videos[0];
        const stream = await axios.get(video.play, { responseType: 'stream' });
        
        api.setMessageReaction("✅", messageID, () => {}, true);
        
        return api.sendMessage({
            body: `◈ ──« أنـمي »── ◈\n◯ تم العثور على المقطع\n◯ البحث: ${args.join(" ")}\n◈ ─────── ◈`,
            attachment: stream.data
        }, threadID, messageID);
        
    } catch(error) {
        api.setMessageReaction("❌", messageID, () => {}, true);
        return api.sendMessage(`❌ خطأ: ${error.message}`, threadID, messageID);
    }
};
