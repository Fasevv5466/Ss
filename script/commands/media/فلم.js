module.exports.config = {
  name: "فلم",
  version: "6.1.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "بحث واقتراحات أفلام مع إصلاح جلب الصور ✨",
  commandCategory: "media",
  usages: ".فلم [اسم] أو [فئة]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const axios = require('axios');
  const fs = require("fs-extra");
  const { threadID, messageID } = event;
  const header = `⌬ ━━━━━━━━━━━━ ⌬\n      🎬 أنـظـمـة الأفـلام\n⌬ ━━━━━━━━━━━━ ⌬`;

  const categories = {
    "اكشن": ["John Wick", "Extraction", "The Dark Knight", "Top Gun: Maverick", "Gladiator", "The Raid", "Inception"],
    "أكشن": ["John Wick", "Extraction", "The Dark Knight", "Top Gun: Maverick", "Gladiator", "The Raid", "Inception"],
    "دراما": ["The Shawshank Redemption", "The Godfather", "Forrest Gump", "The Green Mile", "Parasite", "Joker"],
    "رعب": ["The Conjuring", "The Exorcist", "The Shining", "It", "Scream", "Hereditary", "Smile", "Talk to Me"],
    "خيال": ["Interstellar", "Inception", "The Matrix", "Avatar", "Blade Runner 2049", "Arrival"],
    "كوميديا": ["The Hangover", "Superbad", "The Dictator", "Deadpool", "Free Guy", "The Mask"],
    "جريمة": ["Pulp Fiction", "Goodfellas", "The Departed", "No Country for Old Men", "Heat"],
    "سيرة": ["Oppenheimer", "The Wolf of Wall Street", "Bohemian Rhapsody", "Schindler's List"],
    "كرتون": ["Toy Story", "The Lion King", "Spider-Man: Into the Spider-Verse", "Finding Nemo", "Coco"],
    "وثائقي": ["Our Planet", "The Last Dance", "Cosmos: A Spacetime Odyssey", "Planet Earth"]
  };

  let query = args.join(" ");

  if (!query) {
    return api.sendMessage(
      `${header}\n\n` +
      `يـرجـى تـحـديـد الـفـئـة سـيـدي:\n` +
      `⪼ فلم اكشن | دراما | رعب\n` +
      `⪼ فلم خيال | كوميديا | جريمة\n` +
      `⪼ فلم سيرة | كرتون | وثائقي\n\n` +
      `💡 أو ابـحـث: .فلم [الاسم]\n` +
      `⌬ ━━━━━━━━━━━━ ⌬`, 
      threadID, messageID
    );
  }

  let targetMovie = query;
  let isCategory = false;
  
  if (categories[query]) {
    targetMovie = categories[query][Math.floor(Math.random() * categories[query].length)];
    isCategory = true;
    api.setMessageReaction("🎬", messageID, () => {}, true);
  } else {
    api.setMessageReaction("🔍", messageID, () => {}, true);
  }

  try {
    const res = await axios.get(`https://api.popcat.xyz/imdb?q=${encodeURIComponent(targetMovie)}`);
    const data = res.data;

    if (data.error || !data.title) return api.sendMessage(`❌ لـم أجد نـتائـج لـ "${targetMovie}"`, threadID, messageID);

    // دالة الترجمة المحسنة
    const translate = async (text) => {
      if (!text) return "غير متوفر";
      const tRes = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ar&dt=t&q=${encodeURIComponent(text)}`);
      return tRes.data[0].map(x => x[0]).join("");
    };

    const [plotAr, genresAr] = await Promise.all([translate(data.plot), translate(data.genres)]);
    const path = __dirname + `/cache/movie_${Date.now()}.png`;

    // تحميل الصورة كـ Buffer لضمان وصولها كاملة
    const imageRes = await axios.get(data.poster, { responseType: 'arraybuffer' });
    fs.writeFileSync(path, Buffer.from(imageRes.data));

    const msg = {
      body: `${header}\n\n` +
            (isCategory ? `✨ اقـتـراح لـك: 【 ${data.title} 】\n\n` : "") +
            `⪼ الـعـنـوان: ${data.title}\n` +
            `⪼ الـسـنـة: ${data.year}\n` +
            `⪼ الـتـقـيـيـم: ${data.rating}/10\n` +
            `⪼ الـتـصـنـيـف: ${genresAr}\n\n` +
            `📖 الـقـصـة بـالـعـربـيـة:\n${plotAr}\n\n` +
            `⌬ ━━━━━━━━━━━━ ⌬`,
      attachment: fs.createReadStream(path)
    };

    return api.sendMessage(msg, threadID, () => {
      if (fs.existsSync(path)) fs.unlinkSync(path);
    }, messageID);

  } catch (err) {
    console.error(err);
    return api.sendMessage("⚠️ حـدث خـطأ فـي جـلـب الـبيـانـات، حـاول مـجـدداً.", threadID, messageID);
  }
};
