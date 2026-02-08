// ═══════════════════════════════════════════════════════════
// 👑 KIRA - تاريخ
// المطور: Ayman ♛
// الوصف: غزوات الإمبراطورية: نظام الربح والخسارة من الخزينة المركزية
// ═══════════════════════════════════════════════════════════

module.exports.config = {
  name: "تاريخ",
  aliases: [],
  version: "3.5.0",
  hasPermssion: 0,
  credits: "Ayman ♛",
  description: "غزوات الإمبراطورية: نظام الربح والخسارة من الخزينة المركزية",
  commandCategory: "games",
  cooldowns: 10
};

module.exports.run = async ({ event, api, Currencies }) => {
  const { threadID, messageID, senderID } = event;
  const isTop = global.config.ADMINBOT.includes(senderID);
  const equipCost = 500; // رسوم تجهيز الجيش (صرف من الخزينة)

  // التحقق من رصيد المستخدم
  let userData = await Currencies.getData(senderID);
  let money = userData.money || 0;

  if (!isTop && money < equipCost) {
    return api.sendMessage(`⚠️ عذراً أيها الجندي، خزنتك لا تحتوي على ${equipCost}$ لتجهيز جيشك. اذهب للعمل أولاً!`, threadID, messageID);
  }

  const msg = `◈ ───『 غـزوات الـإمـبـراطـوريـة 』─── ◈\n\n` +
    `⚔️ القائد الأعلى: ايـمـن 👑\n` +
    `💰 رسوم التجهيز: ${isTop ? "مجانية للتوب" : equipCost + "$"}\n\n` +
    `اختر الكتيبة التي تود قيادتها في الغزو:\n` +
    `1. 🛡️ كتيبة المشاة (ثبات عالي)\n` +
    `2. 🧙‍♂️ فرقة السحرة (هجوم مدمر)\n` +
    `3. 🏹 رماة السهام (إصابة دقيقة)\n` +
    `4. 🗡️ فرقة الاغتيال (تسلل صامت)\n` +
    `5. 🚑 سلاح الطبيب (دعم الجيش)\n\n` +
    `📌 رد برقم الكتيبة لإرسال الجيش إلى المعركة!`;

  return api.sendMessage(msg, threadID, (error, info) => {
    global.client.handleReply.push({
      type: "battle",
      name: this.config.name,
      author: senderID,
      messageID: info.messageID,
      isTop: isTop,
      equipCost: equipCost
    });
  }, messageID);
};

module.exports.handleReply = async ({ event, api, handleReply, Currencies }) => {
  const { threadID, messageID, senderID, body } = event;
  if (senderID != handleReply.author) return;

  const isTop = handleReply.isTop;
  const roles = ["🛡️ كتيبة المشاة", "🧙‍♂️ فرقة السحرة", "🏹 رماة السهام", "🗡️ فرقة الاغتيال", "🚑 سلاح الطبيب"];
  const choice = parseInt(body) - 1;

  if (isNaN(body) || choice < 0 || choice > 4) {
    return api.sendMessage("❌ اختر رقم الكتيبة من القائمة (1-5) يا جندي!", threadID, messageID);
  }

  api.unsendMessage(handleReply.messageID);

  // --- نظام الاحتمالات (التوب يربح دائماً، البقية 50/50) ---
  const win = isTop || Math.random() > 0.5;
  const winPrize = Math.floor(Math.random() * 6000) + 3000; // أرباح عالية
  const lossPenalty = Math.floor(Math.random() * 2000) + 1000; // خسارة موجعة

  if (win) {
    let finalPrize = isTop ? winPrize * 2 : winPrize;
    await Currencies.increaseMoney(senderID, finalPrize);

    return api.sendMessage(`◈ ───『 نـصـر مـبـيـن 』─── ◈\n\n` +
      `🔥 قادت ${roles[choice]} هجوماً ناجحاً!\n` +
      `✅ تم غنم ثروات الأعداء وتوزيعها على الخزينة.\n` +
      `💰 الغنائم: +${finalPrize.toLocaleString()}$\n` +
      `🏆 الرتبة: ${isTop ? "الإمبراطور التوب 👑" : "قائد منتصر"}\n\n` +
      `│←› بـإدارة الـتـوب ايـمـن 👑`, threadID, messageID);
  } else {
    // الخصم عند الخسارة (نظام الصرف والخسارة)
    await Currencies.decreaseMoney(senderID, lossPenalty + handleReply.equipCost);

    return api.sendMessage(`◈ ───『 هـزيـمـة نـكـراء 』─── ◈\n\n` +
      `💀 سقطت ${roles[choice]} في كمين غادر!\n` +
      `💸 فقدت الخزينة أموال التجهيز والتعويضات.\n` +
      `📉 إجمالي الخسارة: -${(lossPenalty + handleReply.equipCost).toLocaleString()}$\n` +
      `🛡️ حاول مرة أخرى بعد إعادة تدريب جيشك.\n\n` +
      `│←› بـإدارة الـتـوب ايـمـن 👑`, threadID, messageID);
  }
};
