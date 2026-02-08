const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
    const { threadID, messageID } = event;
    
    if (!args[0]) {
        return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 PIC ━━ ⌬\n\nاكتب نوع الصورة: waifu, neko, etc", threadID, messageID);
    }
    
    const type = args[0].toLowerCase();
    api.setMessageReaction("⏳", messageID, () => {}, true);
    
    try {
        const response = await axios.get(`https://nekos.best/api/v2/${type}`);
        const imageUrl = response.data.results[0].url;
        
        const cacheDir = path.join(__dirname, 'cache');
        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
        
        const imgPath = path.join(cacheDir, `anime_${Date.now()}.jpg`);
        const imgResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        fs.writeFileSync(imgPath, Buffer.from(imgResponse.data));
        
        api.setMessageReaction("✅", messageID, () => {}, true);
        
        await api.sendMessage({
            body: `⌬ ━━ 𝗞𝗜𝗥𝗔 PIC ━━ ⌬\n\nصورة أنمي: ${type}`,
            attachment: fs.createReadStream(imgPath)
        }, threadID, () => {
            if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
        }, messageID);
        
    } catch (error) {
        api.setMessageReaction("❌", messageID, () => {}, true);
        return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 PIC ━━ ⌬\n\nفشل جلب الصورة", threadID, messageID);
    }
};

module.exports.config = {
    name: "انمي",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "ايمن",
    description: "صور أنمي عشوائية",
    commandCategory: "pic",
    usages: "انمي [waifu/neko]",
    cooldowns: 5
};
