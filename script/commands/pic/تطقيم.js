const axios = require("axios");

const mahmud = async () => {
    const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
    return base.data.mahmud;
};

module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
    const { threadID, messageID } = event;
    
    try {
        const apiBase = await mahmud();
        const baseUrl = `${apiBase}/api/cdpvip2`;

        const getStream = async (url) => {
            const res = await axios({
                url,
                method: "GET",
                responseType: "stream",
                headers: { "User-Agent": "Mozilla/5.0" }
            });
            return res.data;
        };

        const category = "anime";
        const res = await axios.get(`${baseUrl}?category=${category}`);
        const groupImages = res.data?.group || [];

        if (!groupImages.length) {
            return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 PIC ━━ ⌬\n\nلم يتم العثور على تطقيم", threadID, messageID);
        }

        const streamAttachments = [];
        for (const url of groupImages) {
            try {
                const stream = await getStream(url);
                streamAttachments.push(stream);
            } catch {
                console.warn(`Failed to load: ${url}`);
            }
        }

        if (!streamAttachments.length) {
            return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 PIC ━━ ⌬\n\nفشل تحميل الصور", threadID, messageID);
        }

        return api.sendMessage({
            body: "⌬ ━━ 𝗞𝗜𝗥𝗔 PIC ━━ ⌬\n\تطقيم أنمي عشوائية",
            attachment: streamAttachments
        }, threadID, messageID);

    } catch (error) {
        console.error('Pairdp Error:', error);
        return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 PIC ━━ ⌬\n\nحدث خطأ", threadID, messageID);
    }
};

module.exports.config = {
    name: "تطقيم",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "ايمن",
    description: "تطقيم أنمي عشوائية للبروفايل",
    commandCategory: "pic",
    usages: "تطقيم",
    cooldowns: 5
};
