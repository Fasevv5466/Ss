module.exports.config = {
  name: "debug-event",
  version: "1.0.0",
  hasPermssion: 2,
  credits: "KIRA Diagnostic",
  description: "عرض معلومات JSON للحدث",
  commandCategory: "test",
  usages: "debug-event",
  cooldowns: 0
};

module.exports.run = async function({ api, event }) {
  const cleanEvent = { ...event };
  delete cleanEvent.attachments;
  let output = "════════════════════════════════════\n🐛 بيانات الحدث (Debug)\n════════════════════════════════════\n\n";
  output += "```json\n" + JSON.stringify(cleanEvent, null, 2) + "\n```";
  return api.sendMessage(output, event.threadID, event.messageID);
};
