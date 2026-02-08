// ═══════════════════════════════════════════════════════════
// 👑 KIRA - مضاربه
// المطور: Ayman ♛
// الوصف: لعبة مضاربة في البورصة العالمية (ربح أو خسارة عشوائية)
// ═══════════════════════════════════════════════════════════

module.exports.config = {
  name: "مضاربه",
  aliases: [],
  version: "2.1.0",
  hasPermssion: 0,
  credits: "Ayman ♛",
  description: "لعبة مضاربة في البورصة العالمية (ربح أو خسارة عشوائية)",
  commandCategory: "games",
  usages: "[المبلغ]",
  cooldowns: 5,
};

module.exports.run = async function({ api, event, args, Currencies }) {
  const { threadID, messageID, senderID } = event;
  const { getData, increaseMoney, decreaseMoney } = Currencies;

  // جلب بيانات المستخدم
  const userData = await getData(senderID);
  const moneyUser = userData.money;

  // التحقق من المدخلات
  var moneyBet = parseInt(args[0]);
  if (isNaN(moneyBet) || moneyBet <= 0) {
      return api.sendMessage("◈ ──『 تـنـبـيـه 』── ◈\n\n⚠️ سيدي، يرجى إدخال مبلغ صحيح للمضاربة به.\nمثال: مضاربه 500", threadID, messageID);
  }
  if (moneyBet > moneyUser) {
      return api.sendMessage(`◈ ──『 عـجز مـالي 』── ◈\n\n⚠️ سيدي، رصيدك الحالي [ ${moneyUser}$ ] لا يكفي للمضاربة بهذا المبلغ.`, threadID, messageID);
  }
  if (moneyBet < 50) {
      return api.sendMessage("◈ ──『 حـد أدنى 』── ◈\n\n⚠️ الحد الأدنى لدخول سوق المضاربة هو 50$.", threadID, messageID);
  }

  // وضع تفاعل البورصة
  api.setMessageReaction("📈", messageID, () => {}, true);

  // حساب النسبة (من 10% إلى 100%)
  const percentage = Math.floor(Math.random() * 91) + 10;
  const moneyChange = Math.round((moneyBet * percentage) / 100);
  
  // تحديد الفوز أو الخسارة (احتمال 50/50)
  const isWin = Math.random() > 0.5;

  setTimeout(async () => {
      if (isWin) {
          await increaseMoney(senderID, moneyChange);
          api.setMessageReaction("✅", messageID, () => {}, true);
          const msg = `◈ ───『 صـفـقـة نـاجـحـة 📈 』─── ◈\n\n` +
                      `✅ تـم تـحـقـيق أربـاح مـذهـلـة!\n` +
                      `◯ نـسـبة الـربـح: [ ${percentage}% ]\n` +
                      `💰 الـمـبـلـغ الـمُـضاف: [ ${moneyChange}$ ]\n` +
                      `———————————————\n` +
                      `│←› بـأوامـر: الـتـوب أيـمـن 👑`;
          return api.sendMessage(msg, threadID, messageID);
      } else {
          await decreaseMoney(senderID, moneyChange);
          api.setMessageReaction("📉", messageID, () => {}, true);
          const msg = `◈ ───『 صـفـقـة خـاسـرة 📉 』─── ◈\n\n` +
                      `❌ لـقـد هـبطت الأسـهـم فـجأة!\n` +
                      `◯ نـسـبة الـخـسارة: [ ${percentage}% ]\n` +
                      `💸 الـمـبـلـغ الـمـخـصوم: [ ${moneyChange}$ ]\n` +
                      `———————————————\n` +
                      `│←› بـأوامـر: الـتـوب أيـمـن 👑`;
          return api.sendMessage(msg, threadID, messageID);
      }
  }, 1000); // تأخير بسيط لزيادة الحماس
};
