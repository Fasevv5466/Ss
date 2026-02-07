const axios = require("axios");
const request = require("request");
const fs = require("fs-extra");

module.exports.config = {
  name: "طوكيو",
  version: "1.1.0",
  hasPermssion: 0,
  credits: "Heba",
  description: "صور طوكيو ريفينجرز",
  commandCategory: "pic",
  usages: "طوكيو",
  cooldowns: 5,
  dependencies: {
    "request": "",
    "fs-extra": "",
    "axios": ""
  }
};

module.exports.run = async ({ api, event }) => {
  const { threadID, messageID } = event;

  api.setMessageReaction("⏳", messageID, () => {}, true);

  const link = [
    "https://i.imgur.com/ho235f3.jpg",
    "https://i.imgur.com/79gtJRN.jpeg",
    "https://i.imgur.com/rNGNE2z.jpeg",
    "https://i.imgur.com/fRsfqi1.jpeg",
    "https://i.imgur.com/zbpxrME.jpeg"
  ];

  const path = __dirname + `/cache/tokyo_${Date.now()}.jpg`;
  const randomLink = link[Math.floor(Math.random() * link.length)];

  const callback = () => {
    return api.sendMessage({
      body: `◈ ───« طـوكـيـو »─── ◈
│
◯ │ عـدد الـصـور : ${link.length}
◯ │ اسـم الأنـيـمي : طـوكـيـو ريفـنـجـرس
◯ │ الـصـورة : عـشـوائـيـة
◯ │ الـحـجـم : جـيـدة
◯ │ التـحـمـيـل : تـم
│
◈ ─────────────── ◈`,
      attachment: fs.createReadStream(path)
    }, threadID, () => {
      if (fs.existsSync(path)) fs.unlinkSync(path);
      api.setMessageReaction("✅", messageID, () => {}, true);
    }, messageID);
  };

  try {
    request(encodeURI(randomLink))
      .pipe(fs.createWriteStream(path))
      .on("close", callback);
  } catch (err) {
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage(
      `◈ ───« خـطـأ »─── ◈
│
◯ │ عـذراً، خـطـأ
◯ │ فـي جـلـب الـصـورة
◯ │ حـاول مـجـدداً
│
◈ ─────────────── ◈`,
      threadID, 
      messageID
    );
  }
};
