module.exports.config = {
    name: "بينترست",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "ايمن",
    description: "البحث عن صور من بينترست",
    commandCategory: "pic",
    usages: "بينترست [الكلمة]",
    cooldowns: 10
};

module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
    api, event, args, Users, Threads, Currencies, models }) {
        const { threadID, messageID } = event;
        
        const query = args.join(" ");
        if (!query) {
            return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 PIC ━━ ⌬\n\nاكتب ما تريد البحث عنه", threadID, messageID);
        }
        
        api.setMessageReaction("⏳", messageID, () => {}, true);
        
        try {
            const response = await axios.get(`https://api.popcat.xyz/pinterest?q=${encodeURIComponent(query)}`);
            const images = response.data;
            
            if (!images || images.length === 0) {
                throw new Error("لم يتم العثور على صور");
            }
            
            const cacheDir = path.join(__dirname, 'cache');
            if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
            
            const numImages = Math.min(5, images.length);
            const attachments = [];
            const tempFiles = [];
            
            for (let i = 0; i < numImages; i++) {
                const imgPath = path.join(cacheDir, `pin_${Date.now()}_${i}.jpg`);
                const imgResponse = await axios.get(images[i], { responseType: 'arraybuffer' });
                fs.writeFileSync(imgPath, Buffer.from(imgResponse.data));
                attachments.push(fs.createReadStream(imgPath));
                tempFiles.push(imgPath);
            }
            
            api.setMessageReaction("✅", messageID, () => {}, true);
            
            await api.sendMessage({
                body: `⌬ ━━ 𝗞𝗜𝗥𝗔 PIC ━━ ⌬\n\nنتائج البحث: ${query}\nعدد الصور: ${numImages}`,
                attachment: attachments
            }, threadID, () => {
                tempFiles.forEach(file => {
                    if (fs.existsSync(file)) fs.unlinkSync(file);
                });
            }, messageID);
            
        } catch (error) {
            api.setMessageReaction("❌", messageID, () => {}, true);
            return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 PIC ━━ ⌬\n\nفشل البحث عن الصور", threadID, messageID);
        }
};
