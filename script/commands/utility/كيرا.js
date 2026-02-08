const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const request = require("request");
const QRCode = require("qrcode");

module.exports.config = {
  name: "كيرا",
  aliases: ["kira", "ai"],
  version: "4.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "🧠 كيرا | المساعدة الذكية الشاملة",
  commandCategory: "ai",
  usages: ".كيرا [طلبك]",
  cooldowns: 5
};

const CACHE = path.join(__dirname, "cache");
fs.ensureDirSync(CACHE);

const INTENTS = [
  { type:"music", icon:"🎵", keys:["سمعني","سمعيني","اغنية","أغنية","song","music"] },
  { type:"images",icon:"🖼️", keys:["صور","صورة","image","pics"] },
  { type:"movie", icon:"🎬", keys:["فلم","فيلم","movie","imdb"] },
  { type:"anime", icon:"🌸", keys:["انمي","أنمي","anime"] },
  { type:"translate",icon:"🌐", keys:["ترجم","ترجمة","translate"] },
  { type:"tts",icon:"🎤", keys:["قولي","اقرأ","انطقي"] },
  { type:"qr",icon:"📱", keys:["باركود","qr"] },
  { type:"shot",icon:"📸", keys:["سكرين","صورلي","screenshot"] }
];

function detect(text){
  text = text.toLowerCase();
  for (const i of INTENTS){
    for (const k of i.keys){
      if (text.includes(k)){
        return {
          type:i.type,
          icon:i.icon,
          query:text.replace(k,"").trim()
        };
      }
    }
  }
  return null;
}

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;
  const text = args.join(" ").trim();

  if (!text){
    return api.sendMessage(
`◈ ───『 𝑲𝑰𝑹𝑨 』─── ◈
│ 🎵 موسيقى
│ 🖼️ صور
│ 🎬 أفلام
│ 🌸 أنمي
│ 🌐 ترجمة
│ 🎤 نطق
│ 📱 QR
│ 📸 سكرين
│
│ مثال:
│ .كيرا سمعيني اغنية
◈ ────────────── ◈`,
      threadID, messageID
    );
  }

  const intent = detect(text);
  if (!intent) {
    return api.sendMessage("❓ لم أفهم طلبك", threadID, messageID);
  }

  try {
    api.setMessageReaction(intent.icon, messageID, ()=>{}, true);

    // 🎵 موسيقى
    if (intent.type === "music"){
      const r = await axios.get(`https://api.deezer.com/search?q=${encodeURIComponent(intent.query)}&limit=1`);
      if (!r.data.data.length) return api.sendMessage("❌ لم أجد أغنية", threadID);
      const song = r.data.data[0];
      const file = path.join(CACHE,"music.mp3");
      const a = await axios.get(song.preview,{responseType:"arraybuffer"});
      fs.writeFileSync(file,a.data);
      return api.sendMessage({
        body:`🎵 ${song.title}\n🎤 ${song.artist.name}`,
        attachment: fs.createReadStream(file)
      },threadID,()=>fs.unlinkSync(file));
    }

    // 🖼️ صور
    if (intent.type === "images"){
      const url = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(intent.query)}`;
      return api.sendMessage(`🖼️ صور: ${intent.query}\n${url}`, threadID);
    }

    // 🎬 فيلم
    if (intent.type === "movie"){
      const r = await axios.get(`https://api.popcat.xyz/imdb?q=${encodeURIComponent(intent.query)}`);
      return api.sendMessage(
`◈ ───『 🎬 فيلم 』─── ◈
│ 🎞️ ${r.data.title}
│ ⭐ ${r.data.rating}
│ 📅 ${r.data.year}
│ 📝 ${r.data.plot}
◈ ────────────── ◈`, threadID);
    }

    // 🌸 أنمي
    if (intent.type === "anime"){
      const r = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(intent.query)}&limit=1`);
      const a = r.data.data[0];
      return api.sendMessage(
`◈ ───『 🌸 أنمي 』─── ◈
│ 📛 ${a.title}
│ ⭐ ${a.score}
│ 📺 ${a.episodes}
◈ ────────────── ◈`, threadID);
    }

    // 🌐 ترجمة
    if (intent.type === "translate"){
      const r = await axios.get(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ar&dt=t&q=${encodeURIComponent(intent.query)}`
      );
      return api.sendMessage(`🌐 الترجمة:\n${r.data[0][0][0]}`, threadID);
    }

    // 🎤 نطق
    if (intent.type === "tts"){
      const file = path.join(CACHE,"tts.mp3");
      const tts = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(intent.query)}&tl=ar&client=tw-ob`;
      request({url:tts,headers:{'User-Agent':'Mozilla'}},()=>{})
        .pipe(fs.createWriteStream(file))
        .on("finish",()=> {
          api.sendMessage({
            attachment:fs.createReadStream(file)
          },threadID,()=>fs.unlinkSync(file));
        });
      return;
    }

    // 📱 QR
    if (intent.type === "qr"){
      const file = path.join(CACHE,"qr.png");
      await QRCode.toFile(file,intent.query);
      return api.sendMessage({
        attachment:fs.createReadStream(file)
      },threadID,()=>fs.unlinkSync(file));
    }

    // 📸 Screenshot
    if (intent.type === "shot"){
      const img = `https://image.thum.io/get/fullpage/${intent.query}`;
      return api.sendMessage(img, threadID);
    }

  } catch (e){
    console.error(e);
    return api.sendMessage("❌ خطأ تقني", threadID, messageID);
  }
};
