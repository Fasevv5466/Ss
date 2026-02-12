module.exports.config = {
  name: "انمي",
  version: "4.6.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "بحث عن أنمي أو اقتراحات حسب الفئة ✨",
  commandCategory: "media",
  usages: ".انمي [الاسم] أو [الفئة]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const axios = require('axios');
  const fs = require("fs-extra");
  const { threadID, messageID } = event;
  const header = `⌬ ━━━━━━━━━━━━ ⌬\n      🌸 أنـظـمـة الأنـمـي\n⌬ ━━━━━━━━━━━━ ⌬`;

  const categories = {
    "اكشن": ["Attack on Titan", "One Piece", "Naruto Shippuden", "Hunter x Hunter", "Jujutsu Kaisen", "Solo Leveling"],
    "دراما": ["Clannad: After Story", "Your Lie in April", "Violet Evergarden", "A Silent Voice"],
    "رعب": ["Death Note", "Monster", "Berserk", "Another", "Parasyte: The Maxim"],
    "رومانسي": ["Kaguya-sama: Love is War", "Toradora!", "Horimiya", "Your Name"],
    "كوميديا": ["Gintama", "Konosuba", "Grand Blue", "Spy x Family"],
    "خيال": ["Steins;Gate", "No Game No Life", "Re:Zero", "Mushoku Tensei"]
  };

  let query = args.join(" ");

  if (!query) {
    return api.sendMessage(
      `${header}\n\n` +
      `يـرجـى تـحـديـد الـفـئـة سـيـدي:\n` +
      `⪼ انـمـي اكـشـن | درامـا | رعب\n` +
      `⪼ انـمـي رومانسي | كـومـيـديـا | خـيـال\n\n` +
      `💡 أو ابـحـث مـبـاشـرة: .انمي [الاسم]\n` +
      `⌬ ━━━━━━━━━━━━ ⌬`, 
      threadID, messageID
    );
  }

  let targetAnime = query;
  let isCategory = false;

  if (categories[query]) {
    targetAnime = categories[query][Math.floor(Math.random() * categories[query].length)];
    isCategory = true;
    api.setMessageReaction("🌸", messageID, () => {}, true);
  } else {
    api.setMessageReaction("🔍", messageID, () => {}, true);
  }

  try {
    const res = await axios.get(`https://api.popcat.xyz/imdb?q=${encodeURIComponent(targetAnime)}`);
    const data = res.data;

    if (data.error || !data.title) return api.sendMessage(`❌ لم أجد نتائج لـ "${targetAnime}"`, threadID, messageID);

    // دالة الترجمة
    const translate = async (text) => {
      if (!text) return "غير متوفر";
      const tRes = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ar&dt=t&q=${encodeURIComponent(text)}`);
      return tRes.data[0].map(x => x[0]).join("");
    };

    const [plotAr, genresAr] = await Promise.all([translate(data.plot), translate(data.genres)]);
    const path = __dirname + `/cache/anime_${Date.now()}.png`;

    // جلب الصورة باستخدام axios لضمان الاستقرار
    const imageBuffer = await axios.get(data.poster, { responseType: 'arraybuffer' });
    fs.writeFileSync(path, Buffer.from(imageBuffer.data));

    const msg = {
      body: `${header}\n\n` +
            (isCategory ? `✨ اقـتـراح لـك: 【 ${data.title} 】\n\n` : "") +
            `⪼ الاسـم: ${data.title}\n` +
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
    return api.sendMessage("⚠️ عـذراً، حـدث خـطأ فـي جـلـب الـبـيـانـات أو الـصـورة.", threadID, messageID);
  }
};
