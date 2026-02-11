const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports.config = {
  name: "ترحيب",
  eventType: ["log:subscribe"],
  version: "2.2.0",
  credits: "ayman",
  description: "ترحيب صافي ومختصر بالأعضاء الجدد",
};

module.exports.run = async function({ api, event, Users }) {
  const { threadID } = event;
  const header = `⌬ ━━━━━━━━━━━━ ⌬\n      👋 تـرحـيـب كـيـرا\n⌬ ━━━━━━━━━━━━ ⌬`;

  // 1. إذا كان البوت هو من انضم للمجموعة
  if (event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
    api.changeNickname(`[ ${global.config.PREFIX} ] • ${global.config.BOTNAME}`, threadID, api.getCurrentUserID());
    return api.sendMessage(`${header}\n\n✅ تم تفعيل البوت في هذه المجموعة!\nالبادئة هي: [ ${global.config.PREFIX} ]`, threadID);
  } 
  
  // 2. ترحيب بالأعضاء الجدد
  else {
    try {
      const threadInfo = await api.getThreadInfo(threadID);
      const { threadName } = threadInfo;
      
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

      // روابط GIFs هادئة للترحيب
      const gifs = [
        "https://media.giphy.com/media/MdLFOyVZtoUPm/giphy.gif",
        "https://media.giphy.com/media/cxPtMDHG8Ljry/giphy.gif",
        "https://media.giphy.com/media/l8vODjlQrm2YM/giphy.gif"
      ];
      const randomGif = gifs[Math.floor(Math.random() * gifs.length)];

      let msg = `${header}\n\n` +
                `👤 أهلاً بك: ${nameArray.join(", ")}\n` +
                `🏰 المجموعة: ${threadName}\n` +
                `🛡️ بواسطة: ${nameAuthor}\n\n` +
                `✨ نتمنى لك وقتاً ممتعاً معنا!`;

      const cachePath = path.join(__dirname, "cache", `welcome_${threadID}.gif`);
      
      const response = await axios.get(randomGif, { responseType: "arraybuffer" });
      fs.writeFileSync(cachePath, Buffer.from(response.data, "utf-8"));

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
