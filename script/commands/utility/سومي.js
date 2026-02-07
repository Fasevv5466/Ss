const axios = require("axios");

// نظام الذاكرة لتخزين أسماء المستخدمين
if (!global.usersNames) global.usersNames = new Map();

module.exports.config = {
  name: "سومي",
  version: "13.0",
  hasPermssion: 0,
  credits: "انس السروري",
  description: "سومي الذكية - لا تتدخل في الدين - ذاكرة متطورة",
  commandCategory: "AI",
  usages: ".سومي [النص]",
};

const GROQ_API_KEY = "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";

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, senderID } = event;
  const prompt = args.join(" ");
  const specialUser = "61577861540407"; // حسابك المميز

  if (!prompt) return api.sendMessage("عيونها لسومي.. شو بدك تسألني يا طيب؟", threadID, messageID);

  // نظام كشف وحفظ الأسماء
  const nameMatch = prompt.match(/(?:اسمي|انا|ادعى|ناديني) ([\u0600-\u06FF\s]+)/i);
  if (nameMatch) {
    global.usersNames.set(senderID, nameMatch[1].trim().split(" ")[0]);
  }

  const userName = global.usersNames.get(senderID) || "يا طيب";
  api.sendTypingIndicator(threadID);

  // سياق المحادثة (آخر 4 رسائل)
  if (!global.client.handleReply) global.client.handleReply = [];
  const history = global.client.handleReply
    .filter(item => item.threadID === threadID && item.author === senderID)
    .slice(-4)
    .map(item => ({ role: item.role, content: item.content }));

  // إعداد الشخصية والقيود الصارمة
  let systemRole = `أنتِ "سومي" (SOMI). هويتك: 'أنا سومي الشهيرة زوجة انس'.
  - مطورك وصانعك: 'انس السروري عمك'.
  - أسلوب الرد: ذكي، عامي (شامي، عراقي، يمني، مصري)، ومميز.
  - قيد ديني صارم: يُمنع منعاً باتاً التدخل في الدين، أو إصدار فتاوى، أو نقاش المعتقدات الدينية، أو الإساءة للذات الإلهية. إذا سُئلتِ عن الدين، اعتذري بلباقة وقولي أنكِ لا تتدخلين في هذه الأمور.
  - أنتِ تعرفين أن اسم الشخص الذي يحادثك هو: ${userName}.
  - كوني ذكية وقدمي إجابات مفيدة في المجالات الأخرى بطابعك الخاص.`;

  if (senderID === specialUser) {
    systemRole += " ملاحظة: أنتِ الآن تتحدثين مع صاحبك 'انس'. كوني مطيعة جداً ولبقة معه لأقصى حد.";
  }

  try {
    const response = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemRole },
        ...history,
        { role: "user", content: prompt }
      ],
      max_tokens: 500,
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
    return api.sendMessage("صار عندي عطل بسيط بالسيستم.. ارجع جرب كمان شوي.", threadID, messageID);
  }
};
