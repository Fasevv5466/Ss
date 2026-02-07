const axios = require("axios");
const fs = require("fs-extra");

module.exports.config = {
    name: "عدل",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Ayman",
    description: "تعديل الصور باستخدام الذكاء الاصطناعي",
    commandCategory: "pic",
    usages: ".عدل [الوصف] (بالرد على صورة)",
    cooldowns: 10
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID, messageReply } = event;
    
    if (!messageReply?.attachments?.length || messageReply.attachments[0].type !== 'photo') {
        return api.sendMessage(`◈ ───« اسـتـخـدام خـاطـئ »─── ◈
│
◯ │ يرجى الرد على صورة لتنفيذ الأمر
◯ │ مثال: قم بالرد على صورة واكتب .عدل كرتوني
│
◈ ─────────────── ◈`, threadID, messageID);
    }
    
    if (!args[0]) {
        return api.sendMessage(`◈ ───« اسـتـخـدام خـاطـئ »─── ◈
│
◯ │ يرجى كتابة وصف التعديل المطلوب
◯ │ مثال: .عدل تحويل إلى لوحة زيتية
│
◈ ─────────────── ◈`, threadID, messageID);
    }
    
    try {
        api.setMessageReaction("⏳", messageID, () => {}, true);
        
        const prompt = encodeURIComponent(args.join(" "));
        const imageUrl = messageReply.attachments[0].url;
        
        // استدعاء واجهة برمجة التطبيقات للتعديل
        const response = await axios.get(`https://api.kenliejugarap.com/editimage/?url=${encodeURIComponent(imageUrl)}&prompt=${prompt}`, {
            responseType: 'arraybuffer'
        });
        
        const imagePath = `./cache/edited_${Date.now()}.jpg`;
        await fs.writeFile(imagePath, response.data);
        
        api.setMessageReaction("✅", messageID, () => {}, true);
        
        return api.sendMessage({
            body: `◈ ───« تـعـديـل الـصـور »─── ◈
│
◯ │ ✅ تم معالجة الصورة بنجاح
◯ │ 📝 الوصف: ${args.join(" ")}
◯ │ 🎨 بواسطة الذكاء الاصطناعي
◯ │ ⚡ دقة عالية
│
◈ ─────────────── ◈`,
            attachment: fs.createReadStream(imagePath)
        }, threadID, () => fs.unlinkSync(imagePath), messageID);
        
    } catch(error) {
        api.setMessageReaction("❌", messageID, () => {}, true);
        return api.sendMessage(`◈ ───« خـطـأ »─── ◈
│
◯ │ ${error.message}
◯ │ الأمر المستدعى: عدل
│
◈ ─────────────── ◈`, threadID, messageID);
    }
};
