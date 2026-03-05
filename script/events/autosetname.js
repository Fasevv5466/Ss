module.exports.config = {
  name: "اللقب_التلقائي",
  eventType: ["log:subscribe"],
  version: "1.0.0",
  credits: "anas",
  description: "تغيير لقب الأعضاء الجدد تلقائياً فور دخولهم"
};

module.exports.run = async function({ api, event, Users }) {
  const { threadID, logMessageData } = event;
  
  // حماية من عدم وجود global.utils
  const bold = (text) => {
    try {
      return global.utils?.toBoldSans?.(text) || text;
    } catch {
      return text;
    }
  };
  
  const header = `⌬ ━━━ ${bold("SOMI AUTO-NAME")} ━━━ ⌬`;

  // استبعاد البوت من العملية
  const botID = api.getCurrentUserID();
  
  // قائمة الأعضاء الجدد
  const memJoin = logMessageData.addedParticipants;

  for (let user of memJoin) {
    const idUser = user.userFbId;
    
    // إذا كان العضو الجديد ليس البوت
    if (idUser !== botID) {
      try {
        // جلب اسم العضو الأصلي
        const info = await Users.getData(idUser);
        const name = info.name || user.fullName;

        // تغيير اللقب إلى التنسيق المطلوب 𖣂 الاسم 𖣂
        const newNickname = `𖣂 ${name} 𖣂`;
        
        // تنفيذ التغيير (تأخير بسيط لتفادي الحظر)
        setTimeout(() => {
          api.changeNickname(newNickname, threadID, idUser);
        }, 1500);

      } catch (e) {
        console.log("Auto-Nickname Error: ", e);
      }
    }
  }
}; // ✅ إضافة الإغلاق الناقص
