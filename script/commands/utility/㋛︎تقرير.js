// ═══════════════════════════════════════════════════════════
// 👑 KIRA - تقرير
// المطور: Ayman ♛
// الوصف: جلب تقرير مفصل عن أي أنمي من قاعدة بيانات MAL
// ═══════════════════════════════════════════════════════════

module.exports.config = {
  name: "تقرير",
  aliases: [],
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Ayman ♛",
  description: "جلب تقرير مفصل عن أي أنمي من قاعدة بيانات MAL",
  commandCategory: "utility",
  usages: "[اسم الأنمي بالإنجليزية]",
  cooldowns: 5,
  dependencies: {
    "mal-scraper": "",
    "axios": "",
    "fs-extra": ""
  }
};

module.exports.run = async ({ api, event, args }) => {
  const axios = require("axios");
  const scraper = require('mal-scraper');
  const fs = require("fs-extra");
  const { threadID, messageID } = event;

  // استخراج اسم الأنمي من المدخلات
  const animeName = args.join(" ");

  if (!animeName) {
    return api.sendMessage("◈ ───『 تـنـبـيـه 』─── ◈\n\n◯ سيدي، يرجى كتابة اسم الأنمي بالإنجليزية.\n◉ مـثال: تقرير One Piece\n———————————————\n◈ ─────────────── ◈", threadID, messageID);
  }

  api.sendMessage(`🔎 جـاري الـبـحث فـي الـمكتبة عـن "${animeName}"...`, threadID, messageID);

  try {
    // جلب البيانات باستخدام المصفي (Scraper)
    const anime = await scraper.getInfoFromName(animeName);

    if (!anime) return api.sendMessage("⚠️ لم أجد هذا الأنمي سيدي.", threadID, messageID);

    const imagePath = __dirname + `/cache/anime_${Date.now()}.png`;
    const getImg = (await axios.get(anime.picture, { responseType: 'arraybuffer' })).data;
    fs.writeFileSync(imagePath, Buffer.from(getImg, 'utf-8'));

    const msg = `◈ ───『 تـقـريـر الأنـمـي 』─── ◈\n\n` +
                `◯ الاسم: ${anime.title}\n` +
                `◉ الاسم الياباني: ${anime.japaneseTitle || 'غير متوفر'}\n` +
                `◯ النوع: ${anime.type}\n` +
                `◉ الحالة: ${anime.status}\n` +
                `◯ عدد الحلقات: ${anime.episodes}\n` +
                `◉ التصنيف: ${anime.genres ? anime.genres.join(", ") : "غير محدد"}\n` +
                `◯ المصدر: ${anime.source}\n` +
                `◉ الاستوديو: ${anime.studios ? anime.studios.join(", ") : "غير معروف"}\n` +
                `◯ التقييم: ⭐ ${anime.score}\n` +
                `◉ الترتيب العالمي: # ${anime.ranked}\n` +
                `———————————————\n` +
                `📝 القصة:\n${anime.synopsis ? anime.synopsis.split('\n')[0] : "لا يوجد ملخص"}\n` +
                `———————————————\n` +
                `│←› بـأوامـر: الـتـوب أيـمـن 👑\n` +
                `◈ ──────────────── ◈`;

    return api.sendMessage({
      body: msg,
      attachment: fs.createReadStream(imagePath)
    }, threadID, () => fs.unlinkSync(imagePath), messageID);

  } catch (err) {
    console.error(err);
    return api.sendMessage("⚠️ عذراً سيدي، حدث خطأ أثناء جلب بيانات الأنمي. تأكد من الاسم بالإنجليزية.", threadID, messageID);
  }
};
