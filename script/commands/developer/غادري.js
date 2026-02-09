const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports.config = {
  name: "غادري",
  version: "1.2.7",
  hasPermssion: 2,
  credits: "Ayman",
  description: "مغادرة البوت للمجموعة",
  commandCategory: "المطور",
  usages: "غادري [ID]",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, senderID } = event;

  // التحقق من المطور
  const DEV_ID = "61577861540407"; 
  if (String(senderID) !== DEV_ID) return;

  const targetID = args[0] || threadID;
  const pathGif = path.join(__dirname, "cache", `bye.gif`);

  try {
    const response = await axios.get("https://media.giphy.com/media/kaBU6pgv0OsPHz2yxy/giphy.gif", { responseType: "arraybuffer" });
    fs.ensureDirSync(path.join(__dirname, "cache"));
    fs.writeFileSync(pathGif, Buffer.from(response.data));

    return api.sendMessage({
      body: "⌬ ━━ 𝗞𝗜𝗥𝗔 ━━ ⌬\n\nنغادر الآن بكل هيبة.. وداعاً. 👑",
      attachment: fs.createReadStream(pathGif)
    }, targetID, () => {
      setTimeout(() => {
        api.removeUserFromGroup(api.getCurrentUserID(), targetID);
        if (fs.existsSync(pathGif)) fs.unlinkSync(pathGif);
      }, 1500);
    });

  } catch (e) {
    return api.removeUserFromGroup(api.getCurrentUserID(), targetID);
  }
};
