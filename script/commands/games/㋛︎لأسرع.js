// ═══════════════════════════════════════════════════════════
// 👑 KIRA - الاسرع
// المطور: Ayman ♛
// الوصف: لعبة الأسرع: أرسل الإيموجي الموجود في الصورة واربح المال
// ═══════════════════════════════════════════════════════════

module.exports.config = {
  name: "الاسرع",
  aliases: [],
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Ayman ♛",
  description: "لعبة الأسرع: أرسل الإيموجي الموجود في الصورة واربح المال",
  commandCategory: "games",
  usages: "الاسرع",
  cooldowns: 5,
  dependencies: {
    "axios": "",
    "fs-extra": ""
  }
};

const fs = require('fs-extra');
const axios = require('axios');

module.exports.handleReply = async function ({ api, event, handleReply, Currencies, Users }) {
  const { body, senderID, threadID, messageID } = event;
  const { correctAnswer, author } = handleReply;

  if (body.trim() === correctAnswer) {
      const name = await Users.getNameUser(senderID);
      await Currencies.increaseMoney(senderID, 100); // زيادة الجائزة لـ 100 دولار
      
      api.unsendMessage(handleReply.messageID); // حذف صورة السؤال
      api.setMessageReaction("✅", messageID, () => {}, true);

      const winMsg = `◈ ───『 فـوز سـريـع 🔥 』─── ◈\n\n◯ الـبـطـل: ${name}\n◉ الإجـابـة: 【 ${correctAnswer} 】\n💰 الـجـائـزة: 100 دولـار\n———————————————\n│←› بـأوامـر: الـتـوب أيـمـن 👑`;
      return api.sendMessage(winMsg, threadID, messageID);
  } else {
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage(`⚠️ خطأ يا ذكي! حاول مرة أخرى قبل أن يسبقك أحد.`, threadID, messageID);
  }
};

module.exports.run = async function ({ api, event, Users }) {
  const { threadID, messageID, senderID } = event;
  const cacheDir = __dirname + "/cache/";
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
  const pathImg = `${cacheDir}fast_${senderID}.png`;

  const questions = [
    { "emoji": "😗", "link": "https://i.imgur.com/LdyIyYD.png" },
    { "emoji": "😭", "link": "https://i.imgur.com/P8zpqby.png" },
    { "emoji": "🤠", "link": "https://i.imgur.com/kG71glL.png" },
    { "emoji": "🙂", "link": "https://i.imgur.com/hzP1Zca.png" },
    { "emoji": "🐸", "link": "https://i.imgur.com/rnsgJju.png" },
    { "emoji": "💰", "link": "https://i.imgur.com/uQmrlvt.png" },
    { "emoji": "🍌", "link": "https://i.imgur.com/71WozFU.jpg" },
    { "emoji": "🦊", "link": "https://i.imgur.com/uyElK2K.png" },
    { "emoji": "😺", "link": "https://i.imgur.com/PXjjXzl.png" },
    { "emoji": "🍀", "link": "https://i.imgur.com/8zJRvzg.png" },
    { "emoji": "🥺", "link": "https://i.imgur.com/M69t6MP.jpg" },
    { "emoji": "👀", "link": "https://i.imgur.com/sH3gFGd.jpg" },
    { "emoji": "🏕️", "link": "https://i.imgur.com/zoGHqWD.jpg" }
  ];

  const randomQ = questions[Math.floor(Math.random() * questions.length)];
  const name = await Users.getNameUser(senderID);

  api.setMessageReaction("⚡", messageID, () => {}, true);

  try {
    const res = await axios.get(randomQ.link, { responseType: "arraybuffer" });
    fs.writeFileSync(pathImg, Buffer.from(res.data, "utf-8"));

    const msg = `◈ ───『 لـعـبـة الأسـرع ⚡ 』─── ◈\n\n◯ يـا [ ${name} ]..\n◉ كـن أول مـن يـرسـل الإيـمـوجـي الـذي في الـصـورة!\n\n💰 الـجـائـزة: 100 دولـار\n———————————————\n│←› بـأوامـر: الـتـوب أيـمـن 👑`;

    return api.sendMessage({ body: msg, attachment: fs.createReadStream(pathImg) }, threadID, (err, info) => {
        fs.unlinkSync(pathImg);
        global.client.handleReply.push({
            name: this.config.name,
            messageID: info.messageID,
            correctAnswer: randomQ.emoji,
            author: senderID
        });
    }, messageID);
  } catch (e) {
    return api.sendMessage("⚠️ عذراً سيدي، حدث خطأ في تحميل صورة التحدي.", threadID, messageID);
  }
};
