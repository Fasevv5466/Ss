const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

async function downloadFromAPI(url) {
    try {
        const response = await axios.get(`https://api.rival.rocks/api/download?url=${encodeURIComponent(url)}`, { timeout: 60000 });
        return response.data;
    } catch (error) {
        const response2 = await axios.get(`https://all-in-one-api-seven.vercel.app/api/download?url=${encodeURIComponent(url)}`, { timeout: 60000 });
        return response2.data;
    }
}

module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
    const { threadID, messageID, senderID } = event;
    
    const url = args[0];
    
    if (!url) {
        return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 MEDIA ━━ ⌬\n\nأرسل رابط تيك توك للتحميل", threadID, messageID);
    }
    
    if (!url.includes('tiktok.com') && !url.includes('vt.tiktok.com')) {
        return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 MEDIA ━━ ⌬\n\nالرابط يجب أن يكون من تيك توك", threadID, messageID);
    }
    
    api.setMessageReaction("⏳", messageID, () => {}, true);
    
    try {
        const data = await downloadFromAPI(url);
        
        if (!data.success || (!data.videoUrl && !data.audioUrl)) {
            throw new Error("فشل التحميل من الخادم");
        }
        
        const cacheDir = path.join(__dirname, 'cache');
        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
        
        const timestamp = Date.now();
        let attachments = [];
        let tempFiles = [];
        
        if (data.videoUrl) {
            const videoPath = path.join(cacheDir, `tiktok_${timestamp}.mp4`);
            const videoResponse = await axios.get(data.videoUrl, { responseType: 'stream', timeout: 120000 });
            const writer = fs.createWriteStream(videoPath);
            videoResponse.data.pipe(writer);
            
            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });
            
            attachments.push(fs.createReadStream(videoPath));
            tempFiles.push(videoPath);
        }
        
        api.setMessageReaction("✅", messageID, () => {}, true);
        
        const message = `⌬ ━━ 𝗞𝗜𝗥𝗔 MEDIA ━━ ⌬\n\n${data.title || "تم التحميل من تيك توك"}${data.author ? `\nبواسطة: ${data.author}` : ""}`;
        
        await api.sendMessage({
            body: message,
            attachment: attachments
        }, threadID, () => {
            tempFiles.forEach(file => {
                if (fs.existsSync(file)) fs.unlinkSync(file);
            });
        }, messageID);
        
    } catch (error) {
        console.error("TikTok Download Error:", error);
        api.setMessageReaction("❌", messageID, () => {}, true);
        return api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 MEDIA ━━ ⌬\n\nفشل التحميل: ${error.message}`, threadID, messageID);
    }
};

module.exports.config = {
    name: "تيك",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "ايمن",
    description: "تحميل فيديوهات من تيك توك",
    commandCategory: "media",
    usages: "تيك [رابط_تيك_توك]",
    cooldowns: 10
};
