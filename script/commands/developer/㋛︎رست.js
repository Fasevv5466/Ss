// ═══════════════════════════════════════════════════════════
// 👑 KIRA - رست
// المطور: Ayman ♛
// الوصف: إعادة تشغيل النظام الملكي للبوت
// ═══════════════════════════════════════════════════════════

module.exports.config = {
  name: "رست",
  aliases: [],
  version: "2.5.0",
  hasPermssion: 2,
  credits: "Ayman ♛",
  description: "إعادة تشغيل النظام الملكي للبوت",
  commandCategory: "developer",
  cooldowns: 5,
  dependencies: {
    "eval": ""
  }
};

module.exports.run = async ({ api, event, args, client, utils }) => {
    const { threadID, messageID, senderID } = event;
    const isTop = global.config.ADMINBOT.includes(senderID);

    // التحقق من السيادة الملكية (التوب فقط)
    if (!isTop) {
        return api.sendMessage(`◈ ───『 تـنـبـيـه الـمـديـر 』─── ◈\n\n⚠️ عذراً سيدي، هذه العملية تتطلب صلاحيات الـإمـبـراطـور الـتـوب ايـمـن 👑\n\n◈ ──────────────── ◈`, threadID, messageID);
    }

    // رسالة بدء عملية إعادة التشغيل الفخمة
    let msg = `◈ ───『 الـنـظـام الـمـلـكـي 』─── ◈\n\n` +
              `🔄 جاري إعادة تشغيل محركات البوت..\n` +
              `⏳ يرجى الانتظار، سأعود لخدمتك قريباً سيدي.\n\n` +
              `│←› الآمـر: الـتـوب ايـمـن 👑\n` +
              `◈ ──────────────── ◈`;

    return api.sendMessage(msg, threadID, () => {
        // تنفيذ الخروج لإعادة التشغيل (Process Exit)
        process.exit(1);
    }, messageID);
};
