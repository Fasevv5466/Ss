const axios = require("axios");

module.exports.config = {
  name: "كيرا",
  version: "3.0",
  hasPermssion: 0,
  credits: "SOMI",
  description: "ذكاء اصطناعي كيرا (Pollinations AI) مع خاصية الرد المستمر",
  commandCategory: "AI",
  usages: ".كيرا [النص]",
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, senderID } = event;

  if (args.length === 0) {
    return api.sendMessage("🤖 مرحباً! أنا كيرا، كيف يمكنني مساعدتك اليوم؟", threadID, messageID);
  }

  const prompt = args.join(" ");
  
  // تفعيل حالة "جاري الكتابة" لإضافة واقعية
  api.sendTypingIndicator(threadID);

  try {
    // تم إضافة نظام (System Prompt) لتعريف الذكاء الاصطناعي بأنه "كيرا"
    const systemPrompt = "Your name is Kira, a smart and helpful AI assistant. Answer in the same language as the user.";
    const url = `https://text.pollinations.ai/${encodeURIComponent(prompt)}?system=${encodeURIComponent(systemPrompt)}&model=openai`;

    const response = await axios.get(url);
    const answer = response.data || "❌ اعتذر، لم أستطع توليد رد حالياً.";

    return api.sendMessage(answer, threadID, (err, info) => {
      if (err) return;
      global.client.handleReply.push({
        name: this.config.name,
        type: "aiChat",
        messageID: info.messageID,
        author: senderID
      });
    }, messageID);

  } catch (err) {
    console.error(err);
    return api.sendMessage("❌ حدث خطأ في الاتصال بخوادم كيرا.", threadID, messageID);
  }
};

module.exports.handleReply = async ({ api, event, handleReply }) => {
  const { threadID, messageID, senderID, body } = event;

  if (handleReply.author && handleReply.author !== senderID) return;

  if (!body) return;
  api.sendTypingIndicator(threadID);

  try {
    const systemPrompt = "Your name is Kira, a smart and helpful AI assistant.";
    const url = `https://text.pollinations.ai/${encodeURIComponent(body)}?system=${encodeURIComponent(systemPrompt)}&model=openai`;

    const response = await axios.get(url);
    const answer = response.data || "❌ لا يوجد رد.";

    return api.sendMessage(answer, threadID, (err, info) => {
      if (err) return;
      global.client.handleReply.push({
        name: module.exports.config.name,
        type: "aiChat",
        messageID: info.messageID,
        author: senderID
      });
    }, messageID);

  } catch (err) {
    console.error(err);
    return api.sendMessage("❌ حدث خطأ أثناء المتابعة.", threadID, messageID);
  }
};
