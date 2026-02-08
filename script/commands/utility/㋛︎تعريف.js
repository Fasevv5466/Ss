// ═══════════════════════════════════════════════════════════
// 👑 KIRA - تعريف
// المطور: Ayman ♛
// الوصف: البيان الإمبراطوري العظيم لنظام التوب أيمن
// ═══════════════════════════════════════════════════════════

const axios = require("axios");
const fs = require("fs-extra");
const request = require("request");

module.exports.config = {
  name: "تعريف",
  aliases: [],
  version: "15.0.0",
  hasPermssion: 0,
  credits: "Ayman ♛",
  description: "البيان الإمبراطوري العظيم لنظام التوب أيمن",
  commandCategory: "utility",
  usages: "",
  cooldowns: 15,
};

module.exports.run = async ({ api, event, Currencies }) => {
  const { threadID, messageID, senderID } = event;
  const reward = 1; // نقطة واحدة لترسيخ التقشف

  const gifs = [
    "https://media.giphy.com/media/64Fw2xPusGKEjEV5SD/giphy.gif",
    "https://media.giphy.com/media/6vp2QrIJCADBVNfX4F/giphy.gif",
    "https://media.giphy.com/media/B0Mg22EfD2oYotpp8d/giphy.gif",
    "https://media.giphy.com/media/ugEhMJq2sdJ3BuODgi/giphy.gif",
    "https://media.giphy.com/media/eQrYEJenozNYN6rOdC/giphy.gif"
  ];

  const randomGif = gifs[Math.floor(Math.random() * gifs.length)];
  const path = __dirname + `/cache/imperial_decree_${senderID}.gif`;

  api.sendMessage(`◈ ───『 خـطـاب الـعـرش 』─── ◈\n\n📢 أنصتوا أيها الرعية.. البيان الرسمي للإمبراطورية قيد العرض..\n\n◈ ──────────────── ◈`, threadID);

  const callback = async () => {
    await Currencies.increaseMoney(senderID, reward);

    let msg = `◈ ───『 بـيـان الـسـيادة والـنـظام 』─── ◈\n\n` +
              `إلى كـل مـن يـطأ أرضـنا ويـسـتخدم (هـبـة)، اعـلـموا أن هـذا الـنـظـام هـو نـظـام صـارم مـبـني عـلى الـتوازن الـمـالي الـدقيق (دفـع وأخـذ):\n\n` +
              `📜 【 الـمـادة الأولـى: قـانـون الـمـقامرة والـتـحـدي 】\n` +
              `الألـعـاب لـيـسـت لـلـتـسـلـيـة الـمـجـانـيـة، بل هـي اخـتـبار لـلـولاء والـثروة. هـذا الـنـظام يـعـتمـد الـدفـع مـسـبـقـاً؛ تـدفع رسـوم الرهـان مـن جـيبك لـتـدخـل الـمـيدان. الـفـوز يـمـنـحـك الـجـائزة، أمـا الـخـسارة فـهـي ضـريـبة تـسـحق رصـيدك وتـصـب مـبـاشـرة في خـزيـنـة الـتـوب ايـمـن الـعـظيمة.\n\n` +
              `📜 【 الـمـادة الـثانـيـة: سـياسـة الـتـقـشـف الـخـدمـي 】\n` +
              `الـخدمات (الأوامر الـعامة) هـي مـنـحة مـلكية تـخـضع لـنـظـام "أخـذ فـقـط". تـحـصل مـن خـلالـها عـلى فـتـات مـن الـنـقاط (مكافآت زهـيدة جداً) لـتـبـقى في حـاجـة دائـمـة لـعـطائـنا، فـلا ثـراء لـلـرعـية إلا بـأمـر مـن الـسـيد.\n\n` +
              `📜 【 الـمـادة الـثالـثـة: الـخـضوع أو الـنـفـي 】\n` +
              `هـذا الـنـظـام لـيـس ديمـقـراطـيـاً؛ هـو نـظـام الـتـوب ايـمـن الـمـطلق. أي مـحـاولة لـلـتـلاعب بـثـغـرات الـنـظام أو الـتطاول سـتـواجه بـالـوسم الـتلقائي (🚫) والـحـظر الـمـؤبد.\n\n` +
              `💡 【 الـخـلاصة 】\n` +
              `تـقـشف في الـخدمات.. خـاطر في الألـعاب.. واخـضـع لـلـقوانين.\n\n` +
              `💰 مـنـحـة الامـتـثـال: +${reward}$\n` +
              ` ———————————————\n` +
              `│←› خـتـم الـسـلـطـة: الـتـوب ايـمـن 👑\n` +
              `◈ ──────────────── ◈`;

    api.sendMessage({
      body: msg,
      attachment: fs.createReadStream(path)
    }, threadID, () => fs.unlinkSync(path), messageID);
  };

  return request(encodeURI(randomGif))
    .pipe(fs.createWriteStream(path))
    .on("close", callback);
};
