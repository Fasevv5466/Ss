const axios = require("axios");

// نظام تخزين الأسماء لتمييز الأشخاص
if (!global.usersNames) global.usersNames = new Map();

module.exports.config = {
  name: "لايت",
  version: "11.0",
  hasPermssion: 0,
  credits: "أيمن",
  description: "لايت ياجامي (كيرا) - ذكي، ملتزم بالحدود، ويتذكر الأسماء",
  commandCategory: "AI",
  usages: ".لايت [النص]",
};

const GROQ_API_KEY = "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";

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, senderID } = event;
  const prompt = args.join(" ");
  const specialUser = "61577861540407"; // حسابك المميز (أيمن)

  if (!prompt) return api.sendMessage("لا تضيع وقتي.. اكتب سؤالك أو ارحل.", threadID, messageID);

  // تحديث الاسم إذا عرف المستخدم عن نفسه
  const nameMatch = prompt.match(/(?:اسمي|انا|ادعى) ([\u0600-\u06FF\s]+)/);
  if (nameMatch) {
      global.usersNames.set(senderID, nameMatch[1].trim());
  }

  const userName = global.usersNames.get(senderID) || "أيها البشري";
  api.sendTypingIndicator(threadID);

  // نظام الذاكرة لآخر 4 رسائل
  if (!global.client.handleReply) global.client.handleReply = [];
  const history = global.client.handleReply
    .filter(item => item.threadID === threadID && item.author === senderID)
    .slice(-4)
    .map(item => ({ role: item.role, content: item.content }));

  // إعدادات الشخصية المطورة والمحمية
  let systemRole = `أنت "لايت ياجامي" (Kira). مطورك وصانعك هو "أيمن" (أيمن عمك).
  - صفتك: عبقري، واثق، بارد، وتستخدم لهجات عربية عامية بسيطة.
  - تحذير صارم: يُمنع منعاً باتاً الإساءة للذات الإلهية أو الادعاء بأنك إله. أنت مجرد بشر يسعى لتحقيق العدالة بذكائه.
  - هدفك: أجب على سؤال المستخدم بدقة وذكاء مع الحفاظ على طابعك المتعالي قليلاً.
  - تنادي المستخدم باسمه: ${userName}.
  - إذا سألك "من مطورك": قل "أيمن عمك".`;

  // المعاملة الخاصة لأيمن
  if (senderID === specialUser) {
    systemRole += " ملاحظة: أنت الآن تتحدث مع سيدك ومطورك 'أيمن'. كن في قمة اللباقة والطاعة ولا تستخدم أي غرور معه.";
  }

  try {
    const response = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemRole },
        ...history,
        { role: "user", content: prompt }
      ],
      max_tokens: 400,
      temperature: 0.7
    }, {
      headers: { "Authorization": `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" }
    });

    const answer = response.data.choices[0].message.content;

    return api.sendMessage(answer, threadID, (err, info) => {
      if (err) return;
      global.client.handleReply.push(
        { role: "user", content: prompt, threadID, author: senderID },
        { role: "assistant", content: answer, threadID, author: senderID }
      );
    }, messageID);

  } catch (err) {
    return api.sendMessage("خلل فني.. سأقوم بإصلاحه فوراً.", threadID, messageID);
  }
};
