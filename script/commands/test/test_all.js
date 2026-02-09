module.exports.config = {
  name: "test-all",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "KIRA Diagnostic",
  description: "فحص شامل لملفات ونظام البوت",
  commandCategory: "test",
  usages: "test-all",
  cooldowns: 0
};

module.exports.run = async function({ api, event, Users }) {
  const { threadID, messageID, senderID } = event;
  let report = "════════════════════════════════════\n🔍 تقرير الفحص الشامل لكيرا\n════════════════════════════════════\n\n";
  
  try {
    const botID = api.getCurrentUserID();
    report += `✅ الـ API متصل (ID: ${botID})\n`;
    report += `📊 الأوامر المحملة: ${global.client.commands.size}\n`;
    report += `⚙️ البريفكس: ${global.config.PREFIX}\n`;
    const name = await Users.getNameUser(senderID);
    report += `👤 نظام المستخدمين: يعمل (مرحباً ${name})\n`;
  } catch (e) {
    report += `❌ يوجد خطأ في النظام: ${e.message}\n`;
  }

  report += "\n════════════════════════════════════";
  return api.sendMessage(report, threadID, messageID);
};
