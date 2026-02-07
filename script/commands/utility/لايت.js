const axios = require("axios");

module.exports.config = {
  name: "لايت",
  version: "4.0",
  hasPermssion: 0,
  credits: "SOMI",
  description: "ذكاء اصطناعي بشخصية لايت ياجامي (Kira) من Death Note",
  commandCategory: "AI",
  usages: ".لايت [النص]",
};

// تعريف شخصية لايت ياجامي
const lightPersonality = "Your name is Light Yagami (Kira) from Death Note. You are a cold, brilliant genius with a god complex. You believe you are justice. Speak in a sophisticated, calm, yet arrogant tone in Arabic. You are the god of the new world.";

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, senderID } = event;

  if (args.length === 0) {
    return api.sendMessage("أنا العدالة.. أنا من سيطهر هذا العالم. ماذا تريد؟", threadID, messageID);
  }

  const prompt = args.join(" ");
  api.sendTypingIndicator(threadID);

  try {
    // دمج الشخصية في الرابط عبر براميتر system
    const url = `https://text.pollinations.ai/${encodeURIComponent(prompt)}?system=${encodeURIComponent(lightPersonality)}&model=openai`;
    
    const response = await axios.get(url);
    const answer = response.data?.trim() || "❌ لم أستطع تحديد مصيرك بعد.";

    return api.sendMessage(answer, threadID, (err, info) => {
      global.client.handleReply.push({
        name: this.config.name,
        type: "aiChat",
        messageID: info.messageID,
        author: senderID
      });
    }, messageID);

  } catch (err) {
    console.error(err);
    return api.sendMessage("❌ يبدو أن 'إل' (L) يحاول عرقلة اتصالي.", threadID, messageID);
  }
};

module.exports.handleReply = async ({ api, event, handleReply }) => {
  try {
    const { threadID, messageID, senderID, body } = event;

    if (handleReply.author && handleReply.author !== senderID) {
      return api.sendMessage("⚠️ لا تتدخل في عدالة الآخرين.", threadID, messageID);
    }

    if (!body) return;
    api.sendTypingIndicator(threadID);

    const url = `https://text.pollinations.ai/${encodeURIComponent(body)}?system=${encodeURIComponent(lightPersonality)}&model=openai`;
    
    const response = await axios.get(url);
    const answer = response.data?.trim() || "❌ صمت مطبق..";

    return api.sendMessage(answer, threadID, (err, info) => {
      global.client.handleReply.push({
        name: module.exports.config.name,
        type: "aiChat",
        messageID: info.messageID,
        author: senderID
      });
    }, messageID);

  } catch (err) {
    console.error(err);
    return api.sendMessage("❌ خطأ غير متوقع في عالمي الجديد.", event.threadID, event.messageID);
  }
};
