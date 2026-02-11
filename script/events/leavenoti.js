const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports.config = {
  name: "مغادرة",
  eventType: ["log:unsubscribe"],
  version: "2.1.0",
  credits: "ayman",
  description: "إشعار عند مغادرة عضو أو طرده من المجموعة",
};

module.exports.run = async function({ api, event, Users }) {
  const { threadID } = event;
  const botID = api.getCurrentUserID();
  const leftID = event.logMessageData.leftParticipantFbId;

  // تجاهل الإشعار إذا كان البوت هو من غادر
  if (leftID == botID) return;

  const header = `⌬ ━━━━━━━━━━━━ ⌬\n      👋 وداعـاً كـيـرا\n⌬ ━━━━━━━━━━━━ ⌬`;

  try {
    const name = await Users.getNameUser(leftID);
    // تحديد سبب الخروج (خروج إرادي أو طرد)
    const type = (event.author == leftID) ? "غادر المجموعة بنفسه" : "تم طرده بواسطة المسؤول";

    const gifURL = "https://media.giphy.com/media/4QxQgWZHbeYwM/giphy.gif";
    
    const msg = `${header}\n\n` +
                `👤 العضو: ${name}\n` +
                `✨ الحالة: ${type}\n\n` +
                `👋 في أمان الله، لن نشتاق لك!`;

    const cachePath = path.join(__dirname, "cache", `leave_${leftID}.gif`);
    
    // تحميل المرفق وحفظه مؤقتاً
    const response = await axios.get(gifURL, { responseType: "arraybuffer" });
    fs.writeFileSync(cachePath, Buffer.from(response.data, "binary"));

    return api.sendMessage({
      body: msg,
      attachment: fs.createReadStream(cachePath)
    }, threadID, () => {
      // حذف الملف المؤقت بعد الإرسال
      if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
    });

  } catch (e) {
    console.error("Leave Error: ", e);
  }
};
