// ═══════════════════════════════════════════════════════════
// 👑 KIRA - دراما
// المطور: Ayman ♛
// الوصف: اقتراح أفلام درامية عالمية مع البوستر الرسمي
// ═══════════════════════════════════════════════════════════

const axios = require("axios");
const fs = require("fs-extra");

module.exports.config = {
  name: "دراما",
  aliases: [],
  version: "3.0.0",
  hasPermssion: 0,
  credits: "Ayman ♛",
  description: "اقتراح أفلام درامية عالمية مع البوستر الرسمي",
  commandCategory: "media",
  usages: "",
  cooldowns: 5
};

module.exports.run = async function({ api, event }) {
  const { threadID, messageID, senderID } = event;

  // قائمة ضخمة من روائع السينما (سيتم جلب بوستراتها تلقائياً)
  const movies = [
    "The Shawshank Redemption", "The Godfather", "Schindler's List", "Forrest Gump", 
    "The Green Mile", "Pulp Fiction", "The Pursuit of Happyness", "Life is Beautiful", 
    "Capernaum", "Incendies", "12 Angry Men", "The Father", "Parasite", "Joker", 
    "Good Will Hunting", "The Pianist", "A Beautiful Mind", "Interstellar", 
    "The Prestige", "Gladiator", "Cast Away", "The Truman Show", "Lion", 
    "Room", "Wonder", "The Intouchables", "Hidden Figures", "The Whale"
  ];

  const randomMovie = movies[Math.floor(Math.random() * movies.length)];
  const path = __dirname + `/cache/drama_${senderID}.png`;

  api.sendMessage(`🎬 جاري البحث في الأرشيف الإمبراطوري عن أفضل كدراما...`, threadID, messageID);

  try {
    // جلب البيانات والبوستر من API الأفلام
    const res = await axios.get(`https://www.omdbapi.com/?t=${encodeURIComponent(randomMovie)}&apikey=ecc05b99`);
    const data = res.data;

    if (!data.Poster || data.Poster === "N/A") throw new Error("No Poster");

    // تحميل صورة البوستر
    const imgRes = await axios.get(data.Poster, { responseType: "arraybuffer" });
    fs.writeFileSync(path, Buffer.from(imgRes.data, "utf-8"));

    let msg = `┏━━━━━━ 🎞️ ━━━━━━┓\n   الـسـينـمـا الإمـبـراطـوريـة\n┗━━━━━━ 🎞️ ━━━━━━┛\n\n` +
              `🎥 الـفـيـلم: ${data.Title}\n` +
              `⭐ الـتـقـيـيـم: ${data.imdbRating} / 10\n` +
              `📅 الـسـنة: ${data.Year}\n` +
              `⏳ الـمـدة: ${data.Runtime}\n` +
              `🎭 الـتـصنيـف: ${data.Genre}\n\n` +
              `📖 الـقـصـة:\n${data.Plot}\n\n` +
              `————————————————\n` +
              `│←› الـنـاقـد: الـتـوب ايـمـن 👑\n` +
              `◈ ──────────────── ◈`;

    return api.sendMessage({
      body: msg,
      attachment: fs.createReadStream(path)
    }, threadID, () => {
        if (fs.existsSync(path)) fs.unlinkSync(path);
    }, messageID);

  } catch (err) {
    return api.sendMessage(`⚠️ سيدي، تعذر جلب البوستر، لكن أرشح لك هذا الفيلم يدوياً:\n\n🎬 الاسم: ${randomMovie}`, threadID, messageID);
  }
};
