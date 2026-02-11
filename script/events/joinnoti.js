const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports.config = {
  name: "ترحيب",
  eventType: ["log:subscribe"],
  version: "2.1.0",
  credits: "ayman",
  description: "ترحيب مختصر مع صور متحركة عشوائية",
};

module.exports.run = async function({ api, event, Users }) {
  const { threadID } = event;
  const bold = (text) => global.utils.toBoldSans(text);
  const header = `⌬ ━━━ ${bold("KIRA WELCOME")} ━━━ ⌬`;

  // 1. إذا كان البوت هو من انضم للمجموعة
  if (event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
    api.changeNickname(`[ ${global.config.PREFIX} ] • ${global.config.BOTNAME}`, threadID, api.getCurrentUserID());
    return api.sendMessage(`${header}\n\n✅ تم الاتصال بنجاح!\nالبادئة هي: [ ${global.config.PREFIX} ]`, threadID);
  } 
  
  // 2. ترحيب بالأعضاء الجدد
  else {
    try {
      const { threadName } = await api.getThreadInfo(threadID);
      const nameArray = [];
      const mentions = [];
      
      for (const participant of event.logMessageData.addedParticipants) {
        const id = participant.userFbId;
        const userName = participant.fullName;
        nameArray.push(userName);
        mentions.push({ tag: userName, id });
      }

      const authorData = await Users.getData(event.author);
      const nameAuthor = authorData.name || "عضو";

      // قائمة روابط الـ GIFs العشوائية
      const gifs = [
        "https://media.giphy.com/media/28AEi3TIvtSP6/giphy.gif",
        "https://media.giphy.com/media/MdLFOyVZtoUPm/giphy.gif",
        "https://media.giphy.com/media/cxPtMDHG8Ljry/giphy.gif",
        "https://media.giphy.com/media/cKtQKy2VylZC0/giphy.gif",
        "https://media.giphy.com/media/l8vODjlQrm2YM/giphy.gif"
      ];
      const randomGif = gifs[Math.floor(Math.random() * gifs.length)];

      // الرسالة الترحيبية المختصرة
      let msg = `${header}\n\n` +
                `👋 أهلاً بك: ${bold(nameArray.join(", "))}\n` +
                `🏰 في: ${bold(threadName)}\n` +
                `👤 بواسطة: ${nameAuthor}\n\n` +
                `✨ استمتع معنا!`;

      // معالجة المرفق
      const cachePath = path.join(__dirname, "cache", `welcome_${threadID}.gif`);
      const getImg = (await axios.get(randomGif, { responseType: "arraybuffer" })).data;
      fs.writeFileSync(cachePath, Buffer.from(getImg, "utf-8"));

      return api.sendMessage({
        body: msg,
        attachment: fs.createReadStream(cachePath),
        mentions
      }, threadID, () => {
        if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
      });

    } catch (e) {
      console.log("Welcome Error: ", e);
    }
  }
};
