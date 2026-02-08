// ═══════════════════════════════════════════════════════════
// 👑 KIRA - تلقائي
// المطور: Ayman ♛
// الوصف: ارسال مقطع قرآني مدته دقيقة كل 30 دقيقة لجميع الكروبات
// ═══════════════════════════════════════════════════════════

const axios = require("axios");
const fs = require("fs-extra");
const ffmpeg = require("fluent-ffmpeg");

module.exports.config = {
  name: "تلقائي",
  aliases: [],
  version: "3.0.0",
  hasPermssion: 2,
  credits: "Ayman ♛",
  description: "ارسال مقطع قرآني مدته دقيقة كل 30 دقيقة لجميع الكروبات",
  commandCategory: "utility",
  cooldowns: 0
};

module.exports.onLoad = async ({ api }) => {
  console.log("📍 تم تشغيل نظام القرآن التلقائي: كل 30 دقيقة | المدة: 1 دقيقة");

  const quranLinks = [
    "https://server11.mp3quran.net/yasser/002.mp3",
    "https://server11.mp3quran.net/yasser/003.mp3",
    "https://server11.mp3quran.net/yasser/004.mp3",
    "https://server11.mp3quran.net/yasser/005.mp3",
    "https://server11.mp3quran.net/yasser/006.mp3"
  ];

  setInterval(async () => {
    try {
      const list = await api.getThreadList(50, null, ["INBOX"]);
      const randomUrl = quranLinks[Math.floor(Math.random() * quranLinks.length)];
      
      const inputPath = __dirname + `/cache/raw_quran.mp3`;
      const outputPath = __dirname + `/cache/cut_quran.mp3`;

      if (!fs.existsSync(__dirname + "/cache")) fs.mkdirSync(__dirname + "/cache");

      // 1. تحميل الملف الأصلي
      const res = await axios({ method: 'get', url: randomUrl, responseType: 'stream' });
      const writer = fs.createWriteStream(inputPath);
      res.data.pipe(writer);

      writer.on('finish', () => {
        // 2. قص أول دقيقة من الصوت باستخدام ffmpeg
        ffmpeg(inputPath)
          .setStartTime(0) 
          .setDuration(60) // مدة المقطع 60 ثانية (دقيقة واحدة)
          .output(outputPath)
          .on('end', async () => {
            for (const thread of list) {
              if (thread.isGroup) {
                api.sendMessage({
                  body: "✨ تذكير تلقائي: مقطع مدته دقيقة من القرآن الكريم بصوت ياسر الدوسري.. اسمع وتدبر.",
                  attachment: fs.createReadStream(outputPath)
                }, thread.threadID);
              }
            }
            // تنظيف الملفات بعد الإرسال
            setTimeout(() => {
              if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
              if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            }, 20000);
          })
          .on('error', (err) => console.log("خطأ في معالجة الصوت: " + err))
          .run();
      });

    } catch (e) {
      console.log("حدث خطأ في النظام التلقائي: " + e.message);
    }
  }, 30 * 60 * 1000); // 30 دقيقة بالضبط
};

module.exports.run = async ({ api, event }) => {
  return api.sendMessage("✅ تم تفعيل القرآن التلقائي (كل 30 دقيقة - مدة دقيقة) لجميع المجموعات.", event.threadID);
};
