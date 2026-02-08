// ═══════════════════════════════════════════════════════════
// 👑 KIRA - اكشن
// المطور: Ayman ♛
// الوصف: مقترح الأفلام الملكي (أفضل 100 فيلم مع الصور)
// ═══════════════════════════════════════════════════════════

const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "اكشن",
  aliases: [],
  version: "3.1.0",
  hasPermssion: 0,
  credits: "Ayman ♛",
  description: "مقترح الأفلام الملكي (أفضل 100 فيلم مع الصور)",
  commandCategory: "games",
  usages: "",
  cooldowns: 5,
};

module.exports.run = async function({ api, event, Currencies }) {
  const { threadID, messageID, senderID } = event;
  const reward = 3; // منحة ترفيهية

  // أفضل 100 فيلم (عينة)
  const movies = [
    "Inception", "The Dark Knight", "The Matrix", "John Wick", "Gladiator", 
    "Interstellar", "Pulp Fiction", "The Godfather", "The Revenant", "Dune",
    "Mad Max: Fury Road", "Django Unchained", "The Prestige", "The Departed", "Se7en"
  ];

  const randomMovie = movies[Math.floor(Math.random() * movies.length)];
  const cachePath = path.join(__dirname, `cache/movie_${senderID}.png`);

  api.sendMessage(`🎬 جاري البحث في الأرشيف السينمائي عن فيلم يليق بك سيدي..`, threadID, messageID);

  try {
    // TMDb API - سجل حساب مجاني واحصل على مفتاح API
    const TMDB_API_KEY = "YOUR_TMDB_API_KEY_HERE"; // ضع مفتاحك هنا

    // البحث عن الفيلم
    const searchRes = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(randomMovie)}&language=ar`);
    if (!searchRes.data.results || searchRes.data.results.length === 0) throw new Error("لم يتم العثور على الفيلم");

    const movie = searchRes.data.results[0];

    // رابط الصورة الرئيسي (Poster)
    const posterUrl = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : null;

    let attachment = null;
    if (posterUrl) {
      const imgRes = await axios.get(posterUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(cachePath, Buffer.from(imgRes.data, "binary"));
      attachment = fs.createReadStream(cachePath);
    }

    await Currencies.increaseMoney(senderID, reward);

    const msg = `◈ ───『 الـسـينـمـا الـمـلـكـيـة 』─── ◈\n\n` +
                `🎞️ الفيلم المقترح: ${movie.title}\n` +
                `📅 السنة: ${movie.release_date || "غير متوفر"}\n` +
                `⭐ التقييم: ${movie.vote_average || "غير متوفر"}\n` +
                `📝 القصة: ${movie.overview || "لا توجد قصة متوفرة"}\n\n` +
                `💰 منحة المشاهدة: +${reward}$\n` +
                `◈ ─────────────── ◈`;

    return api.sendMessage({ body: msg, attachment }, threadID, () => {
      if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
    }, messageID);

  } catch (err) {
    console.log("Movie Error:", err.message);
    return api.sendMessage(`🥀 سيدي، لم أستطع جلب البوستر، لكن أرشح لك فيلم:\n\n🎥 ${randomMovie}`, threadID, messageID);
  }
};
