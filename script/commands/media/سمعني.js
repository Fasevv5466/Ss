const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { exec } = require("child_process");

module.exports.config = {
    name: "سمعني",
    version: "5.2.0",
    hasPermssion: 0,
    credits: "KIRA SYSTEM",
    description: "تحميل مباشر من يوتيوب - نسخة Render الاحترافية",
    commandCategory: "media",
    usages: "[اسم الأغنية]",
    cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const query = args.join(" ");
    
    if (!query) return api.sendMessage("⚠️ اكتب اسم الأغنية يا وحش!", threadID, messageID);

    const waitMsg = await api.sendMessage(`🔍 جاري البحث والتحميل: ${query}...`, threadID);

    try {
        // 1. البحث عن النتيجة الأولى باستخدام YouTube API
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

        // 2. إعداد المسارات (استخدام مسار العمل الحالي)
        const tempDir = path.join(process.cwd(), "temp_audio");
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

        const outputPath = path.join(tempDir, `${Date.now()}.mp3`);
        
        // 3. تحديد مسار yt-dlp (المحلي في رندر أو العالمي)
        const localYtDlp = path.join(process.cwd(), "yt-dlp");
        const ytDlpBinary = fs.existsSync(localYtDlp) ? localYtDlp : "yt-dlp";

        // 4. أمر التحميل المعدل
        const command = `${ytDlpBinary} -x --audio-format mp3 --audio-quality 0 --no-playlist --no-check-certificate -o "${outputPath}" "${videoUrl}"`;

        exec(command, { maxBuffer: 1024 * 1024 * 20 }, async (error, stdout, stderr) => {
            if (error) {
                console.error("Download Error:", error);
                api.unsendMessage(waitMsg.messageID);
                return api.sendMessage(`❌ فشل التحميل.\nتأكد من نجاح أمر 'postinstall' في Render.`, threadID, messageID);
            }

            if (!fs.existsSync(outputPath)) {
                api.unsendMessage(waitMsg.messageID);
                return api.sendMessage(`❌ حدث خطأ: لم يتم إنشاء ملف الصوت.`, threadID, messageID);
            }

            const stats = fs.statSync(outputPath);
            const fileSizeInMB = stats.size / (1024 * 1024);

            if (fileSizeInMB > 26) {
                fs.unlinkSync(outputPath);
                api.unsendMessage(waitMsg.messageID);
                return api.sendMessage(`❌ الأغنية كبيرة جداً (${fileSizeInMB.toFixed(1)}MB). الحد الأقصى 25MB.`, threadID, messageID);
            }

            // 5. إرسال الأغنية
            api.unsendMessage(waitMsg.messageID);
            return api.sendMessage({
                body: `🎵 تفضل الأغنية يا بطل:\n🎧 ${title}\n📦 الحجم: ${fileSizeInMB.toFixed(2)} MB`,
                attachment: fs.createReadStream(outputPath)
            }, threadID, () => {
                // تنظيف الملفات المؤقتة فوراً
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            }, messageID);
        });

    } catch (error) {
        if (waitMsg && waitMsg.messageID) api.unsendMessage(waitMsg.messageID);
        return api.sendMessage(`❌ خطأ في النظام: ${error.message}`, threadID, messageID);
    }
};
