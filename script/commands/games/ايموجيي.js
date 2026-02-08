// ═══════════════════════════════════════════════════════════
// 👑 KIRA - ايموجي
// المطور: Ayman ♛
// الوصف: لعبة ايموجي  
// ═══════════════════════════════════════════════════════════

module.exports.config = {
    name: "ايموجي",
  aliases: [],
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Ayman ♛",
    description: "لعبة ايموجي  ",
    usages: ["لعبة"],
    commandCategory: "games",
    cooldowns: 0
};

const questions = [




  { question: "رجل شرطه", answer: "👮‍♂️" },

  { question: "امره شرطه", answer: "👮‍♀️" },

  { question: "حزين", answer: "😢" },

  { question: "الاكرهه شبه مبتسم", answer: "🙂" },

  { question: "يخرج لسانه", answer: "😛" },

  { question: "ليس له فم", answer: "😶" },

  { question: "يتثائب", answer: "🥱" },

  { question: "نائم", answer: "😴" },

  { question: "يخرج لسانه ومغمض عين واجده", answer: "😜" },

  { question: "يخرج لسانه وعيناه مغمضه", answer: "😝" },

  { question: "واو", answer: "😮" },


  { question: "مغلق فمه", answer: "🤐" },


  { question: "مقلوب راسه", answer: "🙃" },

  { question: "ينفجر رئسه", answer: "🤯" },

  { question: "يشعر بل حر", answer: "🥵" },

  { question: "بالون", answer: "🎈" },

   { question: "عيون", answer: "👀" },

   { question: "ماعز", answer: "🐐" },

   { question: "الساعة الثانيه عشر", answer: "🕛" },
  
  { question: "كره قدم", answer: "⚽" },

  { question: "سله تسوق", answer: "🛒" },

  { question: "دراجه هوائيه", answer: "🚲" },





];

module.exports.handleReply = async function ({ api, event, handleReply, Currencies }) {
    const userAnswer = event.body.trim().toLowerCase();
    const correctAnswer = handleReply.correctAnswer.toLowerCase();
    const userName = global.data.userName.get(event.senderID) || await Users.getNameUser(event.senderID);

    if (userAnswer === correctAnswer) {
        Currencies.increaseMoney(event.senderID, 50);
        api.sendMessage(`تهانينا ${userName} انت الاسرع وكسبت 50 دولار`, event.threadID);
        api.unsendMessage(handleReply.messageID); 
    } else {
        api.sendMessage(`خطأ حاول مره اخرا`, event.threadID);
    }
};

module.exports.run = async function ({ api, event, args }) {
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    const correctAnswer = randomQuestion.answer;
    const question = randomQuestion.question;

    const message = `اسرع شخص يرسل ايموجي: ${question}`;

    api.sendMessage({ body: message }, event.threadID, (error, info) => {
        if (!error) {
            global.client.handleReply.push({
                name: this.config.name,
                messageID: info.messageID,
                correctAnswer: correctAnswer
            });
        }
    });
};
