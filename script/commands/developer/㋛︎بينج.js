// ═══════════════════════════════════════════════════════════
// 👑 KIRA - بينج
// المطور: Ayman ♛
// الوصف: نظام النبض الإمبراطوري التلقائي واليدوي
// ═══════════════════════════════════════════════════════════

const axios = require("axios");

module.exports.config = {
  name: "بينج",
  aliases: [],
  version: "10.0.0",
  hasPermssion: 2, // مخصص للتوب أيمن فقط
  credits: "Ayman ♛",
  description: "نظام النبض الإمبراطوري التلقائي واليدوي",
  commandCategory: "developer",
  usages: "",
  cooldowns: 2
};

if (!global.imperialAutoPing) {
    global.imperialAutoPing = setInterval(async () => {
        try {
            await axios.get("https://anas4-1.onrender.com");
            // سجل العمليات الصامت للهيبة
            console.log("◈ [ نـبض مـلكـي ] ← تـم تـحديث الاتصال تلقائياً.");
        } catch (e) {
            console.log("◈ [ تـنـبيه ] ← الـرابط لا يـستجيب حالياً.");
        }
    }, 120000); // كـل دقـيقتين (120 ثانية)
}

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, senderID } = event;
  const isTop = global.config.ADMINBOT.includes(senderID);

  if (!isTop) return; // الـتوب أيـمن فـقط يـمكنه طـلب الـتقرير

  try {
    const start = Date.now();
    await axios.get("https://anas4-1.onrender.com");
    const end = Date.now();
    const pingTime = end - start;

    return api.sendMessage(`◈ ───『 الـنـبـض الإمـبـراطـوري 』─── ◈\n\n📡 حـالة الـرابط: مـتصل ونـشط ✅\n⏱️ سـرعة الاسـتجابة: ${pingTime}ms\n⚙️ الـنظام الـتـلقائي: يـعـمل كـل دقـيـقـتـين.\n\n│←› الـمـشرف: الـتـوب ايـمـن 👑\n◈ ──────────────── ◈`, threadID, messageID);
  } catch (err) {
    return api.sendMessage(`◈ ───『 تـنـبـيـه مـلـكـي 』─── ◈\n\n❌ سيدي، الـرابط لا يـستجيب حالياً لـلـنـبض الـيدوي.\n⚠️ قد يكون الموقع متوقفاً عن العمل.\n\n◈ ──────────────── ◈`, threadID, messageID);
  }
};
