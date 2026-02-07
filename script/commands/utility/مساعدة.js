module.exports.config = {
  name: "مساعدة",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Heba",
  description: "مساعدة واستفسارات",
  commandCategory: "utility",
  usages: "مساعدة",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;
  
  const helpInfo = {
    "التواصل": "للتواصل مع المطور:\nالمطور: هيبا\nآيدي: في config",
    "المشاكل": "للمشاكل التقنية:\n1. أعد تشغيل البوت\n2. تأكد من الصلاحيات\n3. تحقق من الاتصال",
    "التحديثات": "آخر تحديث:\nالإصدار: 2.0.0\nالتاريخ: 2024\nالمميزات: زخرفة جديدة",
    "الصلاحيات": "مستويات الصلاحيات:\n0: جميع الأعضاء\n1: مدراء المجموعات\n2: المطور فقط"
  };

  let msg = `◈ ───« مـسـاعـدة »─── ◈\n│\n`;
  
  for (const section in helpInfo) {
    msg += `◯ │ ${section} :\n`;
    msg += `◯ │ ${helpInfo[section]}\n`;
    msg += `◯ │ ━━━━━━━━━━━━━━━━━\n`;
  }
  
  msg += `│\n◈ ─────────────── ◈\n`;
  msg += `◯ │ لمزيد من المساعدة:\n`;
  msg += `◯ │ استخدم : اوامر\n`;
  msg += `◯ │ للقائمة الكاملة\n`;
  msg += `◈ ─────────────── ◈`;

  return api.sendMessage(msg, threadID, messageID);
};
