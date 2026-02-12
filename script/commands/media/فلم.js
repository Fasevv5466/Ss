module.exports.config = {
  name: "فلم",
  version: "6.0.5",
  hasPermssion: 0,
  credits: "Ayman",
  description: "بحث واقتراحات أفلام حسب الفئة ✨",
  commandCategory: "media",
  usages: ".فلم [اسم] أو [فئة]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const axios = require('axios');
  const fs = require("fs-extra");
  const request = require("request");
  const { threadID, messageID } = event;
  const header = `⌬ ━━━━━━━━━━━━ ⌬\n      🎬 أنـظـمـة الأفـلام\n⌬ ━━━━━━━━━━━━ ⌬`;

  // القائمة مع دعم الألف الممدودة والعادية لضمان الرد
  const categories = {
    "اكشن": ["John Wick", "Extraction", "The Dark Knight", "Top Gun: Maverick"],
    "أكشن": ["John Wick", "Extraction", "The Dark Knight", "Top Gun: Maverick"],
    "دراما": ["The Shawshank Redemption", "The Godfather", "Parasite"],
    "رعب": ["The Conjuring", "The Exorcist", "Smile", "Talk to Me"],
    "خيال": ["Interstellar", "Inception", "The Matrix", "Avatar"],
    "كوميديا": ["The Hangover", "Superbad", "The Dictator", "Deadpool"],
    "جريمة": ["Pulp Fiction", "Goodfellas", "The Departed", "Se7en"],
    "سيرة": ["Oppenheimer", "The Wolf of Wall Street", "Elvis"],
    "كرتون": ["Toy Story", "Spider-Man: Into the Spider-Verse", "Coco"],
    "وثائقي": ["Our Planet", "Planet Earth", "The Social Dilemma"]
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
  
  // التحقق من الفئة (دعم الألف)
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

    if (data.error) return api.sendMessage(`❌ لـم أجد نـتائـج لـ "${targetMovie}"`, threadID, messageID);

    const translate = async (text) => {
      if (!text) return "غير متوفر";
      const tRes = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ar&dt=t&q=${encodeURIComponent(text)}`);
      return tRes.data[0].map(x => x[0]).join("");
    };

    const [plotAr, genresAr] = await Promise.all([translate(data.plot), translate(data.genres)]);

    const path = __dirname + `/cache/movie_${Date.now()}.png`;
    const callback = () => {
      api.sendMessage({
        body: `${header}\n\n` +
              (isCategory ? `✨ اقـتـراح لـك: 【 ${data.title} 】\n\n` : "") +
              `⪼ الـعـنـوان: ${data.title}\n` +
              `⪼ الـسـنـة: ${data.year}\n` +
              `⪼ الـتـقـيـيـم: ${data.rating}/10\n` +
              `⪼ الـتـصـنـيـف: ${genresAr}\n\n` +
              `📖 الـقـصـة بـالـعـربـيـة:\n${plotAr}\n\n` +
              `⌬ ━━━━━━━━━━━━ ⌬`,
        attachment: fs.createReadStream(path)
      }, threadID, () => { if (fs.existsSync(path)) fs.unlinkSync(path); }, messageID);
    };

    return request(encodeURI(data.poster)).pipe(fs.createWriteStream(path)).on("close", callback);

  } catch (err) {
    return api.sendMessage("⚠️ حـدث خـطأ، حـاول مـجـدداً.", threadID, messageID);
  }
};
