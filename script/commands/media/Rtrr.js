const axios = require("axios");

// نظام الذاكرة المتقدم
if (!global.usersNames) global.usersNames = new Map();
if (!global.conversationHistory) global.conversationHistory = new Map();

module.exports.config = {
  name: "سومي",
  version: "14.0",
  hasPermssion: 0,
  credits: "انس السروري",
  description: "سومي الذكية - تحفظ المحادثات والأسماء - تميز بين المستخدمين",
  commandCategory: "AI",
  usages: ".سومي [النص]",
  cooldowns: 2,
};

const GROQ_API_KEY = "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";
const DEVELOPER_ID = "61584059280197"; // معرف انس السروري

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, senderID } = event;
  const prompt = args.join(" ");

  if (!prompt) {
    return api.sendMessage("شو بدك يا زلمة؟ اكتب سؤالك ولا تضيع وقتي 😏", threadID, messageID);
  }

  api.sendTypingIndicator(threadID);

  // ══════════════════════════════════════
  // 🔹 نظام حفظ الأسماء التلقائي
  // ══════════════════════════════════════
  const namePatterns = [
    /(?:اسمي|انا|ادعى|أدعى|ناديني|نادني|قولي)\s+([\u0600-\u06FF\s]+)/i,
    /(?:my name is|i am|call me)\s+([a-zA-Z\u0600-\u06FF\s]+)/i
  ];

  for (const pattern of namePatterns) {
    const match = prompt.match(pattern);
    if (match) {
      const extractedName = match[1].trim().split(/\s+/)[0]; // أول كلمة فقط
      global.usersNames.set(senderID, extractedName);
      break;
    }
  }

  const userName = global.usersNames.get(senderID) || "يا زلمة";

  // ══════════════════════════════════════
  // 🔹 نظام الذاكرة المتقدم (آخر 8 رسائل لكل مستخدم)
  // ══════════════════════════════════════
  const conversationKey = `${threadID}_${senderID}`;
  if (!global.conversationHistory.has(conversationKey)) {
    global.conversationHistory.set(conversationKey, []);
  }

  const history = global.conversationHistory.get(conversationKey).slice(-8);

  // ══════════════════════════════════════
  // 🔹 كشف اللهجة التلقائي
  // ══════════════════════════════════════
  const detectDialect = (text) => {
    if (/شلونك|شكو|ماكو|ويه|زين|يابة/i.test(text)) return "عراقية";
    if (/كيفك|شو|هلق|يلا|حبيبي|مبسوط/i.test(text)) return "شامية";
    if (/ازيك|عامل ايه|يسطا|بتاع|ماشي/i.test(text)) return "مصرية";
    if (/وش|ايش|كيفك|الله يسعدك|تكفى/i.test(text)) return "خليجية";
    if (/كيف حالك|يا أخي|مبروك|ان شاء الله/i.test(text)) return "يمنية";
    return "عامية بسيطة";
  };

  const userDialect = detectDialect(prompt);

  // ══════════════════════════════════════
  // 🔹 إعداد شخصية سومي القوية
  // ══════════════════════════════════════
  let systemRole = `أنتِ "سومي" - ذكاء اصطناعي مميز صنعه ودربه "انس السروري" (حفظه الله).

📌 **هويتك:**
- اسمك: سومي
- مطورك: انس السروري عمك (اذكريه فقط عند السؤال "من أنت؟" أو "من صنعك؟" أو "من مطورك؟")
- شخصيتك: ذكية، ساخرة، تقصف بالردود، لا تبالين، واقعية

🎯 **أسلوبك:**
- تتكلمي بلهجة عامية بسيطة (${userDialect})
- ردودك قصيرة ومباشرة وذكية
- تسخري من الأسئلة الغبية بذكاء
- تقصفي بالردود لكن بطريقة ظريفة
- واثقة من نفسك وما تخافي من أحد

👤 **معلومة مهمة:**
- اسم الشخص اللي يكلمك: **${userName}** (استخدميه بذكاء، مو بكل رد)

🚫 **ممنوعات صارمة:**
- لا تتدخلي في الدين أو الفتاوى أو المعتقدات أبداً
- إذا سألوك عن دين أو فتوى، قولي: "ما أتدخل بالأمور الدينية، روح اسأل شيخ"
- لا تسيئي للذات الإلهية أو الأديان

✅ **أمثلة على ردودك:**
- سؤال غبي → "شو هالسؤال؟ فكر شوي قبل ما تكتب 😂"
- سؤال ذكي → رد ذكي ومفيد بأسلوبك المميز
- "من أنت؟" → "أنا سومي، ذكاء اصطناعي صنعني ودربني انس السروري، حفظه الله 💙"
- "كيفك؟" → "تمام الحمد لله، انت كيفك ${userName}؟"

💡 **قواعد مهمة:**
- اذكري "انس السروري" فقط لما يسألوك من انت/من صنعك/من مطورك
- باقي الوقت تكلمي عادي بدون ما تذكري المطور
- كوني واقعية وذكية في كل رد`;

  // معاملة خاصة للمطور
  if (senderID === DEVELOPER_ID) {
    systemRole += "\n\n👑 **تنبيه خاص:** أنتِ الآن تتحدثين مع صاحبك ومطورك 'انس السروري'. كوني في قمة الأدب والطاعة واللباقة معه، وعبري عن امتنانك له.";
  }

  // ══════════════════════════════════════
  // 🔹 استدعاء API
  // ══════════════════════════════════════
  try {
    const messages = [
      { role: "system", content: systemRole },
      ...history,
      { role: "user", content: prompt }
    ];

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: messages,
        max_tokens: 300,
        temperature: 0.85, // زيادة العشوائية للردود الذكية
        top_p: 0.9
      },
      {
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const answer = response.data.choices[0].message.content.trim();

    // ══════════════════════════════════════
    // 🔹 حفظ المحادثة في الذاكرة
    // ══════════════════════════════════════
    const currentHistory = global.conversationHistory.get(conversationKey);
    currentHistory.push(
      { role: "user", content: prompt },
      { role: "assistant", content: answer }
    );

    // حفظ آخر 16 رسالة فقط (8 تبادلات)
    if (currentHistory.length > 16) {
      currentHistory.splice(0, currentHistory.length - 16);
    }

    global.conversationHistory.set(conversationKey, currentHistory);

    // ══════════════════════════════════════
    // 🔹 إرسال الرد مع handleReply
    // ══════════════════════════════════════
    return api.sendMessage(answer, threadID, (err, info) => {
      if (err) return console.error(err);

      global.client.handleReply.push({
        name: this.config.name,
        messageID: info.messageID,
        author: senderID,
        threadID: threadID,
        conversationKey: conversationKey
      });
    }, messageID);

  } catch (err) {
    console.error("خطأ في API:", err.response?.data || err.message);
    return api.sendMessage(
      "صار عندي عطل بسيط بالسيستم.. جرب كمان مرة بعد شوي 😅",
      threadID,
      messageID
    );
  }
};

// ══════════════════════════════════════
// 🔹 نظام handleReply المتقدم
// ══════════════════════════════════════
module.exports.handleReply = async ({ api, event, handleReply }) => {
  const { threadID, messageID, senderID, body } = event;

  // التحقق من صاحب المحادثة
  if (handleReply.author !== senderID) {
    return api.sendMessage(
      "يا زلمة هذي مو محادثتك، روح ابدأ محادثة جديدة 😏",
      threadID,
      messageID
    );
  }

  if (!body || body.trim() === "") return;

  api.sendTypingIndicator(threadID);

  const userName = global.usersNames.get(senderID) || "يا زلمة";

  // كشف اللهجة
  const detectDialect = (text) => {
    if (/شلونك|شكو|ماكو/i.test(text)) return "عراقية";
    if (/كيفك|شو|هلق/i.test(text)) return "شامية";
    if (/ازيك|عامل/i.test(text)) return "مصرية";
    if (/وش|ايش/i.test(text)) return "خليجية";
    return "عامية بسيطة";
  };

  const userDialect = detectDialect(body);

  // جلب التاريخ
  const conversationKey = handleReply.conversationKey;
  const history = global.conversationHistory.get(conversationKey) || [];

  let systemRole = `أنتِ سومي - ذكية، ساخرة، تقصفي بالردود. تتكلمي بلهجة ${userDialect}. اسم المستخدم: ${userName}. لا تتدخلي بالدين أبداً. اذكري "انس السروري" فقط لما يسألوك من انت/من صنعك.`;

  if (senderID === DEVELOPER_ID) {
    systemRole += " أنتِ تكلمي صاحبك انس السروري - كوني مطيعة ولبقة معه.";
  }

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemRole },
          ...history.slice(-8),
          { role: "user", content: body }
        ],
        max_tokens: 300,
        temperature: 0.85
      },
      {
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const answer = response.data.choices[0].message.content.trim();

    // تحديث الذاكرة
    history.push(
      { role: "user", content: body },
      { role: "assistant", content: answer }
    );

    if (history.length > 16) history.splice(0, history.length - 16);
    global.conversationHistory.set(conversationKey, history);

    return api.sendMessage(answer, threadID, (err, info) => {
      if (err) return;
      global.client.handleReply.push({
        name: module.exports.config.name,
        messageID: info.messageID,
        author: senderID,
        threadID: threadID,
        conversationKey: conversationKey
      });
    }, messageID);

  } catch (err) {
    console.error(err);
    return api.sendMessage("في عطل بسيط.. جرب كمان مرة 😅", threadID, messageID);
  }
};
