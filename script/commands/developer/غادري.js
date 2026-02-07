const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports.config = {
  name: "غادري",
  version: "1.2.5",
  hasPermssion: 2,
  credits: "Ayman",
  description: "مغادرة المجموعة",
  commandCategory: "developer",
  usages: "غادري [آيدي]",
  cooldowns: 5,
  dependencies: {
    "axios": "",
    "fs-extra": "",
    "path": ""
  }
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, senderID } = event;
  const config = global.config || {};
  const botAdmins = config.MODERATORS || config.MODERATOR || [];

  if (!botAdmins.includes(senderID.toString())) {
    api.setMessageReaction("⚠️", messageID, () => {}, true);
    return api.sendMessage(
      `◈ ───« رفـض »─── ◈
│
◯ │ هـذا الأمـر
◯ │ لـلـمـطـور فـقـط
│
◈ ─────────────── ◈`,
      threadID, 
      messageID
    );
  }

  const targetID = args[0] || threadID;
  const gifURL = "https://media.giphy.com/media/kaBU6pgv0OsPHz2yxy/giphy.gif";
  const pathGif = path.join(__dirname, "cache", `bye_${targetID}.gif`);

  api.setMessageReaction("⏳", messageID, () => {}, true);

  try {
    const response = await axios.get(gifURL, { responseType: "arraybuffer" });
    if (!fs.existsSync(path.join(__dirname, "cache"))) {
      fs.mkdirSync(path.join(__dirname, "cache"));
    }
    fs.writeFileSync(pathGif, Buffer.from(response.data));

    const goodbyeMsg = `◈ ───« وداعـاً »─── ◈
│
◯ │ آن أوان الرحـيـل تـركـنـا لـكـم 
◯ │ المـكـان الـذي لا نُـقـدر فـيـه  لا نـبـقـى فـيـه
│
◈ ─────────────── ◈`;

    return api.sendMessage({
      body: goodbyeMsg,
      attachment: fs.createReadStream(pathGif)
    }, targetID, async (err) => {
      
      setTimeout(() => {
        api.removeUserFromGroup(api.getCurrentUserID(), targetID, (err2) => {
          if (fs.existsSync(pathGif)) fs.unlinkSync(pathGif);
          
          if (err2) {
            return api.sendMessage(
              `◈ ───« فـشـل »─── ◈
│
◯ │ فـشـل الـخـروج
◯ │ مـن : ${targetID}
│
◈ ─────────────── ◈`,
              threadID
            );
          }
          
          api.setMessageReaction("✅", messageID, () => {}, true);
          if (targetID != threadID) {
            api.sendMessage(
              `◈ ───« تـم »─── ◈
│
◯ │ تـم الـخـروج
◯ │ مـن : ${targetID}
│
◈ ─────────────── ◈`,
              threadID
            );
          }
        });
      }, 2500);
    });

  } catch (e) {
    if (fs.existsSync(pathGif)) fs.unlinkSync(pathGif);
    return api.sendMessage(
      `◈ ───« خـطـأ »─── ◈
│
◯ │ خـطـأ : ${e.message}
◯ │ فـي الـمـغـادرة
│
◈ ─────────────── ◈`,
      threadID, 
      messageID
    );
  }
};
