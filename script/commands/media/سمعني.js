const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { exec } = require("child_process");

module.exports.config = {
    name: "سمعني",
    version: "4.0.0",
    hasPermssion: 0,
    credits: "KIRA SYSTEM",
    description: "تحميل وتشغيل الأغاني من YouTube",
    commandCategory: "media",
    usages: "[اسم الأغنية]",
    cooldowns: 10
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID, senderID } = event;
    const query = args.join(" ");
    
    if (!query) {
        return api.sendMessage("⚠️ الرجاء كتابة اسم الأغنية!\n📝 مثال: .سمعني hope", threadID, messageID);
    }

    const waitMsg = await api.sendMessage(`🔍 جاري البحث عن: ${query}...`, threadID);

    try {
        const searchUrl = `https://www.googleapis.com/youtube/v3/search`;
        const params = {
            part: 'snippet',
            q: query,
            type: 'video',
            maxResults: 5,
            key: 'AIzaSyCLyuBSAeTt6XkwGyP0nTh8O7sZXEEpV0Q' // تأكد من أن المفتاح شغال
        };

        const searchResponse = await axios.get(searchUrl, { params });
        const videos = searchResponse.data.items;

        if (!videos || videos.length === 0) {
            api.unsendMessage(waitMsg.messageID);
            return api.sendMessage(`❌ لم أجد نتائج لـ: ${query}`, threadID, messageID);
        }

        let resultMsg = `📋 نتائج البحث عن: ${query}\n\n`;
        videos.forEach((video, index) => {
            resultMsg += `${index + 1}. ${video.snippet.title}\n👤 ${video.snippet.channelTitle}\n\n`;
        });
        resultMsg += `⚠️ رد برقم الأغنية (1-${videos.length})`;

        api.unsendMessage(waitMsg.messageID);

        return api.sendMessage(resultMsg, threadID, (err, info) => {
            // إضافة الرد إلى القائمة العالمية للبوت
            global.client.handleReply.push({
                name: "سمعني", // يجب أن يطابق تماماً name في config
                messageID: info.messageID,
                author: senderID,
                videos: videos
            });
        }, messageID);

    } catch (error) {
        api.unsendMessage(waitMsg.messageID);
        return api.sendMessage(`❌ خطأ: ${error.message}`, threadID, messageID);
    }
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
    const { threadID, messageID, body, senderID } = event;
    
    // التحقق من صاحب الرد
    if (senderID !== handleReply.author) return;

    const choice = parseInt(body);
    const { videos } = handleReply;

    if (isNaN(choice) || choice < 1 || choice > videos.length) {
        return api.sendMessage(`⚠️ اختر رقماً صحيحاً من 1 إلى ${videos.length}`, threadID, messageID);
    }

    const selectedVideo = videos[choice - 1];
    const videoId = selectedVideo.id.videoId;
    const title = selectedVideo.snippet.title;
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    api.unsendMessage(handleReply.messageID);
    const downloadMsg = await api.sendMessage(`⬇️ جاري تحميل: ${title}...`, threadID);

    try {
        // إنشاء مجلد مؤقت في جذر المشروع
        const tempDir = path.join(process.cwd(), "temp_audio");
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

        const outputPath = path.join(tempDir, `${Date.now()}.mp3`);
        
        // استخدام مسار yt-dlp المحلي إذا كان موجوداً (للموافقة مع Render)
        const ytDlpPath = fs.existsSync(path.join(process.cwd(), "yt-dlp")) ? path.join(process.cwd(), "yt-dlp") : "yt-dlp";

        const command = `${ytDlpPath} -x --audio-format mp3 --audio-quality 0 --no-playlist --no-check-certificate -o "${outputPath}" "${videoUrl}"`;

        exec(command, { maxBuffer: 1024 * 1024 * 20 }, async (error) => {
            if (error) {
                api.unsendMessage(downloadMsg.messageID);
                return api.sendMessage(`❌ فشل التحميل! تأكد من إعدادات السيرفر.`, threadID, messageID);
            }

            const stats = fs.statSync(outputPath);
            const fileSizeInMB = stats.size / (1024 * 1024);

            if (fileSizeInMB > 26) {
                fs.unlinkSync(outputPath);
                api.unsendMessage(downloadMsg.messageID);
                return api.sendMessage(`❌ الحجم كبير جداً (${fileSizeInMB.toFixed(1)}MB).`, threadID, messageID);
            }

            api.unsendMessage(downloadMsg.messageID);
            return api.sendMessage({
                body: `✅ تم التحميل:\n🎧 ${title}`,
                attachment: fs.createReadStream(outputPath)
            }, threadID, () => {
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            }, messageID);
        });

    } catch (error) {
        api.unsendMessage(downloadMsg.messageID);
        api.sendMessage(`❌ خطأ: ${error.message}`, threadID, messageID);
    }
};
