// ═══════════════════════════════════════════════════════════
// 👑 KIRA - تجميع
// المطور: Ayman ♛
// الوصف: لعبة تجميع الحروف لتكوين كلمة صحيحة
// ═══════════════════════════════════════════════════════════

module.exports.config = {
  name: "تجميع",
  aliases: [],
  version: "2.1.0",
  hasPermssion: 0,
  credits: "Ayman ♛",
  description: "لعبة تجميع الحروف لتكوين كلمة صحيحة",
  usages: " ",
  commandCategory: "utility",
  cooldowns: 5
};

const questions = [
  { question: "ا ل ظ ل ا م", answer: "الظلام" },
  { question: "ا ل س ع ا د ة", answer: "السعادة" },
  { question: "ا ل ث ر و ة", answer: "الثروة" },
  { question: "ا ل ح ر ا ر ة", answer: "الحرارة" },
  { question: "ا ل ر ط و ب ة", answer: "الرطوبة" },
  { question: "ا ل ض و ض ا ء", answer: "الضوضاء" },
  { question: "ا ل م و ت", answer: "الموت" },
  { question: "ا ل ن ه ا ي ة", answer: "النهاية" },
  { question: "ا ل خ ا ر ج", answer: "الخارج" },
  { question: "ا ل ح ق ي ق ة", answer: "الحقيقة" },
  { question: "ا ل م ا ض ي", answer: "الماضي" },
  { question: "ا ل ح ا ض ر", answer: "الحاضر" },
  { question: "ا ل ف ق ي ر", answer: "الفقير" },
  { question: "ا ل ض ع ي ف", answer: "الضعيف" },
  { question: "ا ل خ ا ئ ن", answer: "الخائن" },
  { question: "ا ل ك ب ر ى", answer: "الكبرى" },
  { question: "ا ل ي أ س", answer: "اليأس" },
  { question: "ا ل غ ي ب و ب ة", answer: "الغيبوبة" },
  { question: "ا ل ك ذ ب", answer: "الكذب" },
  { question: "ا ل ظ ل م", answer: "الظلم" },
  { question: "ا ل ش ر", answer: "الشر" },
  { question: "ا ل ا س ت س ل ا م", answer: "الاستسلام" },
  { question: "ا ل ع ب ق ر ي", answer: "العبقري" },
  { question: "ا ل م س ت ق ب ل", answer: "المستقبل" },
  { question: "ا ل ا م ب ر ا ط و ر", answer: "الإمبراطور" },
  { question: "ا ل ش ج ا ع ة", answer: "الشجاعة" },
  { question: "ا ل ك ب ر ي ا ء", answer: "الكبرياء" },
  { question: "ا ل ت ك ن و ل و ج ي ا", answer: "التكنولوجيا" },
  { question: "ا ل م غ ا م ر ة", answer: "المغامرة" },
  { question: "ا ل ا ن ت ص ا ر", answer: "الانتصار" },
  { question: "ا ل ه ز ي م ة", answer: "الهزيمة" },
  { question: "ا ل ا و ك س ج ي ن", answer: "الاكسجين" },
  { question: "ا ل ف ض ا ء", answer: "الفضاء" },
  { question: "ا ل ج ا ذ ب ي ة", answer: "الجاذبية" },
  { question: "ا ل ح ر ي ة", answer: "الحرية" },
  { question: "ا ل س ل ا م", answer: "السلام" }
];

module.exports.handleReply = async function ({ api, event, handleReply, Currencies, Users }) {
  const { body, senderID, threadID, messageID } = event;
  const userAnswer = body.trim().toLowerCase();
  const correctAnswer = handleReply.correctAnswer.toLowerCase();
  const name = await Users.getNameUser(senderID);

  if (userAnswer === correctAnswer) {
      await Currencies.increaseMoney(senderID, 50);
      api.unsendMessage(handleReply.messageID); 
      return api.sendMessage(`◈ ───『 فـوز إمـبـراطـوري 🏆 』─── ◈\n\n◯ الـبطل: ${name}\n◉ الـكلمة: ${handleReply.correctAnswer}\n💰 الـجائزة: 50$\n———————————————\n◈ ─────────────── ◈`, threadID, messageID);
  } else {
      return api.sendMessage(`❌ خطأ! ركز جيداً يا ${name}`, threadID, messageID);
  }
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;
  const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
  
  // رسالة صغيرة ومركزة كما طلبت سيدي
  const msg = `◈ ───『 تـجـمـيـع 』─── ◈\n\n◯ جـمـع: 【 ${randomQuestion.question} 】\n———————————————\n◯ رد عـلى الـرسـالـة بـالـحـل!`;

  return api.sendMessage(msg, threadID, (error, info) => {
      global.client.handleReply.push({
          name: this.config.name,
          messageID: info.messageID,
          correctAnswer: randomQuestion.answer
      });
  }, messageID);
};
