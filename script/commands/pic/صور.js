const axios = require("axios");
const request = require("request");

module.exports.config = {
  name: "صور",
  version: "2.6.0",
  hasPermssion: 0,
  credits: "Heba",
  description: "البحث عن صور",
  commandCategory: "pic",
  usages: "صور [نص]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;

  api.setMessageReaction("⏳", messageID, () => {}, true);

  const name = args.join(" ").trim();
  if (!name) {
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage(
      `◈ ───« خـطـأ »─── ◈
│
◯ │ يـرجـى
◯ │ كـتـابـة
◯ │ مـا تـريـد
│
◈ ─────────────── ◈`,
      threadID, 
      messageID
    );
  }

  const fixedNumber = 10;

  const headers = {
    'authority': 'www.pinterest.com',
    'user-agent': 'Mozilla/5.0',
    'accept-language': 'en-US,en;q=0.9',
  };

  const options = {
    url: 'https://www.pinterest.com/search/pins/?q=' + (encodeURIComponent(name)) + '&rs=typed&term_meta[]=' + (encodeURIComponent(name)) + '%7Ctyped',
    headers: headers
  };

  request(options, async (error, response, body) => {
    try {
      if (error || response.statusCode !== 200) throw new Error("فشل الاتصال");

      const arrMatch = body.match(/https:\/\/i\.pinimg\.com\/originals\/[^.]+\.jpg/g);
      if (!arrMatch || arrMatch.length === 0) {
        api.setMessageReaction("❎", messageID, () => {}, true);
        return api.sendMessage(
          `◈ ───« لـم أجـد »─── ◈
│
◯ │ لـم أجـد
◯ │ صـور
◯ │ لـ : ${name}
│
◈ ─────────────── ◈`,
          threadID, 
          messageID
        );
      }

      const attachments = [];
      const fetchLimit = Math.min(fixedNumber, arrMatch.length);

      for (let i = 0; i < fetchLimit; i++) {
        try {
          const stream = (await axios.get(arrMatch[i], { responseType: "stream" })).data;
          attachments.push(stream);
        } catch (e) { continue; }
      }

      const msg = {
        body: `◈ ───« صـور »─── ◈
│
◯ │ تـم جـلـب
◯ │ ${attachments.length} صـورة
◯ │ لـ : ${name}
│
◈ ─────────────── ◈`,
        attachment: attachments
      };

      return api.sendMessage(msg, threadID, (err) => {
        if (!err) api.setMessageReaction("✅", messageID, () => {}, true);
        else api.setMessageReaction("❌", messageID, () => {}, true);
      }, messageID);

    } catch (e) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage(
        `◈ ───« خـطـأ »─── ◈
│
◯ │ خـطـأ
◯ │ داخـلـي
│
◈ ─────────────── ◈`,
        threadID, 
        messageID
      );
    }
  });
};
