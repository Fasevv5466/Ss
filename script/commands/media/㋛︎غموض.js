// ═══════════════════════════════════════════════════════════
// 👑 KIRA - غموض
// المطور: Ayman ♛
// الوصف: يقترح أفلام غموض وتشويق عالمية مع البوستر والتفاصيل
// ═══════════════════════════════════════════════════════════

module.exports.config = {
  name: "غموض",
  aliases: [],
  version: "2.1.0",
  hasPermssion: 0,
  credits: "Ayman ♛",
  description: "يقترح أفلام غموض وتشويق عالمية مع البوستر والتفاصيل",
  commandCategory: "media",
  usages: " ",
  cooldowns: 5,
  dependencies: {
    "axios": "",
    "fs-extra": ""
  }
};

module.exports.run = async function({ api, event }) {
  const axios = require("axios");
  const fs = require("fs-extra");
  const { threadID, messageID } = event;

  // أرشيف أفلام الغموض الإمبراطوري
  const mysteryMovies = [
    "Murder on the Orient Express", "The Game 1997", "Identity 2003", "The Fugitive", 
    "Knives Out", "L.A. Confidential", "The Hateful Eight", "Rear Window", 
    "Shutter Island", "Zodiac", "Memories of Murder", "The Girl with the Dragon Tattoo", 
    "Primal Fear", "Gone Girl", "Mystic River", "The Usual Suspects", "Prisoners", 
    "Seven 1995", "Memento", "The Bone Collector", "Searching 2018", "Sherlock Holmes", 
    "The Silence of the Lambs", "Inception", "The Truman Show", "Get Out", "Nightcrawler"
  ];

  const randomMovie = mysteryMovies[Math.floor(Math.random() * mysteryMovies.length)];
  
  // الاستعلام من قاعدة البيانات العالمية للأفلام
  const apiUrl = `https://api.popcat.xyz/movie?title=${encodeURIComponent(randomMovie)}`;

  api.sendMessage("🔍 جاري البحث في ملفات الغموض الأكثر سرية...", threadID, messageID);

  try {
    const response = await axios.get(apiUrl);
    const movie = response.data;

    // تجهيز مسار الصورة المؤقت
    const path = __dirname + `/cache/mystery_${Date.now()}.jpg`;
    const imageRes = await axios.get(movie.poster, { responseType: "arraybuffer" });
    fs.writeFileSync(path, Buffer.from(imageRes.data, "utf-8"));

    let msg = `┏━━━━━━ 🕵️‍♂️ ━━━━━━┓\n   مَـلـف الـغُـمـوض\n┗━━━━━━ 🕵️‍♂️ ━━━━━━┛\n\n` +
              `🎬 الـفـيـلـم: ${movie.title}\n` +
              `📅 الـسـنـة: ${movie.year}\n` +
              `⭐️ الـتـقـيـيـم: ${movie.rating}/10\n` +
              `⏳ الـمـدة: ${movie.runtime}\n\n` +
              `📝 الـقـصـة بـاخـتـصـار:\n${movie.plot || "ابحث عن الحقيقة بنفسك سيدي.."}\n\n` +
              `⚠️ تـحـذير: لا تـثـق بأحـد أثـناء الـمشـاهـدة!`;

    return api.sendMessage({
      body: msg,
      attachment: fs.createReadStream(path)
    }, threadID, () => {
      if (fs.existsSync(path)) fs.unlinkSync(path);
    }, messageID);

  } catch (error) {
    // في حال فشل الـ API يرسل الاسم فقط كخطة بديلة
    return api.sendMessage(`🕵️‍♂️ سيدي، اقترح لك فيلم الغموض: ${randomMovie}\n(تعذر جلب الملفات الكاملة حالياً)`, threadID, messageID);
  }
};
