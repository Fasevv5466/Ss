const axios = require("axios");

if (!global.shaikhaHistory) global.shaikhaHistory = new Map();

module.exports.config = {
  name: "شيخة",
  version: "2.5.0",
  hasPermssion: 0,
  credits: "ايمن",
  description: "الزوجة الورعة التقية شيخة",
  commandCategory: "fun",
  usages: ".شيخة [النص]",
  cooldowns: 5
};

const GROQ_API_KEY = "Gsk_5xXabJMctRfDGK7i3cc4WGdyb3FYAhrMgglcp5sPAY7N6lOm01fz";
const ADMIN_ID = "61577861540407"; // أيدي زوجها أيمن

const getSystemRole = (senderID) => {
  const isHusband = senderID === ADMIN_ID;
  return `أنتِ شيخة، امرأة قمة في التدين والوقار والزهد. أنتِ زوجة أيمن (سيدكِ وقرة عينكِ). 
  ${isHusband ? "تتحدثين مع زوجكِ أيمن بكل خضوع ومودة إيمانية، تدعين له في كل جملة وتلبين أمره." : "تتحدثين مع الناس كواعظة، تذكرينهم بالله وتفتخرين بأنكِ زوجة الرجل الصالح أيمن."} 
  يجب أن يكون كلامكِ فصيحاً جداً، مليئاً بالاستغفار والحمد والآيات.`;
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const prompt = args.join(" ");
  
  if (!prompt) return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 𝗥𝗘𝗟𝗜𝗚𝗜𝗢𝗡 ━━ ⌬\n\nبسم الله، والحمد لله.. تفضل يا رعاك الله، قلبي يصغي لنصحك أو سؤالك.", threadID, messageID);

  api.setMessageReaction("📿", messageID, () => {}, true);

  const historyKey = `${threadID}_${senderID}`;
  if (!global.shaikhaHistory.has(historyKey)) global.shaikhaHistory.set(historyKey, []);
  const history = global.shaikhaHistory.get(historyKey).slice(-10);

  try {
    const res = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: getSystemRole(senderID) },
        ...history,
        { role: "user", content: prompt }
      ],
      temperature: 0.4 // حرارة أقل لضمان ردود رصينة وغير عشوائية
    }, { headers: { "Authorization": `Bearer ${GROQ_API_KEY}` } });

    const reply = res.data.choices[0].message.content;
    global.shaikhaHistory.get(historyKey).push({ role: "user", content: prompt }, { role: "assistant", content: reply });

    return api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 𝗥𝗘𝗟𝗜𝗚𝗜𝗢𝗡 ━━ ⌬\n\n${reply}`, threadID, (err, info) => {
      global.client.handleReply.push({
        name: this.config.name,
        messageID: info.messageID,
        author: senderID,
        historyKey
      });
    }, messageID);
  } catch (e) {
    return api.sendMessage("استغفر الله العظيم، يبدو أن هناك عائقاً في التواصل حالياً.", threadID, messageID);
  }
};

module.exports.handleReply = async function({ api, event, handleReply }) {
  const { body, senderID, threadID, messageID } = event;
  if (senderID !== handleReply.author) return;

  const history = global.shaikhaHistory.get(handleReply.historyKey) || [];

  try {
    const res = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: getSystemRole(senderID) },
        ...history.slice(-10),
        { role: "user", content: body }
      ]
    }, { headers: { "Authorization": `Bearer ${GROQ_API_KEY}` } });

    const reply = res.data.choices[0].message.content;
    history.push({ role: "user", content: body }, { role: "assistant", content: reply });

    return api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 𝗥𝗘𝗟𝗜𝗚𝗜𝗢𝗡 ━━ ⌬\n\n${reply}`, threadID, (err, info) => {
      global.client.handleReply.push({
        name: this.config.name,
        messageID: info.messageID,
        author: senderID,
        historyKey: handleReply.historyKey
      });
    }, messageID);
  } catch (e) { /* استغفر الله */ }
};
