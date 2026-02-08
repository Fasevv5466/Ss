// ═══════════════════════════════════════════════════════════
// 👑 KIRA - ارسل
// المطور: Ayman ♛
// الوصف: إرسال إخطار ملكي لجميع المجموعات بدون هدايا
// ═══════════════════════════════════════════════════════════

const moment = require("moment-timezone");

module.exports.config = {
  name: "ارسل",
  aliases: [],
  version: "4.1.0",
  hasPermission: 2,
  credits: "Ayman ♛",
  description: "إرسال إخطار ملكي لجميع المجموعات بدون هدايا",
  commandCategory: "developer",
  usages: "[النص]",
  cooldowns: 10
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;

  // التحقق من صلاحية المطور
  if (!global.config.ADMINBOT.includes(senderID)) {
    return api.sendMessage(
      "◈ ───『 تـنـبـيـه 』─── ◈\n\n◯ هذا الأمر مخصص للتوب أيمن فقط.\n\n◈ ─────────────── ◈",
      threadID,
      messageID
    );
  }

  const content = args.join(" ");
  if (!content) {
    return api.sendMessage("◯ الرجاء كتابة نص الإخطار بعد كلمة ارسل.", threadID, messageID);
  }

  // جلب قائمة المجموعات
  const threads = await api.getThreadList(100, null, ["INBOX"]);
  const groups = threads.filter(t => t.isGroup && t.isSubscribed);

  const time = moment.tz("Asia/Baghdad").format("HH:mm:ss - D/MM/YYYY");
  let count = 0;
  let errCount = 0;

  api.sendMessage(`⌛ جاري توزيع الإخطار الملكي على ${groups.length} مجموعة...`, threadID);

  const msg = 
`◈ ───『 إخـطـار مـلـكـي 』─── ◈

◯ الـمـحـتـوى:
${content}

◯ الـتـوقـيـت: ${time}

◈ ─────────────── ◈
│ الآمر: الـتـوب أيمن
◈ ─────────────── ◈`;

  for (const group of groups) {
    try {
      await api.sendMessage(msg, group.threadID);
      count++;
      // تأخير بسيط لتجنب الحظر
      await new Promise(resolve => setTimeout(resolve, 1000)); 
    } catch (e) {
      errCount++;
    }
  }

  return api.sendMessage(
    `◈ ───『 تـم الـتـعـمـيـم 』─── ◈\n\n✅ تم الإرسال لـ: ${count} مجموعة\n❌ فشل الإرسال لـ: ${errCount} مجموعة\n\n◈ ─────────────── ◈`,
    threadID
  );
};
