const fs = require("fs-extra");
const jimp = require("jimp");
const path = require("path");
const axios = require("axios");

module.exports.config = {
  name: "رقمي",
  version: "1.3.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "تأثيرات رقمية",
  commandCategory: "pic",
  usages: "رقمي [نمط]",
  cooldowns: 15
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;

  api.setMessageReaction("🔢", messageID, () => {}, true);

  const digitalEffects = {
    "1": { name: "مصفوفة", style: "matrix" },
    "2": { name: "ثنائي", style: "binary" },
    "3": { name: "رقمي", style: "digital" },
    "4": { name: "شيفرة", style: "code" },
    "5": { name: "نقاط", style: "pixels" }
  };

  if (!args[0]) {
    api.setMessageReaction("📋", messageID, () => {}, true);
    return api.sendMessage(
      `◈ ───« رقـمـي »─── ◈
│
◯ │ 1- مـصـفـوفـة
◯ │ 2- ثـنـائـي
◯ │ 3- رقـمـي
◯ │ 4- شـيـفـرة
◯ │ 5- نـقـاط
│
◯ │ اسـتـخـدام :
◯ │ رقـمـي 1
◯ │ بـالـرد ع صـورة
│
◈ ─────────────── ◈`,
      threadID,
      messageID
    );
  }

  const effect = digitalEffects[args[0]];
  if (!effect) {
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage(
      `◈ ───« خـطـأ »─── ◈
│
◯ │ رقـم
◯ │ غـيـر
◯ │ صـحـيـح
│
◈ ─────────────── ◈`,
      threadID, 
      messageID
    );
  }

  if (
    event.type !== "message_reply" ||
    !event.messageReply.attachments ||
    !event.messageReply.attachments[0] ||
    !["photo", "animated_image"].includes(event.messageReply.attachments[0].type)
  ) {
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage(
      `◈ ───« خـطـأ »─── ◈
│
◯ │ يـجـب الـرد ع صـورة
│
◈ ─────────────── ◈`,
      threadID, 
      messageID
    );
  }

  try {
    const imgURL = event.messageReply.attachments[0].url;
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    const imgPath = path.join(cacheDir, `digital_${Date.now()}.jpg`);
    const res = await axios.get(imgURL, { responseType: "arraybuffer" });
    fs.writeFileSync(imgPath, res.data);

    const image = await jimp.read(imgPath);
    const outputPath = await applyDigitalEffect(image, effect);
    
    api.sendMessage(
      {
        body: `◈ ───« تـم »─── ◈
│
◯ │ تـم تـطـبـيـق
◯ │ ${effect.name}
◯ │ بـنـجـاح
│
◈ ─────────────── ◈`,
        attachment: fs.createReadStream(outputPath)
      },
      threadID,
      () => {
        fs.unlinkSync(imgPath);
        fs.unlinkSync(outputPath);
        api.setMessageReaction("✅", messageID, () => {}, true);
      },
      messageID
    );

  } catch (e) {
    api.setMessageReaction("❌", messageID, () => {}, true);
    api.sendMessage(
      `◈ ───« خـطـأ »─── ◈
│
◯ │ خـطـأ  فـي الـمـعـالـجـة
│
◈ ─────────────── ◈`,
      threadID, 
      messageID
    );
  }
};

async function applyDigitalEffect(image, effect) {
  const width = image.bitmap.width;
  const height = image.bitmap.height;
  const cacheDir = path.join(__dirname, "cache");
  const outputPath = path.join(cacheDir, `digital_out_${Date.now()}.jpg`);
  
  const digitalImage = image.clone();
  
  switch(effect.style) {
    case "matrix":
      digitalImage.scan(0, 0, width, height, function(x, y, idx) {
        const brightness = (this.bitmap.data[idx] + this.bitmap.data[idx + 1] + this.bitmap.data[idx + 2]) / 3;
        
        if (Math.random() > brightness / 255) {
          this.bitmap.data[idx + 0] = 0;
          this.bitmap.data[idx + 1] = 255;
          this.bitmap.data[idx + 2] = 0;
        } else {
          this.bitmap.data[idx + 0] = 0;
          this.bitmap.data[idx + 1] = 100;
          this.bitmap.data[idx + 2] = 0;
        }
      });
      break;
      
    case "binary":
      const blockSize = 10;
      
      for (let y = 0; y < height; y += blockSize) {
        for (let x = 0; x < width; x += blockSize) {
          let r = 0, g = 0, b = 0, count = 0;
          
          for (let dy = 0; dy < blockSize && y + dy < height; dy++) {
            for (let dx = 0; dx < blockSize && x + dx < width; dx++) {
              const pixel = image.getPixelColor(x + dx, y + dy);
              const rgba = jimp.intToRGBA(pixel);
              
              r += rgba.r;
              g += rgba.g;
              b += rgba.b;
              count++;
            }
          }
          
          if (count > 0) {
            const avg = (r + g + b) / (3 * count);
            const binaryChar = avg > 127 ? "1" : "0";
            const color = avg > 127 ? 0x00FFFFFF : 0x0000FFFF;
            
            for (let dy = 0; dy < blockSize && y + dy < height; dy++) {
              for (let dx = 0; dx < blockSize && x + dx < width; dx++) {
                digitalImage.setPixelColor(color, x + dx, y + dy);
              }
            }
          }
        }
      }
      break;
  }
  
  await digitalImage.writeAsync(outputPath);
  return outputPath;
}
