const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "المطور",
  version: "2.8.0",
  hasPermssion: 0,
  credits: "ايمن",
  description: "عرض معلومات مطور البوت ✨",
  commandCategory: "utility",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args, Users, Threads, Currencies, models }) {
  const { threadID, messageID } = event;
  const gifs = [
    "https://media.giphy.com/media/XqVUeEK5Lt3VOGEzJj/giphy.gif",
    "https://media.giphy.com/media/HyOOyynWxMxig/giphy.gif"
  ];

  const randomGif = gifs[Math.floor(Math.random() * gifs.length)];
  const gifPath = path.join(__dirname, "cache", `dev.gif`);

  try {
    const response = await axios.get(randomGif, { responseType: "arraybuffer" });
    await fs.outputFile(gifPath, Buffer.from(response.data));

    const msg = {
      body: `⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\n◯ الاسـم: 『 ايـمـن 』\n◯ الـعـمـر: 18 سـنـة\n◯ الـديـانـة: مـسـيـحـي ✞︎\n◯ الـسـكـن: الـعـراق \n◯ الانستا: x_v_k¹`,
      attachment: fs.createReadStream(gifPath)
    };
    return api.sendMessage(msg, threadID, () => fs.unlinkSync(gifPath), messageID);
  } catch (e) {
    return api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\nالاسم: ايمن | العراق`, threadID, messageID);
  }
};
