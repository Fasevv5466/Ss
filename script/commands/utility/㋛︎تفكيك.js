// ═══════════════════════════════════════════════════════════
// 👑 KIRA - تفكيك
// المطور: Ayman ♛
// الوصف: لعبة تفكيك الكلمات إلى حروف (أسرع شخص)
// ═══════════════════════════════════════════════════════════

module.exports.config = {
  name: "تفكيك",
  aliases: [],
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Ayman ♛",
  description: "لعبة تفكيك الكلمات إلى حروف (أسرع شخص)",
  usages: " ",
  commandCategory: "utility",
  cooldowns: 5
};

const questions = [
  { question: "بيت", answer: "ب ي ت" },
  { question: "رجل", answer: "ر ج ل" },
  { question: "امرأة", answer: "ا م ر أ ة" },
  { question: "شمس", answer: "ش م س" },
  { question: "قمر", answer: "ق م ر" },
  { question: "كتاب", answer: "ك ت ا ب" },
  { question: "مدرسة", answer: "م د ر س ة" },
  { question: "سيارة", answer: "س ي ا ر ة" },
  { question: "طائرة", answer: "ط ا ئ ر ة" },
  { question: "سفينة", answer: "س ف ي ن ة" },
  { question: "إمبراطور", answer: "إ م ب ر ا ط و ر" },
  { question: "مملكة", answer: "م م ل ك ة" },
  { question: "شجاعة", answer: "ش ج ا ع ة" },
  { question: "كبرياء", answer: "ك ب ر ي ا ء" },
  { question: "تكنولوجيا", answer: "ت ك ن و ل و ج ي ا" },
  { question: "كمبيوتر", answer: "ك م ب ي و ت ر" },
  { question: "برمجة", answer: "ب ر م ج ة" },
  { question: "جزيرة", answer: "ج ز ي ر ة" },
  { question: "عاصفة", answer: "ع ا ص ف ة" },
  { question: "جوهرة", answer: "ج و ه ر ة" },
  { question: "ياقوت", answer: "ي ا ق و ت" },
  { question: "قلعة", answer: "ق ل ع ة" },
  { question: "فارس", answer: "ف ا ر س" },
  { question: "سيف", answer: "س ي ف" },
  { question: "درع", answer: "د ر ع" }
];

module.exports.handleReply = async function ({ api, event, handleReply, Currencies, Users }) {
  const { body, senderID, threadID, messageID } = event;
  const userAnswer = body.trim();
  const correctAnswer = handleReply.correctAnswer;
  const name = await Users.getNameUser(senderID);

  if (userAnswer === correctAnswer) {
      await Currencies.increaseMoney(senderID, 100);
      api.unsendMessage(handleReply.messageID); 
      return api.sendMessage(`◈ ───『 بـطـل الـتـفـكـيـك 🏆 』─── ◈\n\n◯ الـفـائز : ${name}\n◉ الإجـابة : ${correctAnswer}\n💰 الـجـائزة : 100$\n———————————————\n◯ أحسنت سيدي، سرعة مذهلة!\n◈ ─────────────── ◈`, threadID, messageID);
  } else {
      return api.sendMessage(`❌ خطأ! حاول مجدداً يا ${name}`, threadID, messageID);
  }
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;
  const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
  
  // رسالة صغيرة ومركزة بطلب الإمبراطور
  const msg = `◈ ───『 تـحـدي الـتـفـكـيـك 』─── ◈\n\n◯ فـكـك الـكـلـمـة الـتـالـيـة:\n◉ الـمـطلـوب: 【 ${randomQuestion.question} 】\n———————————————\n◯ رد عـلى الـرسـالـة بـالـحـل (مـع فـواصـل)!`;

  return api.sendMessage(msg, threadID, (error, info) => {
      global.client.handleReply.push({
          name: this.config.name,
          messageID: info.messageID,
          correctAnswer: randomQuestion.answer
      });
  }, messageID);
};
