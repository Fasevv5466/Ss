module.exports.config = {
  name: "ترامب",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "ايمن",
  description: "اكتب نص ليظهر على لافتة ترامب",
  commandCategory: "fun",
  usages: "[نص]",
  cooldowns: 5,
  dependencies: {
    "fs-extra": "",
    "axios": "",
    "canvas": ""
  }
};

module.exports.wrapText = async function (ctx, text, maxWidth) {
  return await new Promise(resolve => {
    if (ctx.measureText(text).width < maxWidth) return resolve([text]);
    if (ctx.measureText('W').width > maxWidth) return resolve(null);
    const words = text.split(' ');
    const lines = [];
    let line = '';
    while (words.length > 0) {
      let split = false;
      while (ctx.measureText(words[0]).width >= maxWidth) {
        const temp = words[0];
        words[0] = temp.slice(0, -1);
        if (split) words[1] = `${temp.slice(-1)}${words[1]}`;
        else {
          split = true;
          words.splice(1, 0, temp.slice(-1));
        }
      }
      if (ctx.measureText(line + words[0]).width < maxWidth) line += `${words.shift()} `;
      else {
        lines.push(line.trim());
        line = '';
      }
      if (words.length === 0) lines.push(line.trim());
    }
    return resolve(lines);
  });
}

module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
  let { senderID, threadID, messageID } = event;
  const { loadImage, createCanvas } = require("canvas");
  const fs = global.nodemodule["fs-extra"];
  const axios = global.nodemodule["axios"];
  let pathImg = __dirname + '/cache/trump.png';
  var text = args.join(" ");
  
  if (!text) {
    return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 MEDIA ━━ ⌬\n\nقم بكتابة شيء ما لإدخاله على الصورة", threadID, messageID);
  }
  
  let getPorn = (await axios.get(`https://i.postimg.cc/SNz6vxYx/Picsart-22-10-16-21-04-30-217.jpg`, { responseType: 'arraybuffer' })).data;
  fs.writeFileSync(pathImg, Buffer.from(getPorn, 'utf-8'));
  let baseImage = await loadImage(pathImg);
  let canvas = createCanvas(baseImage.width, baseImage.height);
  let ctx = canvas.getContext("2d");
  ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
  ctx.font = "400 45px Arial";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "start";
  let fontSize = 250;
  while (ctx.measureText(text).width > 2600) {
    fontSize--;
    ctx.font = `400 ${fontSize}px Arial, sans-serif`;
  }
  const lines = await this.wrapText(ctx, text, 1160);
  ctx.fillText(lines.join('\n'), 60, 170);
  ctx.beginPath();
  const imageBuffer = canvas.toBuffer();
  fs.writeFileSync(pathImg, imageBuffer);
  
  return api.sendMessage({ 
    body: "⌬ ━━ 𝗞𝗜𝗥𝗔 𝗙𝗨𝗡  ━━ ⌬",
    attachment: fs.createReadStream(pathImg) 
  }, threadID, () => fs.unlinkSync(pathImg), messageID);
}
