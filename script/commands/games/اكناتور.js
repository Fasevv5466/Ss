     const axios = require("axios");

module.exports.config = {
  name: "اكيناتور",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "ayman",
  description: "المارد السحري يحزر الشخصية التي تفكر بها (Groq AI)",
  commandCategory: "games",
  usages: "[بداية / مسح]",
  cooldowns: 5
};

const GROQ_API_KEY = "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";
const header = `⌬ ━━━━━━━━━━━━ ⌬\n      أكـيـنـاتـور\n⌬ ━━━━━━━━━━━━ ⌬`;

// تخزين جلسات اللعب
if (!global.akinator_sessions) global.akinator_sessions = {};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID, senderID } = event;

  if (args[0] === "مسح") {
    delete global.akinator_sessions[senderID];
    return api.sendMessage(`${header}\n\n✅ تم مسح الجلسة بنجاح.`, threadID, messageID);
  }

  // بداية اللعبة
  global.akinator_sessions[senderID] = [
    { role: "system", content: "أنت الآن تلعب دور أكيناتور. سأفكر في شخصية (حقيقية أو خيالية) وأنت ستسألني أسئلة قصيرة واحداً تلو الآخر لتحزر من هي. ابدأ بسؤالك الأول الآن باللغة العربية. كن ذكياً ومختصراً." }
  ];

  try {
    const response = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
      model: "llama3-70b-8192",
      messages: global.akinator_sessions[senderID]
    }, {
      headers: { "Authorization": `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" }
    });

    const question = response.data.choices[0].message.content;
    global.akinator_sessions[senderID].push({ role: "assistant", content: question });

    return api.sendMessage(`${header}\n\n🧞‍♂️ ${question}\n\n💡 رد على الرسالة بإجابتك (نعم، لا، ربما...)`, threadID, (err, info) => {
      global.client.handleReply.push({
        name: this.config.name,
        messageID: info.messageID,
        author: senderID
      });
    }, messageID);

  } catch (e) {
    return api.sendMessage("❌ عطل في الاتصال بمحرك الذكاء الاصطناعي.", threadID, messageID);
  }
};

module.exports.handleReply = async function({ api, event, handleReply }) {
  const { threadID, messageID, body, senderID } = event;
  if (senderID !== handleReply.author) return;

  try {
    global.akinator_sessions[senderID].push({ role: "user", content: body });

    const response = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
      model: "llama3-70b-8192",
      messages: global.akinator_sessions[senderID]
    }, {
      headers: { "Authorization": `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" }
    });

    const reply = response.data.choices[0].message.content;
    global.akinator_sessions[senderID].push({ role: "assistant", content: reply });

    return api.sendMessage(`${header}\n\n🧞‍♂️ ${reply}`, threadID, (err, info) => {
      global.client.handleReply.push({
        name: this.config.name,
        messageID: info.messageID,
        author: senderID
      });
    }, messageID);

  } catch (e) {
    api.sendMessage("❌ حدث خطأ أثناء معالجة الرد.", threadID);
  }
};
