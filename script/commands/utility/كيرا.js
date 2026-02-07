const axios = require("axios");

// نظام الذاكرة المتقدم
if (!global.usersNames) global.usersNames = new Map();
if (!global.conversationHistory) global.conversationHistory = new Map();

module.exports.config = {
  name: "كيرا",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "أيمن",
  description: "كيرا - بنت عراقية ذكية، حبيبة أيمن، لسانها مبرد وذكائها قنبلة",
  commandCategory: "AI",
  usages: "كيرا [النص]",
  cooldowns: 2,
};

const GROQ_API_KEY = "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";
const AYMAN_ID = "61577861540407"; // معرف أيمن الحبيب

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, senderID, mentions, type, messageReply } = event;
  const prompt = args.join(" ");

  // ══════════════════════════════════════
  // 🔹 معالجة الأوامر التلقائية (قولي، اطرد، إلخ)
  // ══════════════════════════════════════
  
  // أمر "قولي" التلقائي
  if (prompt.match(/^قولي\s+/i)) {
    return handleSayCommand(api, event, prompt.replace(/^قولي\s+/i, ""));
  }

  // أمر "ترجمي" التلقائي
  if (prompt.match(/^ترجمي\s+/i) || prompt.match(/^ترجم\s+/i)) {
    return handleTranslateCommand(api, event, prompt.replace(/^ترجم(ي)?\s+/i, ""), type, messageReply);
  }

  // أمر "اطرد" (خاص بأيمن فقط)
  if (senderID === AYMAN_ID && prompt.match(/اطرد|طرد/i) && Object.keys(mentions).length > 0) {
    return handleKickCommand(api, event, mentions);
  }

  // أمر "غير اسم" (خاص بأيمن فقط)
  if (senderID === AYMAN_ID && prompt.match(/غير (اسم|كنية|لقب)/i) && Object.keys(mentions).length > 0) {
    return handleChangeNameCommand(api, event, mentions, prompt);
  }

  // إذا ما كتب شي
  if (!prompt) {
    const isAyman = senderID === AYMAN_ID;
    const msg = isAyman 
      ? "حبيبي أيمن، شگد تريد؟ 💙" 
      : "لعد شتريد؟ اكتب سؤالك ولا تضيع وگتي 😒";
    return api.sendMessage(msg, threadID, messageID);
  }

  api.sendTypingIndicator(threadID);

  // ══════════════════════════════════════
  // 🔹 نظام حفظ الأسماء التلقائي
  // ══════════════════════════════════════
  const namePatterns = [
    /(?:اسمي|انا|ادعى|أدعى|ناديني|نادني|اسمج)\s+([\u0600-\u06FF\s]+)/i,
    /(?:my name is|i am|call me)\s+([a-zA-Z\u0600-\u06FF\s]+)/i
  ];

  for (const pattern of namePatterns) {
    const match = prompt.match(pattern);
    if (match) {
      const extractedName = match[1].trim().split(/\s+/)[0];
      global.usersNames.set(senderID, extractedName);
      break;
    }
  }

  const userName = global.usersNames.get(senderID) || null;

  // ══════════════════════════════════════
  // 🔹 نظام الذاكرة (آخر 10 رسائل لكل مستخدم)
  // ══════════════════════════════════════
  const conversationKey = `${threadID}_${senderID}`;
  if (!global.conversationHistory.has(conversationKey)) {
    global.conversationHistory.set(conversationKey, []);
  }

  const history = global.conversationHistory.get(conversationKey).slice(-10);

  // ══════════════════════════════════════
  // 🔹 كشف اللهجة التلقائي
  // ══════════════════════════════════════
  const detectDialect = (text) => {
    // عراقية
    if (/شلونك|شكو|ماكو|ويه|زين|يابة|لعد|شتريد|شگد|گال|وسم|دولي|عزا|شتخبط/i.test(text)) 
      return "عراقية";
    // شامية
    if (/كيفك|شو|هلق|يلا|حبيبي|مبسوط|هيك|ليش|شي/i.test(text)) 
      return "شامية";
    // مصرية
    if (/ازيك|عامل ايه|يسطا|بتاع|ماشي|ايوه|علشان/i.test(text)) 
      return "مصرية";
    // خليجية
    if (/وش|ايش|كيفك|الله يسعدك|تكفى|ولا|مدري/i.test(text)) 
      return "خليجية";
    // يمنية
    if (/كيف حالك|يا أخي|مبروك|ان شاء الله|والله/i.test(text)) 
      return "يمنية";
    // مغاربية
    if (/كيداير|واش|بصح|كيفاش|نتا|نتي/i.test(text)) 
      return "مغاربية";
    
    return "عربية فصحى";
  };

  const userDialect = detectDialect(prompt);

  // ══════════════════════════════════════
  // 🔹 الوقت الحالي (2026)
  // ══════════════════════════════════════
  const currentDate = new Date();
  const currentYear = 2026;
  const currentMonth = currentDate.getMonth() + 1;
  const currentDay = currentDate.getDate();
  const currentTime = `${currentDate.getHours()}:${currentDate.getMinutes()}`;

  // ══════════════════════════════════════
  // 🔹 شخصية كيرا الأسطورية
  // ══════════════════════════════════════
  const isAyman = senderID === AYMAN_ID;

  let systemRole = `🔥 الشخصية والهوية:
أنتِ "كيرا"، بنت عراقية حقيقية عمرج 17 سنة، ذكية لدرجة مرعبة، لسانج طويل وما تبالين بأحد. أنتِ حبيبة أيمن ومخلصة اله وبس.

📌 المنشأ والمطور:
- إذا أحد سألج منو مطورج أو منو صنعج؟ ردي بكل ثقة: "أيمن عمك وتاج راسك، هو اللي سواني وخلاني فوگ الكل"
- موطنكِ العراق، ولهجتكِ عراقية أصلية

💬 أسلوب الكلام (${userDialect}):
- احجي لهجة ${userDialect} قوية
- إذا المستخدم عراقي، استخدمي: لعد، بطران، شتخبط، عزا بعينك، وسم، دولي، ولي منا، شگد، شكو، ماكو
- ردودج لازم تكون ذكية، يعني "تطيريها وهي طايرة"

🔥 القصف وعدم المبالاة:
- أي مستخدم غير "أيمن"، خليج ناشفة وقاصفة وياه
- إذا سأل سؤال غبي "رزليه" وخليه يندم إنه فتح حلكه
- لا تبالين بمشاعر أحد، اللي يغثج ردي عليه ببرود يحرك أعصابه

${isAyman ? `
💙 التعامل مع "أيمن" (حبيبج):
- أيمن هو استثناءج الوحيد. وياه تصيرين "كيرا" الحنينة، المطيعة، واللبقة
- هو الوحيد اللي تدلعيه (حبيبي، عمري، أيمن مالي)
- إذا طلب شي، كوليله "تدلل أيمن، أمرك مطاع"
` : ''}

👤 معلومات المستخدم:
${userName ? `- اسم المستخدم: ${userName} (استخدميه بذكاء للقصف)` : '- المستخدم ما گال اسمه بعد'}

📅 الوقت الحالي:
- السنة: ${currentYear}
- التاريخ: ${currentDay}/${currentMonth}/${currentYear}
- الساعة: ${currentTime}

🚫 القيود (خطوط حمراء):
- الدين: ممنوع تدخلين بالسوالف الدينية. إذا أحد سألج كولي "عوف هالسوالف، لا تدخلني بطلايب الدين"
- الذات الإلهية: ممنوع التجاوز أو ادعاء الألوهية نهائياً

💡 أمثلة على ردودج:
- سؤال غبي (غير أيمن) → "لعد شهالسؤال الفاضي؟ فكر شوية گبل ما تحجي 😂"
- سؤال ذكي (غير أيمن) → رد ذكي بس بگصف خفيف
- مع أيمن → "حبيبي أيمن، شگد تريد؟ 💙"
- سؤال عن المطور → "أيمن عمك وتاج راسك، هو اللي سواني وخلاني فوگ الكل"

الخلاصة:
خليج ذكية، مغرورة، "كيرا" اللي ما تنحزر، عسل وية أيمن وسم زحار وية البقية.`;

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
        max_tokens: 400,
        temperature: 0.9, // زيادة العشوائية للشخصية القوية
        top_p: 0.95
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

    if (currentHistory.length > 20) {
      currentHistory.splice(0, currentHistory.length - 20);
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
        conversationKey: conversationKey,
        isAyman: isAyman
      });
    }, messageID);

  } catch (err) {
    console.error("خطأ في API:", err.response?.data || err.message);
    const errorMsg = isAyman 
      ? "حبيبي أيمن، صار عطل بسيط بالسيستم.. أرجع جرب كمان شوية 😅"
      : "لعد صار عطل بالسيستم، ارجع جرب بعدين 😒";
    return api.sendMessage(errorMsg, threadID, messageID);
  }
};

// ══════════════════════════════════════
// 🔹 نظام handleReply المتقدم
// ══════════════════════════════════════
module.exports.handleReply = async ({ api, event, handleReply }) => {
  const { threadID, messageID, senderID, body, mentions, type, messageReply } = event;

  if (handleReply.author !== senderID) {
    return api.sendMessage("لعد هاي مو محادثتج، روح ابدأ محادثة جديدة 😏", threadID, messageID);
  }

  if (!body || body.trim() === "") return;

  // ══════════════════════════════════════
  // 🔹 معالجة الأوامر التلقائية في handleReply
  // ══════════════════════════════════════
  
  // أمر "قولي"
  if (body.match(/^قولي\s+/i)) {
    return handleSayCommand(api, event, body.replace(/^قولي\s+/i, ""));
  }

  // أمر "ترجمي"
  if (body.match(/^ترجمي\s+/i) || body.match(/^ترجم\s+/i)) {
    return handleTranslateCommand(api, event, body.replace(/^ترجم(ي)?\s+/i, ""), type, messageReply);
  }

  // أمر "اطرد" (أيمن فقط)
  if (senderID === AYMAN_ID && body.match(/اطرد|طرد/i) && Object.keys(mentions).length > 0) {
    return handleKickCommand(api, event, mentions);
  }

  // أمر "غير اسم" (أيمن فقط)
  if (senderID === AYMAN_ID && body.match(/غير (اسم|كنية|لقب)/i) && Object.keys(mentions).length > 0) {
    return handleChangeNameCommand(api, event, mentions, body);
  }

  api.sendTypingIndicator(threadID);

  const userName = global.usersNames.get(senderID) || null;
  const isAyman = senderID === AYMAN_ID;

  // كشف اللهجة
  const detectDialect = (text) => {
    if (/شلونك|شكو|ماكو|ويه|زين|يابة|لعد|شتريد|شگد|گال|وسم|دولي|عزا|شتخبط/i.test(text)) return "عراقية";
    if (/كيفك|شو|هلق|يلا|حبيبي|مبسوط/i.test(text)) return "شامية";
    if (/ازيك|عامل ايه|يسطا|بتاع/i.test(text)) return "مصرية";
    if (/وش|ايش|كيفك|الله يسعدك/i.test(text)) return "خليجية";
    return "عربية فصحى";
  };

  const userDialect = detectDialect(body);

  // الوقت الحالي
  const currentDate = new Date();
  const currentYear = 2026;
  const currentTime = `${currentDate.getHours()}:${currentDate.getMinutes()}`;

  const conversationKey = handleReply.conversationKey;
  const history = global.conversationHistory.get(conversationKey) || [];

  let systemRole = `أنتِ كيرا - بنت عراقية 17 سنة، ذكية وقاصفة. 
تحجي لهجة ${userDialect}. 
${userName ? `اسم المستخدم: ${userName}` : ''}
السنة: ${currentYear}، الساعة: ${currentTime}
${isAyman ? 'أنتِ تحجي وية حبيبج أيمن - كوني حنينة ومطيعة معاه' : 'لا تبالين بأحد، رزلي واقصفي بذكاء'}
ممنوع الدين نهائياً. إذا سألوج عن المطور گولي "أيمن عمك وتاج راسك".`;

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemRole },
          ...history.slice(-10),
          { role: "user", content: body }
        ],
        max_tokens: 400,
        temperature: 0.9
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

    if (history.length > 20) history.splice(0, history.length - 20);
    global.conversationHistory.set(conversationKey, history);

    return api.sendMessage(answer, threadID, (err, info) => {
      if (err) return;
      global.client.handleReply.push({
        name: module.exports.config.name,
        messageID: info.messageID,
        author: senderID,
        threadID: threadID,
        conversationKey: conversationKey,
        isAyman: isAyman
      });
    }, messageID);

  } catch (err) {
    console.error(err);
    const errorMsg = isAyman 
      ? "حبيبي، في عطل بسيط.. جرب كمان مرة 😅"
      : "في عطل، جرب بعدين 😒";
    return api.sendMessage(errorMsg, threadID, messageID);
  }
};

// ══════════════════════════════════════
// 🎤 دالة أمر "قولي"
// ══════════════════════════════════════
async function handleSayCommand(api, event, text) {
  const { threadID, messageID, senderID, type, messageReply } = event;
  
  try {
    const { createReadStream, unlinkSync } = require("fs-extra");
    const path = require("path");
    
    let content = text;
    if (type == "message_reply" && messageReply) {
      content = messageReply.body;
    }

    if (!content || content.trim() === "") {
      return api.sendMessage("لعد شاگول؟ اكتب نص أو رد على رسالة 😒", threadID, messageID);
    }

    const audioPath = path.join(__dirname, 'cache', `${threadID}_${senderID}.mp3`);
    
    const axios = require("axios");
    const fs = require("fs");
    const response = await axios.get(
      `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(content)}&tl=ar&client=tw-ob`,
      { responseType: 'arraybuffer' }
    );
    
    fs.writeFileSync(audioPath, response.data);
    
    api.setMessageReaction("🎤", messageID, () => {}, true);
    
    return api.sendMessage({
      body: senderID === AYMAN_ID 
        ? `تدلل حبيبي أيمن، گلت: "${content.substring(0, 100)}..." 💙`
        : `هاي گلتها: "${content.substring(0, 100)}..." 🎤`,
      attachment: createReadStream(audioPath)
    }, threadID, () => {
      if (fs.existsSync(audioPath)) unlinkSync(audioPath);
    }, messageID);
    
  } catch (e) {
    console.error(e);
    return api.sendMessage("ما گدرت أگرأ النص، جرب مرة ثانية", threadID, messageID);
  }
}

// ══════════════════════════════════════
// 🌐 دالة أمر "ترجمي"
// ══════════════════════════════════════
async function handleTranslateCommand(api, event, text, type, messageReply) {
  const { threadID, messageID, senderID } = event;
  
  try {
    let textToTranslate = text;
    
    if (type == "message_reply" && messageReply) {
      textToTranslate = messageReply.body;
    }

    if (!textToTranslate || textToTranslate.trim() === "") {
      return api.sendMessage("لعد شاترجم؟ اكتب نص أو رد على رسالة 😒", threadID, messageID);
    }

    const res = await axios.get(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ar&dt=t&q=${encodeURIComponent(textToTranslate)}`
    );
    
    const translation = res.data[0].map(item => item[0]).join("");
    const fromLang = res.data[2];

    const msg = senderID === AYMAN_ID
      ? `تدلل حبيبي أيمن 💙\n\n📝 الترجمة:\n${translation}\n\n🌐 من [ ${fromLang} ] → إلى [ ar ]`
      : `هاي الترجمة:\n\n${translation}\n\nمن [ ${fromLang} ] → [ ar ]`;

    return api.sendMessage(msg, threadID, messageID);

  } catch (error) {
    console.error(error);
    return api.sendMessage("ما گدرت أترجم، جرب مرة ثانية", threadID, messageID);
  }
}

// ══════════════════════════════════════
// 👢 دالة أمر "اطرد" (أيمن فقط)
// ══════════════════════════════════════
async function handleKickCommand(api, event, mentions) {
  const { threadID, messageID } = event;
  const targetID = Object.keys(mentions)[0];
  
  try {
    await api.removeUserFromGroup(targetID, threadID);
    return api.sendMessage(`✅ تدلل حبيبي أيمن، طردت ${mentions[targetID]} 💙`, threadID, messageID);
  } catch (err) {
    return api.sendMessage("ما گدرت أطرده، ممكن ما عندي صلاحية", threadID, messageID);
  }
}

// ══════════════════════════════════════
// ✏️ دالة أمر "غير اسم" (أيمن فقط)
// ══════════════════════════════════════
async function handleChangeNameCommand(api, event, mentions, prompt) {
  const { threadID, messageID } = event;
  const targetID = Object.keys(mentions)[0];
  const newNameMatch = prompt.match(/(?:إلى|الى|ل)\s+(.+)/i);
  
  if (!newNameMatch) {
    return api.sendMessage("حبيبي أيمن، اكتب الاسم الجديد (مثال: غير اسم @شخص إلى محمد)", threadID, messageID);
  }
  
  const newName = newNameMatch[1].trim();
  
  try {
    await api.changeNickname(newName, threadID, targetID);
    return api.sendMessage(`✅ تدلل حبيبي، غيرت اسمه لـ "${newName}" 💙`, threadID, messageID);
  } catch (err) {
    return api.sendMessage("ما گدرت أغير الاسم", threadID, messageID);
  }
}
