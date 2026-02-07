module.exports.config = {
  name: "antiEmojiSpam",
  eventType: ["message"],
  version: "1.0.0",
  credits: "Ayman",
  description: "يكتشف السبام المتكرر (إيموجيات/نصوص) ويطرد بعد 10 مرات"
};

const DEV_ID = "61577861540407";
const MAX_REPEAT = 10;         // عدد التكرارات قبل الطرد
const TIME_WINDOW = 30000;     // 30 ثانية

// تخزين الرسائل لكل شخص
global.repeatData = global.repeatData || new Map();

module.exports.run = async function () {};

module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, senderID, body } = event;
  if (!body) return;

  // تجاهل المطور
  if (senderID === DEV_ID) return;

  const now = Date.now();
  if (!global.repeatData.has(senderID)) global.repeatData.set(senderID, []);

  const msgs = global.repeatData.get(senderID);

  // إضافة الرسالة الحالية مع وقتها
  msgs.push({ text: body, time: now });

  // إزالة الرسائل القديمة خارج نافذة الزمن
  const recentMsgs = msgs.filter(m => now - m.time <= TIME_WINDOW);
  global.repeatData.set(senderID, recentMsgs);

  // حساب تكرار نفس الرسالة
  const counts = {};
  for (const m of recentMsgs) {
    counts[m.text] = (counts[m.text] || 0) + 1;
  }

  for (const [text, count] of Object.entries(counts)) {
    if (count >= MAX_REPEAT) {
      try {
        const info = await api.getThreadInfo(threadID);

        // لا تطرد الأدمن
        if (info.adminIDs.some(a => a.id === senderID)) {
          global.repeatData.delete(senderID);
          return;
        }

        await api.sendMessage(
          `🚫 تم طرد العضو بسبب سبام الإيموجيات/النصوص (${MAX_REPEAT} مرات متتالية)`,
          threadID
        );

        await api.removeUserFromGroup(senderID, threadID);
        global.repeatData.delete(senderID);
      } catch (err) {
        console.log("AntiEmojiSpam Error:", err.message);
      }
      break;
    }
  }
};
