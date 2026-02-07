const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "سبوتي",
  version: "2.1.1",
  hasPermssion: 0,
  credits: "Ayman",
  description: "البحث عن المقاطع الصوتية",
  commandCategory: "media",
  usePrefix: true,
  cooldowns: 10,
  dependencies: {
    "axios": "",
    "fs-extra": "",
    "path": ""
  }
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID, senderID, body } = event;

  const prefix = global.config.PREFIX || ".";
  if (!body.startsWith(prefix)) return;

  const songName = args.join(" ");

  if (!songName) {
    return api.sendMessage(
      `◈ ───« سـبـوتـي »─── ◈
│
◯ │ يـرجـى
◯ │ كـتـابـة
◯ │ اسـم الأغـنـيـة
│
◈ ─────────────── ◈`,
      threadID, 
      messageID
    );
  }

  api.setMessageReaction("🔍", messageID, () => {}, true);

  try {
    const res = await axios.get(`https://api.deezer.com/search?q=${encodeURIComponent(songName)}&limit=1`);
    
    if (!res.data.data || res.data.data.length === 0) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage(
        `◈ ───« لـم أجـد »─── ◈
│
◯ │ لـم أجـد
◯ │ هـذا الـمـقـطـع
│
◈ ─────────────── ◈`,
        threadID, 
        messageID
      );
    }

    const song = res.data.data[0];
    const audioUrl = song.preview; 
    const title = song.title;
    const artist = song.artist.name;
    const cover = song.album.cover_big;

    let msg = `◈ ───« مـوسـيـقـى »─── ◈
│
◯ │ الـفـنـان : ${artist}
◯ │ الأغـنـيـة : ${title}
◯ │ جـاري الإرسـال
◯ │ يـرجـى الإنـتـظـار
│
◈ ─────────────── ◈`;

    api.setMessageReaction("🎵", messageID, () => {}, true);

    api.sendMessage({
      body: msg,
      attachment: await getStream(cover)
    }, threadID, async (err, info) => {
      
      if (audioUrl) {
        const filePath = path.join(__dirname, "cache", `${Date.now()}_${senderID}.mp3`);
        const getAudio = await axios.get(audioUrl, { responseType: "arraybuffer" });
        fs.ensureDirSync(path.join(__dirname, "cache"));
        fs.writeFileSync(filePath, Buffer.from(getAudio.data, "utf-8"));

        api.sendMessage({
          body: `◈ ───« تـم »─── ◈
│
◯ │ تـم جـلـب
◯ │ ${title}
◯ │ بـنـجـاح
│
◈ ─────────────── ◈`,
          attachment: fs.createReadStream(filePath)
        }, threadID, () => {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          api.setMessageReaction("✅", messageID, () => {}, true);
        });
      }
    }, messageID);

  } catch (e) {
    api.setMessageReaction("❌", messageID, () => {}, true);
    api.sendMessage(
      `◈ ───« خـطـأ »─── ◈
│
◯ │ خـطـأ
◯ │ تـقـنـي
│
◈ ─────────────── ◈`,
      threadID, 
      messageID
    );
  }
};

async function getStream(url) {
  const res = await axios.get(url, { responseType: "stream" });
  return res.data;
}
