module.exports.config = {
  name: "autoUpdate",
  eventType: ["log:ready"],
  version: "1.5.0",
  credits: "Ayman",
  description: "تحديث الجلسة وإرسال توثيق مزخرف تلقائي كل 15 دقيقة"
};

module.exports.run = async function ({ api }) {
  const fs = require("fs-extra");
  const moment = require("moment-timezone");

  // ضع هنا معرف الشخص المسؤول أو الادمن
  const ADMIN_ID = "61577861540407"; 

  // ضبط المؤقت: كل 15 دقيقة
  const interval = 15 * 60 * 1000;

  setInterval(async () => {
    try {
      // جلب الجلسة الحالية
      const appState = api.getAppState();
      fs.writeFileSync("./appstate.json", JSON.stringify(appState, null, 2), 'utf8');

      // الوقت والتاريخ بتوقيت بغداد
      const time = moment.tz("Asia/Baghdad").format("HH:mm:ss");
      const date = moment.tz("Asia/Baghdad").format("YYYY/MM/DD");

      // صياغة رسالة التوثيق
      const msg = `◈ ───『 تحديث تلقائي 』─── ◈\n\n` +
                  `◯ تم تأمين الجلسة بنجاح.\n` +
                  `———————————————\n` +
                  `📅 التاريخ: ${date}\n` +
                  `⏰ الوقت: ${time}\n` +
                  `———————————————\n` +
                  `│←› النظام: مستقر ✅\n` +
                  `◈ ──────────────── ◈`;

      // إرسال التوثيق
      api.sendMessage(msg, ADMIN_ID, (err) => {
          if (err) console.error("⚠️ فشل الإرسال:", err);
      });

      console.log(`◈ ──『 AUTO-UPDATE 』── ◈ تم التحديث في الساعة: ${time}`);

    } catch (err) {
      console.error("⚠️ فشل التحديث التلقائي:", err);
    }
  }, interval);
};
