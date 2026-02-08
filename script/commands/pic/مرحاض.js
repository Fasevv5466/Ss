module.exports.config = {
    name: "مرحاض",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "ايمن",
    description: "صورة المرحاض المضحكة",
    commandCategory: "pic",
    usages: "مرحاض [@إشارة]",
    cooldowns: 5
};

module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
    api, event, args, Users, Threads, Currencies, models }) {
        const { threadID, messageID, mentions } = event;
        
        const mentionKeys = Object.keys(mentions);
        if (!mentionKeys.length) {
            return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 FUN ━━ ⌬\n\nقم بعمل إشارة لشخص واحد", threadID, messageID);
        }
    
        const targetID = mentionKeys[0];
        const cacheDir = path.join(__dirname, "cache");
        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
        
        const toiletPath = path.join(cacheDir, "toilet.png");
        const avatarPath = path.join(cacheDir, `avatar_${Date.now()}.png`);
        const outputPath = path.join(cacheDir, `toilet_${Date.now()}.png`);
    
        try {
            if (!fs.existsSync(toiletPath)) {
                await axios({
                    method: "GET",
                    url: "https://drive.google.com/uc?id=13ZqFryD-YY-JTs34lcy6b_w36UCCk0EI&export=download",
                    responseType: "arraybuffer"
                }).then((res) => fs.writeFileSync(toiletPath, Buffer.from(res.data)));
            }
    
            const res = await axios.get(
                `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
                { responseType: "arraybuffer" }
            );
            fs.writeFileSync(avatarPath, Buffer.from(res.data));
    
            const toiletImg = await jimp.read(toiletPath);
            const avatarImg = await jimp.read(avatarPath);
            avatarImg.circle().resize(70, 70);
            toiletImg.composite(avatarImg, 100, 200);
            await toiletImg.writeAsync(outputPath);
    
            api.sendMessage({
                body: "⌬ ━━ 𝗞𝗜𝗥𝗔 FUN ━━ ⌬\n\nتم إنشاء صورة المرحاض",
                attachment: fs.createReadStream(outputPath)
            }, threadID, () => {
                if (fs.existsSync(avatarPath)) fs.unlinkSync(avatarPath);
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            }, messageID);
    
        } catch (error) {
            console.error('Toilet Error:', error);
            api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 FUN ━━ ⌬\n\nفشل في إنشاء الصورة", threadID, messageID);
        }
};
