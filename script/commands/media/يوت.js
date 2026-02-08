module.exports.config = {
    name: "يوت",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "ايمن",
    description: "تحميل فيديوهات من يوتيوب",
    commandCategory: "media",
    usages: "يوت [رابط_يوتيوب]",
    cooldowns: 10
};

module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
    api, event, args, Users, Threads, Currencies, models }) {
        const { threadID, messageID, senderID } = event;
        
        const url = args[0];
        
        if (!url) {
            return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 MEDIA ━━ ⌬\n\nأرسل رابط يوتيوب للتحميل", threadID, messageID);
        }
        
        if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
            return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 MEDIA ━━ ⌬\n\nالرابط يجب أن يكون من يوتيوب", threadID, messageID);
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
                const videoPath = path.join(cacheDir, `yt_${timestamp}.mp4`);
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
            
            const message = `⌬ ━━ 𝗞𝗜𝗥𝗔 MEDIA ━━ ⌬\n\n${data.title || "تم التحميل بنجاح"}${data.duration ? `\nالمدة: ${data.duration}` : ""}${data.quality ? `\nالجودة: ${data.quality}` : ""}`;
            
            await api.sendMessage({
                body: message,
                attachment: attachments
            }, threadID, () => {
                tempFiles.forEach(file => {
                    if (fs.existsSync(file)) fs.unlinkSync(file);
                });
            }, messageID);
            
        } catch (error) {
            console.error("YouTube Download Error:", error);
            api.setMessageReaction("❌", messageID, () => {}, true);
            return api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 MEDIA ━━ ⌬\n\nفشل التحميل: ${error.message}`, threadID, messageID);
        }
};
