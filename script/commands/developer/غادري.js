const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "غادري",
  version: "1.3.1",
  hasPermssion: 2,
  credits: "ايمن",
  description: "مغادرة البوت للمجموعة",
  commandCategory: "developer",
  usages: "غادري [ID]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID, senderID } = event;

  if (!global.config.ADMINBOT.includes(senderID)) return;

  const targetID = args[0] || threadID;
  const pathGif = path.join(__dirname, "cache", `leave.gif`);

  try {
    const response = await axios.get("https://i.imgur.com/vHqY7bM.gif", { responseType: "arraybuffer" });
    fs.ensureDirSync(path.join(__dirname, "cache"));
    fs.writeFileSync(pathGif, Buffer.from(response.data));

    return api.sendMessage({
      body: "⌬ ━━ 𝗞𝗜𝗥𝗔 ━━ ⌬\n\nوداعاً، تمت المغادرة بطلب من المطور.",
      attachment: fs.createReadStream(pathGif)
    }, targetID, () => {
      setTimeout(() => {
        api.removeUserFromGroup(api.getCurrentUserID(), targetID);
        if (fs.existsSync(pathGif)) fs.unlinkSync(pathGif);
      }, 1000);
    });

  } catch (e) {
    return api.removeUserFromGroup(api.getCurrentUserID(), targetID);
  }
};
