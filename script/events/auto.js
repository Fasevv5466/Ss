module.exports.config = {
  name: "autoRestart",
  eventType: ["message"],
  version: "1.0.0",
  credits: "Ayman",
  description: "إعادة تشغيل تلقائي كل 30 دقيقة"
};

module.exports.run = async function({ api, event }) {
  const halfHour = 30 * 60 * 1000; 
  if (!global.nextRestart) global.nextRestart = Date.now() + halfHour;

  if (Date.now() >= global.nextRestart) {
    // إرسال تنبيه بسيط قبل الإغلاق
    await api.sendMessage("🔄 جاري تحضير الحساء... 🐢", event.threadID);
    
    // تسجيل أن البوت عمل ريستارت عشان يرسل الرسالة لما يرجع
    const fs = require("fs-extra");
    fs.writeFileSync("./restart_success.txt", event.threadID);
    
    process.exit(1);
  }
};
