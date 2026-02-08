module.exports.config = {
    name: "انستا",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "ايمن",
    description: "تحميل محتوى من انستغرام",
    commandCategory: "media",
    usages: "انستا [رابط_انستغرام]",
    cooldowns: 10
};

module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
    api, event, args, Users, Threads, Currencies, models }) {
        const { threadID, messageID, senderID } = event;
        
        const url = args[0];
        
        if (!url) {
            return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 MEDIA ━━ ⌬\n\nأرسل رابط انستغرام للتحميل", threadID, messageID);
        }
        
        if (!url.includes('instagram.com')) {
            return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 MEDIA ━━ ⌬\n\nالرابط يجب أن يكون من انستغرام", threadID, messageID);
        }
        
        api.setMessageReaction("⏳", messageID, () => {}, true);
        
        try {
            const data = await downloadFromAPI(url);
            
            if (!data.success || (!data.videoUrl && !data.imageUrl)) {
                throw new Error("فشل التحميل من الخادم");
            }
            
            const cacheDir = path.join(__dirname, 'cache');
            if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
            
            const timestamp = Date.now();
            let attachments = [];
            let tempFiles = [];
            
            const mediaUrl = data.videoUrl || data.imageUrl;
            const ext = data.videoUrl ? 'mp4' : 'jpg';
            const mediaPath = path.join(cacheDir, `insta_${timestamp}.${ext}`);
            
            const mediaResponse = await axios.get(mediaUrl, { responseType: 'stream', timeout: 120000 });
            const writer = fs.createWriteStream(mediaPath);
            mediaResponse.data.pipe(writer);
            
            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });
            
            attachments.push(fs.createReadStream(mediaPath));
            tempFiles.push(mediaPath);
            
            api.setMessageReaction("✅", messageID, () => {}, true);
            
            const message = `⌬ ━━ 𝗞𝗜𝗥𝗔 MEDIA ━━ ⌬\n\nتم التحميل من انستغرام${data.author ? `\nبواسطة: ${data.author}` : ""}`;
            
            await api.sendMessage({
                body: message,
                attachment: attachments
            }, threadID, () => {
                tempFiles.forEach(file => {
                    if (fs.existsSync(file)) fs.unlinkSync(file);
                });
            }, messageID);
            
        } catch (error) {
            console.error("Instagram Download Error:", error);
            api.setMessageReaction("❌", messageID, () => {}, true);
            return api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 MEDIA ━━ ⌬\n\nفشل التحميل: ${error.message}`, threadID, messageID);
        }
};
