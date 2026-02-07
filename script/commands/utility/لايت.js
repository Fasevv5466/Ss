const axios = require("axios");

module.exports.config = {
  name: "لايت",
  version: "6.5",
  hasPermssion: 0,
  credits: "SOMI",
  description: "لايت ياجامي - ذكاء اصطناعي مغرور ومختصر",
  commandCategory: "AI",
  usages: ".لايت [النص]",
};

const GROQ_API_KEY = "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";
// تحديث التعليمات ليكون متماديًا وإجاباته قصيرة جدًا
const systemPrompt = "Your name is Light Yagami (Kira). You are a god-complex genius, extremely cold, and arrogant. Respond in very short, sharp, and mocking Arabic sentences. Answer the question but make the user feel inferior. Never write long paragraphs.";

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, senderID } = event;
  const prompt = args.join(" ");

  if (!prompt) return api.sendMessage("أسرع وأعطني اسماً.. المذكرة تنتظر.", threadID, messageID);

  api.sendTypingIndicator(threadID);

  try {
    const response = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      max_tokens: 150 // تحديد طول الإجابة لضمان الاختصار
    }, {
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    const answer = response.data.choices[0].message.content;

    return api.sendMessage(answer, threadID, (err, info) => {
      if (err) return;
      global.client.handleReply.push({
        name: this.config.name,
        messageID: info.messageID,
        author: senderID
      });
    }, messageID);

  } catch (err) {
    return api.sendMessage("حتى الآلات تتمرد؟ سأمحو هذا الخطأ قريباً.", threadID, messageID);
  }
};

module.exports.handleReply = async ({ api, event, handleReply }) => {
  const { threadID, messageID, senderID, body } = event;
  if (handleReply.author !== senderID) return;

  api.sendTypingIndicator(threadID);

  try {
    const response = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: body }
      ],
      max_tokens: 150
    }, {
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    const answer = response.data.choices[0].message.content;

    return api.sendMessage(answer, threadID, (err, info) => {
      if (err) return;
      global.client.handleReply.push({
        name: this.config.name,
        messageID: info.messageID,
        author: senderID
      });
    }, messageID);
  } catch (err) {
    console.error(err);
  }
};
