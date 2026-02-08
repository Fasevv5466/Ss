// ═══════════════════════════════════════════════════════════
// 👑 KIRA - يوتيب
// المطور: Ayman ♛
// الوصف: تشغيل فيديوهات من اليوتيوب
// ═══════════════════════════════════════════════════════════

const axios = require("axios");
const { createReadStream, createWriteStream, unlinkSync, statSync } = require("fs-extra");

module.exports.config = {
  name: "يوتيب",
  aliases: [],
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Ayman ♛",
  description: "تشغيل فيديوهات من اليوتيوب",
  prefix: false,
    commandCategory: "utility",
  usages: "يوتيب [إسم الفيديو]",
  cooldowns: 10
};

module.exports.handleReply = async function({ api, event, handleReply }) {
  try {
    const selectedIndex = parseInt(event.body) - 1;
    if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= handleReply.searchResults.length) {
      return api.sendMessage("⚠️ | الرجاء الرد برقم صحيح من القائمة.", event.threadID, event.messageID);
    }

    const video = handleReply.searchResults[selectedIndex];
    const videoUrl = `https://yt-video-production.up.railway.app/ytdl?url=${encodeURIComponent(video.videoUrl)}`;

    api.sendMessage(`⏱️ | جاري تنزيل الفيديو: ${video.title}\nهذا قد يستغرق بعض الوقت، يرجى الانتظار.`, event.threadID, async (err, info) => {
      setTimeout(() => api.unsendMessage(info.messageID), 20500);
    });

    try {
      const downloadResponse = await axios.get(videoUrl);
      const { video: videoFileUrl, title } = downloadResponse.data;

      const filePath = `${__dirname}/cache/video.mp4`;

      // تنزيل الفيديو باستخدام الرابط الذي تم الحصول عليه
      const videoStream = await axios({
        url: videoFileUrl,
        method: "GET",
        responseType: "stream"
      });

      videoStream.data
        .pipe(createWriteStream(filePath))
        .on("close", () => {
          if (statSync(filePath).size > 26214400) {
            api.sendMessage("⚠️ | تعذر إرسال الفيديو لأن حجمه أكبر من 25 ميغابايت.", event.threadID, () => unlinkSync(filePath));
          } else {
            api.sendMessage({ body: title, attachment: createReadStream(filePath) }, event.threadID, () => unlinkSync(filePath));
          }
        })
        .on("error", (error) => api.sendMessage(`⛔ | حدث خطأ أثناء التنزيل: ${error.message}`, event.threadID));
    } catch (error) {
      api.sendMessage(`⛔ | حدث خطأ أثناء التنزيل: ${error.message}`, event.threadID);
    }
  } catch {
    api.sendMessage("⛔ | تعذر معالجة طلبك!", event.threadID);
  }
};

module.exports.run = async function({ api, event, args }) {
  if (args.length === 0) return api.sendMessage("⚠️ | لا يمكن ترك البحث فارغًا!", event.threadID, event.messageID);

  const query = args.join(" ");
  const apiUrl = `https://c-v1.onrender.com/yt/s?query=${encodeURIComponent(query)}`;

  try {
    const response = await axios.get(apiUrl);
    const searchResults = response.data.slice(0, 4); // تحديد عدد النتائج إلى 4 كحد أقصى

    if (!searchResults.length) {
      return api.sendMessage("❌ | لم يتم العثور على نتائج.", event.threadID, event.messageID);
    }

    let message = "🎼 نتائج البحث:\n\n";
    searchResults.forEach((result, index) => {
      message += `${index + 1}. ${result.title}\nالقناة: ${result.channelTitle}\n-----------------------\n`;
    });

    api.sendMessage(
      `${message}\nأرجوك قم بالرد على هذه الرسالة برقم الفيديو لتنزيله.`,
      event.threadID,
      (err, info) => {
        global.client.handleReply.push({
          name: this.config.name,
          messageID: info.messageID,
          author: event.senderID,
          searchResults
        });
      },
      event.messageID
    );
  } catch (error) {
    api.sendMessage(`⛔ | حدث خطأ أثناء البحث: ${error.message}`, event.threadID, event.messageID);
  }
};