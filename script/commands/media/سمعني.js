const axios = require("axios");
const yts = require("yt-search");

module.exports.config = {
    name: "سمعني",
    version: "2.1.0",
    hasPermssion: 0,
    credits: "KIRA SYSTEM",
    description: "تحميل اغاني يوتيوب باحترافية",
    commandCategory: "media",
    usages: "[اسم الاغنية]",
    cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const songName = args.join(" ");

    if (!songName)
        return api.sendMessage("⚠️ اكتب اسم الاغنية يا وحش.", threadID, messageID);

    try {
        api.sendMessage(`🔍 جاري البحث عن: ${songName}`, threadID, messageID);

        // 1️⃣ البحث باستخدام yt-search
        const search = await yts(songName);
        if (!search.videos.length)
            return api.sendMessage("❌ ما لقيت نتيجة لهالاسم.", threadID, messageID);

        const video = search.videos[0];
        const videoUrl = video.url;

        // 2️⃣ جلب رابط تحميل مباشر (Stream) لتجنب مشاكل ytdl-core
        // نستخدم محول خارجي يرجع ملف mp3 مباشرة للماسينجر
        const downloadApiUrl = `https://api.aggitech.top/videodl?url=${encodeURIComponent(videoUrl)}`;
        const res = await axios.get(downloadApiUrl);
        
        if (!res.data || !res.data.data || !res.data.data.audio) {
            return api.sendMessage("❌ فشل استخراج رابط الصوت، جرب لاحقاً.", threadID, messageID);
        }

        const audioUrl = res.data.data.audio;
        const stream = (await axios.get(audioUrl, { responseType: "stream" })).data;

        // 3️⃣ الإرسال
        return api.sendMessage({
            body: `⌬ ━━ 𝗞𝗜𝗥𝗔 𝗠𝗨𝗦𝗜𝗖 ━━ ⌬\n🎵 ${video.title}\n⏱ ${video.timestamp}\n👁 ${video.views.toLocaleString()} مشاهدة\n⌬ ━━━━━━━━━━━━━━━ ⌬`,
            attachment: stream
        }, threadID, messageID);

    } catch (err) {
        console.error(err);
        return api.sendMessage("❌ حدث خطأ في النظام أو الـ API، حاول مجدداً.", threadID, messageID);
    }
};
