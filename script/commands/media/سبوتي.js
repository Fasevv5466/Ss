module.exports.config = {
  name: "سبوتي",
  version: "2.1.1",
  hasPermssion: 0,
  credits: "ايمن",
  description: "البحث عن المقاطع الصوتية وإرسالها",
  commandCategory: "media",
  usages: "سبوتي [اسم الأغنية]",
  cooldowns: 10
};

module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
  const axios = require("axios");
  const fs = require("fs-extra");
  const path = require("path");
  const { threadID, messageID, senderID } = event;

  const songName = args.join(" ");

  if (!songName) {
    return api.sendMessage(
      `⌬ ━━ 𝗞𝗜𝗥𝗔 MEDIA ━━ ⌬\n\n` +
      `يرجى كتابة اسم الأغنية`,
      threadID,
      messageID
    );
  }

  api.setMessageReaction("🔍", messageID, () => {}, true);

  try {
    const res = await axios.get(`https://api.deezer.com/search?q=${encodeURIComponent(songName)}&limit=1`);
    
    if (!res.data.data || res.data.data.length === 0) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 MEDIA ━━ ⌬\n\nلم أجد هذا المقطع", threadID, messageID);
    }

    const song = res.data.data[0];
    const audioUrl = song.preview;
    const title = song.title;
    const artist = song.artist.name;
    const cover = song.album.cover_big;

    let msg = `⌬ ━━ 𝗞𝗜𝗥𝗔 MEDIA ━━ ⌬\n\n`;
    msg += `الفنان: ${artist}\n`;
    msg += `الأغنية: ${title}\n\n`;
    msg += `جاري إرسال المقطع الصوتي`;

    api.setMessageReaction("🎵", messageID, () => {}, true);

    const getStream = async (url) => {
      const response = await axios.get(url, { responseType: "arraybuffer" });
      const tempPath = path.join(__dirname, "cache", `temp_${Date.now()}.jpg`);
      fs.writeFileSync(tempPath, Buffer.from(response.data));
      return fs.createReadStream(tempPath);
    };

    api.sendMessage(
      {
        body: msg,
        attachment: await getStream(cover)
      },
      threadID,
      async (err, info) => {
        if (audioUrl) {
          const filePath = path.join(__dirname, "cache", `${Date.now()}_${senderID}.mp3`);
          const getAudio = await axios.get(audioUrl, { responseType: "arraybuffer" });
          fs.ensureDirSync(path.join(__dirname, "cache"));
          fs.writeFileSync(filePath, Buffer.from(getAudio.data, "utf-8"));

          api.sendMessage(
            {
              body: `⌬ ━━ 𝗞𝗜𝗥𝗔 MEDIA ━━ ⌬\n\nتم جلب المقطع بنجاح: ${title}`,
              attachment: fs.createReadStream(filePath)
            },
            threadID,
            () => {
              if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
              api.setMessageReaction("✅", messageID, () => {}, true);
            },
            messageID
          );
        }
      },
      messageID
    );

  } catch (error) {
    console.error(error);
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 MEDIA ━━ ⌬\n\nحدث خطأ أثناء البحث", threadID, messageID);
  }
};
