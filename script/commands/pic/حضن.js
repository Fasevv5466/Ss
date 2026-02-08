module.exports.config = {
    name: "حضن",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "ايمن",
    description: "احتضن شخصاً ما",
    commandCategory: "pic",
    usages: "حضن [@إشارة أو رد]",
    cooldowns: 5
};

module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
    api, event, args, Users, Threads, Currencies, models }) {
        const { threadID, messageID, senderID, mentions, messageReply } = event;
        
        let mention = Object.keys(mentions)[0];
        let targetID = mention || messageReply?.senderID;
    
        if (!targetID) {
            return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 FUN ━━ ⌬\n\nمن تريد احتضانه؟ قم بالإشارة أو الرد على رسالة", threadID, messageID);
        }
    
        const huggerID = senderID;
    
        const getAvatar = async (uid) => {
            try {
                const url = `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
                const cacheDir = path.join(__dirname, 'cache');
                if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
                
                const avatarPath = path.join(cacheDir, `${uid}_${Date.now()}.png`);
                const res = await axios.get(url, { responseType: "arraybuffer" });
                fs.writeFileSync(avatarPath, res.data);
                return avatarPath;
            } catch (err) {
                console.error(`Error fetching avatar: ${err.message}`);
                return "";
            }
        };
    
        try {
            const bg = await loadImage("https://i.imgur.com/eUNHCj3.jpeg");
            const canvas = createCanvas(bg.width, bg.height);
            const ctx = canvas.getContext("2d");
            ctx.drawImage(bg, 0, 0);
    
            const huggerAvatarPath = await getAvatar(huggerID);
            const targetAvatarPath = await getAvatar(targetID);
    
            const huggerAvatar = await loadImage(huggerAvatarPath);
            const targetAvatar = await loadImage(targetAvatarPath);
    
            ctx.save();
            ctx.beginPath();
            ctx.arc(285, 110, 50, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(huggerAvatar, 235, 60, 100, 100);
            ctx.restore();
    
            ctx.save();
            ctx.beginPath();
            ctx.arc(460, 160, 50, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(targetAvatar, 410, 110, 100, 100);
            ctx.restore();
    
            const cacheDir = path.join(__dirname, 'cache');
            const output = path.join(cacheDir, `hug_${Date.now()}.png`);
            fs.writeFileSync(output, canvas.toBuffer("image/png"));
    
            const senderName = await Users.getData(huggerID).then(u => u.name) || "أنت";
            const targetName = mentions[mention] || (messageReply?.senderName || "صديق");
    
            api.sendMessage({
                body: `⌬ ━━ 𝗞𝗜𝗥𝗔 FUN ━━ ⌬\n\n${senderName} يحتضن ${targetName} بحب`,
                attachment: fs.createReadStream(output)
            }, threadID, () => {
                if (fs.existsSync(output)) fs.unlinkSync(output);
                if (fs.existsSync(huggerAvatarPath)) fs.unlinkSync(huggerAvatarPath);
                if (fs.existsSync(targetAvatarPath)) fs.unlinkSync(targetAvatarPath);
            }, messageID);
    
        } catch (error) {
            console.error('Hug Error:', error);
            api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 FUN ━━ ⌬\n\nفشل في إنشاء الصورة", threadID, messageID);
        }
};
