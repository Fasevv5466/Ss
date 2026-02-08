// ═══════════════════════════════════════════════════════════
// 👑 KIRA - اصفعي
// المطور: Ayman ♛
// الوصف: توجيه صفعة تأديبية لمنشن مع صورة فوتوشوب
// ═══════════════════════════════════════════════════════════

module.exports.config = {
  name: "اصفعي",
  aliases: [],
  version: "3.2.0",
  hasPermssion: 0,
  credits: "Ayman ♛",
  description: "توجيه صفعة تأديبية لمنشن مع صورة فوتوشوب",
  commandCategory: "utility",
  usages: "[تاغ للشخص]",
  cooldowns: 5,
  dependencies: {
      "axios": "",
      "fs-extra": "",
      "path": "",
      "jimp": ""
  }
};

module.exports.onLoad = async() => {
  const { resolve } = require("path");
  const { existsSync, mkdirSync } = require("fs-extra");
  const axios = require("axios");
  const fs = require("fs");

  const dir = resolve(__dirname, 'cache', 'canvas');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  
  const path = resolve(dir, 'slap.png');
  if (!existsSync(path)) {
    const res = await axios.get("https://i.imgur.com/dsrmtlg.jpg", { responseType: "arraybuffer" });
    fs.writeFileSync(path, Buffer.from(res.data, "utf-8"));
  }
}

async function circle(image) {
  const jimp = require("jimp");
  image = await jimp.read(image);
  image.circle();
  return await image.getBufferAsync("image/png");
}

async function makeImage({ one, two }) {
  const fs = require("fs-extra");
  const path = require("path");
  const axios = require("axios"); 
  const jimp = require("jimp");
  const __root = path.resolve(__dirname, "cache", "canvas");

  let baseImage = await jimp.read(__root + "/slap.png");
  let pathImg = __root + `/slap_${one}_${two}.png`;
  let avatarOne = __root + `/avt_${one}.png`;
  let avatarTwo = __root + `/avt_${two}.png`;

  let getAvatarOne = (await axios.get(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
  fs.writeFileSync(avatarOne, Buffer.from(getAvatarOne, 'utf-8'));

  let getAvatarTwo = (await axios.get(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
  fs.writeFileSync(avatarTwo, Buffer.from(getAvatarTwo, 'utf-8'));

  let circleOne = await jimp.read(await circle(avatarOne));
  let circleTwo = await jimp.read(await circle(avatarTwo));
  
  baseImage.composite(circleOne.resize(150, 150), 260, 80) // الصافع
           .composite(circleTwo.resize(150, 150), 80, 190); // المصفوع

  let raw = await baseImage.getBufferAsync("image/png");

  fs.writeFileSync(pathImg, raw);
  fs.unlinkSync(avatarOne);
  fs.unlinkSync(avatarTwo);

  return pathImg;
}

module.exports.run = async function ({ event, api, args, Users }) {    
  const fs = require("fs-extra");
  const { threadID, messageID, senderID, mentions } = event;
  const EMPEROR_ID = "61577861540407"; // أيدي الإمبراطور أيمن

  const mention = Object.keys(mentions);
  if (!mention[0]) return api.sendMessage("◈ ───『 تـنـبـيـه 』─── ◈\n\n◯ سيدي، يجب عمل تاغ للشخص الذي تريد تأديبه.\n———————————————\n◈ ─────────────── ◈", threadID, messageID);

  if (mention[0] == EMPEROR_ID) {
    return api.sendMessage("◈ ───『 تـحـذيـر مـلـكـي 』─── ◈\n\n◯ لـا يـمـكـن لأحـد صـفـع الإمـبـراطـور أيـمـن!\n◉ سـيـتـم جـلـدك بـدلاً مـن ذلـك 🛡️\n———————————————\n◈ ─────────────── ◈", threadID, messageID);
  }

  const nameVictim = mentions[mention[0]].replace("@", "");
  
  api.sendMessage("◈ ───『 جـاري الـتأديـب.. 』─── ◈", threadID, async () => {
      try {
          const path = await makeImage({ one: senderID, two: mention[0] });
          return api.sendMessage({ 
              body: `◈ ───『 صـفـعـة إمـبـراطـورية 』─── ◈\n\n◯ خـذ هـذه الـصـفـعـة يـا ${nameVictim}!\n———————————————\n│←› بـأوامـر: الـتـوب أيـمـن 👑`, 
              attachment: fs.createReadStream(path) 
          }, threadID, () => fs.unlinkSync(path), messageID);
      } catch (e) {
          return api.sendMessage("⚠️ سيدي، حدث خطأ في رسم الصفعة.", threadID, messageID);
      }
  }, messageID);
}
