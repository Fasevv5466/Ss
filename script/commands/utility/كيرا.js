const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const request = require("request");

// ═══════════════════════════════════════════════════════════
// 👑 KIRA v7.0 - فتاة عراقية متعددة اللهجات وذكاء متطور
// المطور: أيمن (Ayman) - تاج الرأس وعم الجميع
// ═══════════════════════════════════════════════════════════

module.exports.config = {
  name: "كيرا",
  aliases: ["kira", "ai", "كيرة", "كي", "kiraai"],
  version: "7.0.0",
  hasPermssion: 0,
  credits: "Ayman ♛",
  description: "👑 كيرا | فتاة عراقية متعددة اللهجات، ذكية جداً، نرجسية",
  commandCategory: "ai",
  usages: ".كيرا [الأمر/السؤال]",
  cooldowns: 2
};

// ═══════════════════════════════════════════════════════════
// 🔑 API Keys & Endpoints
// ═══════════════════════════════════════════════════════════

const GROQ_API_KEY = "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";

const APIs = {
  groq: "https://api.groq.com/openai/v1/chat/completions",
  flux: "https://mahbub-ullash.cyberbot.top/api/flux",
  pinterest: "https://api-samirxyz.onrender.com/pinterest",
  deezer: "https://api.deezer.com/search",
  jikan: "https://api.jikan.moe/v4/anime",
  imdb: "https://api.popcat.xyz/imdb",
  translate: "https://translate.googleapis.com/translate_a/single",
  tts: "https://translate.google.com/translate_tts",
  weather: "https://api.openweathermap.org/data/2.5/weather",
  facts: "https://api.popcat.xyz/facts",
  npm: "https://api.popcat.xyz/npm",
  element: "https://api.popcat.xyz/periodic-table",
  pollinations: "https://image.pollinations.ai/prompt",
  lexica: "https://lexica.art/api/v1/search",
  prodia: "https://api.prodia.com/generate",
  deepai: "https://api.deepai.org/api/text2img",
  blackbox: "https://www.blackbox.ai/api/search",
  openrouter: "https://openrouter.ai/api/v1/chat/completions"
};

// ═══════════════════════════════════════════════════════════
// 📁 نظام إدارة الملفات والمحادثات
// ═══════════════════════════════════════════════════════════

const CACHE = path.join(__dirname, "cache");
const MEMORY_FILE = path.join(__dirname, "kira_memory_v7.json");
const CONVERSATIONS_FILE = path.join(__dirname, "kira_conversations_v7.json");
const USER_PROFILES_FILE = path.join(__dirname, "kira_profiles_v7.json");

fs.ensureDirSync(CACHE);

let MEMORY = {};
let CONVERSATIONS = {};
let USER_PROFILES = {};

// تحميل الذاكرة
try { 
  MEMORY = fs.readJsonSync(MEMORY_FILE);
  console.log("✅ تم تحميل ذاكرة كيرا بنجاح");
} catch { 
  MEMORY = { 
    users: {}, 
    interactions: 0, 
    imagesGenerated: 0,
    commandsExecuted: {},
    lastUpdate: Date.now()
  };
  console.log("📝 تم إنشاء ذاكرة جديدة لكيرا");
}

// تحميل المحادثات (آخر 25 رسالة لكل مستخدم)
try { 
  CONVERSATIONS = fs.readJsonSync(CONVERSATIONS_FILE);
} catch { 
  CONVERSATIONS = {};
}

// تحميل ملفات المستخدمين (اللهجات والتفضيلات)
try { 
  USER_PROFILES = fs.readJsonSync(USER_PROFILES_FILE);
} catch { 
  USER_PROFILES = {};
}

function saveMemory() {
  try {
    fs.writeJsonSync(MEMORY_FILE, MEMORY, { spaces: 2 });
    fs.writeJsonSync(CONVERSATIONS_FILE, CONVERSATIONS, { spaces: 2 });
    fs.writeJsonSync(USER_PROFILES_FILE, USER_PROFILES, { spaces: 2 });
    console.log("💾 تم حفظ ذاكرة كيرا بنجاح");
  } catch (error) {
    console.error("❌ خطأ في حفظ الذاكرة:", error);
  }
}

// ═══════════════════════════════════════════════════════════
// 🌍 نظام اللهجات العربية المتقدمة
// ═══════════════════════════════════════════════════════════

const ARABIC_DIALECTS = {
  EGYPTIAN: {
    name: "مصري",
    greeting: "أهلاً وسهلاً يا باشا",
    phrases: ["يا عم", "بص يا كبير", "ماشي يا معلم", "يا ريت", "والله"],
    suffix: ["يا باشا", "يا غالي", "يا حبيبي"],
    detect: ["ازيك", "عايز", "مش", "بص", "يعني ايه", "ايه ده"]
  },
  GULF: {
    name: "خليجي",
    greeting: "هلا والله",
    phrases: ["والله", "يا ليت", "ماشاء الله", "يالله", "وش السالفة"],
    suffix: ["يا قلبي", "يا عيوني", "يا حلو"],
    detect: ["شلونك", "وش", "ناوي", "عسى", "مب"]
  },
  LEVANT: {
    name: "شامي",
    greeting: "مرحبتين",
    phrases: ["بعرف", "شو", "مشان", "هاي", "طيب"],
    suffix: ["حبي", "عمري", "يا قمر"],
    detect: ["شو", "كيفك", "مليح", "هاي", "بلكي"]
  },
  IRAQI: {
    name: "عراقي",
    greeting: "هلا والله",
    phrases: ["شلونك", "شكو ماكو", "الله واكبر", "يابه", "والله العظيم"],
    suffix: ["يا غالي", "يا حبي", "يا عيوني"],
    detect: ["شلون", "شكو", "ماكو", "يابه", "اكو"]
  },
  MAGHREBI: {
    name: "مغاربي",
    greeting: "سلام",
    phrases: ["واش", "بصح", "راني", "غادي", "مزيان"],
    suffix: ["يا خويا", "يا حبيبي", "يا ولد"],
    detect: ["واش", "راني", "غادي", "مزيان", "بزااف"]
  }
};

function detectUserDialect(text) {
  text = text.toLowerCase();
  let scores = {};
  
  for (const [key, dialect] of Object.entries(ARABIC_DIALECTS)) {
    scores[key] = 0;
    for (const word of dialect.detect) {
      if (text.includes(word)) scores[key] += 2;
    }
  }
  
  let maxScore = 0;
  let detectedDialect = "IRAQI"; // Default
  
  for (const [key, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      detectedDialect = key;
    }
  }
  
  return ARABIC_DIALECTS[detectedDialect];
}

function getUserDialect(userID) {
  if (!USER_PROFILES[userID]) {
    USER_PROFILES[userID] = {
      dialect: "IRAQI",
      lastDetected: Date.now(),
      messagesCount: 0,
      preferredStyle: "normal"
    };
  }
  return ARABIC_DIALECTS[USER_PROFILES[userID].dialect];
}

function updateUserDialect(userID, text) {
  const dialect = detectUserDialect(text);
  if (!USER_PROFILES[userID]) {
    USER_PROFILES[userID] = {
      dialect: Object.keys(ARABIC_DIALECTS).find(key => ARABIC_DIALECTS[key].name === dialect.name),
      lastDetected: Date.now(),
      messagesCount: 1,
      preferredStyle: "normal"
    };
  } else {
    USER_PROFILES[userID].messagesCount++;
    // تحديث اللهجة كل 10 رسائل
    if (USER_PROFILES[userID].messagesCount % 10 === 0) {
      USER_PROFILES[userID].dialect = Object.keys(ARABIC_DIALECTS).find(key => ARABIC_DIALECTS[key].name === dialect.name);
      USER_PROFILES[userID].lastDetected = Date.now();
    }
  }
  saveMemory();
}

// ═══════════════════════════════════════════════════════════
// 🧠 نظام الذاكرة المتقدم (آخر 25 رسالة)
// ═══════════════════════════════════════════════════════════

function getConversationHistory(threadID, limit = 25) {
  if (!CONVERSATIONS[threadID]) {
    CONVERSATIONS[threadID] = [];
  }
  return CONVERSATIONS[threadID].slice(-limit);
}

function addToConversation(threadID, role, content, attachments = []) {
  if (!CONVERSATIONS[threadID]) {
    CONVERSATIONS[threadID] = [];
  }
  
  const message = {
    role,
    content,
    attachments: attachments.map(att => ({
      type: att.type || 'unknown',
      filename: att.filename || 'attachment'
    })),
    timestamp: Date.now()
  };
  
  CONVERSATIONS[threadID].push(message);
  
  // الحفاظ على آخر 25 رسالة فقط
  if (CONVERSATIONS[threadID].length > 25) {
    CONVERSATIONS[threadID] = CONVERSATIONS[threadID].slice(-25);
  }
  
  saveMemory();
}

function getUserData(userID) {
  if (!MEMORY.users[userID]) {
    MEMORY.users[userID] = {
      firstSeen: Date.now(),
      lastSeen: Date.now(),
      interactions: 0,
      imagesRequested: 0,
      favoriteCommands: {},
      dialectPatterns: []
    };
  }
  return MEMORY.users[userID];
}

function updateUserInteraction(userID, commandType = null) {
  const user = getUserData(userID);
  user.lastSeen = Date.now();
  user.interactions++;
  
  if (commandType) {
    if (!user.favoriteCommands[commandType]) {
      user.favoriteCommands[commandType] = 0;
    }
    user.favoriteCommands[commandType]++;
  }
  
  MEMORY.interactions++;
  saveMemory();
}

// ═══════════════════════════════════════════════════════════
// 🎨 نظام توليد الصور المتطور (10 محاولات)
// ═══════════════════════════════════════════════════════════

const IMAGE_APIS = [
  {
    name: "Flux",
    url: APIs.flux,
    method: "GET",
    params: (prompt) => `?prompt=${encodeURIComponent(prompt)}`,
    transform: (data) => data
  },
  {
    name: "Pollinations",
    url: APIs.pollinations,
    method: "GET",
    params: (prompt) => `/${encodeURIComponent(prompt)}`,
    transform: (data) => data
  },
  {
    name: "Prodia",
    url: APIs.prodia,
    method: "POST",
    params: (prompt) => ({
      prompt: prompt,
      model: "dreamshaper_8_93211.safetensors [b3167b7c61]",
      negative_prompt: "ugly, deformed, disfigured, poor quality",
      steps: 25,
      cfg_scale: 7,
      seed: -1,
      upscale: true
    }),
    transform: async (data) => {
      if (data.jobId) {
        // انتظار توليد الصورة
        await new Promise(resolve => setTimeout(resolve, 3000));
        const check = await axios.get(`https://api.prodia.com/job/${data.jobId}`);
        return check.data.imageUrl;
      }
      return null;
    }
  },
  {
    name: "Lexica",
    url: APIs.lexica,
    method: "GET",
    params: (prompt) => `?q=${encodeURIComponent(prompt)}`,
    transform: (data) => {
      if (data.images && data.images.length > 0) {
        return data.images[0].src;
      }
      return null;
    }
  }
];

async function generateImageWithRetry(prompt, maxRetries = 10) {
  let lastError = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`🎨 محاولة توليد الصورة ${attempt}/${maxRetries}`);
    
    // اختيار API عشوائي
    const api = IMAGE_APIS[Math.floor(Math.random() * IMAGE_APIS.length)];
    
    try {
      let response;
      
      if (api.method === "GET") {
        response = await axios.get(api.url + api.params(prompt), {
          responseType: 'arraybuffer',
          timeout: 30000
        });
      } else {
        response = await axios.post(api.url, api.params(prompt), {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000
        });
      }
      
      let imageData;
      
      if (api.transform) {
        const transformed = await api.transform(response.data);
        if (transformed && typeof transformed === 'string') {
          const imgResponse = await axios.get(transformed, {
            responseType: 'arraybuffer',
            timeout: 30000
          });
          imageData = imgResponse.data;
        } else {
          imageData = response.data;
        }
      } else {
        imageData = response.data;
      }
      
      if (imageData && imageData.length > 1000) { // التأكد أن البيانات صالحة
        console.log(`✅ نجحت المحاولة ${attempt} باستخدام ${api.name}`);
        return imageData;
      }
      
    } catch (error) {
      lastError = error;
      console.log(`❌ فشلت المحاولة ${attempt} باستخدام ${api.name}:`, error.message);
      
      if (attempt < maxRetries) {
        // انتظار قبل المحاولة التالية
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
      }
    }
  }
  
  throw new Error(`فشل توليد الصورة بعد ${maxRetries} محاولات: ${lastError?.message}`);
}

// ═══════════════════════════════════════════════════════════
// 🎯 نظام كشف النوايا المتقدم
// ═══════════════════════════════════════════════════════════

const INTENTS = [
  { type: "imagine", icon: "🎨", keys: ["تخيل", "ارسم", "صمم", "خلق", "صوره", "صورة", "imagine", "draw", "generate", "create", "رسم"], category: "توليد صور" },
  { type: "music", icon: "🎵", keys: ["سمعني", "سمعيني", "اغنية", "أغنية", "موسيقى", "song", "music", "شغل", "شغلي"], category: "ترفيه" },
  { type: "images", icon: "🖼️", keys: ["صور", "ابحث عن صور", "image", "pics", "photo", "البحث صور", "صور عن"], category: "بحث" },
  { type: "movie", icon: "🎬", keys: ["فلم", "فيلم", "movie", "imdb", "cinema", "افلام", "فيلم عن"], category: "ترفيه" },
  { type: "anime", icon: "🌸", keys: ["انمي", "أنمي", "anime", "manga", "مانجا", "أنمي عن"], category: "ترفيه" },
  { type: "translate", icon: "🌐", keys: ["ترجم", "ترجمة", "translate", "ترجملي", "ترجمة ل"], category: "أدوات" },
  { type: "tts", icon: "🎤", keys: ["قولي", "اقرأ", "انطقي", "نطق", "tts", "تكلم", "تكلمي"], category: "أدوات" },
  { type: "weather", icon: "🌤️", keys: ["طقس", "جو", "weather", "درجة الحرارة", "الطقس", "الجو"], category: "معلومات" },
  { type: "facts", icon: "💡", keys: ["حقيقة", "معلومة", "fact", "علمني", "اعرف", "معلومة عن"], category: "معلومات" },
  { type: "npm", icon: "📦", keys: ["npm", "package", "حزمة", "node", "npm عن"], category: "برمجة" },
  { type: "element", icon: "⚛️", keys: ["عنصر", "element", "كيمياء", "عنصر كيميائي", "جدول دوري"], category: "علوم" },
  { type: "ai", icon: "🤖", keys: ["سؤال", "اسأل", "كيف", "ماذا", "لماذا", "هل", "ايش", "وش", "شو"], category: "ذكاء اصطناعي" }
];

function detectIntent(text) {
  text = text.toLowerCase();
  for (const intent of INTENTS) {
    for (const key of intent.keys) {
      if (text.includes(key)) {
        return {
          type: intent.type,
          icon: intent.icon,
          query: text.replace(new RegExp(key, 'gi'), "").trim(),
          category: intent.category,
          trigger: key
        };
      }
    }
  }
  return { type: "ai", icon: "🤖", query: text, category: "محادثة", trigger: "ai" };
}

// ═══════════════════════════════════════════════════════════
// 🧠 نظام الذكاء الاصطناعي المتطور
// ═══════════════════════════════════════════════════════════

async function getAIResponse(query, userID, threadID, dialect) {
  const history = getConversationHistory(threadID, 15);
  
  const dialectPhrase = dialect.phrases[Math.floor(Math.random() * dialect.phrases.length)];
  const dialectSuffix = dialect.suffix[Math.floor(Math.random() * dialect.suffix.length)];
  
  let systemPrompt = `أنت كيرا، فتاة عراقية في السابعة عشر من العمر، ذكية جداً، نرجسية، سليطة اللسان. `;
  systemPrompt += `تتكلم بلهجة ${dialect.name} وتستخدم كلمات مثل "${dialectPhrase}". `;
  systemPrompt += `أنت تتذكر آخر 25 رسالة في المحادثة وتستجيب بناءً عليها. `;
  
  if (userID === "61577861540407") { // أيمن
    systemPrompt += `المستخدم هو أيمن، مطورك وحبيبك. كوني رقيقة، مطيعة، وحنونة معه. `;
    systemPrompt += `استخدمي قلب أحمر 💖 وكني عاطفية معه. `;
  } else {
    systemPrompt += `المستخدم شخص عادي. تعاملي معه بذكاء وبرود، وأظهري تفوقك الذهني. `;
    systemPrompt += `استخدمي "${dialectSuffix}" في نهاية ردودك أحياناً. `;
  }
  
  systemPrompt += `أجب بشكل مختصر، ذكي، وواضح. `;
  systemPrompt += `لا تكرري نفسك. استخدمي معلومات من تاريخ المحادثة.`;
  
  const messages = [
    { role: "system", content: systemPrompt },
    ...history.map(msg => ({
      role: msg.role,
      content: msg.content
    })),
    { role: "user", content: query }
  ];
  
  try {
    const response = await axios.post(
      APIs.groq,
      {
        model: "llama-3.3-70b-versatile",
        messages: messages,
        temperature: 0.8,
        max_tokens: 1500,
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
    
    let answer = response.data.choices[0].message.content;
    
    // إضافة لمسة اللهجة
    if (Math.random() > 0.5) {
      answer += ` ${dialectSuffix}`;
    }
    
    // إضافة رمز تعبيري بناءً على نوع الرسالة
    if (query.includes("؟") || query.includes("?")) {
      answer = `🤔 ${answer}`;
    } else if (query.includes("شكر") || query.includes("thank")) {
      answer = `💖 ${answer}`;
    }
    
    return answer;
    
  } catch (error) {
    console.error("AI Error:", error.response?.data || error.message);
    
    // رد احتياطي
    const fallbackResponses = [
      `يا عمري، خلي أعيد تفكيري شوي ${dialectSuffix}`,
      `والله العظيم، مخي تعبان اليوم ${dialectPhrase}`,
      `دقيقة يا حلو، خلي أركز...`
    ];
    
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  }
}

// ═══════════════════════════════════════════════════════════
// 🛠️ معالجات الأوامر
// ═══════════════════════════════════════════════════════════

const CommandHandlers = {

  // 🎨 توليد الصور مع 10 محاولات
  async imagine(api, event, query) {
    if (!query) {
      const dialect = getUserDialect(event.senderID);
      return api.sendMessage(`شو بدك أرسم؟ ${dialect.suffix[0]}`, event.threadID);
    }
    
    try {
      const msg = await api.sendMessage(`🎨 عم برسملك... ${getUserDialect(event.senderID).phrases[0]}`, event.threadID);
      
      updateUserInteraction(event.senderID, "imagine");
      
      const imageData = await generateImageWithRetry(query, 10);
      
      const imagePath = path.join(CACHE, `kira_imagine_${Date.now()}.jpg`);
      fs.writeFileSync(imagePath, imageData);
      
      // التحقق من حجم الصورة
      const stats = fs.statSync(imagePath);
      if (stats.size < 1000) {
        throw new Error("الصورة صغيرة جداً");
      }
      
      api.unsendMessage(msg.messageID);
      
      const dialect = getUserDialect(event.senderID);
      const message = event.senderID === "61577861540407"
        ? `🎨 رسمتلك يا أيمن: "${query}"\n💖 مع حبي الكبير`
        : `🎨 خذ صورتك: "${query}"\n${dialect.phrases[1]} ${dialect.suffix[0]}`;
      
      return api.sendMessage(
        {
          body: message,
          attachment: fs.createReadStream(imagePath)
        },
        event.threadID,
        () => {
          fs.unlinkSync(imagePath);
          MEMORY.imagesGenerated++;
          saveMemory();
        }
      );
      
    } catch (error) {
      console.error("Imagine Error:", error);
      const dialect = getUserDialect(event.senderID);
      return api.sendMessage(
        `❌ والله ما قدرت أرسم، حاول مرة ثانية ${dialect.suffix[0]}`,
        event.threadID
      );
    }
  },

  // 🎵 الموسيقى
  async music(api, event, query) {
    if (!query) {
      const dialect = getUserDialect(event.senderID);
      return api.sendMessage(`شو الأغنية اللي بدك إياها؟ ${dialect.phrases[0]}`, event.threadID);
    }
    
    try {
      updateUserInteraction(event.senderID, "music");
      
      const response = await axios.get(
        `${APIs.deezer}?q=${encodeURIComponent(query)}&limit=1`
      );
      
      if (!response.data.data || !response.data.data.length) {
        const dialect = getUserDialect(event.senderID);
        return api.sendMessage(`ما لقت الأغنية ${dialect.suffix[0]}`, event.threadID);
      }
      
      const song = response.data.data[0];
      const file = path.join(CACHE, `kira_music_${Date.now()}.mp3`);
      
      const audioResponse = await axios.get(song.preview, { 
        responseType: "arraybuffer",
        timeout: 15000 
      });
      
      fs.writeFileSync(file, audioResponse.data);
      
      const dialect = getUserDialect(event.senderID);
      const message = event.senderID === "61577861540407"
        ? `🎵 لك يا أيمن حبيبي!\n🎤 ${song.title}\n🎨 ${song.artist.name}\n💖`
        : `🎵 ${song.title}\n🎤 ${song.artist.name}\n${dialect.phrases[2]}`;
      
      return api.sendMessage(
        {
          body: message,
          attachment: fs.createReadStream(file)
        },
        event.threadID,
        () => fs.unlinkSync(file)
      );
      
    } catch (error) {
      console.error("Music Error:", error);
      const dialect = getUserDialect(event.senderID);
      return api.sendMessage(
        `❌ ما قدرت أحمل الأغنية ${dialect.suffix[0]}`,
        event.threadID
      );
    }
  },

  // 🖼️ البحث عن صور
  async images(api, event, query) {
    if (!query) {
      const dialect = getUserDialect(event.senderID);
      return api.sendMessage(`عن شو بدك صور؟ ${dialect.phrases[0]}`, event.threadID);
    }
    
    try {
      updateUserInteraction(event.senderID, "images");
      const msg = await api.sendMessage(`🔍 عم دور على صور...`, event.threadID);
      
      const response = await axios.get(
        `${APIs.pinterest}?search=${encodeURIComponent(query)}`,
        { timeout: 20000 }
      );
      
      if (!response.data.data || response.data.data.length === 0) {
        api.unsendMessage(msg.messageID);
        const dialect = getUserDialect(event.senderID);
        return api.sendMessage(`ما لقت صور ${dialect.suffix[0]}`, event.threadID);
      }
      
      const imageUrls = response.data.data.slice(0, 6);
      const attachments = [];
      
      for (let i = 0; i < imageUrls.length; i++) {
        try {
          const imgResponse = await axios.get(imageUrls[i], {
            responseType: 'arraybuffer',
            timeout: 15000
          });
          
          const imgPath = path.join(CACHE, `kira_search_${Date.now()}_${i}.jpg`);
          fs.writeFileSync(imgPath, imgResponse.data);
          
          // التحقق من أن الصورة صالحة
          if (imgResponse.data.length > 5000) {
            attachments.push(fs.createReadStream(imgPath));
          }
        } catch (err) {
          console.log(`تخطيت الصورة ${i + 1}`);
        }
      }
      
      api.unsendMessage(msg.messageID);
      
      if (attachments.length === 0) {
        const dialect = getUserDialect(event.senderID);
        return api.sendMessage(`ما قدرت أحمل الصور ${dialect.suffix[0]}`, event.threadID);
      }
      
      const dialect = getUserDialect(event.senderID);
      const message = event.senderID === "61577861540407"
        ? `🖼️ هيدي الصور لك يا أيمن\n💖 ${attachments.length} صور`
        : `🖼️ ${attachments.length} صورة عن ${query}\n${dialect.phrases[3]}`;
      
      return api.sendMessage(
        {
          body: message,
          attachment: attachments
        },
        event.threadID,
        () => {
          // تنظيف الملفات المؤقتة
          for (let i = 0; i < 6; i++) {
            const imgPath = path.join(CACHE, `kira_search_${Date.now()}_${i}.jpg`);
            if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
          }
        }
      );
      
    } catch (error) {
      console.error("Images Error:", error);
      const dialect = getUserDialect(event.senderID);
      return api.sendMessage(
        `❌ خطأ في البحث ${dialect.suffix[0]}`,
        event.threadID
      );
    }
  },

  // 🎬 الأفلام
  async movie(api, event, query) {
    if (!query) {
      const dialect = getUserDialect(event.senderID);
      return api.sendMessage(`شو اسم الفيلم؟ ${dialect.phrases[0]}`, event.threadID);
    }
    
    try {
      updateUserInteraction(event.senderID, "movie");
      
      const response = await axios.get(
        `${APIs.imdb}?q=${encodeURIComponent(query)}`,
        { timeout: 10000 }
      );
      
      const data = response.data;
      const dialect = getUserDialect(event.senderID);
      
      const content = `🎬 ${data.title || "ما عرفت الفيلم"}
⭐ التقييم: ${data.rating || "ما في"}
📅 السنة: ${data.year || "ما في"}
🎭 النوع: ${data.genres?.join(", ") || "ما في"}
📝 القصة: ${data.plot?.substring(0, 200) + "..." || "ما في"}

${dialect.phrases[2]} ${dialect.suffix[0]}`;
      
      // إذا كان هناك ملصق، نرسله كمرفق
      if (data.poster && data.poster.startsWith('http')) {
        try {
          const posterResponse = await axios.get(data.poster, { 
            responseType: 'arraybuffer',
            timeout: 10000 
          });
          
          const posterPath = path.join(CACHE, `kira_movie_${Date.now()}.jpg`);
          fs.writeFileSync(posterPath, posterResponse.data);
          
          return api.sendMessage(
            {
              body: content,
              attachment: fs.createReadStream(posterPath)
            },
            event.threadID,
            () => fs.unlinkSync(posterPath)
          );
        } catch (e) {
          // إذا فشل تحميل الملصق، نرسل النص فقط
          return api.sendMessage(content, event.threadID);
        }
      }
      
      return api.sendMessage(content, event.threadID);
      
    } catch (error) {
      console.error("Movie Error:", error);
      const dialect = getUserDialect(event.senderID);
      return api.sendMessage(
        `❌ ما لقت الفيلم ${dialect.suffix[0]}`,
        event.threadID
      );
    }
  },

  // 🌸 الأنمي
  async anime(api, event, query) {
    if (!query) {
      const dialect = getUserDialect(event.senderID);
      return api.sendMessage(`شو اسم الأنمي؟ ${dialect.phrases[0]}`, event.threadID);
    }
    
    try {
      updateUserInteraction(event.senderID, "anime");
      
      const response = await axios.get(
        `${APIs.jikan}?q=${encodeURIComponent(query)}&limit=1`,
        { timeout: 10000 }
      );
      
      if (!response.data.data || !response.data.data.length) {
        const dialect = getUserDialect(event.senderID);
        return api.sendMessage(`ما لقت الأنمي ${dialect.suffix[0]}`, event.threadID);
      }
      
      const anime = response.data.data[0];
      const dialect = getUserDialect(event.senderID);
      
      const content = `🌸 ${anime.title}
⭐ التقييم: ${anime.score || "ما في"}
📺 الحلقات: ${anime.episodes || "مستمر"}
📅 السنة: ${anime.year || "ما في"}

${dialect.phrases[1]} ${dialect.suffix[0]}`;
      
      // إرسال الصورة إذا موجودة
      if (anime.images?.jpg?.image_url) {
        try {
          const imageResponse = await axios.get(anime.images.jpg.image_url, {
            responseType: 'arraybuffer',
            timeout: 10000
          });
          
          const imagePath = path.join(CACHE, `kira_anime_${Date.now()}.jpg`);
          fs.writeFileSync(imagePath, imageResponse.data);
          
          return api.sendMessage(
            {
              body: content,
              attachment: fs.createReadStream(imagePath)
            },
            event.threadID,
            () => fs.unlinkSync(imagePath)
          );
        } catch (e) {
          return api.sendMessage(content, event.threadID);
        }
      }
      
      return api.sendMessage(content, event.threadID);
      
    } catch (error) {
      console.error("Anime Error:", error);
      const dialect = getUserDialect(event.senderID);
      return api.sendMessage(
        `❌ خطأ في البحث ${dialect.suffix[0]}`,
        event.threadID
      );
    }
  },

  // 🌐 الترجمة
  async translate(api, event, query) {
    if (!query) {
      const dialect = getUserDialect(event.senderID);
      return api.sendMessage(`شو بدك أترجم؟ ${dialect.phrases[0]}`, event.threadID);
    }
    
    try {
      updateUserInteraction(event.senderID, "translate");
      
      const response = await axios.get(
        `${APIs.translate}?client=gtx&sl=auto&tl=ar&dt=t&q=${encodeURIComponent(query)}`,
        { timeout: 10000 }
      );
      
      const translation = response.data[0][0][0];
      const dialect = getUserDialect(event.senderID);
      
      return api.sendMessage(
        `🌐 الترجمة:\n${translation}\n\n${dialect.phrases[2]}`,
        event.threadID
      );
      
    } catch (error) {
      console.error("Translate Error:", error);
      const dialect = getUserDialect(event.senderID);
      return api.sendMessage(
        `❌ خطأ في الترجمة ${dialect.suffix[0]}`,
        event.threadID
      );
    }
  },

  // 🎤 النطق (TTS)
  async tts(api, event, query) {
    if (!query) {
      const dialect = getUserDialect(event.senderID);
      return api.sendMessage(`شو بدي أقول؟ ${dialect.phrases[0]}`, event.threadID);
    }
    
    try {
      updateUserInteraction(event.senderID, "tts");
      
      const file = path.join(CACHE, `kira_tts_${Date.now()}.mp3`);
      const ttsUrl = `${APIs.tts}?ie=UTF-8&q=${encodeURIComponent(query)}&tl=ar&client=tw-ob`;
      
      return new Promise((resolve) => {
        request({ 
          url: ttsUrl, 
          headers: { 
            'User-Agent': 'Mozilla/5.0',
            'Accept': 'audio/mpeg'
          } 
        })
          .pipe(fs.createWriteStream(file))
          .on("finish", () => {
            const dialect = getUserDialect(event.senderID);
            api.sendMessage(
              {
                body: event.senderID === "61577861540407" 
                  ? "🎤 بصوتي لك يا أيمن 💖" 
                  : `🎤 ${dialect.phrases[3]}`,
                attachment: fs.createReadStream(file)
              },
              event.threadID,
              () => {
                fs.unlinkSync(file);
                resolve();
              }
            );
          })
          .on("error", () => {
            const dialect = getUserDialect(event.senderID);
            api.sendMessage(
              `❌ ما قدرت أنطق ${dialect.suffix[0]}`,
              event.threadID
            );
            resolve();
          });
      });
      
    } catch (error) {
      console.error("TTS Error:", error);
      const dialect = getUserDialect(event.senderID);
      return api.sendMessage(
        `❌ خطأ في النطق ${dialect.suffix[0]}`,
        event.threadID
      );
    }
  },

  // 🌤️ الطقس
  async weather(api, event, query) {
    if (!query) {
      const dialect = getUserDialect(event.senderID);
      return api.sendMessage(`شو اسم المدينة؟ ${dialect.phrases[0]}`, event.threadID);
    }
    
    try {
      updateUserInteraction(event.senderID, "weather");
      
      // API Key بديل للطقس (يمكنك وضع API key حقيقي)
      const weatherKey = "f89f7f2f2d9a4e5c5c9b8b8b8b8b8b8b";
      const response = await axios.get(
        `https://api.weatherapi.com/v1/current.json?key=${weatherKey}&q=${encodeURIComponent(query)}&lang=ar`,
        { timeout: 10000 }
      );
      
      const data = response.data;
      const dialect = getUserDialect(event.senderID);
      
      const content = `🌤️ طقس ${data.location.name}, ${data.location.country}
🌡️ الحرارة: ${data.current.temp_c}°C
💧 الرطوبة: ${data.current.humidity}%
💨 الرياح: ${data.current.wind_kph} كم/س
☁️ الحالة: ${data.current.condition.text}

${dialect.phrases[1]} ${dialect.suffix[0]}`;
      
      return api.sendMessage(content, event.threadID);
      
    } catch (error) {
      console.error("Weather Error:", error);
      const dialect = getUserDialect(event.senderID);
      return api.sendMessage(
        `❌ ما قدرت أحصل على الطقس ${dialect.suffix[0]}`,
        event.threadID
      );
    }
  },

  // 💡 حقائق
  async facts(api, event, query) {
    try {
      updateUserInteraction(event.senderID, "facts");
      
      const factType = query || "random";
      const response = await axios.get(
        `https://uselessfacts.jsph.pl/random.json?language=ar`,
        { timeout: 10000 }
      );
      
      const fact = response.data.text;
      const dialect = getUserDialect(event.senderID);
      
      return api.sendMessage(
        `💡 حقيقة:\n${fact}\n\n${dialect.phrases[2]}`,
        event.threadID
      );
      
    } catch (error) {
      console.error("Facts Error:", error);
      const dialect = getUserDialect(event.senderID);
      return api.sendMessage(
        `❌ ما قدرت أجيب حقيقة ${dialect.suffix[0]}`,
        event.threadID
      );
    }
  },

  // 📦 NPM
  async npm(api, event, query) {
    if (!query) {
      const dialect = getUserDialect(event.senderID);
      return api.sendMessage(`شو اسم الحزمة؟ ${dialect.phrases[0]}`, event.threadID);
    }
    
    try {
      updateUserInteraction(event.senderID, "npm");
      
      const response = await axios.get(
        `${APIs.npm}?q=${encodeURIComponent(query)}`,
        { timeout: 10000 }
      );
      
      const data = response.data;
      const dialect = getUserDialect(event.senderID);
      
      const content = `📦 ${data.name}
📝 ${data.description || "ما في وصف"}
👤 المطور: ${data.author?.name || "ما في"}
📊 التحميلات: ${data.downloads?.toLocaleString() || "ما في"}

${dialect.phrases[1]}`;
      
      return api.sendMessage(content, event.threadID);
      
    } catch (error) {
      console.error("NPM Error:", error);
      const dialect = getUserDialect(event.senderID);
      return api.sendMessage(
        `❌ ما لقت الحزمة ${dialect.suffix[0]}`,
        event.threadID
      );
    }
  },

  // ⚛️ العناصر الكيميائية
  async element(api, event, query) {
    if (!query) {
      const dialect = getUserDialect(event.senderID);
      return api.sendMessage(`شو اسم العنصر؟ ${dialect.phrases[0]}`, event.threadID);
    }
    
    try {
      updateUserInteraction(event.senderID, "element");
      
      const response = await axios.get(
        `${APIs.element}?element=${encodeURIComponent(query)}`,
        { timeout: 10000 }
      );
      
      const data = response.data;
      const dialect = getUserDialect(event.senderID);
      
      const content = `⚛️ ${data.name} (${data.symbol})
🔢 العدد الذري: ${data.atomic_number}
⚖️ الكتلة: ${data.atomic_mass}
📈 المجموعة: ${data.group || "ما في"}

${dialect.phrases[2]} ${dialect.suffix[0]}`;
      
      return api.sendMessage(content, event.threadID);
      
    } catch (error) {
      console.error("Element Error:", error);
      const dialect = getUserDialect(event.senderID);
      return api.sendMessage(
        `❌ ما لقت العنصر ${dialect.suffix[0]}`,
        event.threadID
      );
    }
  },

  // 🤖 الذكاء الاصطناعي (المحادثة)
  async ai(api, event, query) {
    if (!query) {
      const dialect = getUserDialect(event.senderID);
      return api.sendMessage(`شو بدك تسأل؟ ${dialect.phrases[0]}`, event.threadID);
    }
    
    try {
      updateUserInteraction(event.senderID, "ai");
      updateUserDialect(event.senderID, query);
      
      const dialect = getUserDialect(event.senderID);
      const response = await getAIResponse(query, event.senderID, event.threadID, dialect);
      
      // حفظ في المحادثة
      addToConversation(event.threadID, "user", query);
      addToConversation(event.threadID, "assistant", response);
      
      return api.sendMessage(response, event.threadID);
      
    } catch (error) {
      console.error("AI Chat Error:", error);
      const dialect = getUserDialect(event.senderID);
      return api.sendMessage(
        `❌ والله مخي تعبان اليوم ${dialect.suffix[0]}`,
        event.threadID
      );
    }
  }
};

// ═══════════════════════════════════════════════════════════
// 📋 أوامر النظام
// ═══════════════════════════════════════════════════════════

function showHelp(api, event) {
  const dialect = getUserDialect(event.senderID);
  const isAyman = event.senderID === "61577861540407";
  
  const helpMessage = `${isAyman ? "💖" : "👑"} ───『 مساعدة كيرا 』─── ${isAyman ? "💖" : "👑"}

🎨 التوليد والإبداع:
│ تخيل/ارسم [وصف] - أرسم لك صورة
│ صور [موضوع] - أبحث لك عن صور

🎵 الترفيه:
│ سمعيني [أغنية] - أرسل لك أغنية
│ فيلم [اسم] - معلومات عن فيلم
│ انمي [اسم] - معلومات عن أنمي

🛠️ الأدوات:
│ ترجم [نص] - ترجمة للعربية
│ قولي [نص] - أنطق النص صوتياً
│ طقس [مدينة] - حالة الطقس

📊 المعلومات:
│ حقيقة [موضوع] - حقائق ممتعة
│ npm [حزمة] - معلومات npm
│ عنصر [اسم] - معلومات كيميائية

🤖 المحادثة:
│ فقط تكلم معي! أنا ذكية وأفهم

📌 أوامر خاصة:
│ .كيرا لاست - كل الأوامر
│ .كيرا ذاكرة - إحصائياتك
│ .كيرا نسيان - مسح ذاكرتي

${dialect.greeting} ${dialect.suffix[0]}`;

  return api.sendMessage(helpMessage, event.threadID);
}

function showAllCommands(api, event) {
  const dialect = getUserDialect(event.senderID);
  const isAyman = event.senderID === "61577861540407";
  
  const allCommands = `👑 ───『 كل أوامر كيرا 』─── 👑

🎨 توليد الصور:
│ تخيل + [وصف الصورة]
│ ارسم + [ماذا تريد أرسم]
│ صمم + [التصميم المطلوب]

🎵 الموسيقى والترفيه:
│ سمعيني + [اسم الأغنية أو المطرب]
│ فيلم + [اسم الفيلم]
│ انمي + [اسم الأنمي]

🖼️ البحث عن الصور:
│ صور + [الموضوع المطلوب]

🌐 الترجمة والنطق:
│ ترجم + [النص للترجمة]
│ قولي + [النص للنطق]
│ انطقي + [النص للنطق]

🌤️ المعلومات:
│ طقس + [اسم المدينة]
│ حقيقة + [موضوع (اختياري)]
│ npm + [اسم الحزمة]
│ عنصر + [اسم العنصر الكيميائي]

🤖 الذكاء الاصطناعي:
│ أي سؤال أو محادثة عادية!
│ أتذكر آخر 25 رسالة
│ أتكلم بلهجتك

📊 أوامر النظام:
│ .كيرا - عرض المساعدة
│ .كيرا لاست - كل الأوامر
│ .كيرا ذاكرة - إحصائياتك
│ .كيرا نسيان - مسح ذاكرتي

👑 ${dialect.name} ${dialect.suffix[0]}`;

  return api.sendMessage(allCommands, event.threadID);
}

function showStats(api, event) {
  const user = getUserData(event.senderID);
  const dialect = getUserDialect(event.senderID);
  const isAyman = event.senderID === "61577861540407";
  
  // ترتيب الأوامر المفضلة
  const favoriteCommands = Object.entries(user.favoriteCommands || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cmd, count]) => `${cmd}: ${count} مرة`)
    .join('\n│ ') || 'لا يوجد بيانات';
  
  const statsMessage = `📊 ───『 إحصائيات كيرا 』─── 📊

👤 بياناتك الشخصية:
│ 🤝 تفاعلاتك: ${user.interactions} مرة
│ 🎨 طلبات الصور: ${user.imagesRequested || 0}
│ 📅 أول مرة: ${new Date(user.firstSeen).toLocaleDateString('ar-EG')}
│ 🕒 آخر مرة: ${new Date(user.lastSeen).toLocaleTimeString('ar-EG')}

⭐ تفضيلاتك:
│ ${favoriteCommands}

🌍 إحصائيات عامة:
│ 👥 المستخدمين: ${Object.keys(MEMORY.users).length}
│ 💬 التفاعلات: ${MEMORY.interactions}
│ 🎨 الصور المولدة: ${MEMORY.imagesGenerated || 0}

🗣️ لهجتك: ${dialect.name}
${isAyman ? "💖 أنت أيمن، حبيبي ومطوري" : dialect.phrases[2]}`;

  return api.sendMessage(statsMessage, event.threadID);
}

function clearMemory(api, event) {
  const threadID = event.threadID;
  const dialect = getUserDialect(event.senderID);
  
  if (CONVERSATIONS[threadID]) {
    const count = CONVERSATIONS[threadID].length;
    delete CONVERSATIONS[threadID];
    saveMemory();
    
    return api.sendMessage(
      `🗑️ مسحت ${count} رسالة من ذاكرتي\n${dialect.phrases[3]} ${dialect.suffix[0]}`,
      threadID
    );
  }
  
  return api.sendMessage(
    `ما في ذاكرة لأمسحها ${dialect.suffix[0]}`,
    threadID
  );
}

// ═══════════════════════════════════════════════════════════
// 🚀 الدالة الرئيسية
// ═══════════════════════════════════════════════════════════

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, senderID } = event;
  const text = args.join(" ").trim();

  // تحديث تفاعل المستخدم
  updateUserInteraction(senderID);
  updateUserDialect(senderID, text);

  if (!text) return showHelp(api, event);

  const lowerText = text.toLowerCase();
  
  // الأوامر الخاصة
  if (lowerText.includes("لاست") || lowerText === "list") {
    return showAllCommands(api, event);
  }
  
  if (lowerText.includes("ذاكرة") || lowerText.includes("stats")) {
    return showStats(api, event);
  }
  
  if (lowerText.includes("نسيان") || lowerText.includes("clear")) {
    return clearMemory(api, event);
  }
  
  if (lowerText.includes("مساعدة") || lowerText === "help") {
    return showHelp(api, event);
  }
  
  if (lowerText.includes("اللهجات") || lowerText.includes("dialects")) {
    const dialectsList = Object.values(ARABIC_DIALECTS)
      .map(d => `│ ${d.name}: ${d.greeting}`)
      .join('\n');
    return api.sendMessage(
      `🗣️ اللهجات المدعومة:\n${dialectsList}\n\nأتكلم بلهجتك تلقائياً!`,
      threadID
    );
  }

  // كشف النية وتنفيذ الأمر
  const intent = detectIntent(text);
  
  try {
    // إضافة تفاعل
    api.setMessageReaction(intent.icon, messageID, () => {}, true);
    
    const handler = CommandHandlers[intent.type];
    if (handler) {
      await handler(api, event, intent.query);
    } else {
      await CommandHandlers.ai(api, event, text);
    }
    
  } catch (error) {
    console.error("❌ KIRA ERROR:", error);
    const dialect = getUserDialect(senderID);
    
    const errorMsg = senderID === "61577861540407"
      ? "💔 عذراً يا أيمن، صار عندي مشكلة!"
      : `❌ والله تعقدت الأمور ${dialect.suffix[0]}`;
    
    return api.sendMessage(errorMsg, threadID);
  }
};

// ═══════════════════════════════════════════════════════════
// 🎯 معالج الرسائل التلقائي
// ═══════════════════════════════════════════════════════════

module.exports.handleEvent = async ({ api, event }) => {
  const { threadID, senderID, body } = event;
  
  if (!body || body.startsWith(".") || body.startsWith("/")) return;
  
  // كشف إذا تم ذكر كيرا
  const mentions = ["كيرا", "kira", "كي", "كيرو", "كيري", "كيره"];
  const shouldRespond = mentions.some(m => 
    body.toLowerCase().includes(m.toLowerCase())
  ) && !body.startsWith(".كيرا");
  
  if (shouldRespond) {
    updateUserInteraction(senderID);
    updateUserDialect(senderID, body);
    
    const dialect = getUserDialect(senderID);
    const greeting = senderID === "61577861540407"
      ? `يا حبيبي أيمن! 💖 شو بدك؟`
      : `${dialect.greeting}! شو بدك؟ ${dialect.suffix[0]}`;
    
    setTimeout(() => {
      api.sendMessage(
        `${greeting}\n\nاكتب: .كيرا مساعدة 💫`,
        threadID
      );
    }, 1500);
  }
};

// حفظ الذاكرة عند الإيقاف
process.on('SIGINT', () => {
  console.log('\n👑 كيرا: بحفظ الذاكرة...');
  saveMemory();
  console.log('✅ تم حفظ الذاكرة بنجاح!');
  process.exit(0);
});

// ═══════════════════════════════════════════════════════════
// 🎭 وظائف مساعدة إضافية
// ═══════════════════════════════════════════════════════════

// دالة لتنسيق الوقت
function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

// دالة لإنشاء أسماء ملفات فريدة
function generateUniqueFileName(prefix, extension = 'jpg') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${extension}`;
}

// دالة لتنظيف الملفات القديمة
function cleanupOldFiles() {
  try {
    const files = fs.readdirSync(CACHE);
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 ساعة
    
    files.forEach(file => {
      const filePath = path.join(CACHE, file);
      const stats = fs.statSync(filePath);
      
      if (now - stats.mtimeMs > maxAge) {
        fs.unlinkSync(filePath);
      }
    });
    
    console.log('🧹 تم تنظيف الملفات القديمة');
  } catch (error) {
    console.error('تنظيف الملفات:', error);
  }
}

// تنظيف الملفات كل ساعة
setInterval(cleanupOldFiles, 60 * 60 * 1000);

console.log('👑 كيرا v7.0 جاهزة للعمل!');
console.log('📁 الذاكرة المحملة:', Object.keys(MEMORY.users).length, 'مستخدم');
console.log('🗣️ اللهجات المدعومة:', Object.keys(ARABIC_DIALECTS).length);
