const fs = require('fs-extra');
const axios = require('axios');

module.exports.config = {
  name: "ترامب",
  version: "1.1.2",
  hasPermssion: 0,
  credits: "ايمن",
  description: "اكتب نص ليظهر على لافتة ترامب الاحترافية",
  commandCategory: "fun",
  usages: "ترامب [النص]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
  const { threadID, messageID, senderID } = event;
  const pathImg = __dirname + `/cache/trump_${senderID}.png`;
  
  // دمج النص ومعالجة المسافات ليتناسب مع الرابط
  let text = args.join(" ");
  if (!text) {
    return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 FUN ━━ ⌬\n\nقم بكتابة نص ليظهر على اللافتة", threadID, messageID);
  }

  try {
    // معالجة النص: استبدال المسافات بـ "_" أو "-" حسب متطلبات memegen
    // النص يوضع في القسم السفلي من القالب (اللافتة)
    const processedText = text.replace(/\s+/g, '_');
    const apiUrl = `https://api.memegen.link/images/trump/${processedText}.png`;

    const res = await axios.get(apiUrl, { responseType: 'arraybuffer' });
    
    fs.ensureDirSync(__dirname + '/cache/');
    fs.writeFileSync(pathImg, Buffer.from(res.data, 'utf-8'));

    return api.sendMessage({
      body: "⌬ ━━ 𝗞𝗜𝗥𝗔 FUN ━━ ⌬",
      attachment: fs.createReadStream(pathImg)
    }, threadID, () => {
      if (fs.existsSync(pathImg)) fs.unlinkSync(pathImg);
    }, messageID);

  } catch (error) {
    if (fs.existsSync(pathImg)) fs.unlinkSync(pathImg);
    console.error(error);
    return api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 FUN ━━ ⌬\n\nعذراً، فشل الاتصال بمحرك الصور.`, threadID, messageID);
  }
};
