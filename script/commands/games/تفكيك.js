module.exports.config = {
  name: "تفكيك",
  version: "1.7.0",
  hasPermssion: 0,
  credits: "Heba",
  description: "لعبة تفكيك الكلمات",
  usages: "تفكيك",
  commandCategory: "games",
  cooldowns: 5
};

const words = [
  { word: "الظلام", answer: "ا ل ظ ل ا م" },
  { word: "السعادة", answer: "ا ل س ع ا د ة" },
  { word: "الثروة", answer: "ا ل ث ر و ة" },
  { word: "الحرارة", answer: "ا ل ح ر ا ر ة" },
  { word: "المستقبل", answer: "ا ل م س ت ق ب ل" }
];

module.exports.handleReply = async function ({ api, event, handleReply }) {
  const { body, threadID, messageID } = event;
  if (handleReply.name !== "تفكيك") return;

  const userAnswer = body.trim();
  const correctAnswer = handleReply.correctAnswer;

  if (userAnswer === correctAnswer) {
      api.unsendMessage(handleReply.messageID); 
      api.setMessageReaction("✅", messageID, () => {}, true);

      return api.sendMessage(
        `◈ ───« نـجـاح »─── ◈
│
◯ │ أحـسـنـت
◯ │ إجـابـة
◯ │ صـحـيـحـة
◯ │ تـفـكـيـك
◯ │ الـكـلـمـة :
◯ │ ${correctAnswer}
│
◈ ─────────────── ◈`,
        threadID, 
        messageID
      );
  } else {
      api.setMessageReaction("❌", messageID, () => {}, true);
  }
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;

  api.setMessageReaction("⏳", messageID, () => {}, true);

  const randomWord = words[Math.floor(Math.random() * words.length)];
  const msg = `◈ ───« تـفـكـيـك »─── ◈
│
◯ │ أسـرع شـخـص
◯ │ يـفـكـك الـكـلـمـة
◯ │ ضـع مـسـافـة
◯ │ بـيـن كـل حـرف
│
◯ │ الـكـلـمـة : ${randomWord.word}
◯ │ الـوقـت : 60 ثـانـيـة
◯ │ رد ع الـرسـالـة
◯ │ بـالـحـل
│
◈ ─────────────── ◈`;

  return api.sendMessage(msg, threadID, (error, info) => {
      global.client.handleReply.push({
          name: "تفكيك",
          messageID: info.messageID,
          correctAnswer: randomWord.answer
      });
  }, messageID);
};
