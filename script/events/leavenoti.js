const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports.config = {
  name: "مغادرة",
  eventType: ["log:unsubscribe"],
  version: "2.1.1",
  credits: "ayman - Enhanced",
  description: "إشعار عند مغادرة عضو أو طرده من المجموعة"
};

module.exports.run = async function({ api, event, Users }) {
  const { threadID } = event;
  const botID = api.getCurrentUserID();
  const leftID = event.logMessageData.leftParticipantFbId;

  // ✅ تجاهل الإشعار إذا كان البوت هو من غادر
  if (leftID == botID) return;

  const header = `⌬ ━━━━━━━━━━━━ ⌬\n      👋 وداعـاً\n⌬ ━━━━━━━━━━━━ ⌬`;

  try {
    const name = await Users.getNameUser(leftID);
    
    // ✅ تحديد سبب الخروج (خروج إرادي أو طرد)
    const type = (event.author == leftID) 
      ? "غادر المجموعة بنفسه 🚶" 
      : "تم طرده بواسطة المسؤول 🚫";

    const msg = `${header}\n\n` +
                `👤 العضو: ${name}\n` +
                `✨ الحالة: ${type}\n\n` +
                `👋 في أمان الله!`;

    // ✅ التحقق من وجود مجلد cache وإنشاءه إذا لم يكن موجود
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) {
      console.log("📁 إنشاء مجلد cache للمغادرة...");
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    const cachePath = path.join(cacheDir, `leave_${leftID}.gif`);
    const gifURL = "https://media.giphy.com/media/4QxQgWZHbeYwM/giphy.gif";

    try {
      // ✅ محاولة تحميل الصورة مع timeout
      const response = await axios.get(gifURL, { 
        responseType: "arraybuffer",
        timeout: 5000 // مهلة 5 ثواني فقط
      });
      
      fs.writeFileSync(cachePath, Buffer.from(response.data, "binary"));

      return api.sendMessage({
        body: msg,
        attachment: fs.createReadStream(cachePath)
      }, threadID, () => {
        // ✅ حذف الملف المؤقت بعد الإرسال
        if (fs.existsSync(cachePath)) {
          fs.unlinkSync(cachePath);
        }
      });

    } catch (downloadError) {
      // ✅ إذا فشل تحميل الصورة، أرسل النص فقط
      console.warn("⚠️ فشل تحميل صورة الوداع:", downloadError.message);
      return api.sendMessage(msg, threadID);
    }

  } catch (e) {
    console.error("❌ Leave Notification Error:", e.message);
    console.error("Stack:", e.stack);
    
    // ✅ رسالة احتياطية بسيطة
    try {
      return api.sendMessage("👋 عضو غادر المجموعة", threadID);
    } catch (fallbackError) {
      console.error("❌ حتى رسالة الـ fallback فشلت:", fallbackError.message);
    }
  }
};
