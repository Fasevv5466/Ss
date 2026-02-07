const fs = require("fs-extra");
const FormData = require("form-data");
const axios = require("axios");

module.exports.config = {
    name: "بيد",
    version: "1.0.0",
    hasPermssion: 2,
    credits: "Ayman",
    description: "رفع ملفات النظام",
    commandCategory: "developer",
    usages: ".بيد [اسم الملف] أو بالرد",
    cooldowns: 10
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID, senderID } = event;
    
    if (!global.config.ADMINBOT.includes(senderID.toString())) {
        return api.sendMessage(`◈ ──« رفـض »── ◈\n◯ خاص بالمطور فقط\n◈ ─────── ◈`, threadID, messageID);
    }
    
    try {
        api.setMessageReaction("⏳", messageID, () => {}, true);
        
        let filePath;
        
        if (event.messageReply?.attachments?.length) {
            const attachment = event.messageReply.attachments[0];
            const response = await axios.get(attachment.url, { responseType: 'stream' });
            filePath = `./temp_up_${Date.now()}`;
            const writer = fs.createWriteStream(filePath);
            response.data.pipe(writer);
            await new Promise((res, rej) => { writer.on('finish', res); writer.on('error', rej); });
        }
        else if (args[0]) {
            filePath = `./script/commands/${args[0]}`;
            if (!fs.existsSync(filePath)) return api.sendMessage("❌ الملف غير موجود", threadID, messageID);
        }
        else {
            return api.sendMessage(`◈ ──« خـطأ »── ◈\n◯ حدد ملفاً أو رد عليه\n◈ ─────── ◈`, threadID, messageID);
        }
        
        const form = new FormData();
        form.append('file', fs.createReadStream(filePath));
        
        const upload = await axios.post('https://api.kenliejugarap.com/upload', form, {
            headers: form.getHeaders()
        });
        
        api.setMessageReaction("✅", messageID, () => {}, true);
        const url = upload.data.url || 'لا يوجد رابط';
        
        if (filePath.includes('temp_up')) fs.unlinkSync(filePath);
        
        return api.sendMessage(`◈ ──« تـم الرفع »── ◈\n◯ الرابط: ${url}\n◈ ─────── ◈`, threadID, messageID);
        
    } catch(error) {
        api.setMessageReaction("❌", messageID, () => {}, true);
        return api.sendMessage(`❌ خطأ: ${error.message}`, threadID, messageID);
    }
};
