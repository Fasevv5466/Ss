module.exports.config = {
  name: "سكرين",
  version: "1.2.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "تصوير المواقع",
  commandCategory: "utility",
  usages: "[الرابط] أو بالرد",
  cooldowns: 5,
  usePrefix: true
};

module.exports.run = async ({ event, api, args }) => {
  const axios = require("axios");
  const fs = require("fs-extra");
  const path = require("path");
  const qrcodeReader = require("qrcode-reader");
  const jimp = require("jimp");

  let url = args[0];

  if (event.type === "message_reply") {
    const reply = event.messageReply;
    
    if (reply.attachments && reply.attachments.length > 0 && reply.attachments[0].type === "photo") {
      api.setMessageReaction("🔍", event.messageID, () => {}, true);
      try {
        const imgRes = await axios.get(reply.attachments[0].url, { responseType: 'arraybuffer' });
        const image = await jimp.read(Buffer.from(imgRes.data));
        const qr = new qrcodeReader();
        
        const result = await new Promise((resolve, reject) => {
          qr.callback = (err, value) => err ? reject(err) : resolve(value);
          qr.decode(image.bitmap);
        });
        url = result.result;
      } catch (e) {
        return api.sendMessage(
          `◈ ───« خـطـأ »─── ◈
│
◯ │ فـشـل قـراءة
◯ │ الـبـاركـود
│
◈ ─────────────── ◈`,
          event.threadID
        );
      }
    } else {
      url = reply.body.split(/\s+/)[0];
    }
  }

  if (!url || !url.includes(".")) {
    return api.sendMessage(
      `◈ ───« خـطـأ »─── ◈
│
◯ │ يـرجـى وضـع
◯ │ رابـط صـحـيـح
│
◈ ─────────────── ◈`,
      event.threadID
    );
  }

  if (!url.startsWith("http")) url = "https://" + url;

  try {
    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    const cachePath = path.join(__dirname, 'cache', `screen_${event.senderID}.png`);
    if (!fs.existsSync(path.join(__dirname, 'cache'))) fs.mkdirSync(path.join(__dirname, 'cache'));

    const screenshotUrl = `https://image.thum.io/get/width/1200/crop/800/noanimate/${url}`;
    const res = await axios.get(screenshotUrl, { responseType: 'arraybuffer' });
    
    fs.writeFileSync(cachePath, Buffer.from(res.data, 'binary'));

    api.setMessageReaction("✅", event.messageID, () => {}, true);

    api.sendMessage({
      body: `◈ ───« سـكـريـن »─── ◈
│
◯ │ الـرابـط : ${url}
◯ │ الـوقـت : تـم
◯ │ الـحـجـم : جـيـد
│
◈ ─────────────── ◈`,
      attachment: fs.createReadStream(cachePath)
    }, event.threadID, () => fs.unlinkSync(cachePath));

  } catch (e) {
    api.setMessageReaction("❌", event.messageID, () => {}, true);
    return api.sendMessage(
      `◈ ───« خـطـأ »─── ◈
│
◯ │ تـعـذر تـصـويـر
◯ │ الـمـوقـع
│
◈ ─────────────── ◈`,
      event.threadID
    );
  }
};
