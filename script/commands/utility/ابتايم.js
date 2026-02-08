
module.exports.config = {
  name: "ابتايم",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "ايمن",
  description: "عرض إحصائيات تشغيل البوت ✨",
  commandCategory: "utility",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args, Users, Threads, Currencies, models }) => {
  const { threadID, messageID } = event;
  const time = process.uptime();
  const days = Math.floor(time / (24 * 60 * 60));
  const hours = Math.floor((time % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((time % (60 * 60)) / 60);
  const seconds = Math.floor(time % 60);

  const allThreads = await api.getThreadList(100, null, ["INBOX"]);
  const groups = allThreads.filter(t => t.isGroup);
  
  let totalMembers = 0;
  groups.forEach(g => {
    totalMembers += (g.participantIDs ? g.participantIDs.length : 0);
  });

  const uptimeString = `${days} يوم، ${hours} ساعة، ${minutes} دقيقة، ${seconds} ثانية`;

  const response = `⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\n🕒 مدة التشغيل: ${uptimeString}\n👥 المجموعات: ${groups.length}\n👤 الأعضاء: ${totalMembers}\n⚙️ الحالة: نشط`;
  return api.sendMessage(response, threadID, messageID);
};
