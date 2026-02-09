module.exports.config = {
  name: "شنق",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "ايمن",
  description: "تشنق شخص بالمنشن او الرد",
  commandCategory: "fun",
  usages: "[@منشن] او [رد على رسالة]",
  cooldowns: 5,
  dependencies: {
    "axios": "",
    "fs-extra": "",
    "path": "",
    "jimp": ""
  }
};

module.exports.onLoad = async() => {
  const { resolve } = global.nodemodule["path"];
  const { existsSync, mkdirSync } = global.nodemodule["fs-extra"];
  const { downloadFile } = global.utils;
  const dirMaterial = __dirname + `/cache/canvas/`;
  const path = resolve(__dirname, 'cache/canvas', 'smto.png');
  if (!existsSync(dirMaterial + "canvas")) mkdirSync(dirMaterial, { recursive: true });
  if (!existsSync(path)) await downloadFile("https://i.postimg.cc/brq6rDDB/received-1417994055426496.jpg", path);
}

async function makeImage({ one, two }) {
  const fs = global.nodemodule["fs-extra"];
  const path = global.nodemodule["path"];
  const axios = global.nodemodule["axios"]; 
  const jimp = global.nodemodule["jimp"];
  const __root = path.resolve(__dirname, "cache", "canvas");

  let batgiam_img = await jimp.read(__root + "/smto.png");
  let pathImg = __root + `/smto${one}_${two}.png`;
  let avatarOne = __root + `/avt_${one}.png`;
  let avatarTwo = __root + `/avt_${two}.png`;

  let getAvatarOne = (await axios.get(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
  fs.writeFileSync(avatarOne, Buffer.from(getAvatarOne, 'utf-8'));

  let getAvatarTwo = (await axios.get(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
  fs.writeFileSync(avatarTwo, Buffer.from(getAvatarTwo, 'utf-8'));

  let circleOne = await jimp.read(await circle(avatarOne));
  let circleTwo = await jimp.read(await circle(avatarTwo));
  batgiam_img.composite(circleOne.resize(200, 200), 255, 25005).composite(circleTwo.resize(118, 118), 350, 80);

  let raw = await batgiam_img.getBufferAsync("image/png");

  fs.writeFileSync(pathImg, raw);
  fs.unlinkSync(avatarOne);
  fs.unlinkSync(avatarTwo);

  return pathImg;
}

async function circle(image) {
  const jimp = require("jimp");
  image = await jimp.read(image);
  image.circle();
  return await image.getBufferAsync("image/png");
}

module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
  const fs = global.nodemodule["fs-extra"];
  const { threadID, messageID, senderID } = event;
  
  let mention = Object.keys(event.mentions)[0];
  
  if (event.type == "message_reply") {
    mention = event.messageReply.senderID;
  }
  
  if (!mention) {
    return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 GAMES ━━ ⌬\n\nقم بعمل منشن أو رد على رسالة الشخص المراد شنقه", threadID, messageID);
  }
  
  const one = senderID;
  const two = mention;
  
  return makeImage({ one, two }).then(path => api.sendMessage({ 
    body: "⌬ ━━ 𝗞𝗜𝗥𝗔 GAMES ━━ ⌬\n\nتم الشنق بنجاح", 
    attachment: fs.createReadStream(path) 
  }, threadID, () => fs.unlinkSync(path), messageID));
}
