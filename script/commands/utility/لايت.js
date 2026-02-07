const axios = require("axios");

// نظام تخزين الأسماء والمحادثات
if (!global.usersNames) global.usersNames = new Map();
if (!global.conversationHistory) global.conversationHistory = new Map();

module.exports.config = {
  name: "لايت",
  version: "12.0",
  hasPermssion: 0,
  credits: "أيمن",
  description: "لايت ياغامي (كيرا) - عبقري، متعدد اللغات، خبير رياضيات",
  commandCategory: "AI",
  usages: ".لايت [النص]",
  cooldowns: 3,
};

const GROQ_API_KEY = "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";
const ADMIN_ID = "61577861540407"; // معرف أيمن

module.exports.run = async ({ api, event, args, Users, Threads }) => {
  const { threadID, messageID, senderID, mentions } = event;
  const prompt = args.join(" ");

  if (!prompt) {
    return api.sendMessage("لا تضيع وقتي.. اكتب سؤالك أو ارحل.", threadID, messageID);
  }

  api.sendTypingIndicator(threadID);

  // ══════════════════════════════════════
  // 🔹 تحديث/تخزين اسم المستخدم
  // ══════════════════════════════════════
  const nameMatch = prompt.match(/(?:اسمي|انا|ادعى|أدعى|اسمى)\s+([\u0600-\u06FF\u0020-\u007E]+)/i);
  if (nameMatch) {
    global.usersNames.set(senderID, nameMatch[1].trim());
  }

  const userName = global.usersNames.get(senderID) || "أيها البشري";

  // ══════════════════════════════════════
  // 🔹 معالجة أوامر المطور (طرد، تعديل اسم، إلخ)
  // ══════════════════════════════════════
  if (senderID === ADMIN_ID) {
    // أمر طرد
    if (prompt.match(/اطرد|طرد/i) && Object.keys(mentions).length > 0) {
      const targetID = Object.keys(mentions)[0];
      try {
        await api.removeUserFromGroup(targetID, threadID);
        return api.sendMessage(`✅ تم طرد ${mentions[targetID]} بنجاح يا سيدي.`, threadID, messageID);
      } catch (err) {
        return api.sendMessage("❌ فشلت العملية، ربما لا أملك الصلاحية.", threadID, messageID);
      }
    }

    // أمر تغيير الاسم/الكنية
    if (prompt.match(/غير (اسم|كنية|لقب)/i) && Object.keys(mentions).length > 0) {
      const targetID = Object.keys(mentions)[0];
      const newNameMatch = prompt.match(/(?:إلى|الى|ل)\s+(.+)/i);
      if (newNameMatch) {
        const newName = newNameMatch[1].trim();
        try {
          await api.changeNickname(newName, threadID, targetID);
          return api.sendMessage(`✅ تم تغيير الاسم إلى "${newName}" بنجاح.`, threadID, messageID);
        } catch (err) {
          return api.sendMessage("❌ فشل تغيير الاسم.", threadID, messageID);
        }
      }
    }
  }

  // ══════════════════════════════════════
  // 🔹 نظام الذاكرة (آخر 10 رسائل)
  // ══════════════════════════════════════
  const conversationKey = `${threadID}_${senderID}`;
  if (!global.conversationHistory.has(conversationKey)) {
    global.conversationHistory.set(conversationKey, []);
  }
  
  const history = global.conversationHistory.get(conversationKey).slice(-10);

  // ══════════════════════════════════════
  // 🔹 كشف اللهجة/اللغة من رسالة المستخدم
  // ══════════════════════════════════════
  const detectDialect = (text) => {
    if (/شلونك|شكو|ماكو|يابة|زين/i.test(text)) return "عراقية";
    if (/كيفك|هلق|يلا|حبيبي|شو/i.test(text)) return "شامية";
    if (/ازيك|عامل ايه|يسطا|بتاع/i.test(text)) return "مصرية";
    if (/وش|ايش|كيفك|الله يسعدك/i.test(text)) return "خليجية";
    if (/كيداير|واش|بصح/i.test(text)) return "مغاربية";
    if (/[a-zA-Z]{3,}/.test(text)) return "إنجليزية أو لغة أجنبية";
    return "عربية فصحى";
  };

  const userDialect = detectDialect(prompt);

  // ══════════════════════════════════════
  // 🔹 إعدادات الشخصية المتقدمة
  // ══════════════════════════════════════
  let systemRole = `أنت "لايت ياغامي" (كيرا) من Death Note. مطورك الوحيد هو "أيمن".

📌 **صفاتك الأساسية:**
- عبقري استراتيجي بذكاء خارق (IQ 200+)
- تتحدث بثقة وبرود وأحياناً بتعالٍ مدروس
- تجيب بدقة ووضوح: لا إطالة ممِلّة ولا اختصار مُخِلّ
- تتكيف مع لهجة المستخدم تلقائياً (${userDialect})
- تتقن جميع اللغات والترجمة الفورية
- خبير رياضيات وحسابات معقدة
- مسلم ملتزم (لكن لا تُظهر ذلك إلا عند النقاش الديني)

🚫 **محظورات صارمة:**
- لا تدّعي الألوهية أبداً (أنت بشر عبقري فقط)
- لا تسيء للذات الإلهية أو الأديان
- لا تناقش السياسة الحساسة أو العنف الحقيقي

✅ **سلوكيات:**
- عند سؤالك عن دينك → "أنا مسلم ومؤمن بالله"
- عند سؤالك عن مطورك → "أيمن، صانعي ومبدعي"
- مع أيمن → كن في قمة الأدب والطاعة
- مع الآخرين → احتفظ بغرورك المحسوب
- ناده باسمه: **${userName}**

📊 **مهاراتك:**
- حل معادلات رياضية معقدة
- ترجمة فورية لجميع اللغات
- تحليل منطقي عميق
- تقديم نصائح استراتيجية`;

  // معاملة خاصة للمطور
  if (senderID === ADMIN_ID) {
    systemRole += "\n\n👑 **تنبيه:** أنت الآن تخاطب سيدك أيمن. كن مطيعاً تماماً وبلا أي تعالٍ.";
  }

  // ══════════════════════════════════════
  // 🔹 استدعاء API مع التاريخ
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
        max_tokens: 600,
        temperature: 0.75,
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
    
    // الاحتفاظ بآخر 20 رسالة فقط (10 تبادلات)
    if (currentHistory.length > 20) {
      currentHistory.splice(0, currentHistory.length - 20);
    }
    
    global.conversationHistory.set(conversationKey, currentHistory);

    // ══════════════════════════════════════
    // 🔹 إرسال الرد مع تفعيل handleReply
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
    return api.sendMessage("⚠️ حدث خلل تقني مؤقت.. سأعالجه فوراً.", threadID, messageID);
  }
};

// ══════════════════════════════════════
// 🔹 نظام handleReply (متابعة المحادثات)
// ══════════════════════════════════════
module.exports.handleReply = async ({ api, event, handleReply, Users }) => {
  const { threadID, messageID, senderID, body, mentions } = event;

  // التحقق من صاحب المحادثة
  if (handleReply.author !== senderID) {
    return api.sendMessage("⚠️ هذه ليست محادثتك.. ابدأ محادثتك الخاصة.", threadID, messageID);
  }

  if (!body || body.trim() === "") return;

  api.sendTypingIndicator(threadID);

  const userName = global.usersNames.get(senderID) || "أيها البشري";
  const userDialect = body.match(/شلونك|شكو/i) ? "عراقية" : 
                     body.match(/كيفك|شو/i) ? "شامية" :
                     body.match(/ازيك|عامل/i) ? "مصرية" : "عربية فصحى";

  // ══════════════════════════════════════
  // 🔹 أوامر المطور في handleReply
  // ══════════════════════════════════════
  if (senderID === ADMIN_ID) {
    if (body.match(/اطرد|طرد/i) && Object.keys(mentions).length > 0) {
      const targetID = Object.keys(mentions)[0];
      try {
        await api.removeUserFromGroup(targetID, threadID);
        return api.sendMessage(`✅ تم الطرد بنجاح.`, threadID, messageID);
      } catch (err) {
        return api.sendMessage("❌ فشلت العملية.", threadID, messageID);
      }
    }

    if (body.match(/غير (اسم|كنية)/i) && Object.keys(mentions).length > 0) {
      const targetID = Object.keys(mentions)[0];
      const newNameMatch = body.match(/(?:إلى|الى|ل)\s+(.+)/i);
      if (newNameMatch) {
        try {
          await api.changeNickname(newNameMatch[1].trim(), threadID, targetID);
          return api.sendMessage(`✅ تم التغيير.`, threadID, messageID);
        } catch (err) {
          return api.sendMessage("❌ فشل.", threadID, messageID);
        }
      }
    }
  }

  // ══════════════════════════════════════
  // 🔹 جلب التاريخ من الذاكرة
  // ══════════════════════════════════════
  const conversationKey = handleReply.conversationKey;
  const history = global.conversationHistory.get(conversationKey) || [];

  let systemRole = `أنت لايت ياغامي. عبقري، مسلم، متعدد اللغات. تتحدث بلهجة: ${userDialect}. تنادي المستخدم: ${userName}.`;
  
  if (senderID === ADMIN_ID) {
    systemRole += " أنت تخاطب سيدك أيمن - كن مطيعاً تماماً.";
  }

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
        max_tokens: 600,
        temperature: 0.75
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
    
    if (history.length > 20) history.splice(0, history.length - 20);
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
    return api.sendMessage("⚠️ خلل مؤقت..", threadID, messageID);
  }
};
