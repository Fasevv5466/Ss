module.exports.config = {
  name: "جودة",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "Ayman",
  description: "تحسين جودة الصورة",
  commandCategory: "pic",
  usages: "[رد على صورة]",
  cooldowns: 10,
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
◯ │ يـجـب
◯ │ الـرد
◯ │ ع صـورة
│
◈ ─────────────── ◈`,
      event.threadID
    );
  }

  try {
    const emojis = ["1⃣", "2⃣", "3⃣", "4⃣", "5⃣", "6⃣", "7⃣", "8⃣", "9⃣", "🔟"];
    for (const emoji of emojis) {
      await new Promise(resolve => setTimeout(resolve, 200));
      api.setMessageReaction(emoji, event.messageID, (err) => {}, true);
    }

    const imgUrl = event.messageReply.attachments[0].url;
    const res = await axios.get(imgUrl, { responseType: 'arraybuffer' });
    
    const buffer = await sharp(Buffer.from(res.data, 'binary'))
      .sharpen()
      .normalize()
      .modulate({ 
        brightness: 1.1, 
        saturation: 1.1 
      })
      .toBuffer();

    const cachePath = path.join(__dirname, 'cache', `enhanced_${Date.now()}.png`);
    
    if (!fs.existsSync(path.join(__dirname, 'cache'))) {
      fs.mkdirSync(path.join(__dirname, 'cache'));
    }

    fs.writeFileSync(cachePath, buffer);

    const msg = {
      body: `◈ ───« تـحـسـيـن »─── ◈
│
◯ │ تـم
◯ │ تـحـسـيـن
◯ │ جـودة
◯ │ الـصـورة
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
◯ │ تـحـسـيـن
◯ │ الـصـورة
│
◈ ─────────────── ◈`,
      event.threadID
    );
  }
};
