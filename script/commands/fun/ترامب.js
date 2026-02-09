const fs = require('fs-extra');
const axios = require('axios');

module.exports.config = {
  name: "ترامب",
  version: "1.2.0",
  hasPermssion: 0,
  credits: "ايمن",
  description: "يظهر النص أو اسم المنشن على لافتة ترامب",
  commandCategory: "fun", // تأكد أنها تطابق فئة الـترفـيـه
  usages: "ترامب [نص] أو [منشن]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args, Users }) {
  const { threadID, messageID, senderID, mentions, type, messageReply } = event;
  const pathImg = __dirname + `/cache/trump_${senderID}.png`;
  
  let text = args.join(" ");
  
  // ذكاء اصطناعي لاستخراج النص: إذا فيه منشن أو رد، ياخذ الاسم
  if (type === "message_reply") {
    text = await Users.getNameUser(messageReply.senderID);
  } else if (Object.keys(mentions).length > 0) {
    const targetID = Object.keys(mentions)[0];
    text = mentions[targetID].replace("@", "");
  }

  if (!text) {
    return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔  - الـترفـيـه ━━ ⌬\n\nقم بكتابة نص أو عمل منشن ليظهر على اللافتة", threadID, messageID);
  }

  try {
    // معالجة النص للرابط (استبدال المسافات والرموز)
    const encodedText = encodeURIComponent(text.replace(/\s+/g, '_'));
    const apiUrl = `https://api.memegen.link/images/trump/${encodedText}.png`;

    const res = await axios.get(apiUrl, { responseType: 'arraybuffer' });
    
    fs.ensureDirSync(__dirname + '/cache/');
    fs.writeFileSync(pathImg, Buffer.from(res.data, 'utf-8'));

    return api.sendMessage({
      body: "⌬ ━━ 𝗞𝗜𝗥𝗔  - الـترفـيـه ━━ ⌬",
      attachment: fs.createReadStream(pathImg)
    }, threadID, () => {
      if (fs.existsSync(pathImg)) fs.unlinkSync(pathImg);
    }, messageID);

  } catch (error) {
    if (fs.existsSync(pathImg)) fs.unlinkSync(pathImg);
    console.error(error);
    return api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔  - الـترفـيـه ━━ ⌬\n\nعذراً، فشل توليد الصورة.`, threadID, messageID);
  }
};
