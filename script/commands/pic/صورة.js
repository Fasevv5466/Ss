module.exports.config = {
    name: "صورة",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "ايمن",
    description: "جلب صورة الحساب",
    commandCategory: "pic",
    usages: "صورة [@منشن]",
    cooldowns: 5
};

module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
    api, event, args, Users, Threads, Currencies, models }) {
        const { threadID, messageID, senderID, mentions, type, messageReply } = event;
        
        let targetID = senderID;
        
        if (Object.keys(mentions).length > 0) {
            targetID = Object.keys(mentions)[0];
        } else if (type === "message_reply") {
            targetID = messageReply.senderID;
        } else if (args[0]) {
            targetID = args[0];
        }
        
        try {
            const avatarURL = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
            
            const cacheDir = path.join(__dirname, 'cache');
            if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
            
            const imgPath = path.join(cacheDir, `avatar_${Date.now()}.jpg`);
            const response = await axios.get(avatarURL, { responseType: 'arraybuffer' });
            fs.writeFileSync(imgPath, Buffer.from(response.data));
            
            await api.sendMessage({
                body: "⌬ ━━ 𝗞𝗜𝗥𝗔 PIC ━━ ⌬\n\nصورة الحساب",
                attachment: fs.createReadStream(imgPath)
            }, threadID, () => {
                if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
            }, messageID);
            
        } catch (error) {
            return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 PIC ━━ ⌬\n\nفشل جلب الصورة", threadID, messageID);
        }
};
