// ═══════════════════════════════════════════════════════════
// 👑 KIRA - غادري
// المطور: Ayman ♛
// الوصف: أمر سيادي لجعل البوت يغادر المجموعة فوراً
// ═══════════════════════════════════════════════════════════

module.exports.config = {
  name: "غادري",
  aliases: [],
  version: "1.0.0",
  hasPermssion: 2,
  credits: "Ayman ♛",
  description: "أمر سيادي لجعل البوت يغادر المجموعة فوراً",
  commandCategory: "developer",
  usages: "",
  cooldowns: 2
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, senderID } = event;
  const isTop = global.config.ADMINBOT.includes(senderID);

  // التحقق من الهوية الملكية (التوب فقط)
  if (!isTop) {
    return api.sendMessage(`◈ ───『 تـنـبـيـه الـمـديـر 』─── ◈\n\n⚠️ عذراً، هذا الأمر من صلاحيات الـتـوب ايـمـن فقط 👑\n\n◈ ──────────────── ◈`, threadID, messageID);
  }

  // رسالة الوداع الفخمة قبل المغادرة
  return api.sendMessage(`◈ ───『 أمـر مـغـادرة 』─── ◈\n\n🏛️ استجابة لأوامر الـتـوب ايـمـن، سأغادر هذه المجموعة الآن.\n\n✅ تـم الـتـنـفـيـذ بـنـجـاح.\n\n◈ ──────────────── ◈`, threadID, () => {
    api.removeUserFromGroup(api.getCurrentUserID(), threadID);
  });
};
