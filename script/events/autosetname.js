const moment = require("moment-timezone");

module.exports.config = {
  name: "autosetname",
  eventType: ["log:subscribe"], // يشتغل عند انضمام أي عضو جديد
  version: "1.2.2",
  credits: "Ayman",
  description: "تغيير لقب الأعضاء الجدد تلقائياً عبر نظام ʜᴇʙᴀ ᴄʜᴀɴ"
};

module.exports.run = async function ({ api, event }) {
  const { threadID, logMessageData } = event;

  // جلب قائمة الأعضاء الجدد
  const memJoin = logMessageData.addedParticipants;
  if (!memJoin || memJoin.length === 0) return;

  const botID = api.getCurrentUserID();

  for (let user of memJoin) {
    const idUser = user.userFbId;
    const nameUser = user.fullName;

    // تجاهل إذا كان البوت (ʜᴇʙᴀ ᴄʜᴀɴ) هو المنضم
    if (idUser === botID) continue;

    try {
      // تأخير بسيط (1.5 ثانية) لضمان الاستقرار
      await new Promise(resolve => setTimeout(resolve, 1500));

      // تغيير اللقب إلى الزخرفة الموحدة
      await api.changeNickname(`𖣂 ${nameUser} 𖣂`, threadID, idUser);
    } catch (err) {
      console.log(`⚠️ [ʜᴇʙᴀ ᴄʜᴀɴ] فشل تلقيب العضو: ${idUser}`, err);
    }
  }
};
