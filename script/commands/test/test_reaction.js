module.exports.config = {
  name: "test-reaction",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "KIRA Diagnostic",
  description: "اختبار حذف الرسالة بالتفاعل",
  commandCategory: "test",
  usages: "test-reaction",
  cooldowns: 0
};

module.exports.run = async function({ api, event }) {
  const { threadID, messageID } = event;
  let message = "════════════════════════════════════\n🧪 اختبار حذف الرسالة بالتفاعل\n════════════════════════════════════\n\n";
  message += "📝 التعليمات:\nتفاعل على هذه الرسالة بـ: 😡 أو 👍 أو ❌\n\nيجب أن تُحذف الرسالة تلقائياً!";
  return api.sendMessage(message, threadID, messageID);
};

module.exports.handleEvent = async function({ api, event }) {
  const { reaction, messageReply, threadID } = event;
  if (!reaction || !messageReply || messageReply.senderID !== api.getCurrentUserID()) return;
  
  const deleteReactions = ["👍", "😡", "🗑️", "❌", "💔", "🚫", "⛔"];
  if (deleteReactions.includes(reaction)) {
    try {
      await api.unsendMessage(messageReply.messageID);
      api.sendMessage(`✅ نجح الاختبار! تم الحذف بالتفاعل ${reaction}`, threadID);
    } catch (error) {
      api.sendMessage(`❌ فشل الحذف: ${error.message}`, threadID);
    }
  }
};
