const axios = require("axios");

module.exports.config = {
  name: "اكيناتور",
  version: "1.1.0",
  hasPermssion: 0,
  credits: "ayman",
  description: "المارد السحري يحزر الشخصية (Groq AI)",
  commandCategory: "games",
  usages: "[بداية / مسح]",
  cooldowns: 5
};

// تأكد من صحة هذا المفتاح أو استبدله بـ Key جديد من موقع Groq
const GROQ_API_KEY = "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";
const header = `⌬ ━━━━━━━━━━━━ ⌬\n      أكـيـنـاتـور\n⌬ ━━━━━━━━━━━━ ⌬`;

if (!global.akinator_sessions) global.akinator_sessions = {};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID, senderID } = event;

  if (args[0] === "مسح") {
    delete global.akinator_sessions[senderID];
    return api.sendMessage(`${header}\n\n✅ تم تصغير الجلسة ومسح الذاكرة.`, threadID, messageID);
  }

  // تهيئة الجلسة
  global.akinator_sessions[senderID] = [
    { role: "system", content: "أنت المارد الأكيناتور. اسأل أسئلة قصيرة باللغة العربية لتحزر الشخصية. ابدأ فوراً بسؤالك الأول." }
  ];

  await callGroqAI(api, event, senderID);
};

module.exports.handleReply = async function({ api, event, handleReply }) {
  const { threadID, messageID, body, senderID } = event;
  if (senderID !== handleReply.author) return;

  if (!global.akinator_sessions[senderID]) return;

  global.akinator_sessions[senderID].push({ role: "user", content: body });
  await callGroqAI(api, event, senderID);
};

async function callGroqAI(api, event, senderID) {
  const { threadID, messageID } = event;
  
  try {
    const response = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
      model: "llama3-70b-8192",
      messages: global.akinator_sessions[senderID],
      temperature: 0.7
    }, {
      headers: { 
        "Authorization": `Bearer ${GROQ_API_KEY}`, 
        "Content-Type": "application/json" 
      }
    });

    const reply = response.data.choices[0].message.content;
    global.akinator_sessions[senderID].push({ role: "assistant", content: reply });

    return api.sendMessage(`${header}\n\n🧞‍♂️ ${reply}\n\n💡 رد على الرسالة للاستمرار..`, threadID, (err, info) => {
      global.client.handleReply.push({
        name: "اكيناتور",
        messageID: info.messageID,
        author: senderID
      });
    }, messageID);

  } catch (e) {
    console.error(e.response ? e.response.data : e);
    
    let errorMsg = "❌ عطل في الاتصال بمحرك الذكاء الاصطناعي.";
    if (e.response && e.response.status === 401) errorMsg = "❌ خطأ: مفتاح الـ API Key غير صحيح أو منتهي.";
    if (e.response && e.response.status === 429) errorMsg = "❌ خطأ: تم الوصول للحد الأقصى للطلبات (Rate Limit).";
    
    return api.sendMessage(errorMsg, threadID, messageID);
  }
}
