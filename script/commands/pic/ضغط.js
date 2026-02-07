module.exports.config = {
  name: "ضغط",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "Ayman",
  description: "تقليل حجم الصورة",
  commandCategory: "pic",
  usages: "[رد على صورة]",
  cooldowns: 5,
  usePrefix: true
};

module.exports.run = async ({ api, event }) => {
  const sharp = require("sharp");
  const axios = require("axios");
  const fs = require("fs-extra");
  const path = require("path");

  if (event.type !== "message_reply" || !event.messageReply.attachments[0]) {
    return api.sendMessage(
      `◈ ───« خـطـأ »─── ◈
│
◯ │ يـجـب الـرد
◯ │ عـلـى صـورة
│
◈ ─────────────── ◈`,
      event.threadID
    );
  }

  try {
    const emojis = ["1⃣", "2⃣", "3⃣", "4⃣", "5⃣", "6⃣", "7⃣", "8⃣", "9⃣", "🔟"];
    for (const emoji of emojis) {
      await new Promise(resolve => setTimeout(resolve, 100));
      api.setMessageReaction(emoji, event.messageID, (err) => {}, true);
    }

    const imgUrl = event.messageReply.attachments[0].url;
    const res = await axios.get(imgUrl, { responseType: 'arraybuffer' });
    
    const buffer = await sharp(Buffer.from(res.data, 'binary'))
      .jpeg({ 
        quality: 50, 
        progressive: true 
      })
      .toBuffer();

    const cachePath = path.join(__dirname, 'cache', `compressed_${Date.now()}.jpg`);
    
    if (!fs.existsSync(path.join(__dirname, 'cache'))) {
      fs.mkdirSync(path.join(__dirname, 'cache'));
    }

    fs.writeFileSync(cachePath, buffer);

    const oldSize = (res.data.length / 1024).toFixed(2);
    const newSize = (buffer.length / 1024).toFixed(2);

    const msg = {
      body: `◈ ───« ضـغـط »─── ◈
│
◯ │ تـم ضـغـط
◯ │ الـصـورة
│
◯ │ الـحـجـم الـقـديـم : ${oldSize} KB
◯ │ الـحـجـم الـجـديـد : ${newSize} KB
◯ │ الـتـوفـيـر : ${(oldSize - newSize).toFixed(2)} KB
│
◈ ─────────────── ◈`,
      attachment: fs.createReadStream(cachePath)
    };

    api.sendMessage(msg, event.threadID, () => {
      if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
    });

  } catch (e) {
    api.sendMessage(
      `◈ ───« خـطـأ »─── ◈
│
◯ │ فـشـل
◯ │ ضـغـط الـصـورة
│
◈ ─────────────── ◈`,
      event.threadID
    );
  }
};
