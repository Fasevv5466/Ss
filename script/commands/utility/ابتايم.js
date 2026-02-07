module.exports.config = {
    name: "ابتايم",
    version: "1.1.0",
    hasPermssion: 0,
    credits: "Ayman",
    description: "فحص حالة البوت وصورته",
    commandCategory: "utility",
    usages: ".ابتايم",
    cooldowns: 5
};

module.exports.run = async function({ api, event, axios }) {
    const { threadID, messageID } = event;
    
    try {
        api.setMessageReaction("⏳", messageID, () => {}, true);
        
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        
        // جلب صورة حساب البوت
        const botID = api.getCurrentUserID();
        const avatarURL = `https://graph.facebook.com/${botID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        const avatar = (await axios.get(avatarURL, { responseType: "stream" })).data;

        const msg = `◈ ──« الـحـالـة »── ◈
◯ الـنظام: يعمل بنجاح ✅
◯ الـوقت: ${hours}س ${minutes}د ${seconds}ث
◯ المطور: أيمن
◯ الإصدار: 1.1.0
◈ ─────── ◈`;
        
        api.setMessageReaction("✅", messageID, () => {}, true);
        
        return api.sendMessage({
            body: msg,
            attachment: avatar
        }, threadID, messageID);
        
    } catch(error) {
        api.setMessageReaction("❌", messageID, () => {}, true);
        return api.sendMessage(`❌ خطأ: ${error.message}`, threadID, messageID);
    }
};
