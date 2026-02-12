const axios = require("axios");
const fs = require("fs-extra");
const yts = require("yt-search");

module.exports.config = {
    name: "سمعني",
    version: "1.3.0",
    hasPermssion: 0,
    credits: "ayman",
    description: "تحميل الأغاني بصيغة Buffer لضمان العمل 100%",
    commandCategory: "media",
    usages: "[اسم الأغنية]",
    cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const songName = args.join(" ");
    const header = `⌬ ━━━━━━━━━━━━ ⌬\n      🎵 طـرب كـيـرا\n⌬ ━━━━━━━━━━━━ ⌬`;

    if (!songName) return api.sendMessage(`${header}\n⚠️ يـرجـى كـتـابـة اسـم الأغـنـيـة!\n${header}`, threadID, messageID);

    try {
        api.sendMessage(`🔍 جـاري الـبـحـث والـتـحـمـيـل...`, threadID, messageID);

        const searchResults = await yts(songName);
        if (!searchResults.videos.length) return api.sendMessage("❌ لم أجد الأغنية.", threadID, messageID);

        const video = searchResults.videos[0];
        // استخدام رابط API بديل وأسرع
        const downloadUrl = `https://api.aggitech.top/videodl?url=${encodeURIComponent(video.url)}`;

        // تحميل الملف كـ Buffer (هنا الحل)
        const response = await axios.get(downloadUrl, { responseType: "arraybuffer" });
        const musicBuffer = Buffer.from(response.data, "utf-8");

        // مسار الحفظ
        const path = __dirname + `/cache/song_${Date.now()}.mp3`;
        
        // التأكد من المجلد وحفظ الملف
        if (!fs.existsSync(__dirname + "/cache/")) fs.mkdirSync(__dirname + "/cache/");
        fs.writeFileSync(path, musicBuffer);

        const stats = fs.statSync(path);
        if (stats.size > 26214400) { // 25MB
            fs.unlinkSync(path);
            return api.sendMessage("⚠️ الملف كبير جداً (أكثر من 25MB).", threadID, messageID);
        }

        const msg = {
            body: `${header}\n✅ تـم الـتـحـمـيـل بـنـجـاح\n\n⪼ الـعـنـوان: ${video.title}\n⪼ الـمـدة: ${video.timestamp}\n${header}`,
            attachment: fs.createReadStream(path)
        };

        return api.sendMessage(msg, threadID, () => {
            if (fs.existsSync(path)) fs.unlinkSync(path);
        }, messageID);

    } catch (error) {
        console.error(error);
        return api.sendMessage("❌ حدث خطأ! السيرفر قد يكون مضغوطاً حالياً.", threadID, messageID);
    }
};
