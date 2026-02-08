const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

const SUPPORTED_PLATFORMS = ['youtube.com', 'youtu.be', 'tiktok.com', 'vt.tiktok.com', 'instagram.com', 'facebook.com', 'fb.watch', 'twitter.com', 'x.com', 'spotify.com', 'soundcloud.com'];

async function downloadFromAPI(url) {
    try {
        const response = await axios.get(`https://api.rival.rocks/api/download?url=${encodeURIComponent(url)}`, { timeout: 60000 });
        return response.data;
    } catch (error) {
        try {
            const response2 = await axios.get(`https://all-in-one-api-seven.vercel.app/api/download?url=${encodeURIComponent(url)}`, { timeout: 60000 });
            return response2.data;
        } catch (err) {
            throw new Error("فشل الاتصال بخوادم التحميل");
        }
    }
}

function getPlatformName(url) {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'يوتيوب';
    if (url.includes('tiktok.com')) return 'تيك توك';
    if (url.includes('instagram.com')) return 'انستغرام';
    if (url.includes('facebook.com') || url.includes('fb.watch')) return 'فيسبوك';
    if (url.includes('twitter.com') || url.includes('x.com')) return 'تويتر';
    if (url.includes('spotify.com')) return 'سبوتيفاي';
    if (url.includes('soundcloud.com')) return 'ساوند كلاود';
    return 'المنصة';
}

module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
    const { threadID, messageID, senderID } = event;
    
    const url = args[0];
    
    if (!url) {
        const supportedList = SUPPORTED_PLATFORMS.slice(0, 7).join('\n• ');
        return api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 MEDIA ━━ ⌬\n\nأرسل رابط للتحميل\n\nالمنصات المدعومة:\n• ${supportedList}\n\nوغيرها...`, threadID, messageID);
    }
    
    const isSupported = SUPPORTED_PLATFORMS.some(platform => url.includes(platform));
    if (!isSupported) {
        return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 MEDIA ━━ ⌬\n\nالرابط غير مدعوم أو غير صحيح", threadID, messageID);
    }
    
    const platformName = getPlatformName(url);
    api.setMessageReaction("⏳", messageID, () => {}, true);
    
    try {
        const data = await downloadFromAPI(url);
        
        if (!data.success || (!data.videoUrl && !data.audioUrl && !data.imageUrl)) {
            throw new Error("فشل التحميل من الخادم");
        }
        
        const cacheDir = path.join(__dirname, 'cache');
        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
        
        const timestamp = Date.now();
        let attachments = [];
        let tempFiles = [];
        
        if (data.videoUrl) {
            const videoPath = path.join(cacheDir, `download_${timestamp}.mp4`);
            const videoResponse = await axios.get(data.videoUrl, { responseType: 'stream', timeout: 120000 });
            const writer = fs.createWriteStream(videoPath);
            videoResponse.data.pipe(writer);
            
            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });
            
            attachments.push(fs.createReadStream(videoPath));
            tempFiles.push(videoPath);
        } else if (data.audioUrl) {
            const audioPath = path.join(cacheDir, `download_${timestamp}.mp3`);
            const audioResponse = await axios.get(data.audioUrl, { responseType: 'stream', timeout: 120000 });
            const writer = fs.createWriteStream(audioPath);
            audioResponse.data.pipe(writer);
            
            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });
            
            attachments.push(fs.createReadStream(audioPath));
            tempFiles.push(audioPath);
        } else if (data.imageUrl) {
            const imagePath = path.join(cacheDir, `download_${timestamp}.jpg`);
            const imageResponse = await axios.get(data.imageUrl, { responseType: 'stream', timeout: 120000 });
            const writer = fs.createWriteStream(imagePath);
            imageResponse.data.pipe(writer);
            
            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });
            
            attachments.push(fs.createReadStream(imagePath));
            tempFiles.push(imagePath);
        }
        
        api.setMessageReaction("✅", messageID, () => {}, true);
        
        let message = `⌬ ━━ 𝗞𝗜𝗥𝗔 MEDIA ━━ ⌬\n\nتم التحميل من ${platformName}`;
        if (data.title) message += `\n\n${data.title}`;
        if (data.author) message += `\nبواسطة: ${data.author}`;
        if (data.duration) message += `\nالمدة: ${data.duration}`;
        if (data.quality) message += `\nالجودة: ${data.quality}`;
        
        await api.sendMessage({
            body: message,
            attachment: attachments
        }, threadID, () => {
            tempFiles.forEach(file => {
                if (fs.existsSync(file)) fs.unlinkSync(file);
            });
        }, messageID);
        
    } catch (error) {
        console.error("Download Error:", error);
        api.setMessageReaction("❌", messageID, () => {}, true);
        return api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 MEDIA ━━ ⌬\n\nفشل التحميل من ${platformName}\n${error.message}`, threadID, messageID);
    }
};

module.exports.config = {
    name: "تحميل",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "ايمن",
    description: "تحميل من جميع المنصات",
    commandCategory: "media",
    usages: "تحميل [الرابط]",
    cooldowns: 10
};
