const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { exec } = require("child_process");

module.exports.config = {
    name: "سمعني",
    version: "6.0.0",
    hasPermssion: 0,
    credits: "KIRA SYSTEM",
    description: "تحميل مباشر من يوتيوب باستخدام yt-dlp على Render",
    commandCategory: "media",
    usages: "[اسم الأغنية]",
    cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const query = args.join(" ");
    
    // 1. التحقق من المدخلات
    if (!query) return api.sendMessage("⚠️ اكتب اسم الأغنية يا وحش!", threadID, messageID);

    const waitMsg = await api.sendMessage(`🔍 جاري البحث والتحميل: ${query}...`, threadID);

    try {
        // 2. البحث عن النتيجة الأولى باستخدام YouTube API الخاص بك
        const searchUrl = `https://www.googleapis.com/youtube/v3/search`;
        const params = {
            part: 'snippet',
            q: query,
            type: 'video',
            maxResults: 1,
            key: 'AIzaSyCLyuBSAeTt6XkwGyP0nTh8O7sZXEEpV0Q' 
        };

        const searchResponse = await axios.get(searchUrl, { params });
        const video = searchResponse.data.items[0];

        if (!video) {
            api.unsendMessage(waitMsg.messageID);
            return api.sendMessage(`❌ لم أجد نتائج لـ: ${query}`, threadID, messageID);
        }

        const videoId = video.id.videoId;
        const title = video.snippet.title;
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

        // 3. إعداد المسارات والمجلد المؤقت
        const tempDir = path.join(process.cwd(), "temp_audio");
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

        const outputPath = path.join(tempDir, `${Date.now()}.mp3`);
        
        // 4. تحديد مسار برنامج yt-dlp الذي قمت بتحميله عبر الـ Build Command
        const ytDlpPath = path.join(process.cwd(), "yt-dlp");
        
        // التأكد من وجود الأداة، وإذا لم توجد نستخدم الأمر الافتراضي
        const ytDlpBinary = fs.existsSync(ytDlpPath) ? ytDlpPath : "yt-dlp";

        // 5. أمر التحميل (MP3، جودة عالية، بدون قائمة تشغيل)
        const command = `${ytDlpBinary} -x --audio-format mp3 --audio-quality 0 --no-playlist --no-check-certificate -o "${outputPath}" "${videoUrl}"`;

        exec(command, { maxBuffer: 1024 * 1024 * 20 }, async (error, stdout, stderr) => {
            if (error) {
                console.error("Download Error:", error);
                api.unsendMessage(waitMsg.messageID);
                return api.sendMessage(`❌ فشل التحميل.\nتأكد من كتابة Build Command في Render بشكل صحيح.`, threadID, messageID);
            }

            if (!fs.existsSync(outputPath)) {
                api.unsendMessage(waitMsg.messageID);
                return api.sendMessage(`❌ حدث خطأ: لم يتم إنتاج ملف الصوت.`, threadID, messageID);
            }

            // 6. التحقق من حجم الملف (فيسبوك يسمح بـ 25MB)
            const stats = fs.statSync(outputPath);
            const fileSizeInMB = stats.size / (1024 * 1024);

            if (fileSizeInMB > 26) {
                fs.unlinkSync(outputPath);
                api.unsendMessage(waitMsg.messageID);
                return api.sendMessage(`❌ الأغنية كبيرة جداً (${fileSizeInMB.toFixed(1)}MB). جرب أغنية أصغر.`, threadID, messageID);
            }

            // 7. إرسال الأغنية للمستخدم وتنظيف السيرفر
            api.unsendMessage(waitMsg.messageID);
            return api.sendMessage({
                body: `🎵 تفضل الأغنية يا بطل:\n🎧 ${title}\n📦 الحجم: ${fileSizeInMB.toFixed(2)} MB`,
                attachment: fs.createReadStream(outputPath)
            }, threadID, () => {
                // حذف الملف بعد الإرسال للحفاظ على مساحة السيرفر في Render
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            }, messageID);
        });

    } catch (error) {
        if (waitMsg && waitMsg.messageID) api.unsendMessage(waitMsg.messageID);
        console.error("System Error:", error);
        return api.sendMessage(`❌ خطأ في النظام: ${error.message}`, threadID, messageID);
    }
};
