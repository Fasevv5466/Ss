const axios = require("axios");
const fs = require("fs-extra");
const yts = require("yt-search");

module.exports.config = {
    name: "سمعني",
    version: "1.2.5",
    hasPermssion: 0,
    credits: "ayman",
    description: "البحث عن الأغاني وتحميلها صوتاً بدون أخطاء",
    commandCategory: "media",
    usages: "[اسم الأغنية]",
    cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const songName = args.join(" ");
    const header = `⌬ ━━━━━━━━━━━━ ⌬\n      🎵 طـرب كـيـرا\n⌬ ━━━━━━━━━━━━ ⌬`;

    if (!songName) {
        return api.sendMessage(`${header}\n⚠️ يـرجـى كـتـابـة اسـم الأغـنـيـة!\n${header}`, threadID, messageID);
    }

    try {
        api.sendMessage(`🔍 جـاري الـبـحـث والـتـحـمـيـل: [ ${songName} ]...`, threadID, messageID);

        // 1. البحث عن الأغنية في يوتيوب
        const searchResults = await yts(songName);
        if (!searchResults.videos.length) {
            return api.sendMessage("❌ لـم أتـمـكـن مـن الـعـثـور عـلى الأغـنـيـة.", threadID, messageID);
        }

        const video = searchResults.videos[0];
        const videoUrl = video.url;
        
        // إنشاء مسار الملف في مجلد cache
        const cacheDir = __dirname + "/cache/";
        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
        const streamPath = cacheDir + `song_${Date.now()}.mp3`;

        // 2. استخدام API خارجي مستقر للتحميل لتجنب مشاكل ytdl-core
        const downloadUrl = `https://api.aggitech.top/videodl?url=${encodeURIComponent(videoUrl)}`;
        
        const response = await axios({
            method: 'get',
            url: downloadUrl,
            responseType: 'stream'
        });

        // 3. كتابة الملف باستخدام fs-extra
        const writer = fs.createWriteStream(streamPath);
        response.data.pipe(writer);

        writer.on("finish", async () => {
            try {
                const stats = fs.statSync(streamPath);
                
                // التأكد أن حجم الملف لا يتجاوز 25 ميجا (حد ماسينجر)
                if (stats.size > 26214400) {
                    fs.unlinkSync(streamPath);
                    return api.sendMessage("⚠️ الأغـنـيـة كـبـيـرة جـداً، جـرب أغـنـيـة أقـصـر.", threadID, messageID);
                }

                const msg = {
                    body: `${header}\n✅ تـم الـتـحـمـيـل بـنـجـاح\n\n⪼ الـعـنـوان: ${video.title}\n⪼ الـمـدة: ${video.timestamp}\n${header}`,
                    attachment: fs.createReadStream(streamPath)
                };

                return api.sendMessage(msg, threadID, () => {
                    if (fs.existsSync(streamPath)) fs.unlinkSync(streamPath);
                }, messageID);

            } catch (err) {
                console.error(err);
                return api.sendMessage("❌ حـدث خـطأ أثـنـاء إرسـال الـصـوت.", threadID, messageID);
            }
        });

        writer.on("error", (err) => {
            console.error(err);
            api.sendMessage("⚠️ فـشـل تـحـمـيـل الـمـلـف مـن الـسـيـرفـر.", threadID, messageID);
        });

    } catch (error) {
        console.error(error);
        return api.sendMessage("⚠️ حـدث خـطأ فـي الـنـظـام، حـاول مـجـدداً.", threadID, messageID);
    }
};
