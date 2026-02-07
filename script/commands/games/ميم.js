const axios = require("axios");
const fs = require("fs");

module.exports.config = {
    name: "ميم",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Ayman",
    description: "إنشاء ميم مقارنة (قالب درايك)",
    commandCategory: "games",
    usages: ".ميم [الشيء الذي تفضله] + [الشيء الذي ترفضه]",
    cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID } = event;
    
    const input = args.join(" ");
    const parts = input.split("+");
    
    if (parts.length < 2) {
        return api.sendMessage(`◈ ───« اسـتـخـدام خـاطـئ »─── ◈
│
◯ │ يرجى الكتابة بهذا الشكل: .ميم [تفضل] + [ترفض]
◯ │ مثال: .ميم القهوة + الشاي
│
◈ ─────────────── ◈`, threadID, messageID);
    }
    
    try {
        api.setMessageReaction("⏳", messageID, () => {}, true);
        
        const like = parts[0].trim();
        const dislike = parts[1].trim();
        
        // جلب الميم من مصدر خارجي
        const memeUrl = `https://api.memegen.link/images/drake/${encodeURIComponent(dislike)}/${encodeURIComponent(like)}.png`;
        
        const response = await axios.get(memeUrl, { responseType: 'arraybuffer' });
        const imagePath = `./cache/meme_${Date.now()}.png`;
        fs.writeFileSync(imagePath, response.data);
        
        api.setMessageReaction("✅", messageID, () => {}, true);
        
        await api.sendMessage({
            body: `◈ ───« مـيـم مـقـارنـة »─── ◈
│
◯ │ 😄 تفضل: ${like}
◯ │ 😒 ترفض: ${dislike}
◯ │ 🎭 قالب درايك الشهير
│
◈ ─────────────── ◈`,
            attachment: fs.createReadStream(imagePath)
        }, threadID, () => fs.unlinkSync(imagePath), messageID);
        
    } catch(error) {
        api.setMessageReaction("❌", messageID, () => {}, true);
        return api.sendMessage(`◈ ───« خـطـأ »─── ◈
│
◯ │ ${error.message}
◯ │ الأمر المستدعى: ميم
│
◈ ─────────────── ◈`, threadID, messageID);
    }
};
