const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "رابطه",
  version: "1.1.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "رابط وصورة الحساب",
  commandCategory: "utility",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const { mentions, messageReply, senderID, threadID, messageID } = event;
  let targetID;

  if (Object.keys(mentions).length > 0) {
    targetID = Object.keys(mentions)[0];
  } else if (messageReply) {
    targetID = messageReply.senderID;
  } else {
    targetID = senderID;
  }

  try {
    const imgURL = `https://graph.facebook.com/${targetID}/picture?width=1500&height=1500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const imgPath = path.join(__dirname, "cache", `${targetID}.jpg`);

    const getImg = (await axios.get(imgURL, { responseType: "arraybuffer" })).data;
    fs.ensureDirSync(path.join(__dirname, "cache"));
    fs.writeFileSync(imgPath, Buffer.from(getImg));

    return api.sendMessage({
      body: `◈ ───« رابـط »─── ◈
│
◯ │ الـرابـط :
◯ │ facebook.com/${targetID}
◯ │ الآيـدي : ${targetID}
◯ │ تـم جـلـب
◯ │ بـنـجـاح
│
◈ ─────────────── ◈`,
      attachment: fs.createReadStream(imgPath)
    }, threadID, () => {
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }, messageID);

  } catch (error) {
    return api.sendMessage(
      `◈ ───« رابـط »─── ◈
│
◯ │ الـرابـط :
◯ │ facebook.com/${targetID}
◯ │ الآيـدي : ${targetID}
◯ │ عـذراً
◯ │ لـم أجـد الـصـورة
│
◈ ─────────────── ◈`,
      threadID, 
      messageID
    );
  }
};
