const axios = require("axios");
const fs = require("fs-extra");

module.exports.config = {
    name: "انميشن",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Ayman",
    description: "توليد فيديو بالذكاء الاصطناعي",
    commandCategory: "media",
    usages: ".انميشن [الوصف]",
    cooldowns: 30
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID } = event;
    
    if (!args[0]) {
        return api.sendMessage(`◈ ──« خـطأ »── ◈\n◯ يرجى كتابة وصف للمشهد\n◈ ─────── ◈`, threadID, messageID);
    }
    
    try {
        api.setMessageReaction("⏳", messageID, () => {}, true);
        
        const prompt = encodeURIComponent(args.join(" "));
        const response = await axios.get(`https://api.kenliejugarap.com/animate/?prompt=${prompt}`);
        
        if (!response.data?.video) {
            throw new Error("فشل في إنشاء الفيديو");
        }
        
        const videoPath = `./cache/ai_vid_${Date.now()}.mp4`;
        const writer = fs.createWriteStream(videoPath);
        
        const videoStream = await axios.get(response.data.video, { responseType: 'stream' });
        videoStream.data.pipe(writer);
        
        writer.on('finish', async () => {
            api.setMessageReaction("✅", messageID, () => {}, true);
            
            await api.sendMessage({
                body: `◈ ──« أنـميشن »── ◈\n◯ تم الإنشاء بنجاح\n◯ الوصف: ${args.join(" ")}\n◈ ─────── ◈`,
                attachment: fs.createReadStream(videoPath)
            }, threadID, () => fs.unlinkSync(videoPath), messageID);
        });
        
    } catch(error) {
        api.setMessageReaction("❌", messageID, () => {}, true);
        return api.sendMessage(`❌ خطأ: ${error.message}`, threadID, messageID);
    }
};
