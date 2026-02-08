const axios = require('axios');

module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
    const { threadID, messageID } = event;
    
    const city = args.join(" ");
    if (!city) {
        return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\nاكتب اسم المدينة", threadID, messageID);
    }
    
    try {
        const response = await axios.get(`https://api.popcat.xyz/weather?q=${encodeURIComponent(city)}`);
        const data = response.data[0];
        
        if (!data) throw new Error("المدينة غير موجودة");
        
        const message = `⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\nالطقس في ${data.location.name}\n\nدرجة الحرارة: ${data.current.temperature}°C\nالطقس: ${data.current.skytext}\nالرطوبة: ${data.current.humidity}%\nالرياح: ${data.current.winddisplay}\nوقت الرصد: ${data.current.observationtime}`;
        
        return api.sendMessage(message, threadID, messageID);
        
    } catch (error) {
        return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\nفشل جلب معلومات الطقس", threadID, messageID);
    }
};

module.exports.config = {
    name: "طقس",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "ايمن",
    description: "معرفة حالة الطقس",
    commandCategory: "utility",
    usages: "طقس [المدينة]",
    cooldowns: 5
};
