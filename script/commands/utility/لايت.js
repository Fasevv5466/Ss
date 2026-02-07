const axios = require("axios");

module.exports.config = {
  name: "لايت",
  version: "6.0",
  hasPermssion: 0,
  credits: "SOMI",
  description: "لايت ياجامي باستخدام محرك Groq السريع",
  commandCategory: "AI",
  usages: ".لايت [النص]",
};

const GROQ_API_KEY = "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";
const systemPrompt = "Your name is Light Yagami (Kira). You are a cold, arrogant genius. Speak in sophisticated Arabic. You believe you are justice and the god of the new world.";

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, senderID } = event;
  const prompt = args.join(" ");

  if (!prompt) return api.sendMessage("أكتب شيئاً.. هل تريد أن ينتهي اسمك في مذكرتي؟", threadID, messageID);

  api.sendTypingIndicator(threadID);

  try {
    const response = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
      model: "llama-3.3-70b-versatile", // موديل قوي جداً وسريع
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ]
    }, {
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    const answer = response.data.choices[0].message.content;

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
    return api.sendMessage("❌ يبدو أن النظام يرفض الانصياع.. تأكد من صلاحية المفتاح.", threadID, messageID);
  }
};

// ملاحظة: الـ handleReply يحتاج تعديل مشابه بنفس الرابط والـ Headers
