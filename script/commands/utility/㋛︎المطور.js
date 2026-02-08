// ═══════════════════════════════════════════════════════════
// 👑 KIRA - المطور
// المطور: Ayman ♛
// الوصف: عرض معلومات مطور البوت برموز غير ملونة
// ═══════════════════════════════════════════════════════════

module.exports.config = {
  name: "المطور",
  aliases: [],
  version: "2.7.0",
  hasPermssion: 0,
  credits: "Ayman ♛",
  description: "عرض معلومات مطور البوت برموز غير ملونة",
  commandCategory: "utility",
  usages: "",
  cooldowns: 5
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;
  const request = require("request");
  const fs = require("fs-extra");

  // قائمة روابط الـ GIF
  const gifs = [
    "https://media.giphy.com/media/XqVUeEK5Lt3VOGEzJj/giphy.gif",
    "https://media.giphy.com/media/HyOOyynWxMxig/giphy.gif",
    "https://media.giphy.com/media/SnVZO1N0Wo6u4/giphy.gif",
    "https://media.giphy.com/media/wXo9rzjkBBk7m/giphy.gif",
    "https://media.giphy.com/media/FB5EOw0CaaQM0/giphy.gif",
    "https://media.giphy.com/media/ztpMY1t5VYWlO/giphy.gif",
    "https://media.giphy.com/media/Uho05vACGIjMk/giphy.gif",
    "https://media.giphy.com/media/gysS4T0YsTKdq/giphy.gif",
    "https://media.giphy.com/media/58oxPkC3lWuNa/giphy.gif",
    "https://media.giphy.com/media/kXdo4BgGoFC80/giphy.gif"
  ];

  const randomGif = gifs[Math.floor(Math.random() * gifs.length)];
  const path = __dirname + `/cache/hiba_dev_${Date.now()}.gif`;

  const callback = () => {
    return api.sendMessage({
      body: `◈ ───『 مـعـلـومـات الـمـطـور 』─── ◈\n\n` +
            `◯ الاسـم: 『 ايـمـن 』\n` +
            `◯ اللـقـب: مـبـرمـج هـبـة ✞︎\n` +
            `◯ الـعـمـر: 18 سـنـة\n` +
            `◯ الـديـانـة: مـسـيـحـي ✞︎\n` +
            `◯ الـسـكـن: الـعـراق ✞︎\n` +
            `◯ الـهـواية: تـطـويـر الـذكاء الاصـطـناعـي\n\n` +
            `───────────────\n` +
            `◯ رابـط الـفـيـسـبـوك:\n` +
            `⮕ fb.com/xvk1c\n\n` +
            `◯ مـلاحـظـة:\n` +
            `← إذا واجـهـت مـشـكـلـة تـواصـل مـعـي فـوراً\n\n` +
            `◈ ─────────────── ◈\n` +
            `│←› تـم الـتـطـويـر بـواسطـة ايـمـن\n` +
            `│←› اسـتـمـتـع بـاسـتـخـدام هـبـة ✞︎\n` +
            `◈ ─────────────── ◈`,
      attachment: fs.createReadStream(path)
    }, threadID, () => fs.unlinkSync(path), messageID);
  };

  return request(encodeURI(randomGif)).pipe(fs.createWriteStream(path)).on("close", callback);
};
