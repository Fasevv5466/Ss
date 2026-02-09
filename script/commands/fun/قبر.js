module.exports.config = {
  name: "قبر",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "ايمن",
  description: "تسوي قبر لنفسك او لشخص بالمنشن او الرد",
  commandCategory: "fun",
  usages: "[@منشن] او [رد على رسالة]",
  cooldowns: 5,
  dependencies: {
    "fs-extra": "",
    "axios": "",
    "canvas": "",
    "jimp": "",
    "node-superfetch": ""
  }
};

module.exports.circle = async (image) => {
  const jimp = global.nodemodule['jimp'];
  image = await jimp.read(image);
  image.circle();
  return await image.getBufferAsync("image/png");
};

module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
  try {
    const Canvas = global.nodemodule['canvas'];
    const request = global.nodemodule["node-superfetch"];
    const jimp = global.nodemodule["jimp"];
    const fs = global.nodemodule["fs-extra"];
    const { threadID, messageID, senderID } = event;
    
    var path_toilet = __dirname + '/cache/damma.jpg';
    var id = senderID;
    
    if (event.type == "message_reply") {
      id = event.messageReply.senderID;
    } else if (Object.keys(event.mentions).length > 0) {
      id = Object.keys(event.mentions)[0];
    }
    
    const canvas = Canvas.createCanvas(500, 670);
    const ctx = canvas.getContext('2d');
    const background = await Canvas.loadImage('https://i.imgur.com/A4quyh3.jpg');

    var avatar = await request.get(`https://graph.facebook.com/${id}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
    avatar = await this.circle(avatar.body);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(await Canvas.loadImage(avatar), 160, 70, 160, 160);
    const imageBuffer = canvas.toBuffer();
    fs.writeFileSync(path_toilet, imageBuffer);
    
    api.sendMessage({
      body: "⌬ ━━ 𝗞𝗜𝗥𝗔 FUN ━━ ⌬\n\nاقرأ الفاتحة",
      attachment: fs.createReadStream(path_toilet, {'highWaterMark': 128 * 1024})
    }, threadID, () => fs.unlinkSync(path_toilet), messageID);
  } catch(e) {
    api.sendMessage(e.stack, event.threadID);
  }
}
