// ═══════════════════════════════════════════════════════════
// 👑 KIRA - اطرديني
// المطور: Ayman ♛
// الوصف: الطرد الذاتي من المجموعة مع نظام رسوم الخزينة
// ═══════════════════════════════════════════════════════════

module.exports.config = {
  name: "اطرديني",
  aliases: [],
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Ayman ♛",
  description: "الطرد الذاتي من المجموعة مع نظام رسوم الخزينة",
  commandCategory: "utility",
  usages: "استخدمه إذا كنت تجرؤ على دفع رسوم المغادرة",
  cooldowns: 5
};

module.exports.run = async function({ api, event, Currencies }) {
  const { threadID, messageID, senderID } = event;
  const isTop = global.config.ADMINBOT.includes(senderID);
  const kickFee = 1000; // رسوم المغادرة (صرف)

  try {
    // جلب معلومات المجموعة والتأكد من رتبة البوت
    var info = await api.getThreadInfo(threadID);
    if (!info.adminIDs.some(item => item.id == api.getCurrentUserID())) {
      return api.sendMessage('◈ عذراً، يجب أن أكون مسؤولاً (Admin) لأتمكن من تنفيذ أمر الطرد سيدي.', threadID, messageID);
    }

    // نظام الصرف من الخزينة المركزية
    if (!isTop) {
      let userData = await Currencies.getData(senderID);
      let money = userData.money || 0;

      if (money < kickFee) {
        return api.sendMessage(`◈ لا تملك ${kickFee}$ دفع رسوم "الخروج النهائي". الخزينة تمنع الفقراء من الهرب!`, threadID, messageID);
      }

      // خصم الرسوم من المستخدم العادي
      await Currencies.decreaseMoney(senderID, kickFee);
    }

    // إرسال رسالة الوداع قبل الطرد
    const msg = isTop 
      ? `👑 سيدي التوب أيمن.. أمرك مطاع، سأفتقد وجودك هنا!` 
      : `🚪 تم خصم ${kickFee}$ رسوم مغادرة.. وداعاً أيها العاطل!`;

    await api.sendMessage(msg, threadID);

    // تنفيذ عملية الطرد
    return api.removeUserFromGroup(senderID, threadID);

  } catch (e) {
    return api.sendMessage("❌ حدث خطأ، قد يكون لدى المستخدم حماية من الطرد أو أن الرتبة غير كافية.", threadID, messageID);
  }
};
