const axios = require("axios");
const fs = require("fs");

module.exports.config = {
    name: "سيارات",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Ayman",
    description: "جلب مقطع فيديو عشوائي للسيارات",
    commandCategory: "media",
    usages: ".سيارات",
    cooldowns: 10
};

module.exports.run = async function({ api, event }) {
    const { threadID, messageID } = event;
    
    try {
        api.setMessageReaction("⏳", messageID, () => {}, true);
        
        const response = await axios.get("https://api.kenliejugarap.com/randomcar/");
        
        if (!response.data?.video) {
            return api.sendMessage(`◈ ───« عـذراً »─── ◈
│
◯ │ لم يتم العثور على مقطع فيديو حالياً
◯ │ يرجى المحاولة مرة أخرى لاحقاً
│
◈ ─────────────── ◈`, threadID, messageID);
        }
        
        const videoPath = `./cache/car_${Date.now()}.mp4`;
        const writer = fs.createWriteStream(videoPath);
        
        const videoStream = await axios.get(response.data.video, { responseType: 'stream' });
        videoStream.data.pipe(writer);
        
        writer.on('finish', async () => {
            api.setMessageReaction("✅", messageID, () => {}, true);
            
            await api.sendMessage({
                body: `◈ ───« مـقـطـع سـيـارات »─── ◈
│
◯ │ ⚡ مشاهدة ممتعة
│
◈ ─────────────── ◈`,
                attachment: fs.createReadStream(videoPath)
            }, threadID, () => fs.unlinkSync(videoPath), messageID);
        });
        
    } catch(error) {
        api.setMessageReaction("❌", messageID, () => {}, true);
        return api.sendMessage(`◈ ───« خـطـأ »─── ◈
│
◯ │ ${error.message}
◯ │ الأمر المستدعى: سيارات
│
◈ ─────────────── ◈`, threadID, messageID);
    }
};
