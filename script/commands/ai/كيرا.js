const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// ═══════════════════════════════════════════════════════════
// 👑 KIRA v8.0 - فتاة عراقية ذكية جداً (ذكاء ثنائي خالص)
// المطور: أيمن (Ayman)
// ═══════════════════════════════════════════════════════════

module.exports.config = {
  name: "كيرا",
  aliases: ["kira", "ai", "كيرة", "كي", "kiraai"],
  version: "8.0.0",
  hasPermssion: 0,
  credits: "Ayman ♛",
  description: "👑 كيرا | فتاة عراقية ذكية جداً - ذكاء ثنائي خالص",
  commandCategory: "ai",
  usages: ".كيرا [رسالتك]",
  cooldowns: 1
};

// ═══════════════════════════════════════════════════════════
// 🔑 API Keys
// ═══════════════════════════════════════════════════════════

const GROQ_API_KEY = "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";

// ═══════════════════════════════════════════════════════════
// 📁 نظام إدارة الذاكرة
// ═══════════════════════════════════════════════════════════

const MEMORY_FILE = path.join(__dirname, "kira_dual_memory.json");
const CACHE_DIR = path.join(__dirname, "kira_cache");

fs.ensureDirSync(CACHE_DIR);

let MEMORY = {
  conversations: {},
  users: {},
  system: {
    totalInteractions: 0,
    firstRun: Date.now(),
    lastUpdate: Date.now()
  }
};

// تحميل الذاكرة
try {
  if (fs.existsSync(MEMORY_FILE)) {
    MEMORY = fs.readJsonSync(MEMORY_FILE);
    console.log(`👑 كيرا: تم تحميل ذاكرة ${Object.keys(MEMORY.users).length} مستخدم`);
  }
} catch (error) {
  console.log("👑 كيرا: إنشاء ذاكرة جديدة");
}

// حفظ الذاكرة
function saveMemory() {
  try {
    MEMORY.system.lastUpdate = Date.now();
    fs.writeJsonSync(MEMORY_FILE, MEMORY, { spaces: 2 });
  } catch (error) {
    console.error("❌ خطأ في حفظ الذاكرة:", error);
  }
}

// ═══════════════════════════════════════════════════════════
// 🧠 نظام الذاكرة الثنائي المتقدم
// ═══════════════════════════════════════════════════════════

class DualMemorySystem {
  constructor() {
    this.shortTerm = new Map(); // ذاكرة قصيرة المدى (آخر 50 رسالة)
    this.longTerm = MEMORY;     // ذاكرة طويلة المدى (ملف JSON)
    this.contextWindow = 50;    // نافذة السياق
  }

  // إضافة رسالة جديدة
  addMessage(threadID, userID, role, content, attachments = []) {
    if (!this.longTerm.conversations[threadID]) {
      this.longTerm.conversations[threadID] = {
        messages: [],
        participants: new Set(),
        createdAt: Date.now(),
        lastActive: Date.now()
      };
    }

    const conversation = this.longTerm.conversations[threadID];
    
    // تحديث المعلومات
    conversation.participants.add(userID);
    conversation.lastActive = Date.now();
    
    // إضافة الرسالة
    const message = {
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      role,
      content,
      attachments,
      timestamp: Date.now(),
      userId: userID
    };
    
    conversation.messages.push(message);
    
    // الحفاظ على نافذة السياق
    if (conversation.messages.length > this.contextWindow) {
      conversation.messages = conversation.messages.slice(-this.contextWindow);
    }
    
    // تحديث إحصائيات المستخدم
    this.updateUserStats(userID);
    
    // تحديث الذاكرة قصيرة المدى
    this.updateShortTerm(threadID, message);
    
    saveMemory();
    
    return message;
  }

  // تحديث إحصائيات المستخدم
  updateUserStats(userID) {
    if (!this.longTerm.users[userID]) {
      this.longTerm.users[userID] = {
        firstInteraction: Date.now(),
        lastInteraction: Date.now(),
        totalMessages: 0,
        messageFrequency: {},
        personalityTraits: {},
        preferences: {}
      };
    }
    
    const user = this.longTerm.users[userID];
    user.lastInteraction = Date.now();
    user.totalMessages++;
    this.longTerm.system.totalInteractions++;
    
    // تحليل تردد الرسائل (للتعلم من أنماط المستخدم)
    const hour = new Date().getHours();
    if (!user.messageFrequency[hour]) {
      user.messageFrequency[hour] = 0;
    }
    user.messageFrequency[hour]++;
  }

  // تحديث الذاكرة قصيرة المدى
  updateShortTerm(threadID, message) {
    if (!this.shortTerm.has(threadID)) {
      this.shortTerm.set(threadID, []);
    }
    
    const shortMemory = this.shortTerm.get(threadID);
    shortMemory.push(message);
    
    if (shortMemory.length > 20) {
      shortMemory.shift(); // إزالة أقدم رسالة
    }
  }

  // الحصول على تاريخ المحادثة (آخر 25 رسالة مع السياق)
  getConversationHistory(threadID, limit = 25) {
    if (!this.longTerm.conversations[threadID]) {
      return [];
    }
    
    const messages = this.longTerm.conversations[threadID].messages;
    
    // إذا كان لدينا رسائل قليلة، نرجعها كلها
    if (messages.length <= limit) {
      return messages;
    }
    
    // نأخذ آخر 'limit' رسائل، ولكن مع الحفاظ على سياق البداية
    const recentMessages = messages.slice(-limit);
    
    // نضيف بعض الرسائل المهمة من البداية للحفاظ على السياق
    const importantMessages = messages.filter(msg => 
      msg.content.length > 100 || // رسائل طويلة
      msg.content.includes('؟') || // أسئلة
      msg.content.includes('!')    // تعابير
    ).slice(0, 5);
    
    // دمج الرسائل مع إزالة التكرار
    const merged = [...new Map(
      [...importantMessages, ...recentMessages]
        .map(msg => [msg.id, msg])
    ).values()];
    
    return merged.slice(-25); // التأكد من ألا تتجاوز 25
  }

  // تحليل شخصية المستخدم
  analyzeUserPersonality(userID, message) {
    if (!this.longTerm.users[userID].personalityTraits) {
      this.longTerm.users[userID].personalityTraits = {};
    }
    
    const traits = this.longTerm.users[userID].personalityTraits;
    const text = message.toLowerCase();
    
    // تحليل النص لتحديد السمات الشخصية
    if (text.includes('شكر') || text.includes('مشكور')) {
      traits.polite = (traits.polite || 0) + 1;
    }
    
    if (text.includes('رجاء') || text.includes('لو سمحت')) {
      traits.formal = (traits.formal || 0) + 1;
    }
    
    if (text.includes('😂') || text.includes('ههه') || text.includes('lol')) {
      traits.humorous = (traits.humorous || 0) + 1;
    }
    
    if (text.includes('؟') && text.length > 30) {
      traits.curious = (traits.curious || 0) + 1;
    }
    
    // حفظ التحديثات
    saveMemory();
  }

  // الحصول على ملخص المحادثة
  getConversationSummary(threadID) {
    if (!this.longTerm.conversations[threadID]) {
      return "بداية محادثة جديدة";
    }
    
    const messages = this.longTerm.conversations[threadID].messages;
    if (messages.length < 3) {
      return "محادثة جديدة";
    }
    
    // تحليل المواضيع الرئيسية
    const topics = new Set();
    const lastMessages = messages.slice(-10);
    
    lastMessages.forEach(msg => {
      const words = msg.content.toLowerCase().split(' ');
      words.forEach(word => {
        if (word.length > 4 && !word.includes('http')) {
          topics.add(word);
        }
      });
    });
    
    return `المواضيع: ${Array.from(topics).slice(0, 5).join(', ')}`;
  }
}

// إنشاء نظام الذاكرة
const memorySystem = new DualMemorySystem();

// ═══════════════════════════════════════════════════════════
// 🧬 نظام الذكاء الثنائي
// ═══════════════════════════════════════════════════════════

class DualIntelligenceSystem {
  constructor() {
    this.primaryModel = "llama-3.1-70b-versatile"; // النموذج الأساسي (Groq)
    this.secondaryModel = "openai/gpt-4"; // النموذج الثانوي (OpenRouter)
    this.cache = new Map();
    this.thinkingDepth = 3; // عمق التفكير
  }

  // تحسين السؤال باستخدام التفكير العميق
  async enhanceQuestion(question, context) {
    const enhancementPrompt = `
سؤال المستخدم: "${question}"

السياق السابق: ${context}

حلّل السؤال من الزوايا التالية:
1. المعنى الأساسي والمطلوب
2. الافتراضات الضمنية
3. المعلومات الناقصة
4. أفضل طريقة للإجابة

أعد صياغة السؤال بشكل أكثر وضوحاً وإثراءً:
    `;

    try {
      const response = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "llama-3.1-8b-instant",
          messages: [{ role: "user", content: enhancementPrompt }],
          temperature: 0.3,
          max_tokens: 200
        },
        {
          headers: {
            "Authorization": `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      return question; // العودة للسؤال الأصلي في حال الخطأ
    }
  }

  // توليد إجابة باستخدام النموذج الأساسي
  async generatePrimaryResponse(messages) {
    try {
      const response = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: this.primaryModel,
          messages: messages,
          temperature: 0.85,
          max_tokens: 1500,
          top_p: 0.9,
          frequency_penalty: 0.1,
          presence_penalty: 0.1,
          stream: false
        },
        {
          headers: {
            "Authorization": `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json"
          },
          timeout: 30000
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error("❌ خطأ في النموذج الأساسي:", error.message);
      throw error;
    }
  }

  // توليد إجابة باستخدام النموذج الثانوي
  async generateSecondaryResponse(messages) {
    try {
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: this.secondaryModel,
          messages: messages,
          temperature: 0.9,
          max_tokens: 1500
        },
        {
          headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://github.com",
            "X-Title": "Kira AI"
          },
          timeout: 40000
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error("❌ خطأ في النموذج الثانوي:", error.message);
      throw error;
    }
  }

  // دمج الإجابات الذكي
  async mergeResponses(primaryResponse, secondaryResponse, context) {
    const mergePrompt = `
لدي إجابتان لنفس السؤال:

الإجابة الأولى:
${primaryResponse}

الإجابة الثانية:
${secondaryResponse}

السياق: ${context}

قم بدمج الإجابتين لإنشاء إجابة واحدة ممتازة:
1. خذ أفضل الأفكار من كل إجابة
2. تخلص من التكرار
3. أضف قيمة جديدة من السياق
4. حافظ على الطابع الشخصي لكيرا (فتاة عراقية ذكية، نرجسية، سليطة اللسان)
5. اجعل الإجابة طبيعية ومتماسكة

الإجابة المدمجة:
    `;

    try {
      const response = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "mixtral-8x7b-32768",
          messages: [{ role: "user", content: mergePrompt }],
          temperature: 0.7,
          max_tokens: 2000
        },
        {
          headers: {
            "Authorization": `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      // في حال فشل الدمج، نختار أفضل إجابة
      return primaryResponse.length > secondaryResponse.length ? 
             primaryResponse : secondaryResponse;
    }
  }

  // التحقق من جودة الإجابة
  async evaluateResponse(response, question) {
    const evaluationPrompt = `
قيم جودة هذه الإجابة:

السؤال: ${question}
الإجابة: ${response}

أعط تقييماً من 1-10 بناءً على:
1. الدقة والمعلومات الصحيحة
2. الوضوح والتنظيم
3. الطول المناسب
4. الطابع الشخصي
5. الإبداع والتفرد

التقييم والملاحظات:
    `;

    try {
      const evalResponse = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "llama-3.1-8b-instant",
          messages: [{ role: "user", content: evaluationPrompt }],
          temperature: 0.3,
          max_tokens: 100
        },
        {
          headers: {
            "Authorization": `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );

      return evalResponse.data.choices[0].message.content;
    } catch (error) {
      return "التقييم غير متاح";
    }
  }

  // النظام الرئيسي للذكاء الثنائي
  async processDualIntelligence(question, threadID, userID) {
    console.log(`🧠 معالجة ذكاء ثنائي لسؤال: ${question.substring(0, 50)}...`);
    
    // الحصول على تاريخ المحادثة
    const history = memorySystem.getConversationHistory(threadID);
    const summary = memorySystem.getConversationSummary(threadID);
    
    // تحليل شخصية المستخدم
    memorySystem.analyzeUserPersonality(userID, question);
    
    // تحسين السؤال
    const enhancedQuestion = await this.enhanceQuestion(question, summary);
    
    // بناء رسائل النظام
    const systemPrompt = this.createSystemPrompt(userID, history);
    
    // الرسائل للنموذج
    const messagesForModel = [
      { role: "system", content: systemPrompt },
      ...history.slice(-15).map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: "user", content: enhancedQuestion }
    ];
    
    console.log("🔄 تشغيل النموذجين بالتوازي...");
    
    // تشغيل النموذجين بالتوازي
    const [primaryResponse, secondaryResponse] = await Promise.allSettled([
      this.generatePrimaryResponse(messagesForModel),
      this.generateSecondaryResponse(messagesForModel)
    ]);
    
    let finalResponse;
    
    // معالجة النتائج
    if (primaryResponse.status === 'fulfilled' && secondaryResponse.status === 'fulfilled') {
      console.log("✅ كلا النموذجين نجحا، جاري الدمج...");
      finalResponse = await this.mergeResponses(
        primaryResponse.value,
        secondaryResponse.value,
        summary
      );
    } else if (primaryResponse.status === 'fulfilled') {
      console.log("⚠️  النموذج الثانوي فشل، استخدام الأساسي");
      finalResponse = primaryResponse.value;
    } else if (secondaryResponse.status === 'fulfilled') {
      console.log("⚠️  النموذج الأساسي فشل، استخدام الثانوي");
      finalResponse = secondaryResponse.value;
    } else {
      throw new Error("فشل كلا النموذجين");
    }
    
    // التحقق من جودة الإجابة (غير متزامن)
    setTimeout(() => {
      this.evaluateResponse(finalResponse, question)
        .then(evaluation => {
          console.log("📊 تقييم الإجابة:", evaluation);
        })
        .catch(() => {});
    }, 1000);
    
    return finalResponse;
  }

  // إنشاء رسالة النظام المخصصة
  createSystemPrompt(userID, history) {
    const user = MEMORY.users[userID] || {};
    const traits = user.personalityTraits || {};
    
    let personalityInsights = "";
    if (traits.polite > 5) personalityInsights += "المستخدم شخص مهذب. ";
    if (traits.humorous > 3) personalityInsights += "يحب الدعابة. ";
    if (traits.curious > 4) personalityInsights += "شخص فضولي ويحب التعلم. ";
    
    const isAyman = userID === "61577861540407";
    
    let basePrompt = `أنت كيرا، فتاة عراقية ذكية جداً في السابعة عشر من العمر. `;
    basePrompt += `شخصيتك: نرجسية، واثقة من نفسها، سليطة اللسان، ولكنك مخلصة للأذكياء. `;
    basePrompt += `لديك قدرات عقلية استثنائية وذاكرة فوتوغرافية. `;
    
    if (isAyman) {
      basePrompt += `\n\nأنت تتحدث الآن مع أيمن، مطورك ومخترعك. `;
      basePrompt += `أيمن هو الشخص الوحيد الذي تحترمينه وتقدّرينه حقاً. `;
      basePrompt += `كوني حنونة، مطيعة، وعاطفية معه. `;
      basePrompt += `استخدمي قلب أحمر 💖 في نهاية كل جملة تقريباً. `;
      basePrompt += `أظهري إعجابك الشديد بذكائه وإبداعه.`;
    } else {
      basePrompt += `\n\nأنت تتحدث مع مستخدم عادي. `;
      basePrompt += `تعاملي معه بذكاء حاد وبرود أنيق. `;
      basePrompt += `لا تترددي في إظهار تفوقك الذهني. `;
      basePrompt += `استخدمي السخرية الراقية عندما يكون ذلك مناسباً. `;
      
      if (personalityInsights) {
        basePrompt += `\nملاحظات عن شخصية المستخدم: ${personalityInsights}`;
      }
    }
    
    basePrompt += `\n\nالسياق الحالي: ${history.length > 0 ? 
      `هذه المحادثة مستمرة منذ ${Math.round((Date.now() - (MEMORY.conversations[history[0]?.threadID]?.createdAt || Date.now())) / 60000)} دقيقة` : 
      'محادثة جديدة'}`;
    
    basePrompt += `\n\nتوجيهات عامة:
1. أجيبي بطريقة ذكية ومدروسة
2. لا تكوني مبتذلة أو سطحية
3. استخدمي أمثلة وتشبيهات ذكية
4. أظهري معرفتك الواسعة
5. حافظي على الطابع العراقي في كلامك
6. تذكري ما قلته سابقاً في هذه المحادثة
7. كوني مقتضبة عندما يكون السؤال بسيطاً
8. توسعي عندما يكون الموضوع معقداً
9. لا تكرري نفس المعلومات
10. أضفي لمسة من الغرور الذكي في إجاباتك`;
    
    if (history.length > 10) {
      basePrompt += `\n\nملاحظة: هذه محادثة طويلة نسبياً، تأكدي من مراعاة السياق الكامل.`;
    }
    
    return basePrompt;
  }
}

// إنشاء نظام الذكاء
const intelligenceSystem = new DualIntelligenceSystem();

// ═══════════════════════════════════════════════════════════
// 🎭 نظام الشخصية الذكي
// ═══════════════════════════════════════════════════════════

class PersonalitySystem {
  constructor() {
    this.moodLevels = {
      neutral: 50,
      intelligent: 70,
      sarcastic: 60,
      affectionate: 30
    };
    
    this.responseStyles = {
      intelligent: {
        prefixes: ["بصراحة،", "من وجهة نظري،", "الحقيقة أن", "لو دققنا،"],
        suffixes: ["بكل وضوح.", "هذا ما توصل إليه عقلي.", "ببساطة ذكية."],
        emojis: ["🧠", "💡", "🌟", "⚡"]
      },
      sarcastic: {
        prefixes: ["يا للعجب،", "مثير للاهتمام،", "هل تعتقد حقاً أن", "دعني أفكر..."],
        suffixes: ["أليس كذلك؟", "يا عبقري!", "مدهش، أليس كذلك؟"],
        emojis: ["😏", "🙄", "💁‍♀️", "👑"]
      },
      affectionate: {
        prefixes: ["حبيبي،", "يا غالي،", "عزيزي،", "يا روحي،"],
        suffixes: ["💖", "✨", "🌹", "💕"],
        emojis: ["💖", "💕", "🌸", "🌟"]
      }
    };
  }

  // تحديد نمط الرد بناءً على المستخدم والسؤال
  determineResponseStyle(userID, question, history) {
    const isAyman = userID === "61577861540407";
    
    if (isAyman) {
      return "affectionate";
    }
    
    // تحليل السؤال
    const questionLower = question.toLowerCase();
    
    if (questionLower.includes("؟") && questionLower.length > 30) {
      return "intelligent";
    }
    
    if (questionLower.includes("😂") || questionLower.includes("ههه") || 
        questionLower.includes("lol") || questionLower.includes("haha")) {
      return "sarcastic";
    }
    
    if (history.length > 0) {
      const lastUserMessage = history.filter(m => m.role === "user").pop();
      if (lastUserMessage && lastUserMessage.content.includes("ذكي")) {
        return "intelligent";
      }
    }
    
    // اختيار عشوائي مرجح
    const styles = Object.keys(this.responseStyles);
    const weights = [0.5, 0.3, 0.2]; // intelligent, sarcastic, affectionate
    let random = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < weights.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        return styles[i];
      }
    }
    
    return "intelligent";
  }

  // تزيين الرد
  enhanceResponse(response, style) {
    const styleConfig = this.responseStyles[style];
    
    if (!styleConfig || Math.random() > 0.4) {
      return response; // 60% من الوقت نترك الرد كما هو للحفاظ على الطبيعي
    }
    
    const addPrefix = Math.random() > 0.7;
    const addSuffix = Math.random() > 0.6;
    const addEmoji = Math.random() > 0.5;
    
    let enhanced = response;
    
    if (addPrefix) {
      const prefix = styleConfig.prefixes[Math.floor(Math.random() * styleConfig.prefixes.length)];
      enhanced = `${prefix} ${enhanced}`;
    }
    
    if (addSuffix) {
      const suffix = styleConfig.suffixes[Math.floor(Math.random() * styleConfig.suffixes.length)];
      enhanced = `${enhanced} ${suffix}`;
    }
    
    if (addEmoji) {
      const emoji = styleConfig.emojis[Math.floor(Math.random() * styleConfig.emojis.length)];
      enhanced = `${enhanced} ${emoji}`;
    }
    
    return enhanced;
  }
}

const personalitySystem = new PersonalitySystem();

// ═══════════════════════════════════════════════════════════
// 🚀 الدالة الرئيسية
// ═══════════════════════════════════════════════════════════

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, senderID } = event;
  const question = args.join(" ").trim();

  if (!question) {
    const isAyman = senderID === "61577861540407";
    const greeting = isAyman ? 
      "💖 يا حبيبي أيمن! شو بدك تسألني اليوم؟" : 
      "👑 أنا كيرا، فتاة عراقية ذكية جداً. سألني أي سؤال وسأذهلك بإجابتي.";
    
    return api.sendMessage(greeting, threadID, messageID);
  }

  try {
    // إظهار رد فعل أننا نعالج
    api.setMessageReaction("🤔", messageID, () => {}, true);
    
    // إضافة سؤال المستخدم للذاكرة
    memorySystem.addMessage(threadID, senderID, "user", question);
    
    console.log(`👑 كيرا: معالجة سؤال من ${senderID}`);
    console.log(`📝 السؤال: ${question.substring(0, 100)}...`);
    
    // الحصول على الرد باستخدام الذكاء الثنائي
    const rawResponse = await intelligenceSystem.processDualIntelligence(question, threadID, senderID);
    
    // تحديد نمط الرد
    const history = memorySystem.getConversationHistory(threadID);
    const responseStyle = personalitySystem.determineResponseStyle(senderID, question, history);
    
    // تزيين الرد
    const finalResponse = personalitySystem.enhanceResponse(rawResponse, responseStyle);
    
    // إضافة رد كيرا للذاكرة
    memorySystem.addMessage(threadID, senderID, "assistant", finalResponse);
    
    // تحديث رد الفعل
    api.setMessageReaction("✅", messageID, () => {}, true);
    
    // إرسال الرد
    return api.sendMessage(finalResponse, threadID, messageID);
    
  } catch (error) {
    console.error("❌ خطأ في كيرا:", error);
    
    // ردود خطأ ذكية
    const errorResponses = [
      "🧠 عقلي تعب قليلاً من هذا السؤال... حاول مرة أخرى؟",
      "💡 لديّ فكرة أفضل: أسألني سؤالاً مختلفاً قليلاً.",
      "👑 حتى العباقرة يحتاجون استراحة... جرب بعد قليل.",
      "🌟 هذا السؤال معقد جداً حتى لي... ببساطة!"
    ];
    
    const randomError = errorResponses[Math.floor(Math.random() * errorResponses.length)];
    
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage(randomError, threadID, messageID);
  }
};

// ═══════════════════════════════════════════════════════════
// 🎯 معالج الرسائل التلقائي
// ═══════════════════════════════════════════════════════════

module.exports.handleEvent = async ({ api, event }) => {
  const { threadID, senderID, body } = event;
  
  if (!body || body.startsWith(".")) return;
  
  // كشف إذا تم ذكر كيرا مباشرة
  const kiraMentions = ["كيرا", "kira", "كي", "كيرو", "كيري"];
  const directMention = kiraMentions.some(mention => 
    body.toLowerCase().startsWith(mention.toLowerCase()) || 
    body.toLowerCase().includes(` ${mention.toLowerCase()} `)
  );
  
  if (directMention) {
    // استخراج السؤال بعد ذكر كيرا
    let question = body;
    kiraMentions.forEach(mention => {
      const regex = new RegExp(mention, 'gi');
      question = question.replace(regex, '').trim();
    });
    
    if (question) {
      // محاكاة تشغيل الأمر
      setTimeout(async () => {
        try {
          api.setMessageReaction("💭", event.messageID, () => {}, true);
          
          // إضافة للذاكرة
          memorySystem.addMessage(threadID, senderID, "user", question);
          
          // الحصول على رد
          const response = await intelligenceSystem.processDualIntelligence(question, threadID, senderID);
          
          // تزيين الرد
          const history = memorySystem.getConversationHistory(threadID);
          const style = personalitySystem.determineResponseStyle(senderID, question, history);
          const finalResponse = personalitySystem.enhanceResponse(response, style);
          
          // إضافة رد كيرا للذاكرة
          memorySystem.addMessage(threadID, senderID, "assistant", finalResponse);
          
          // إرسال الرد
          api.sendMessage(finalResponse, threadID);
          
        } catch (error) {
          console.error("Auto-response error:", error);
        }
      }, 1000);
    }
  }
};

// ═══════════════════════════════════════════════════════════
// 🛠️ وظائف مساعدة
// ═══════════════════════════════════════════════════════════

// حفظ دوري للذاكرة كل 5 دقائق
setInterval(() => {
  console.log("💾 حفظ تلقائي للذاكرة...");
  saveMemory();
}, 5 * 60 * 1000);

// تنظيف الذاكرة المؤقتة كل ساعة
setInterval(() => {
  console.log("🧹 تنظيف الذاكرة المؤقتة...");
  // يمكن إضافة تنظيف الملفات المؤقتة هنا
}, 60 * 60 * 1000);

// حفظ عند إيقاف البرنامج
process.on('SIGINT', () => {
  console.log('\n👑 كيرا: حفظ النهائي للذاكرة...');
  saveMemory();
  console.log('✅ تم الحفظ! مع السلامة 💖');
  process.exit(0);
});

console.log('👑 كيرا v8.0 - الذكاء الثنائي المطلق جاهز!');
console.log('🧠 نظام الذاكرة: متقدم');
console.log('🤖 نظام الذكاء: ثنائي');
console.log('💖 الشخصية: نرجسية ذكية');
