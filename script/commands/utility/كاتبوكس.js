const axios = require("axios");
const fs = require("fs-extra");
const FormData = require("form-data");

module.exports.config = {
    name: "كاتبوكس",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Ayman",
    description: "رفع الصور والمقاطع إلى موقع Catbox",
    commandCategory: "utility",
    usages: ".كاتبوكس (بالرد على ملف وسائط)",
    cooldowns: 5
};

module.exports.run = async function({ api, event }) {
    const { threadID, messageID, messageReply } = event;
    
    if (!messageReply?.attachments?.length) {
        return api.sendMessage(`◈ ───« اسـتـخـدام خـاطـئ »─── ◈
│
◯ │ يرجى الرد على صورة أو مقطع فيديو
◯ │ مثال: قم بالرد على الملف ثم اكتب .كاتبوكس
│
◈ ─────────────── ◈`, threadID, messageID);
    }
    
    try {
        api.setMessageReaction("⏳", messageID, () => {}, true);
        
        const attachment = messageReply.attachments[0];
        const isImage = attachment.type === 'photo';
        const tempPath = `./temp_${Date.now()}.${isImage ? 'jpg' : 'mp4'}`;
        
        const response = await axios.get(attachment.url, { responseType: 'stream' });
        const writer = fs.createWriteStream(tempPath);
        response.data.pipe(writer);
        
        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
        
        const form = new FormData();
        form.append('reqtype', 'fileupload');
        form.append('fileToUpload', fs.createReadStream(tempPath));
        
        const upload = await axios.post('https://catbox.moe/user/api.php', form, {
            headers: form.getHeaders()
        });
        
        api.setMessageReaction("✅", messageID, () => {}, true);
        
        const msg = `◈ ───« رفـع الـمـلـفـات »─── ◈
│
◯ │ ✅ تم رفع الملف بنجاح
◯ │ 🔗 الرابط: ${upload.data}
◯ │ 📁 النوع: ${isImage ? 'صورة' : 'فيديو'}
◯ │ ⚡ المستضيف: catbox.moe
│
◈ ─────────────── ◈`;
        
        fs.unlinkSync(tempPath);
        return api.sendMessage(msg, threadID, messageID);
        
    } catch(error) {
        api.setMessageReaction("❌", messageID, () => {}, true);
        return api.sendMessage(`◈ ───« خـطـأ »─── ◈
│
◯ │ ${error.message}
◯ │ الأمر المستدعى: كاتبوكس
│
◈ ─────────────── ◈`, threadID, messageID);
    }
};
