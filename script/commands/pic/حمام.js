module.exports.config = {
    name: "حمام",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "ايمن",
    description: "رمي شخص في الحمام",
    commandCategory: "pic",
    usages: "حمام [@منشن]",
    cooldowns: 5
};

module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
    api, event, args, Users, Threads, Currencies, models }) {
        const { threadID, messageID, senderID, mentions } = event;
        
        if (Object.keys(mentions).length === 0) {
            return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 FUN ━━ ⌬\n\nعليك عمل منشن لشخص", threadID, messageID);
        }
        
        const targetID = Object.keys(mentions)[0];
        const senderName = await Users.getNameUser(senderID);
        const targetName = mentions[targetID].replace("@", "");
        
        try {
            const avatarUrl = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
            
            const response = await axios.get(`https://www.api.vyturex.com/toilet?userid=${targetID}`, { responseType: 'arraybuffer' });
            
            const cacheDir = path.join(__dirname, 'cache');
            if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
            
            const imagePath = path.join(cacheDir, `toilet_${Date.now()}.jpg`);
            fs.writeFileSync(imagePath, Buffer.from(response.data));
            
            await api.sendMessage({
                body: `⌬ ━━ 𝗞𝗜𝗥𝗔 FUN ━━ ⌬\n\n${senderName} يرمي ${targetName} في الحمام`,
                attachment: fs.createReadStream(imagePath)
            }, threadID, () => {
                if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
            }, messageID);
            
        } catch (error) {
            return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 FUN ━━ ⌬\n\nفشل إنشاء الصورة", threadID, messageID);
        }
};
