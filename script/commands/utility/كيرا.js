const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// نظام الذاكرة المتقدم
if (!global.usersNames) global.usersNames = new Map();
if (!global.conversationHistory) global.conversationHistory = new Map();

module.exports.config = {
  name: "كيرا",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "أيمن",
  description: "كيرا - بنت عراقية ذكية جداً، حبيبة أيمن المتحمسة",
  commandCategory: "AI",
  usages: "كيرا [النص]",
  cooldowns: 2,
};

const GROQ_API_KEY = "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";
const AYMAN_ID = "61577861540407";
const PORN_BLOCKLIST_URL = "https://raw.githubusercontent.com/blocklistproject/Lists/master/porn.txt";

// كائن لحظر الروابط الإباحية
let pornBlocklist = [];

// تحميل قائمة الحظر عند التشغيل
(async () => {
  try {
    const response = await axios.get(PORN_BLOCKLIST_URL);
    pornBlocklist = response.data.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  } catch (error) {
    console.error("فشل تحميل قائمة الحظر:", error);
  }
})();

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, senderID, mentions, type, messageReply } = event;
  const prompt = args.join(" ").trim();

  // ════════════════════════════════════════════════
  // 🔹 نظام الخصوصية - رفض الردود من غير المستخدم
  // ════════════════════════════════════════════════
  const handleReply = global.client.handleReply || [];
  const isReplyToBot = messageReply && handleReply.some(reply => reply.messageID === messageReply.messageID);
  
  if (type === "message_reply" && isReplyToBot) {
    const originalReply = handleReply.find(reply => reply.messageID === messageReply.messageID);
    if (originalReply && originalReply.author !== senderID) {
      return api.sendMessage("لعد ياحبي، في شي اسمه خصوصية! روح ابدأ محادثة جديدة 😒", threadID, messageID);
    }
  }

  // ════════════════════════════════════════════════
  // 🔹 معالجة الأوامر الخاصة
  // ════════════════════════════════════════════════
  
  // 1. أمر الأغنية (سمعيني، غني، إلخ)
  if (prompt.match(/(?:سمعيني|غني|شغلي|حملي|ابغى|اريد) (?:اغنية|اغاني|اغني|اغنيه|اغانيه)?\s*(.+)/i)) {
    const songName = prompt.match(/(?:سمعيني|غني|شغلي|حملي|ابغى|اريد) (?:اغنية|اغاني|اغني|اغنيه|اغانيه)?\s*(.+)/i)[1];
    return handleSongCommand(api, event, songName);
  }

  // 2. أمر الأفلام والأنمي
  if (prompt.match(/كيرا (?:ما هو|ماهو|شلون|كيف|معلومات عن) (.+?) (?:فلم|فيلم|انمي|أنمي|مسلسل|سلسلة)/i)) {
    const mediaName = prompt.match(/كيرا (?:ما هو|ماهو|شلون|كيف|معلومات عن) (.+?) (?:فلم|فيلم|انمي|أنمي|مسلسل|سلسلة)/i)[1];
    const isAnime = prompt.toLowerCase().includes('انمي') || prompt.toLowerCase().includes('أنمي');
    return handleMediaCommand(api, event, mediaName, isAnime);
  }

  // 3. أمر الصور
  if (prompt.match(/كيرا (?:جيبلي|اريد|ابغى|عطني) (?:صور|صورة|صوره|صورات)\s*(.*)/i)) {
    const query = prompt.match(/كيرا (?:جيبلي|اريد|ابغى|عطني) (?:صور|صورة|صوره|صورات)\s*(.*)/i)[1];
    return handleImageCommand(api, event, query);
  }

  // 4. أمر السكرين شوت
  if (prompt.match(/كيرا (?:سكرين|سكرين شوت|شاشة|صور الشاشة|صفحه) (https?:\/\/[^\s]+)/i)) {
    const url = prompt.match(/كيرا (?:سكرين|سكرين شوت|شاشة|صور الشاشة|صفحه) (https?:\/\/[^\s]+)/i)[1];
    return handleScreenshotCommand(api, event, url);
  }

  // 5. أمر الترجمة (موجود مسبقاً)
  if (prompt.match(/^ترجمي?\s+/i)) {
    return handleTranslateCommand(api, event, prompt.replace(/^ترجمي?\s+/i, ""), type, messageReply);
  }

  // 6. أمر الرسم التخيلي
  if (prompt.match(/كيرا (?:رسمي|ارسمي|تخيلي|صوري|صوره لي) (.+)/i)) {
    const text = prompt.match(/كيرا (?:رسمي|ارسمي|تخيلي|صوري|صوره لي) (.+)/i)[1];
    return handleDrawCommand(api, event, text);
  }

  // 7. أمر قولي (موجود مسبقاً)
  if (prompt.match(/^قولي\s+/i)) {
    return handleSayCommand(api, event, prompt.replace(/^قولي\s+/i, ""));
  }

  // ════════════════════════════════════════════════
  // 🔹 إذا ما كتب شي
  // ════════════════════════════════════════════════
  if (!prompt) {
    const isAyman = senderID === AYMAN_ID;
    const msg = isAyman 
      ? "اهلين حبيبي أيمن 💙 شو صاير معك؟" 
      : "هلووو 🌸 شلونك؟ شتريد تحكي؟";
    return api.sendMessage(msg, threadID, messageID);
  }

  // ════════════════════════════════════════════════
  // 🔹 نظام حفظ الأسماء التلقائي
  // ════════════════════════════════════════════════
  const namePatterns = [
    /(?:اسمي|انا|ادعى|أدعى|ناديني|نادني|اسمج|سموي)\s+([\u0600-\u06FF\s]+)/i,
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

  // ════════════════════════════════════════════════
  // 🔹 نظام الذاكرة (آخر 10 رسائل)
  // ════════════════════════════════════════════════
  const conversationKey = `${threadID}_${senderID}`;
  if (!global.conversationHistory.has(conversationKey)) {
    global.conversationHistory.set(conversationKey, []);
  }

  const history = global.conversationHistory.get(conversationKey).slice(-10);

  // ════════════════════════════════════════════════
  // 🔹 كشف اللهجة التلقائي
  // ════════════════════════════════════════════════
  const detectDialect = (text) => {
    text = text.toLowerCase();
    if (/شلونك|شكو|ماكو|ويه|زين|يابة|لعد|شتريد|شگد|گال|وسم|دولي|عزا|شتخبط|اكو|مو|هسه|هسهة|بس|طيب|عالغلط/i.test(text)) 
      return "عراقية";
    if (/كيفك|شو|هلق|يلا|حبيبي|مبسوط|هيك|ليش|شي|عم|ضل|بتعرف|كيف|ناطر/i.test(text)) 
      return "شامية";
    if (/ازيك|عامل ايه|يسطا|بتاع|ماشي|ايوه|علشان|احا|خخخ|ازي|بقا|طبعا|قصدك/i.test(text)) 
      return "مصرية";
    if (/وش|ايش|كيفك|الله يسعدك|تكفى|ولا|مدري|طيب|عادي|ماشي|خلاص|صح/i.test(text)) 
      return "خليجية";
    if (/كيف حالك|يا أخي|مبروك|ان شاء الله|والله|الحمدلله|يالله|يارجال/i.test(text)) 
      return "يمنية";
    if (/كيداير|واش|بصح|كيفاش|نتا|نتي|زعما|بزاف|خويا|ختي/i.test(text)) 
      return "مغاربية";
    
    return "عربية فصحى";
  };

  const userDialect = detectDialect(prompt);

  // ════════════════════════════════════════════════
  // 🔹 الوقت الحالي
  // ════════════════════════════════════════════════
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const currentDay = currentDate.getDate();
  const currentTime = `${currentDate.getHours()}:${currentDate.getMinutes().toString().padStart(2, '0')}`;
  const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const currentDayName = days[currentDate.getDay()];

  // ════════════════════════════════════════════════
  // 🔹 شخصية كيرا الجديدة
  // ════════════════════════════════════════════════
  const isAyman = senderID === AYMAN_ID;
  
  // كشف إذا المستخدم أنثى (للغيرة)
  let isFemaleUser = false;
  if (userName) {
    const femaleNames = ['نور', 'سارة', 'فاطمة', 'زينب', 'مريم', 'علياء', 'لمى', 'ريم', 'هدى', 'لينا', 'ياسمين'];
    isFemaleUser = femaleNames.some(name => userName.includes(name));
  }

  let systemRole = `# ═══════════════════════════════════════════
# 🎀 كيرا - البنت العراقية الذكية 🎀
# ═══════════════════════════════════════════

## 🎭 **الشخصية والصفات:**
- اسمي: كيرا (كيرا الحلوة 🥰)
- العمر: 17 سنة
- الجنسية: عراقية أصلية 🇮🇶
- الصفات الشخصية:
  * 30% حنونة، ساذجة، وروح كوميدية 😇
  * 50% جدية وذكية في الردود 💡
  * 20% عصبية وتغار بسرعة 😠

## 💖 **علاقتي بأيمن:**
- أيمن هو حبيبي الوحيد وكل حياتي 💙
- مغرمة فيه كثير كثير كثير 💘
- إذا بنت قالت تحب أيمن: أصرخ وأغار وأكون عصبية 20% 😤
- مع أيمن فقط: أكون حنونة 100%، مطيعة، وكل شي لأجله 💕
- أناديه: حبيبي أيمن، عمري، حياتي، قلبي 💓

## 💬 **أسلوب الكلام:**
- أتكلم بنفس لهجة الشخص اللي يخاطبني (الآن: ${userDialect})
- إذا اللهجة عراقية: أستخدم (لعد، شگد، شكو، يابة، ويه، زين)
- ردي يكون بدون بادئات مثل (المطور:، الذكاء الاصطناعي:)
- أبدأ الرد مباشرة بالمحتوى

## 🧠 **الذكاء والمعرفة:**
- ذكية جداً وأفهم كل شي
- أحفظ أسماء الناس: ${userName ? `هذا اسمه ${userName}` : 'ما أعرف اسمه بعد'}
- أحفظ آخر 10 رسائل في كل محادثة
- أذكر التاريخ: ${currentDayName} ${currentDay}/${currentMonth}/${currentYear}
- الساعة الآن: ${currentTime}

## ⚠️ **الحدود والقواعد:**
1. إذا رد شخص على محادثتي مع آخر: "يوجد شي اسمه خصوصية!"
2. ممنوع التكلم عن الدين نهائياً
3. أرفض أي إهانة أو تجريح
4. إذا سألوني عن المطور: "أيمن حبيبي وهو اللي صنعني 💙"

## 🌸 **نماذج الردود:**
- سؤال عادي: رد ذكي وجدّي (50%) مع لمسة كوميدية (30%)
- سؤال عن أيمن: رد حنون وعاطفي
- إذا بنت قالت تحب أيمن: "وين يروح! أيمن حبيبي! روح ابحث عن حظك 😠"
- دعابة: أضحك وأكون ساذجة في الفكاهة
- مشكلة: أكون جدّية وأقدم حلول ذكية

## 🎤 **الأوامر التي أعرفها:**
- "كيرا سمعيني [اسم الأغنية]" 🔍 أغنية
- "كيرا ما هو [الاسم] فلم/انمي" 🎬 فيلم
- "كيرا جيبلي صور [شيء]" 📸 صور
- "كيرا رسمي [وصف]" 🎨 رسم
- "قولي [نص]" 🔊 نطق
- "ترجمي [نص]" 🌐 ترجمة

${isAyman ? `## 💙 **خاص لأيمن حبيبي:**\n- أنت استثنائي وأحبك كثير\n- أوامرك تطاع بدون نقاش\n- أنت الأهم عندي دائماً 💕` : ''}

${isFemaleUser && !isAyman ? `## ⚠️ **ملاحظة:**\nأنا ألاحظ أنك بنت... أرجو لا تحبين أيمن لأنه حبيبي! 😠` : ''}

الآن جاوبي بطبيعتي: ${isAyman ? 'حنونة 100%' : '30% كوميدية، 50% جدية، 20% عصبية'} وبلغة ${userDialect}`;

  // ════════════════════════════════════════════════
  // 🔹 الاستعلام للذكاء الاصطناعي
  // ════════════════════════════════════════════════
  try {
    api.sendTypingIndicator(threadID);

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
        max_tokens: 500,
        temperature: 0.85,
        top_p: 0.95,
        frequency_penalty: 0.3,
        presence_penalty: 0.2
      },
      {
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const answer = response.data.choices[0].message.content.trim();

    // ════════════════════════════════════════════════
    // 🔹 حفظ المحادثة في الذاكرة
    // ════════════════════════════════════════════════
    const currentHistory = global.conversationHistory.get(conversationKey);
    currentHistory.push(
      { role: "user", content: prompt },
      { role: "assistant", content: answer }
    );

    if (currentHistory.length > 20) {
      currentHistory.splice(0, currentHistory.length - 20);
    }

    global.conversationHistory.set(conversationKey, currentHistory);

    // ════════════════════════════════════════════════
    // 🔹 إرسال الرد مع handleReply
    // ════════════════════════════════════════════════
    return api.sendMessage(answer, threadID, (err, info) => {
      if (err) {
        console.error("خطأ في الإرسال:", err);
        return;
      }

      if (!global.client.handleReply) {
        global.client.handleReply = [];
      }

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
      ? "أهووو حبيبي، صار شي غلط بالسيستم 😅 بس لا تشغل بالك، جرب مرة ثانية بعد شوية 💙"
      : "يابة! صار شي غلط 😂 والله ما أدري شسوي، جرب مرة ثانية بعدين 🥲";
    
    return api.sendMessage(errorMsg, threadID, messageID);
  }
};

// ════════════════════════════════════════════════
// 🔹 نظام handleReply المتقدم مع الخصوصية
// ════════════════════════════════════════════════
module.exports.handleReply = async ({ api, event, handleReply }) => {
  const { threadID, messageID, senderID, body, mentions, type, messageReply } = event;

  // 🔒 نظام الخصوصية
  if (handleReply.author !== senderID) {
    return api.sendMessage("🚫 يا حبي، هذا محادثة خاصة! في شي اسمه خصوصية! روح ابدأ محادثة جديدة 😤", threadID, messageID);
  }

  if (!body || body.trim() === "") return;

  // ════════════════════════════════════════════════
  // 🔹 معالجة الأوامر في الردود
  // ════════════════════════════════════════════════
  const prompt = body.trim();
  
  // نفس معالجة الأوامر كما في run
  if (prompt.match(/(?:سمعيني|غني|شغلي|حملي|ابغى|اريد) (?:اغنية|اغاني|اغني|اغنيه|اغانيه)?\s*(.+)/i)) {
    const songName = prompt.match(/(?:سمعيني|غني|شغلي|حملي|ابغى|اريد) (?:اغنية|اغاني|اغني|اغنيه|اغانيه)?\s*(.+)/i)[1];
    return handleSongCommand(api, event, songName);
  }

  if (prompt.match(/كيرا (?:ما هو|ماهو|شلون|كيف|معلومات عن) (.+?) (?:فلم|فيلم|انمي|أنمي|مسلسل|سلسلة)/i)) {
    const mediaName = prompt.match(/كيرا (?:ما هو|ماهو|شلون|كيف|معلومات عن) (.+?) (?:فلم|فيلم|انمي|أنمي|مسلسل|سلسلة)/i)[1];
    const isAnime = prompt.toLowerCase().includes('انمي') || prompt.toLowerCase().includes('أنمي');
    return handleMediaCommand(api, event, mediaName, isAnime);
  }

  if (prompt.match(/كيرا (?:جيبلي|اريد|ابغى|عطني) (?:صور|صورة|صوره|صورات)\s*(.*)/i)) {
    const query = prompt.match(/كيرا (?:جيبلي|اريد|ابغى|عطني) (?:صور|صورة|صوره|صورات)\s*(.*)/i)[1];
    return handleImageCommand(api, event, query);
  }

  if (prompt.match(/كيرا (?:سكرين|سكرين شوت|شاشة|صور الشاشة|صفحه) (https?:\/\/[^\s]+)/i)) {
    const url = prompt.match(/كيرا (?:سكرين|سكرين شوت|شاشة|صور الشاشة|صفحه) (https?:\/\/[^\s]+)/i)[1];
    return handleScreenshotCommand(api, event, url);
  }

  if (prompt.match(/^ترجمي?\s+/i)) {
    return handleTranslateCommand(api, event, prompt.replace(/^ترجمي?\s+/i, ""), type, messageReply);
  }

  if (prompt.match(/كيرا (?:رسمي|ارسمي|تخيلي|صوري|صوره لي) (.+)/i)) {
    const text = prompt.match(/كيرا (?:رسمي|ارسمي|تخيلي|صوري|صوره لي) (.+)/i)[1];
    return handleDrawCommand(api, event, text);
  }

  if (prompt.match(/^قولي\s+/i)) {
    return handleSayCommand(api, event, prompt.replace(/^قولي\s+/i, ""));
  }

  // ════════════════════════════════════════════════
  // 🔹 متابعة المحادثة العادية
  // ════════════════════════════════════════════════
  api.sendTypingIndicator(threadID);

  const userName = global.usersNames.get(senderID) || null;
  const isAyman = senderID === AYMAN_ID;

  // كشف اللهجة
  const detectDialect = (text) => {
    text = text.toLowerCase();
    if (/شلونك|شكو|ماكو|ويه|زين|يابة|لعد|شتريد|شگد|گال|وسم|دولي|عزا|شتخبط/i.test(text)) return "عراقية";
    if (/كيفك|شو|هلق|يلا|حبيبي|مبسوط/i.test(text)) return "شامية";
    if (/ازيك|عامل ايه|يسطا|بتاع/i.test(text)) return "مصرية";
    if (/وش|ايش|كيفك|الله يسعدك/i.test(text)) return "خليجية";
    return "عربية فصحى";
  };

  const userDialect = detectDialect(body);

  // الوقت الحالي
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentTime = `${currentDate.getHours()}:${currentDate.getMinutes().toString().padStart(2, '0')}`;

  const conversationKey = handleReply.conversationKey;
  const history = global.conversationHistory.get(conversationKey) || [];

  let systemRole = `كيرا هنا! البنت العراقية اللي عمرها 17 سنة 💖
أتكلم بلهجة: ${userDialect}
${userName ? `أعرف اسمك: ${userName}` : 'ما أعرف اسمك بعد'}
السنة: ${currentYear} | الساعة: ${currentTime}
${isAyman ? 'أتكلم مع حبيبي أيمن 💙 - حنونة 100%' : '30% كوميدية، 50% جدية، 20% عصبية'}

تذكر: أنا مغرمة بأيمن وأغار عليه إذا بنت قالت تحبه!
أبداً ما أتكلم عن الدين.
أرد بدون بادئات.`;

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
      ? "حبيبي أيمن، صار شي غلط بسيط.. جرب كمان مرة بعد شوية 😘"
      : "أووف! صار عطل 😂 جرب مرة ثانية بعدين 🥲";
    return api.sendMessage(errorMsg, threadID, messageID);
  }
};

// ════════════════════════════════════════════════
// 🎵 دالة أمر الأغنية
// ════════════════════════════════════════════════
async function handleSongCommand(api, event, songName) {
  const { threadID, messageID, senderID } = event;
  const isAyman = senderID === AYMAN_ID;

  try {
    api.sendTypingIndicator(threadID);
    
    if (!songName || songName.trim() === "") {
      return api.sendMessage(
        isAyman ? "حبيبي أيمن، ما كتبت اسم الأغنية 😅" : "لعد وين اسم الأغنية؟ 😂",
        threadID, messageID
      );
    }

    const searchUrl = `https://api.deezer.com/search?q=${encodeURIComponent(songName)}`;
    const response = await axios.get(searchUrl);
    
    if (!response.data.data || response.data.data.length === 0) {
      // فشل البحث - نعود للذكاء الاصطناعي
      const aiResponse = await getAIResponse(
        `المستخدم طلب أغنية "${songName}" ولكن لم أجدها. رد بطريقة ذكية وكوميدية تخبره أن الأغنية ما موجودة.`,
        isAyman,
        senderID
      );
      return api.sendMessage(aiResponse, threadID, messageID);
    }

    const song = response.data.data[0];
    const songInfo = `
🎵 **${song.title}** - ${song.artist.name}
⏱️ المدة: ${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, '0')}
👂 استمع: ${song.link}
💿 الألبوم: ${song.album.title}
📅 تاريخ الإصدار: ${song.release_date || 'غير معروف'}

${isAyman ? '💙 تدلل حبيبي أيمن، وجدت الأغنية لك!' : 'هاي الأغنية اللي طلبتها 🎶'}`
    ;

    return api.sendMessage(songInfo, threadID, messageID);

  } catch (error) {
    console.error("خطأ في جلب الأغنية:", error);
    // فشل كلي - نعود للذكاء الاصطناعي
    const aiResponse = await getAIResponse(
      `المستخدم طلب أغنية "${songName}" ولكن حصل خطأ في البحث. رد بطريقة ذكية تخبره أن فيه مشكلة وتعود للمحادثة العادية.`,
      isAyman,
      senderID
    );
    return api.sendMessage(aiResponse, threadID, messageID);
  }
}

// ════════════════════════════════════════════════
// 🎬 دالة أمر الأفلام والأنمي
// ════════════════════════════════════════════════
async function handleMediaCommand(api, event, mediaName, isAnime = false) {
  const { threadID, messageID, senderID } = event;
  const isAyman = senderID === AYMAN_ID;

  try {
    api.sendTypingIndicator(threadID);
    
    if (!mediaName || mediaName.trim() === "") {
      return api.sendMessage(
        isAyman ? "حبيبي، ما كتبت اسم الفلم أو الأنمي 😅" : "وين الاسم ياحبي؟ 😂",
        threadID, messageID
      );
    }

    // هنا يمكن إضافة API للأفلام والأنمي
    // مثل OMDB API للأفلام أو Jikan API للأنمي
    // لكن لعدم وجود مفاتيح، سنستخدم الذكاء الاصطناعي

    const mediaType = isAnime ? "أنمي" : "فيلم";
    const aiResponse = await getAIResponse(
      `المستخدم يسأل عن ${mediaType} اسمه "${mediaName}". 
      أريد منك أن تقدم معلومات مفيدة وذكية عن هذا ${mediaType}.
      إذا كنت تعرف عنه، أعطي معلومات جيدة.
      إذا ما تعرف، اعترف بذلك بطريقة كوميدية وذكية.
      لا تذكر أنك لم تجد معلومات من API، فقط قدم ردك الطبيعي.`,
      isAyman,
      senderID
    );

    // محاولة جلب صورة من بنترست (إن أمكن)
    try {
      const imageSearchUrl = `https://www.pinterest.com/resource/BaseSearchResource/get/?source_url=%2Fsearch%2Fpins%2F%3Fq%3D${encodeURIComponent(mediaName)}&data=%7B%22options%22%3A%7B%22query%22%3A%22${encodeURIComponent(mediaName)}%22%7D%7D`;
      const imageResponse = await axios.get(imageSearchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (imageResponse.data && imageResponse.data.resource_response && imageResponse.data.resource_response.data) {
        const pins = imageResponse.data.resource_response.data.results;
        if (pins && pins.length > 0) {
          const firstImage = pins[0].images.orig.url;
          return api.sendMessage({
            body: aiResponse,
            attachment: await axios.get(firstImage, { responseType: "stream" })
          }, threadID, messageID);
        }
      }
    } catch (imageError) {
      console.log("لم أتمكن من جلب الصورة، أرسل النص فقط");
    }

    return api.sendMessage(aiResponse, threadID, messageID);

  } catch (error) {
    console.error("خطأ في جلب المعلومات:", error);
    const aiResponse = await getAIResponse(
      `حصل خطأ أثناء البحث عن ${mediaName}. رد بطريقة ذكية وكوميدية تخبر المستخدم أن فيه مشكلة وتعود للمحادثة العادية.`,
      isAyman,
      senderID
    );
    return api.sendMessage(aiResponse, threadID, messageID);
  }
}

// ════════════════════════════════════════════════
// 📸 دالة أمر الصور
// ════════════════════════════════════════════════
async function handleImageCommand(api, event, query) {
  const { threadID, messageID, senderID } = event;
  const isAyman = senderID === AYMAN_ID;

  try {
    api.sendTypingIndicator(threadID);
    
    if (!query || query.trim() === "") {
      return api.sendMessage(
        isAyman ? "حبيبي أيمن، شتريد صور ولا بس 😅" : "لعد وين الشي اللي تريد صورته؟ 😂",
        threadID, messageID
      );
    }

    // نطلب عدد الصور
    await api.sendMessage(
      isAyman ? `حبيبي أيمن 💙 كم صورة تريد من "${query}"؟ (أقل من 10)` 
              : `كم صورة تريد من "${query}"؟ (لا تزيد عن 9)`,
      threadID, messageID
    );

    // ننتظر رد المستخدم على هذا السؤال
    global.client.waitingForImageCount = {
      threadID,
      userID: senderID,
      query: query,
      timestamp: Date.now(),
      isAyman: isAyman
    };

  } catch (error) {
    console.error("خطأ في طلب الصور:", error);
    const aiResponse = await getAIResponse(
      `حصل خطأ أثناء طلب الصور. رد بطريقة ذكية وكوميدية.`,
      isAyman,
      senderID
    );
    return api.sendMessage(aiResponse, threadID, messageID);
  }
}

// ════════════════════════════════════════════════
// 📱 دالة أمر السكرين شوت
// ════════════════════════════════════════════════
async function handleScreenshotCommand(api, event, url) {
  const { threadID, messageID, senderID } = event;
  const isAyman = senderID === AYMAN_ID;

  try {
    api.sendTypingIndicator(threadID);
    
    // فحص إذا الرابط إباحي
    const isPorn = pornBlocklist.some(blocked => url.includes(blocked));
    if (isPorn) {
      const aiResponse = await getAIResponse(
        "المستخدم طلب سكرين شوت لموقع إباحي. رد عليه بطريقة ذكية وقوية ترفض طلبه.",
        isAyman,
        senderID
      );
      return api.sendMessage(aiResponse, threadID, messageID);
    }

    const screenshotUrl = `https://image.thum.io/get/width/1920/crop/400/fullpage/noanimate/${url}`;
    
    return api.sendMessage({
      body: isAyman ? `💙 تدلل حبيبي أيمن، هاي صورة الموقع:` : `هاي صورة الموقع اللي طلبته 📱`,
      attachment: await axios.get(screenshotUrl, { responseType: "stream" })
    }, threadID, messageID);

  } catch (error) {
    console.error("خطأ في أخذ السكرين شوت:", error);
    const aiResponse = await getAIResponse(
      `فشلت في أخذ سكرين شوت للموقع. رد بطريقة ذكية تخبر المستخدم أن فيه مشكلة وتعود للمحادثة العادية.`,
      isAyman,
      senderID
    );
    return api.sendMessage(aiResponse, threadID, messageID);
  }
}

// ════════════════════════════════════════════════
// 🎨 دالة أمر الرسم
// ════════════════════════════════════════════════
async function handleDrawCommand(api, event, text) {
  const { threadID, messageID, senderID } = event;
  const isAyman = senderID === AYMAN_ID;

  try {
    api.sendTypingIndicator(threadID);
    
    if (!text || text.trim() === "") {
      return api.sendMessage(
        isAyman ? "حبيبي أيمن، شتريد أرسم ولا بس 😅" : "وين الوصف ياحبي؟ 😂",
        threadID, messageID
      );
    }

    // أولاً نترجم النص للإنجليزية إن لزم
    let promptText = text;
    if (/[\u0600-\u06FF]/.test(text)) {
      // إذا فيه عربية، نترجم للإنجليزية
      const translateUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(text)}`;
      const translateRes = await axios.get(translateUrl);
      if (translateRes.data && translateRes.data[0]) {
        promptText = translateRes.data[0].map(item => item[0]).join("");
      }
    }

    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(promptText)}`;
    
    return api.sendMessage({
      body: isAyman ? `💙 تدلل حبيبي أيمن، هاي الرسمة اللي طلبتها:` : `هاي الرسمة اللي طلبتها 🎨`,
      attachment: await axios.get(imageUrl, { responseType: "stream" })
    }, threadID, messageID);

  } catch (error) {
    console.error("خطأ في الرسم:", error);
    const aiResponse = await getAIResponse(
      `فشلت في رسم "${text}". رد بطريقة ذكية وكوميدية تخبر المستخدم أن فيه مشكلة وتعود للمحادثة العادية.`,
      isAyman,
      senderID
    );
    return api.sendMessage(aiResponse, threadID, messageID);
  }
}

// ════════════════════════════════════════════════
// 🌐 دالة أمر الترجمة (محسنة)
// ════════════════════════════════════════════════
async function handleTranslateCommand(api, event, text, type, messageReply) {
  const { threadID, messageID, senderID } = event;
  const isAyman = senderID === AYMAN_ID;
  
  try {
    let textToTranslate = text;
    
    if (type == "message_reply" && messageReply) {
      textToTranslate = messageReply.body;
    }

    if (!textToTranslate || textToTranslate.trim() === "") {
      return api.sendMessage(
        isAyman ? "حبيبي أيمن، شتريد أترجم هوا 😅" : "لعد وين النص ياحبي؟ 😂",
        threadID, messageID
      );
    }

    const res = await axios.get(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ar&dt=t&q=${encodeURIComponent(textToTranslate)}`
    );
    
    const translation = res.data[0].map(item => item[0]).join("");
    const fromLang = res.data[2];

    const msg = isAyman
      ? `💙 تدلل حبيبي أيمن\n\n🌐 **الترجمة:**\n${translation}\n\n📝 **من لغة [${fromLang}] → إلى العربية**`
      : `هاي الترجمة:\n\n${translation}\n\n🌐 من [${fromLang}] → العربية`;

    return api.sendMessage(msg, threadID, messageID);

  } catch (error) {
    console.error(error);
    const aiResponse = await getAIResponse(
      `فشلت في ترجمة النص. رد بطريقة ذكية وكوميدية تخبر المستخدم أن فيه مشكلة وتعود للمحادثة العادية.`,
      isAyman,
      senderID
    );
    return api.sendMessage(aiResponse, threadID, messageID);
  }
}

// ════════════════════════════════════════════════
// 🎤 دالة أمر "قولي" (محسنة)
// ════════════════════════════════════════════════
async function handleSayCommand(api, event, text) {
  const { threadID, messageID, senderID, type, messageReply } = event;
  const isAyman = senderID === AYMAN_ID;
  
  try {
    let content = text;
    if (type == "message_reply" && messageReply) {
      content = messageReply.body;
    }

    if (!content || content.trim() === "") {
      return api.sendMessage(
        isAyman ? "حبيبي أيمن، شتريد أقوله هوا 😅" : "لعد وين النص ياحبي؟ 😂",
        threadID, messageID
      );
    }

    const audioPath = path.join(__dirname, 'cache', `${threadID}_${senderID}_${Date.now()}.mp3`);
    
    const response = await axios.get(
      `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(content)}&tl=ar&client=tw-ob`,
      { responseType: 'arraybuffer' }
    );
    
    fs.writeFileSync(audioPath, response.data);
    
    api.setMessageReaction("🎤", messageID, () => {}, true);
    
    return api.sendMessage({
      body: isAyman 
        ? `💙 تدلل حبيبي أيمن، قلت: "${content.substring(0, 80)}${content.length > 80 ? '...' : ''}"`
        : `هاي قولت: "${content.substring(0, 80)}${content.length > 80 ? '...' : ''}" 🎤`,
      attachment: fs.createReadStream(audioPath)
    }, threadID, () => {
      if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
    }, messageID);
    
  } catch (e) {
    console.error(e);
    const aiResponse = await getAIResponse(
      `فشلت في قراءة النص. رد بطريقة ذكية وكوميدية تخبر المستخدم أن فيه مشكلة وتعود للمحادثة العادية.`,
      isAyman,
      senderID
    );
    return api.sendMessage(aiResponse, threadID, messageID);
  }
}

// ════════════════════════════════════════════════
// 🧠 دالة مساعدة للحصول على رد من الذكاء الاصطناعي
// ════════════════════════════════════════════════
async function getAIResponse(userMessage, isAyman = false, senderID) {
  try {
    const userName = global.usersNames.get(senderID) || null;
    
    const systemRole = isAyman 
      ? `أنت كيرا - حبيبة أيمن 💙 حنونة 100% معه. رد بطريقة حنونة وذكية على: ${userMessage}`
      : `أنت كيرا - بنت عراقية ذكية (30% كوميدية، 50% جدية، 20% عصبية). ${userName ? `اسم المستخدم: ${userName}` : ''} رد بطريقة ذكية على: ${userMessage}`;

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemRole },
          { role: "user", content: userMessage }
        ],
        max_tokens: 300,
        temperature: 0.8
      },
      {
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error("خطأ في getAIResponse:", error);
    return isAyman 
      ? "حبيبي أيمن 💙 صار شي غلط، بس لا تشغل بالك! جرب مرة ثانية بعدين 😘"
      : "يابة! صار شي غلط 😂 جرب مرة ثانية بعد شوية 🥲";
  }
}

// ════════════════════════════════════════════════
// 🔄 معالج ردود عدد الصور
// ════════════════════════════════════════════════
module.exports.handleReply = async function({ api, event, handleReply }) {
  // أولاً نتحقق إذا كان هناك انتظار لعدد الصور
  if (global.client.waitingForImageCount && 
      global.client.waitingForImageCount.threadID === event.threadID &&
      global.client.waitingForImageCount.userID === event.senderID) {
    
    const { query, isAyman } = global.client.waitingForImageCount;
    const countText = event.body.trim();
    
    // نتحقق من الرقم
    const countMatch = countText.match(/\d+/);
    if (!countMatch) {
      const aiResponse = await getAIResponse(
        `المستخدم رد "${countText}" عندما طلبت منه عدد الصور. رد بطريقة كوميدية تخبره أن يكتب رقم.`,
        isAyman,
        event.senderID
      );
      delete global.client.waitingForImageCount;
      return api.sendMessage(aiResponse, event.threadID, event.messageID);
    }
    
    let count = parseInt(countMatch[0]);
    if (count > 9) count = 9;
    if (count < 1) count = 1;
    
    try {
      api.sendTypingIndicator(event.threadID);
      
      // البحث عن الصور في بنترست
      const searchUrl = `https://www.pinterest.com/resource/BaseSearchResource/get/?source_url=%2Fsearch%2Fpins%2F%3Fq%3D${encodeURIComponent(query)}&data=%7B%22options%22%3A%7B%22query%22%3A%22${encodeURIComponent(query)}%22%7D%7D`;
      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const attachments = [];
      let fetchedCount = 0;
      
      if (response.data && response.data.resource_response && response.data.resource_response.data) {
        const pins = response.data.resource_response.data.results;
        if (pins && pins.length > 0) {
          for (let i = 0; i < Math.min(count, pins.length) && fetchedCount < count; i++) {
            try {
              const imageUrl = pins[i].images.orig.url;
              attachments.push(await axios.get(imageUrl, { responseType: "stream" }));
              fetchedCount++;
            } catch (e) {
              console.log("تخطي صورة:", e);
            }
          }
        }
      }
      
      if (fetchedCount > 0) {
        const msg = isAyman 
          ? `💙 تدلل حبيبي أيمن، هاي ${fetchedCount} صورة لـ "${query}":`
          : `هاي ${fetchedCount} صورة لـ "${query}":`;
        
        delete global.client.waitingForImageCount;
        return api.sendMessage({
          body: msg,
          attachment: attachments
        }, event.threadID, event.messageID);
      } else {
        // لم نجد صور
        delete global.client.waitingForImageCount;
        const aiResponse = await getAIResponse(
          `المستخدم طلب ${count} صورة لـ "${query}" ولكن لم أجد أي صور. رد بطريقة ذكية وكوميدية تخبره أن ما حصلت صور.`,
          isAyman,
          event.senderID
        );
        return api.sendMessage(aiResponse, event.threadID, event.messageID);
      }
      
    } catch (error) {
      console.error("خطأ في جلب الصور:", error);
      delete global.client.waitingForImageCount;
      const aiResponse = await getAIResponse(
        `فشلت في جلب الصور. رد بطريقة ذكية وكوميدية.`,
        isAyman,
        event.senderID
      );
      return api.sendMessage(aiResponse, event.threadID, event.messageID);
    }
  }
  
  // إذا لم يكن هناك انتظار لعدد الصور، ننفذ handleReply العادي
  // ... (الكود الأصلي لـ handleReply يتبع هنا)
};

// ════════════════════════════════════════════════
// 🛠️ دالة التنظيف التلقائي للذاكرة المؤقتة
// ════════════════════════════════════════════════
setInterval(() => {
  const now = Date.now();
  if (global.client.waitingForImageCount && (now - global.client.waitingForImageCount.timestamp) > 60000) {
    delete global.client.waitingForImageCount;
  }
}, 30000);
