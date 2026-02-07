const axios = require('axios');
const fs = require("fs-extra");
const request = require("request");

module.exports.config = {
  name: "فلم",
  version: "6.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "بحث واقتراحات أفلام",
  commandCategory: "media",
  usages: "فلم [اسم] أو [فئة]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;

  const categories = {
    "اكشن": ["John Wick", "Extraction", "Top Gun: Maverick"],
    "دراما": ["The Shawshank Redemption", "The Godfather", "Forrest Gump"],
    "رعب": ["The Conjuring", "The Exorcist", "The Shining"],
    "خيال": ["Interstellar", "Inception", "The Matrix"],
    "كوميديا": ["The Hangover", "Superbad", "The Dictator"],
    "جريمة": ["Pulp Fiction", "Goodfellas", "The Departed"],
    "سيرة": ["Oppenheimer", "The Wolf of Wall Street", "Bohemian Rhapsody"],
    "كرتون": ["Toy Story", "The Lion King", "Spider-Man"],
    "وثائقي": ["Our Planet", "The Last Dance", "Cosmos"]
  };

  let query = args.join(" ");

  if (!query) {
    return api.sendMessage(
      `◈ ───« أفـلام »─── ◈
│
◯ │ اقـتـرح فـئـة :
◯ │ فـلـم اكـشـن
◯ │ فـلـم درامـا  
◯ │ فـلـم رعـب
◯ │ فـلـم خـيـال
◯ │ فـلـم كـومـيـديـا
◯ │ فـلـم جـريـمـة
◯ │ فـلـم سـيـرة
◯ │ فـلـم كـرتـون
◯ │ فـلـم وثـائـقـي
◯ │ أو : فـلـم [اسـم]
│
◈ ─────────────── ◈`,
      threadID, 
      messageID
    );
  }

  let targetMovie = query;
  let isCategory = false;
  
  if (categories[query]) {
    targetMovie = categories[query][Math.floor(Math.random() * categories[query].length)];
    isCategory = true;
    const reacts = { "اكشن": "🔥", "دراما": "🎭", "رعب": "👻" };
    api.setMessageReaction(reacts[query] || "🎬", messageID, () => {}, true);
  } else {
    api.setMessageReaction("🔍", messageID, () => {}, true);
  }

  try {
    api.sendMessage(
      `◈ ───« بـحـث »─── ◈
│
◯ │ جـاري الـبـحـث عـن : ${targetMovie}
◯ │ الـنـوع : ${isCategory ? 'فـئـة ' + query : 'فـلـم'}
│
◈ ─────────────── ◈`,
      threadID, 
      messageID
    );

    const res = await axios.get(`https://api.popcat.xyz/imdb?q=${encodeURIComponent(targetMovie)}`);
    const data = res.data;

    if (data.error) {
      return api.sendMessage(
        `◈ ───« لـم أجـد »─── ◈
│
◯ │ لـم أجـد نـتـائـج لـ : ${targetMovie}
◯ │ جـرب اسـم آخـر
◯ │ أو اخـتـر فـئـة مـن الـقـائـمـة
│
◈ ─────────────── ◈`,
        threadID, 
        messageID
      );
    }

    const translate = async (text) => {
      if (!text) return "غـيـر مـتـوفر";
      try {
        const tRes = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ar&dt=t&q=${encodeURIComponent(text)}`);
        return tRes.data[0].map(x => x[0]).join("");
      } catch {
        return text;
      }
    };

    const [plotAr, genresAr] = await Promise.all([
      translate(data.plot),
      translate(data.genres)
    ]);

    const path = __dirname + `/cache/movie_final.png`;
    const callback = () => {
      api.sendMessage({
        body: `◈ ───« ${data.title} »─── ◈
│
◯ │ الـعـنـوان : ${data.title}
◯ │ الـسـنـة : ${data.year}
◯ │ الـتـقـيـيـم : ${data.rating}/10
◯ │ الـتـصـنـيـف : ${genresAr}
│
◯ │ الـقـصـة :
◯ │ ${plotAr.substring(0, 300)}...
│
◈ ─────────────── ◈`,
        attachment: fs.createReadStream(path)
      }, threadID, () => {
        if (fs.existsSync(path)) fs.unlinkSync(path);
      }, messageID);
    };

    return request(encodeURI(data.poster)).pipe(fs.createWriteStream(path)).on("close", callback);

  } catch (err) {
    return api.sendMessage(
      `◈ ───« خـطـأ »─── ◈
│
◯ │ حـدث خـطـأ، حـاول مـجـدداً
◯ │ أو جـرب فـلـم آخـر
│
◈ ─────────────── ◈`,
      threadID, 
      messageID
    );
  }
};
