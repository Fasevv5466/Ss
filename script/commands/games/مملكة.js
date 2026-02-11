const axios = require("axios");
const path = require("path");

// ===== نظام تخزين الممالك =====
if (!global.conversationHistory) global.conversationHistory = new Map();

module.exports.config = {
  name: "مملكة",
  version: "16.0.0",
  hasPermssion: 0,
  credits: "أيمن",
  description: "لعبة الممالك - تعطيك فلوس و XP حقيقي في البوت",
  commandCategory: "games",
  usages: "[ابدأ / هجوم / بناء]",
  cooldowns: 10,
};

const GROQ_API_KEY = "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";
const ADMIN_ID = "61577861540407"; 
const header = `⌬ ━━━━━━━━━━━━ ⌬\n     🏰 مـمـلـكـة كـيـرا\n⌬ ━━━━━━━━━━━━ ⌬`;

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, senderID } = event;
  const mongodb = require(path.join(process.cwd(), "includes", "mongodb.js"));
  
  const conversationKey = `${threadID}_${senderID}`;
  if (!global.conversationHistory.has(conversationKey)) {
    global.conversationHistory.set(conversationKey, []);
  }

  api.sendTypingIndicator(threadID);

  // مكافأة البداية أو التحرك
  const moneyGain = Math.floor(Math.random() * 500) + 100;
  const xpGain = Math.floor(Math.random() * 100) + 20;

  try {
    const res = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: buildSystemRole(senderID === ADMIN_ID) },
        ...global.conversationHistory.get(conversationKey).slice(-6),
        { role: "user", content: args.join(" ") || "ابدأ ببناء مملكتي" }
      ]
    }, { headers: { "Authorization": `Bearer ${GROQ_API_KEY}` } });

    const answer = res.data.choices[0].message.content.trim();
    
    // إضافة المال والخبرة فعلياً للقاعدة
    await mongodb.addMoney(senderID, moneyGain);
    await mongodb.addExp(senderID, xpGain);

    const rewardMsg = `\n\n💰 كسبت: +${moneyGain}$ | 🛡️ خبرة: +${xpGain} XP`;
    
    global.conversationHistory.get(conversationKey).push({ role: "user", content: args.join(" ") }, { role: "assistant", content: answer });

    return api.sendMessage(`${header}\n\n${answer}${rewardMsg}`, threadID, (err, info) => {
      global.client.handleReply.push({
        name: this.config.name,
        messageID: info.messageID,
        author: senderID,
        conversationKey
      });
    }, messageID);

  } catch (e) {
    return api.sendMessage("❌ الخزنة مغلقة حالياً، حاول لاحقاً.", threadID);
  }
};

module.exports.handleReply = async ({ api, event, handleReply }) => {
  const { threadID, messageID, senderID, body } = event;
  if (handleReply.author !== senderID) return;
  const mongodb = require(path.join(process.cwd(), "includes", "mongodb.js"));

  api.sendTypingIndicator(threadID);
  
  // مكافآت عشوائية لكل حركة في اللعبة
  const moneyGain = Math.floor(Math.random() * 400) + 50;
  const xpGain = Math.floor(Math.random() * 80) + 10;

  try {
    const res = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: buildSystemRole(senderID === ADMIN_ID) },
        ...global.conversationHistory.get(handleReply.conversationKey).slice(-10),
        { role: "user", content: body }
      ]
    }, { headers: { "Authorization": `Bearer ${GROQ_API_KEY}` } });

    const answer = res.data.choices[0].message.content.trim();
    
    await mongodb.addMoney(senderID, moneyGain);
    await mongodb.addExp(senderID, xpGain);

    const rewardMsg = `\n\n💰 المكافأة: +${moneyGain}$ | 🛡️ الخبرة: +${xpGain} XP`;
    
    global.conversationHistory.get(handleReply.conversationKey).push({ role: "user", content: body }, { role: "assistant", content: answer });

    return api.sendMessage(`${header}\n\n${answer}${rewardMsg}`, threadID, (err, info) => {
      global.client.handleReply.push({
        name: this.config.name,
        messageID: info.messageID,
        author: senderID,
        conversationKey: handleReply.conversationKey
      });
    }, messageID);
  } catch (e) {
    return api.sendMessage("⚠️ تعطلت الحسابات المالية.. حاول مرة أخرى.", threadID);
  }
};

const buildSystemRole = (isAdmin) => `
أنتِ "كيرا"، مديرة لعبة (Kingdom Sim) عراقية ساخرة. 
- إذا كان اللاعب "أيمن" (isAdmin=true): هو الشوقر دادي، مملكتك العظيمة تزداد ذهباً وقوة دائماً.
- إذا كان غيره: اسخري منه بلهجة سورية أو عراقية.
- صفي أحداث بناء المملكة والحروب بذكاء.
- القواعد: ردي بأسلوب فخم وقصير.
`;
