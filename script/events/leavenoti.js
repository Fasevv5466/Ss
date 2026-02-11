const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports.config = {
  name: "مغادرة",
  eventType: ["log:unsubscribe"],
  version: "2.0.0",
  credits: "ayman",
  description: "إشعار عند مغادرة عضو أو طرده",
};

module.exports.run = async function({ api, event, Users }) {
  const { threadID } = event;
  const botID = api.getCurrentUserID();
  const leftID = event.logMessageData.leftParticipantFbId;

  // إذا كان البوت هو الذي غادر أو طُرد لا يرسل شيئاً
  if (leftID == botID) return;

  const bold = (text) => global.utils.toBoldSans(text);
  const header = `⌬ ━━━ ${bold("KIRA LEAVE")} ━━━ ⌬`;

  try {
    const name = await Users.getNameUser(leftID);
    const type = (event.author == leftID) ? "غادر المجموعة" : "تم طرده بواسطة المسؤول";

    // رابط الـ GIF الذي طلبته
    const gifURL = "https://media.giphy.com/media/4QxQgWZHbeYwM/giphy.gif";
    
    const msg = `${header}\n\n` +
                `👤 ${bold(name)}\n` +
                `✨ ${type}\n\n` +
                `👋 ${bold("وداعاً، لن نشتاق لك!")}`;

    // إعداد المرفق (GIF)
    const cachePath = path.join(__dirname, "cache", `leave_${leftID}.gif`);
    const getImg = (await axios.get(gifURL, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(cachePath, Buffer.from(getImg, "utf-8"));

    return api.sendMessage({
      body: msg,
      attachment: fs.createReadStream(cachePath)
    }, threadID, () => {
      if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
    });

  } catch (e) {
    console.log("Leave Noti Error: ", e);
  }
};
