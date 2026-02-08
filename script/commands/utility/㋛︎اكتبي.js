// ═══════════════════════════════════════════════════════════
// 👑 KIRA - اكتبي
// المطور: Ayman ♛
// الوصف: نداء ملكي مخفي لجميع الرعية في المجموعة
// ═══════════════════════════════════════════════════════════

module.exports.config = {
  name: "اكتبي",
  aliases: [],
  version: "1.1.0",
  hasPermssion: 0,
  credits: "Ayman ♛",
  description: "نداء ملكي مخفي لجميع الرعية في المجموعة",
  commandCategory: "utility",
  usages: "[النص]",
  cooldowns: 10
};

module.exports.run = async function({ api, event, args, Currencies }) {
  const { threadID, messageID, senderID, participantIDs } = event;
  const reward = 1; // منحة التقشف الملكية

  try {
    const botID = api.getCurrentUserID();
    // تصفية القائمة لاستثناء البوت والمرسل
    const listUserID = participantIDs.filter(ID => ID != botID && ID != senderID);
    
    let content = args.join(" ");
    if (!content) return api.sendMessage("◈ ───『 تـنـبـيـه 』─── ◈\n\n⚠️ سيدي، يرجى كتابة الرسالة المراد توجيهها للرعية.\n\n◈ ──────────────── ◈", threadID, messageID);

    let mentions = [];
    let body = "";

    // بناء المنشن المخفي الإمبراطوري
    for (const idUser of listUserID) {
      body += "‎"; // محرف مخفي
      mentions.push({
        id: idUser,
        tag: "‎", // منشن غير مرئي
        fromIndex: -1
      });
    }

    // دمج النص مع المنشن المخفي
    const finalBody = body + content;

    // صرف منحة التقشف
    await Currencies.increaseMoney(senderID, reward);

    return api.sendMessage({ body: finalBody, mentions }, threadID, (err) => {
      if (err) return console.log(err);
    }, messageID);

  } catch (e) {
    return console.log(e);
  }
};
