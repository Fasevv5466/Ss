const axios = require("axios");
const yts = require("yt-search");
const ytdl = require("ytdl-core");

module.exports.config = {
    name: "سمعني",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "KIRA SYSTEM",
    description: "تحميل اغاني بدون API خارجي",
    commandCategory: "media",
    usages: "[اسم الاغنية]",
    cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const songName = args.join(" ");

    if (!songName)
        return api.sendMessage("⚠️ اكتب اسم الاغنية.", threadID, messageID);

    try {
        api.sendMessage(`🔍 جاري البحث عن: ${songName}`, threadID, messageID);

        // 1️⃣ بحث
        const search = await yts(songName);
        if (!search.videos.length)
            return api.sendMessage("❌ ما حصلت نتيجة.", threadID, messageID);

        const video = search.videos[0];

        // 2️⃣ تحميل صوت فقط
        const stream = ytdl(video.url, {
            filter: "audioonly",
            quality: "highestaudio"
        });

        return api.sendMessage({
            body:
`⌬ ━━ 𝗞𝗜𝗥𝗔 𝗠𝗨𝗦𝗜𝗖 ━━ ⌬
🎵 ${video.title}
⏱ ${video.timestamp}
👁 ${video.views} مشاهدة
⌬ ━━━━━━━━━━━━━━━ ⌬`,
            attachment: stream
        }, threadID, messageID);

    } catch (err) {
        return api.sendMessage("❌ فشل التحميل، تأكد الانترنت شغال.", threadID, messageID);
    }
};
