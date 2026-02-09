module.exports.config = {
  name: "صور",
  version: "2.6.0",
  hasPermssion: 0,
  credits: "ايمن",
  description: "البحث عن 10 صور في بنترست بجودة عالية",
  commandCategory: "pic",
  usages: "صور [نص البحث]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
  const axios = require("axios");
  const request = require("request");
  const fs = require("fs-extra");
  const { threadID, messageID } = event;

  api.setMessageReaction("⏳", messageID, () => {}, true);

  const name = args.join(" ").trim();
  if (!name) {
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 PIC ━━ ⌬\n\nيرجى كتابة ما تريد البحث عنه", threadID, messageID);
  }

  const fixedNumber = 10;

  const headers = {
    'user-agent': 'Mozilla/5.0'
  };

  const options = {
    url: 'https://www.pinterest.com/search/pins/?q=' + encodeURIComponent(name),
    headers: headers
  };

  request(options, async (error, response, body) => {
    try {
      if (error || response.statusCode !== 200) throw new Error("Pinterest Connection Failed");

      const arrMatch = body.match(/https:\/\/i\.pinimg\.com\/originals\/[^.]+\.jpg/g);
      if (!arrMatch || arrMatch.length === 0) {
        api.setMessageReaction("❎", messageID, () => {}, true);
        return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 PIC ━━ ⌬\n\nلم يتم العثور على صور لهذا البحث", threadID, messageID);
      }

      const imgData = [];
      const selected = arrMatch.slice(0, fixedNumber);

      for (let i = 0; i < selected.length; i++) {
        try {
          const path = __dirname + `/cache/${i + 1}.jpg`;
          const download = (await axios.get(selected[i], { responseType: "arraybuffer" })).data;
          fs.writeFileSync(path, Buffer.from(download, "utf-8"));
          imgData.push(fs.createReadStream(path));
        } catch (err) {
          console.log(err);
        }
      }

      api.setMessageReaction("✅", messageID, () => {}, true);

      return api.sendMessage(
        {
          body: `⌬ ━━ 𝗞𝗜𝗥𝗔 PIC ━━ ⌬\n\nإليك ${imgData.length} صورة عن: ${name}`,
          attachment: imgData
        },
        threadID,
        () => {
          for (let i = 1; i <= selected.length; i++) {
            const p = __dirname + `/cache/${i}.jpg`;
            if (fs.existsSync(p)) fs.unlinkSync(p);
          }
        },
        messageID
      );

    } catch (e) {
      console.error(e);
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 PIC ━━ ⌬\n\nحدث خطأ أثناء البحث", threadID, messageID);
    }
  });
};
