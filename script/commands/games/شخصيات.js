module.exports.config = {
  name: "شخصيات",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "عمر",
  description: "احزر اسم الشخصية",
  usages: "شخصيات",
  commandCategory: "games",
  cooldowns: 0
};

const fs = require('fs');
const axios = require('axios');
const tempImageFilePath = __dirname + "/cache/tempImage12.jpg";

module.exports.handleReply = async function ({ api, event, handleReply, Currencies, Users }) {
  const userAnswer = event.body.trim().toLowerCase();
  const correctAnswer = handleReply.correctAnswer.toLowerCase();
  const name = await Users.getNameUser(event.senderID);

  if (userAnswer === correctAnswer) {
      Currencies.increaseMoney(event.senderID, 50);
      api.sendMessage(
        `◈ ───« نـجـاح »─── ◈
│
◯ │ كـفـو يـا ${name}
◯ │ اجـابـتـك صـحـيـحـة
◯ │ الـجـائـزة : 50 ديـنـار
│
◈ ─────────────── ◈`,
        event.threadID
      );
      api.unsendMessage(handleReply.messageID);
  } else {
      api.sendMessage(
        `◈ ───« خـطـأ »─── ◈
│
◯ │ اجـابـة
◯ │ خـاطـئـة
◯ │ حـاول مـرة أخـرى
│
◈ ─────────────── ◈`,
        event.threadID
      );
  }
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;
  const questions = [
    { image: "https://i.imgur.com/yrEx6fs.jpg", answer: "كورومي" },
    { image: "https://i.imgur.com/cAFukZB.jpg", answer: "الينا" },
    { image: "https://i.pinimg.com/236x/63/c7/47/63c7474adaab4e36525611da528a20bd.jpg", answer: "فوليت" },
    { image: "https://i.pinimg.com/236x/b3/cd/6a/b3cd6a25d9e3451d68628b75da6b2d9e.jpg", answer: "ليفاي" },
    { image: "https://i.pinimg.com/236x/eb/a1/c6/eba1c6ed1611c3332655649ef405490a.jpg", answer: "مايكي" }
  ];

  const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
  const imageResponse = await axios.get(randomQuestion.image, { responseType: "arraybuffer" });
  fs.writeFileSync(tempImageFilePath, Buffer.from(imageResponse.data, "binary"));

  return api.sendMessage({ 
    body: `◈ ───« خـمـن »─── ◈
│
◯ │ مـن صـاحـب
◯ │ هـذه الـصـورة ؟
│
◈ ─────────────── ◈`, 
    attachment: fs.createReadStream(tempImageFilePath) 
  }, threadID, (error, info) => {
      global.client.handleReply.push({
          name: this.config.name,
          messageID: info.messageID,
          correctAnswer: randomQuestion.answer
      });
  }, messageID);
};
