const path = require("path");
const mongoPath = path.join(process.cwd(), "includes", "mongodb.js");
const { Currency } = require(mongoPath);

module.exports.config = {
  name: "xpControl",
  eventType: ["message"], // يراقب الرسائل القادمة
  version: "1.1.0",
  credits: "أيمن",
  description: "نظام زيادة الـ XP التلقائي عبر السحابة"
};

module.exports.run = async function({ api, event }) {
  const { senderID, body, type, threadID } = event;

  // 1. تجاهل رسائل البوت نفسه
  // 2. تجاهل الرسائل التي تبدأ ببادئة (Prefix) لكي لا يحسب الأوامر
  if (senderID == api.getCurrentUserID() || !body || body.startsWith('.') || body.startsWith('!')) return;

  try {
    // تحديث السحابة مباشرة بزيادة مقدارها 2
    // استخدام upsert لضمان إنشاء سجل للعضو الجديد فوراً
    await Currency.findOneAndUpdate(
      { userID: senderID },
      { 
        $inc: { exp: 2 },
        $setOnInsert: { money: 0, lastDaily: 0 } 
      },
      { upsert: true, new: true }
    );

    // ملاحظة: الزيادة تتم في صمت تام لضمان استقرار الشات
  } catch (err) {
    console.error("⚠️ [XP ERROR]:", err.message);
  }
};
