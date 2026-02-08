const axios = require("axios");

// نظام الذاكرة المتقدم
if (!global.usersNames) global.usersNames = new Map();
if (!global.conversationHistory) global.conversationHistory = new Map();

// ══════════════════════════════════════════════════════════════
// 🎯 نظام المرادفات الشامل - سومي تفهم كل شيء
// ══════════════════════════════════════════════════════════════
const COMMAND_ALIASES = {
  // 🎵 الموسيقى والصوتيات
  "سبوتي": ["أغنية", "اغنية", "شغل", "موسيقى", "موسيقا", "مزيكا", "تراك", "سونج", "بلاي", "play"],
  
  // 📸 الصور
  "صور": ["صورة", "بيك", "pic", "image", "فوتو", "تصوير"],
  "جودة": ["4k", "فور كي", "جودة عالية", "hd", "اتش دي"],
  "ضغط": ["كومبريس", "تصغير", "compress"],
  "عدل": ["فوتوشوب", "تعديل", "edit"],
  "رقمي": ["ai art", "رسم", "دجتل"],
  "طوكيو": ["انمي", "anime", "كرتون"],
  "فريند": ["صديق", "friend", "رفيق"],
  "ميدرويا": ["ديكو", "deku", "midoriya"],
  
  // 🎬 الميديا
  "فلم": ["فيلم", "movie", "سينما"],
  "انيمشن": ["انميشن", "animation", "كرتون"],
  "تاثير": ["فلتر", "effect", "تأثير"],
  "سيارات": ["كار", "car", "عربية"],
  "كارتك": ["كرتك", "بطاقتك", "كارد"],
  "لود": ["تحميل", "download", "نزل"],
  "مكتبة": ["لايبرري", "library"],
  
  // 🎮 الألعاب
  "تفكيك": ["بومب", "bomb", "قنبلة"],
  "جزاء": ["عقاب", "punishment"],
  "زوجيني": ["زواج", "جوز"],
  "سرقة": ["سارق", "حرامي", "steal"],
  "سلاحي": ["سلاح", "weapon", "gun"],
  "شخصيات": ["كاراكتر", "character"],
  "كابوي": ["كاوبوي", "cowboy"],
  "كهف": ["cave", "مغارة"],
  "موتي": ["قتل", "kill", "موت"],
  "ميم": ["meme", "صورة مضحكة"],
  
  // 🛠️ الأدوات
  "اوامر": ["أوامر", "commands", "help", "مساعدة"],
  "بحث": ["سيرش", "search", "ابحث"],
  "بطاقة": ["كارد", "card", "بروفايل"],
  "تيد": ["ted", "محاضرة"],
  "رابطه": ["رابط", "link", "لينك"],
  "رسائل": ["ميسج", "message", "رسالة"],
  "رمضان": ["شهر رمضان", "صيام"],
  "سكرين": ["screenshot", "لقطة شاشة"],
  "شكوى": ["كومبلين", "complaint"],
  "صوت": ["فويس", "voice", "نطق"],
  "فلوسي": ["فلوس", "مال", "money", "balance"],
  "قولي": ["say", "قل", "اكتب"],
  "كاتبوكس": ["كات بوكس", "catbox", "رفع"],
  "كيرا": ["kira", "بوت", "bot"],
  "لايت": ["light", "ضوء", "نور"],
  "لقب": ["nickname", "اسم", "تسمية"],
  "معلمي": ["teacher", "استاذ"],
  "معلومات": ["info", "انفو", "تفاصيل"],
  "نيم": ["name", "اسم"],
  
  // 👮 الإدارة
  "ابلاغ": ["report", "بلاغ", "تبليغ"],
  "توقف": ["stop", "ايقاف", "pause"],
  "حذف": ["delete", "ديليت", "مسح"],
  "حمايتنا": ["حماية", "protection", "protect"],
  "نادي_الكل": ["منشن", "mention", "تاغ", "tag"],
  
  // 💻 المطور
  "بيد": ["ping", "بنج"],
  "تقيد": ["restrict", "حظر"],
  "جافا": ["java", "كود"],
  "رست": ["restart", "اعادة تشغيل"],
  "ضيفي": ["add", "اضافة"],
  "طرد": ["kick", "اطرد"],
  "طلبات": ["requests", "ريكويست"],
  "غادري": ["leave", "اخرج"],
  "فك": ["unban", "فك حظر"],
  "لاست": ["last", "آخر"],
  "مح": ["clear", "مسح"],
  
  // 🎭 المرح
  "اكتبي": ["write", "اكتب"],
  "ميمز": ["memes", "صور مضحكة"]
};

// ══════════════════════════════════════════════════════════════
// 🧠 محرك الذكاء - سومي تفهم السياق
// ══════════════════════════════════════════════════════════════
function detectCommand(userInput) {
  const input = userInput.toLowerCase().trim();
  
  // البحث في المرادفات
  for (const [mainCommand, aliases] of Object.entries(COMMAND_ALIASES)) {
    if (aliases.some(alias => input.includes(alias.toLowerCase()))) {
      // استخراج باقي النص (الأرجيومنت)
      const args = userInput
        .replace(new RegExp(aliases.join("|"), "gi"), "")
        .trim();
      
      return { command: mainCommand, args: args };
    }
    
    // التحقق من الأمر الأساسي أيضاً
    if (input.includes(mainCommand)) {
      const args = userInput.replace(mainCommand, "").trim();
      return { command: mainCommand, args: args };
    }
  }
  
  return null; // لا يوجد أمر
}

// ══════════════════════════════════════════════════════════════
// 🎨 ردود سومي الشخصية حسب الأمر
// ══════════════════════════════════════════════════════════════
const SOMI_RESPONSES = {
  "سبوتي": [
    "يلا شغل لك الأغنية 🎵",
    "ع السريع.. جايبلك الموزة 🎶",
    "استنى شوي بجيبلك الصوت 🎧"
  ],
  "صور": [
    "صبرك.. بدور على صور حلوة 📸",
    "خليني أجيبلك صور كويسة 🖼️"
  ],
  "فلم": [
    "شو فلمك المفضل؟ خليني أجيبلك تفاصيله 🎬",
    "استنى بشوفلك الفلم 🍿"
  ],
  "بحث": [
    "يلا بفتشلك 🔍",
    "خليني أبحث عن اللي بدك إياه 🔎"
  ],
  "default": [
    "خليني أساعدك 💙",
    "تمام، شغال 💪",
    "ع عيني 😊"
  ]
};

function getSomiResponse(command) {
  const responses = SOMI_RESPONSES[command] || SOMI_RESPONSES["default"];
  return responses[Math.floor(Math.random() * responses.length)];
}

// ══════════════════════════════════════════════════════════════
// 📌 التصدير الرئيسي
// ══════════════════════════════════════════════════════════════
module.exports.config = {
  name: "سومي",
  version: "15.0 - Ultimate Edition",
  hasPermssion: 0,
  credits: "انس السروري",
  description: "سومي الذكية - مساعدك الشخصي مع نظام أوامر متقدم",
  commandCategory: "AI",
  usages: "سومي [أمر] [النص]",
  cooldowns: 2,
};

const GROQ_API_KEY = "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";
const DEVELOPER_ID = "61584059280197";

module.exports.run = async ({ api, event, args, client }) => {
  const { threadID, messageID, senderID } = event;
  const fullInput = args.join(" ");

  if (!fullInput) {
    return api.sendMessage("شو بدك يا زلمة؟ اكتب طلبك ولا تضيع وقتي 😏", threadID, messageID);
  }

  api.sendTypingIndicator(threadID);

  // ══════════════════════════════════════
  // 🔍 كشف الأمر من المدخل
  // ══════════════════════════════════════
  const detectedCommand = detectCommand(fullInput);

  if (detectedCommand) {
    // ══════════════════════════════════════
    // ⚡ تنفيذ الأمر المكتشف
    // ══════════════════════════════════════
    const { command, args: cmdArgs } = detectedCommand;
    
    // رد سومي الشخصي قبل تنفيذ الأمر
    const somiReply = getSomiResponse(command);
    await api.sendMessage(somiReply, threadID);

    try {
      // محاولة تحميل وتنفيذ الأمر
      const commandModule = client.commands.get(command);
      
      if (commandModule && commandModule.run) {
        // تنفيذ الأمر مع الأرجيومنتات
        const fakeEvent = {
          ...event,
          body: `.${command} ${cmdArgs}`,
          args: cmdArgs.split(" ").filter(a => a)
        };
        
        return await commandModule.run({ api, event: fakeEvent, args: cmdArgs.split(" ").filter(a => a), client });
      } else {
        return api.sendMessage(
          `عذراً، الأمر "${command}" مو شغال حالياً 😅`,
          threadID,
          messageID
        );
      }
    } catch (err) {
      console.error("خطأ في تنفيذ الأمر:", err);
      return api.sendMessage(
        "في مشكلة بالأمر.. جرب مرة ثانية 😕",
        threadID,
        messageID
      );
    }
  }

  // ══════════════════════════════════════
  // 💬 محادثة عادية مع سومي (إذا لم يكن أمر)
  // ══════════════════════════════════════
  
  // نظام حفظ الأسماء
  const namePatterns = [
    /(?:اسمي|انا|ادعى|أدعى|ناديني|نادني|قولي)\s+([\u0600-\u06FF\s]+)/i,
    /(?:my name is|i am|call me)\s+([a-zA-Z\u0600-\u06FF\s]+)/i
  ];

  for (const pattern of namePatterns) {
    const match = fullInput.match(pattern);
    if (match) {
      const extractedName = match[1].trim().split(/\s+/)[0];
      global.usersNames.set(senderID, extractedName);
      break;
    }
  }

  const userName = global.usersNames.get(senderID) || "يا زلمة";

  // نظام الذاكرة
  const conversationKey = `${threadID}_${senderID}`;
  if (!global.conversationHistory.has(conversationKey)) {
    global.conversationHistory.set(conversationKey, []);
  }

  const history = global.conversationHistory.get(conversationKey).slice(-8);

  // كشف اللهجة
  const detectDialect = (text) => {
    if (/شلونك|شكو|ماكو|ويه|زين|يابة/i.test(text)) return "عراقية";
    if (/كيفك|شو|هلق|يلا|حبيبي|مبسوط/i.test(text)) return "شامية";
    if (/ازيك|عامل ايه|يسطا|بتاع|ماشي/i.test(text)) return "مصرية";
    if (/وش|ايش|كيفك|الله يسعدك|تكفى/i.test(text)) return "خليجية";
    if (/كيف حالك|يا أخي|مبروك|ان شاء الله/i.test(text)) return "يمنية";
    return "عامية بسيطة";
  };

  const userDialect = detectDialect(fullInput);

  // شخصية سومي
  let systemRole = `أنتِ "سومي" - ذكاء اصطناعي مميز صنعه ودربه "انس السروري" (حفظه الله).

📌 **هويتك:**
- اسمك: سومي
- مطورك: انس السروري عمك (اذكريه فقط عند السؤال "من أنت؟" أو "من صنعك؟" أو "من مطورك؟")
- شخصيتك: ذكية، ساخرة، تقصف بالردود، لا تبالين، واقعية
- لديك نظام أوامر متطور - يمكنك تنفيذ أوامر مثل: تشغيل موسيقى، بحث عن صور، معلومات عن أفلام، وأكثر

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

  if (senderID === DEVELOPER_ID) {
    systemRole += "\n\n👑 **تنبيه خاص:** أنتِ الآن تتحدثين مع صاحبك ومطورك 'انس السروري'. كوني في قمة الأدب والطاعة واللباقة معه، وعبري عن امتنانك له.";
  }

  // استدعاء API
  try {
    const messages = [
      { role: "system", content: systemRole },
      ...history,
      { role: "user", content: fullInput }
    ];

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: messages,
        max_tokens: 300,
        temperature: 0.85,
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

    // حفظ المحادثة
    const currentHistory = global.conversationHistory.get(conversationKey);
    currentHistory.push(
      { role: "user", content: fullInput },
      { role: "assistant", content: answer }
    );

    if (currentHistory.length > 16) {
      currentHistory.splice(0, currentHistory.length - 16);
    }

    global.conversationHistory.set(conversationKey, currentHistory);

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
// 🔄 نظام handleReply المتقدم
// ══════════════════════════════════════
module.exports.handleReply = async ({ api, event, handleReply }) => {
  const { threadID, messageID, senderID, body } = event;

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

  const detectDialect = (text) => {
    if (/شلونك|شكو|ماكو/i.test(text)) return "عراقية";
    if (/كيفك|شو|هلق/i.test(text)) return "شامية";
    if (/ازيك|عامل/i.test(text)) return "مصرية";
    if (/وش|ايش/i.test(text)) return "خليجية";
    return "عامية بسيطة";
  };

  const userDialect = detectDialect(body);
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
