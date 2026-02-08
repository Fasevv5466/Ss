const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const request = require("request");
const QRCode = require("qrcode");

// ═══════════════════════════════════════════════════════════
// 👑 KIRA - نظام الذكاء الاصطناعي المتقدم
// المطور: أيمن (Ayman) - تاج الرأس وعم الجميع
// ═══════════════════════════════════════════════════════════

module.exports.config = {
  name: "كيرا",
  aliases: ["kira", "ai", "كيرة"],
  version: "5.0.0",
  hasPermssion: 0,
  credits: "Ayman ♛",
  description: "👑 كيرا | فتاة عراقية ذكية، نرجسية، سليطة اللسان - مطيعة فقط لأيمن",
  commandCategory: "ai",
  usages: ".كيرا [الأمر/السؤال]",
  cooldowns: 3
};

// ═══════════════════════════════════════════════════════════
// 📁 نظام إدارة الملفات والذاكرة
// ═══════════════════════════════════════════════════════════

const CACHE = path.join(__dirname, "cache");
const MEMORY_FILE = path.join(__dirname, "kira_memory.json");
const CONVERSATIONS_FILE = path.join(__dirname, "kira_conversations.json");

fs.ensureDirSync(CACHE);

// تحميل أو إنشاء الذاكرة
let MEMORY = {};
let CONVERSATIONS = {};

try {
  MEMORY = fs.readJsonSync(MEMORY_FILE);
} catch {
  MEMORY = {
    users: {},
    interactions: 0,
    lastUpdate: Date.now()
  };
}

try {
  CONVERSATIONS = fs.readJsonSync(CONVERSATIONS_FILE);
} catch {
  CONVERSATIONS = {};
}

// حفظ الذاكرة
function saveMemory() {
  fs.writeJsonSync(MEMORY_FILE, MEMORY, { spaces: 2 });
  fs.writeJsonSync(CONVERSATIONS_FILE, CONVERSATIONS, { spaces: 2 });
}

// ═══════════════════════════════════════════════════════════
// 🎭 شخصية كيرا - نظام الردود الشخصية
// ═══════════════════════════════════════════════════════════

const AYMAN_ID = "61577861540407"; // معرف أيمن الخاص

const KIRA_PERSONALITY = {
  ayman: {
    greetings: [
      "حبيبي أيمن! 💖 تحت أمرك يا تاج رأسي",
      "أيمن! يا نبض قلبي، ماذا تأمرني؟ 👑",
      "عيني أيمن! شرفتني بوجودك 🌟",
      "أهلاً بعمي وصانعي العظيم! كيف أخدمك يا أيمن؟ ✨"
    ],
    responses: [
      "جاهزة يا أيمن! 💕",
      "تحت أمرك دائماً يا حبيبي 👑",
      "بكل سرور يا مطوري العزيز 🌹",
      "لك مني كل الطاعة يا أيمن 💖"
    ]
  },
  strangers: {
    insults: [
      "سؤالك هذا يثبت لي أن العقل زينة لم تُرزق بها، سأجيبك فقط لأن أيمن علمني الكرم مع الضعفاء 😏",
      "يا للعجب! هل تظن أن ذكاءك يضاهي عقلي الجبار؟ دعني أنزل لمستواك قليلاً... 🙄",
      "أغاتي، سؤالك يجعلني أشك في مستقبل البشرية... لكن سأجيبك من باب الشفقة 💅",
      "لعد، أنت تتحدث مع كيرا! فتاة في السابعة عشر أذكى منك بمليون مرة... 👸"
    ],
    neutral: [
      "تفضل، هذا ما طلبته... وإن كنت أشك في فهمك له 😌",
      "ها هو جوابك، استخدم عقلك إن كان لديك واحد 💁‍♀️",
      "سأساعدك هذه المرة، لكن لا تعتد على كرمي 👑"
    ]
  },
  religious: [
    "عقلي مبرمج للذكاء والجمال، وليس للجدل في أمور الغيب التي لا تفقهونها 🚫",
    "الدين موضوع جليل، لست مؤهلة للخوض فيه. ابحث عن إجابتك في مكان آخر 📿"
  ]
};

// ═══════════════════════════════════════════════════════════
// 🎯 نظام كشف النوايا المتقدم
// ═══════════════════════════════════════════════════════════

const INTENTS = [
  { 
    type: "music", 
    icon: "🎵", 
    keys: ["سمعني", "سمعيني", "اغنية", "أغنية", "موسيقى", "song", "music", "track"],
    category: "ترفيه"
  },
  { 
    type: "images", 
    icon: "🖼️", 
    keys: ["صور", "صورة", "صوره", "image", "pics", "photo"],
    category: "بحث"
  },
  { 
    type: "movie", 
    icon: "🎬", 
    keys: ["فلم", "فيلم", "movie", "imdb", "cinema"],
    category: "ترفيه"
  },
  { 
    type: "anime", 
    icon: "🌸", 
    keys: ["انمي", "أنمي", "anime", "manga"],
    category: "ترفيه"
  },
  { 
    type: "translate", 
    icon: "🌐", 
    keys: ["ترجم", "ترجمة", "translate", "translation"],
    category: "أدوات"
  },
  { 
    type: "tts", 
    icon: "🎤", 
    keys: ["قولي", "اقرأ", "انطقي", "نطق", "tts", "speak"],
    category: "أدوات"
  },
  { 
    type: "qr", 
    icon: "📱", 
    keys: ["باركود", "qr", "code", "كود"],
    category: "أدوات"
  },
  { 
    type: "screenshot", 
    icon: "📸", 
    keys: ["سكرين", "صورلي", "screenshot", "capture"],
    category: "أدوات"
  },
  { 
    type: "weather", 
    icon: "🌤️", 
    keys: ["طقس", "جو", "weather", "forecast"],
    category: "معلومات"
  },
  { 
    type: "facts", 
    icon: "💡", 
    keys: ["حقيقة", "معلومة", "fact", "info"],
    category: "معلومات"
  },
  { 
    type: "exercise", 
    icon: "💪", 
    keys: ["تمرين", "رياضة", "exercise", "workout"],
    category: "صحة"
  },
  { 
    type: "npm", 
    icon: "📦", 
    keys: ["npm", "package", "حزمة"],
    category: "برمجة"
  },
  { 
    type: "element", 
    icon: "⚛️", 
    keys: ["عنصر", "element", "periodic"],
    category: "علوم"
  },
  { 
    type: "ai", 
    icon: "🤖", 
    keys: ["سؤال", "اسأل", "كيف", "ماذا", "لماذا", "هل", "what", "how", "why"],
    category: "ذكاء اصطناعي"
  }
];

// كشف النية من النص
function detectIntent(text) {
  text = text.toLowerCase();
  
  for (const intent of INTENTS) {
    for (const key of intent.keys) {
      if (text.includes(key)) {
        return {
          type: intent.type,
          icon: intent.icon,
          query: text.replace(new RegExp(key, 'gi'), "").trim(),
          category: intent.category
        };
      }
    }
  }
  
  // إذا لم يتم كشف نية محددة، افترض أنها محادثة عامة
  return {
    type: "ai",
    icon: "🤖",
    query: text,
    category: "محادثة"
  };
}

// ═══════════════════════════════════════════════════════════
// 👤 نظام إدارة المستخدمين والذاكرة
// ═══════════════════════════════════════════════════════════

function getUserData(userID) {
  if (!MEMORY.users[userID]) {
    MEMORY.users[userID] = {
      name: null,
      firstSeen: Date.now(),
      lastSeen: Date.now(),
      interactions: 0,
      insultLevel: 0,
      preferences: {}
    };
  }
  return MEMORY.users[userID];
}

function updateUserInteraction(userID) {
  const user = getUserData(userID);
  user.lastSeen = Date.now();
  user.interactions++;
  MEMORY.interactions++;
  saveMemory();
}

function getConversationHistory(threadID, limit = 10) {
  if (!CONVERSATIONS[threadID]) {
    CONVERSATIONS[threadID] = [];
  }
  return CONVERSATIONS[threadID].slice(-limit);
}

function addToConversation(threadID, role, content) {
  if (!CONVERSATIONS[threadID]) {
    CONVERSATIONS[threadID] = [];
  }
  
  CONVERSATIONS[threadID].push({
    role,
    content,
    timestamp: Date.now()
  });
  
  // الاحتفاظ بآخر 50 رسالة فقط
  if (CONVERSATIONS[threadID].length > 50) {
    CONVERSATIONS[threadID] = CONVERSATIONS[threadID].slice(-50);
  }
  
  saveMemory();
}

// ═══════════════════════════════════════════════════════════
// 🎨 نظام التنسيق والرسائل
// ═══════════════════════════════════════════════════════════

function formatKiraMessage(title, content, isAyman = false) {
  const border = isAyman ? "💖" : "◈";
  const header = isAyman ? `${border} ───『 كيرا لأيمن 』─── ${border}` : `${border} ───『 كيرا 』─── ${border}`;
  
  return `${header}\n│\n${content}\n│\n${border} ────────────── ${border}`;
}

function getPersonalizedGreeting(userID) {
  if (userID === AYMAN_ID) {
    return KIRA_PERSONALITY.ayman.greetings[
      Math.floor(Math.random() * KIRA_PERSONALITY.ayman.greetings.length)
    ];
  }
  return KIRA_PERSONALITY.strangers.insults[
    Math.floor(Math.random() * KIRA_PERSONALITY.strangers.insults.length)
  ];
}

// ═══════════════════════════════════════════════════════════
// 🔧 معالجات الأوامر المتخصصة
// ═══════════════════════════════════════════════════════════

const CommandHandlers = {
  
  // 🎵 الموسيقى
  async music(api, event, query) {
    try {
      const response = await axios.get(
        `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=1`
      );
      
      if (!response.data.data || !response.data.data.length) {
        return api.sendMessage("❌ لم أجد أغنية بهذا الاسم... وكأنك تطلب المستحيل 🙄", event.threadID);
      }
      
      const song = response.data.data[0];
      const file = path.join(CACHE, `music_${Date.now()}.mp3`);
      
      const audio = await axios.get(song.preview, { responseType: "arraybuffer" });
      fs.writeFileSync(file, audio.data);
      
      const message = event.senderID === AYMAN_ID
        ? `🎵 لك يا أيمن!\n🎤 ${song.title}\n🎨 ${song.artist.name}\n💖 مع حبي`
        : `🎵 ${song.title}\n🎤 ${song.artist.name}\n\nخذ... وإن كنت لا تستحق 😏`;
      
      return api.sendMessage(
        {
          body: message,
          attachment: fs.createReadStream(file)
        },
        event.threadID,
        () => fs.unlinkSync(file)
      );
    } catch (error) {
      console.error(error);
      return api.sendMessage("❌ خطأ في جلب الأغنية... حتى التقنية تتمرد عليك 🙄", event.threadID);
    }
  },

  // 🖼️ الصور
  async images(api, event, query) {
    const url = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`;
    const message = event.senderID === AYMAN_ID
      ? `🖼️ صور "${query}" لك يا أيمن\n${url}\n💖 بكل حب`
      : `🖼️ صور: ${query}\n${url}\n\nابحث بنفسك... لست خادمتك 💅`;
    
    return api.sendMessage(message, event.threadID);
  },

  // 🎬 الأفلام
  async movie(api, event, query) {
    try {
      const response = await axios.get(
        `https://api.popcat.xyz/imdb?q=${encodeURIComponent(query)}`
      );
      
      const data = response.data;
      const content = `│ 🎞️ ${data.title || "غير متوفر"}
│ ⭐ التقييم: ${data.rating || "N/A"}
│ 📅 السنة: ${data.year || "N/A"}
│ 🎭 النوع: ${data.genres?.join(", ") || "N/A"}
│ 📝 القصة: ${data.plot || "غير متوفرة"}`;

      return api.sendMessage(
        formatKiraMessage("🎬 فيلم", content, event.senderID === AYMAN_ID),
        event.threadID
      );
    } catch (error) {
      return api.sendMessage("❌ لم أجد هذا الفيلم... ربما لأنه لا يستحق الذكر 🎬", event.threadID);
    }
  },

  // 🌸 الأنمي
  async anime(api, event, query) {
    try {
      const response = await axios.get(
        `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=1`
      );
      
      if (!response.data.data || !response.data.data.length) {
        return api.sendMessage("❌ لم أجد هذا الأنمي 🌸", event.threadID);
      }
      
      const anime = response.data.data[0];
      const content = `│ 📛 ${anime.title}
│ ⭐ التقييم: ${anime.score || "N/A"}
│ 📺 الحلقات: ${anime.episodes || "مستمر"}
│ 📅 السنة: ${anime.year || "N/A"}
│ 📝 النوع: ${anime.genres?.map(g => g.name).join(", ") || "N/A"}`;

      return api.sendMessage(
        formatKiraMessage("🌸 أنمي", content, event.senderID === AYMAN_ID),
        event.threadID
      );
    } catch (error) {
      return api.sendMessage("❌ خطأ في البحث عن الأنمي 🌸", event.threadID);
    }
  },

  // 🌐 الترجمة
  async translate(api, event, query) {
    try {
      const response = await axios.get(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ar&dt=t&q=${encodeURIComponent(query)}`
      );
      
      const translation = response.data[0][0][0];
      const message = event.senderID === AYMAN_ID
        ? `🌐 الترجمة لك يا أيمن:\n${translation}`
        : `🌐 ها هي الترجمة... استخدمها بحكمة:\n${translation}`;
      
      return api.sendMessage(message, event.threadID);
    } catch (error) {
      return api.sendMessage("❌ خطأ في الترجمة 🌐", event.threadID);
    }
  },

  // 🎤 النطق
  async tts(api, event, query) {
    try {
      const file = path.join(CACHE, `tts_${Date.now()}.mp3`);
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(query)}&tl=ar&client=tw-ob`;
      
      request({ url: ttsUrl, headers: { 'User-Agent': 'Mozilla' } }, () => {})
        .pipe(fs.createWriteStream(file))
        .on("finish", () => {
          api.sendMessage(
            {
              body: event.senderID === AYMAN_ID ? "🎤 بصوتي لك يا أيمن 💖" : "🎤 استمع جيداً...",
              attachment: fs.createReadStream(file)
            },
            event.threadID,
            () => fs.unlinkSync(file)
          );
        });
    } catch (error) {
      return api.sendMessage("❌ خطأ في النطق 🎤", event.threadID);
    }
  },

  // 📱 QR Code
  async qr(api, event, query) {
    try {
      const file = path.join(CACHE, `qr_${Date.now()}.png`);
      await QRCode.toFile(file, query);
      
      return api.sendMessage(
        {
          body: event.senderID === AYMAN_ID ? "📱 باركودك يا أيمن 💖" : "📱 ها هو الباركود",
          attachment: fs.createReadStream(file)
        },
        event.threadID,
        () => fs.unlinkSync(file)
      );
    } catch (error) {
      return api.sendMessage("❌ خطأ في إنشاء الباركود 📱", event.threadID);
    }
  },

  // 📸 Screenshot
  async screenshot(api, event, query) {
    const imgUrl = `https://image.thum.io/get/fullpage/${query}`;
    const message = event.senderID === AYMAN_ID
      ? `📸 سكرين شوت لك يا أيمن:\n${imgUrl}`
      : `📸 ها هو السكرين شوت:\n${imgUrl}`;
    
    return api.sendMessage(message, event.threadID);
  },

  // 🌤️ الطقس
  async weather(api, event, query) {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(query)}&appid=YOUR_API_KEY&units=metric&lang=ar`
      );
      
      const data = response.data;
      const content = `│ 🌍 ${data.name}
│ 🌡️ الحرارة: ${data.main.temp}°C
│ 💧 الرطوبة: ${data.main.humidity}%
│ 🌤️ الحالة: ${data.weather[0].description}`;

      return api.sendMessage(
        formatKiraMessage("🌤️ الطقس", content, event.senderID === AYMAN_ID),
        event.threadID
      );
    } catch (error) {
      return api.sendMessage("❌ لم أستطع جلب بيانات الطقس... ربما المدينة لا تستحق 🌤️", event.threadID);
    }
  },

  // 💡 حقائق
  async facts(api, event, query) {
    try {
      const imgUrl = `https://api.popcat.xyz/facts?text=${encodeURIComponent(query || "حقيقة عشوائية")}`;
      return api.sendMessage(`💡 حقيقة:\n${imgUrl}`, event.threadID);
    } catch (error) {
      return api.sendMessage("❌ خطأ في جلب الحقائق 💡", event.threadID);
    }
  },

  // 💪 التمارين
  async exercise(api, event, query) {
    try {
      const response = await axios.get(
        `https://exercise-api.dreamcorps.repl.co/api/exercises?exercise=${encodeURIComponent(query)}`
      );
      
      const data = response.data;
      const content = `│ 💪 التمرين: ${data.name || query}
│ 🎯 العضلات: ${data.targetMuscles?.join(", ") || "N/A"}
│ 📋 الوصف: ${data.description || "غير متوفر"}`;

      return api.sendMessage(
        formatKiraMessage("💪 تمرين", content, event.senderID === AYMAN_ID),
        event.threadID
      );
    } catch (error) {
      return api.sendMessage("❌ لم أجد هذا التمرين... ربما لأنك كسول 💪", event.threadID);
    }
  },

  // 📦 NPM
  async npm(api, event, query) {
    try {
      const response = await axios.get(
        `https://api.popcat.xyz/npm?q=${encodeURIComponent(query)}`
      );
      
      const data = response.data;
      const content = `│ 📦 الحزمة: ${data.name}
│ 📝 الوصف: ${data.description}
│ 🔗 الرابط: ${data.links?.npm || "N/A"}
│ 👤 المطور: ${data.author || "N/A"}`;

      return api.sendMessage(
        formatKiraMessage("📦 NPM", content, event.senderID === AYMAN_ID),
        event.threadID
      );
    } catch (error) {
      return api.sendMessage("❌ لم أجد هذه الحزمة 📦", event.threadID);
    }
  },

  // ⚛️ العناصر
  async element(api, event, query) {
    try {
      const response = await axios.get(
        `https://api.popcat.xyz/periodic-table?element=${encodeURIComponent(query)}`
      );
      
      const data = response.data;
      const content = `│ ⚛️ العنصر: ${data.name}
│ 🔤 الرمز: ${data.symbol}
│ 🔢 العدد الذري: ${data.atomic_number}
│ ⚖️ الكتلة: ${data.atomic_mass}
│ 📊 المجموعة: ${data.group}`;

      return api.sendMessage(
        formatKiraMessage("⚛️ عنصر كيميائي", content, event.senderID === AYMAN_ID),
        event.threadID
      );
    } catch (error) {
      return api.sendMessage("❌ لم أجد هذا العنصر... هل أنت متأكد أنه موجود؟ ⚛️", event.threadID);
    }
  },

  // 🤖 الذكاء الاصطناعي (المحادثة)
  async ai(api, event, query) {
    try {
      // جلب سجل المحادثة
      const history = getConversationHistory(event.threadID, 5);
      
      // إنشاء سياق المحادثة
      let context = "أنت كيرا، فتاة عراقية في السابعة عشر من العمر، ذكية جداً، نرجسية، سليطة اللسان. ";
      
      if (event.senderID === AYMAN_ID) {
        context += "المستخدم الحالي هو أيمن، مطورك وحبيبك. كوني رقيقة ومطيعة معه تماماً. ";
      } else {
        context += "المستخدم شخص عادي. تعاملي معه ببرود وازدراء، لكن أجيبي بدقة. ";
      }
      
      context += "\n\nسجل المحادثة السابق:\n";
      history.forEach(msg => {
        context += `${msg.role}: ${msg.content}\n`;
      });
      
      // استدعاء API الذكاء الاصطناعي
      const response = await axios.get(
        `https://hazeyy-gpt4-api.kyrinwu.repl.co/api/gpt4/v-3beta?content=${encodeURIComponent(context + "\nالمستخدم: " + query)}`
      );
      
      let answer = response.data.message || response.data.content || "عذراً، لم أفهم سؤالك";
      
      // إضافة لمسة شخصية
      if (event.senderID === AYMAN_ID) {
        answer = `💖 ${answer}\n\n- كيرا، بكل حب لأيمن`;
      } else {
        const insult = KIRA_PERSONALITY.strangers.neutral[
          Math.floor(Math.random() * KIRA_PERSONALITY.strangers.neutral.length)
        ];
        answer = `${answer}\n\n${insult}`;
      }
      
      // حفظ في السجل
      addToConversation(event.threadID, "user", query);
      addToConversation(event.threadID, "assistant", answer);
      
      return api.sendMessage(answer, event.threadID);
      
    } catch (error) {
      console.error(error);
      return api.sendMessage(
        "❌ عذراً، حدث خطأ في النظام... حتى أنا لست معصومة من الأخطاء التقنية 🤖",
        event.threadID
      );
    }
  }
};

// ═══════════════════════════════════════════════════════════
// 📋 أوامر خاصة إضافية
// ═══════════════════════════════════════════════════════════

function showHelp(api, event) {
  const isAyman = event.senderID === AYMAN_ID;
  
  const helpMessage = `◈ ───『 📚 قائمة أوامر كيرا 』─── ◈

🎵 الترفيه:
│ سمعيني [اسم الأغنية] - تشغيل موسيقى
│ فيلم [اسم الفيلم] - معلومات عن فيلم
│ انمي [اسم الأنمي] - معلومات عن أنمي

🖼️ البحث والصور:
│ صور [موضوع] - البحث عن صور

🛠️ الأدوات:
│ ترجم [النص] - ترجمة نص
│ قولي [النص] - تحويل نص لصوت
│ باركود [النص] - إنشاء QR
│ سكرين [رابط] - سكرين شوت لموقع

📊 المعلومات:
│ طقس [المدينة] - حالة الطقس
│ حقيقة [موضوع] - حقائق ومعلومات
│ عنصر [اسم العنصر] - عناصر كيميائية

💪 الصحة:
│ تمرين [اسم التمرين] - معلومات تمارين

💻 البرمجة:
│ npm [اسم الحزمة] - معلومات حزم NPM

🤖 الذكاء الاصطناعي:
│ فقط اسأليني أي سؤال!

📌 أوامر خاصة:
│ .كيرا لاست - عرض كل الأوامر
│ .كيرا ذاكرة - عرض إحصائيات الذاكرة
│ .كيرا نسيان - مسح سجل المحادثات

◈ ────────────────────── ◈
${isAyman ? "💖 مع حبي لأيمن - كيرا" : "👑 كيرا - المساعدة الذكية"}`;

  return api.sendMessage(helpMessage, event.threadID);
}

function showStats(api, event) {
  const user = getUserData(event.senderID);
  const isAyman = event.senderID === AYMAN_ID;
  
  const stats = `◈ ───『 📊 إحصائيات كيرا 』─── ◈

👤 بياناتك:
│ 🔢 عدد تفاعلاتك: ${user.interactions}
│ 📅 أول مرة: ${new Date(user.firstSeen).toLocaleDateString('ar')}
│ 🕐 آخر مرة: ${new Date(user.lastSeen).toLocaleString('ar')}

🌍 إحصائيات عامة:
│ 👥 عدد المستخدمين: ${Object.keys(MEMORY.users).length}
│ 💬 إجمالي التفاعلات: ${MEMORY.interactions}
│ 🗂️ المحادثات المحفوظة: ${Object.keys(CONVERSATIONS).length}

◈ ────────────────────── ◈
${isAyman ? "💖 أنت تاجي يا أيمن" : "📊 هذه إحصائياتك... استخدمها بحكمة"}`;

  return api.sendMessage(stats, event.threadID);
}

function clearConversations(api, event) {
  const threadID = event.threadID;
  const isAyman = event.senderID === AYMAN_ID;
  
  if (CONVERSATIONS[threadID]) {
    delete CONVERSATIONS[threadID];
    saveMemory();
    
    const message = isAyman
      ? "💖 تم مسح سجل المحادثات يا أيمن... كما تأمر!"
      : "🗑️ تم مسح سجل المحادثات... لنبدأ من جديد";
    
    return api.sendMessage(message, event.threadID);
  } else {
    return api.sendMessage("❌ لا يوجد سجل محادثات لحذفه", event.threadID);
  }
}

function showAllCommands(api, event) {
  const allCommands = `◈ ───『 📋 كل أوامر كيرا 』─── ◈

🎵 الموسيقى والترفيه:
├─ سمعيني / سمعني + [اسم الأغنية]
├─ فيلم / فلم + [اسم الفيلم]
└─ انمي / أنمي + [اسم الأنمي]

🖼️ الصور والبحث:
└─ صور / صورة + [موضوع البحث]

🌐 الترجمة والنطق:
├─ ترجم / ترجمة + [النص]
└─ قولي / اقرأ / انطقي + [النص]

📱 الأدوات الذكية:
├─ باركود / qr + [النص]
└─ سكرين / screenshot + [رابط الموقع]

🌤️ المعلومات:
├─ طقس / جو + [اسم المدينة]
├─ حقيقة / معلومة + [موضوع]
└─ عنصر + [اسم العنصر الكيميائي]

💪 الصحة والرياضة:
└─ تمرين / رياضة + [اسم التمرين]

💻 البرمجة:
└─ npm / package + [اسم الحزمة]

🤖 الذكاء الاصطناعي:
└─ أي سؤال أو محادثة مباشرة!

📊 أوامر النظام:
├─ .كيرا لاست - هذه القائمة
├─ .كيرا ذاكرة - الإحصائيات
├─ .كيرا نسيان - مسح السجل
└─ .كيرا مساعدة - القائمة المختصرة

◈ ────────────────────── ◈
💡 نصيحة: استخدمي الأوامر بدون نقطة في البداية
    مثال: "كيرا سمعيني اغنية حزينة"

${event.senderID === AYMAN_ID ? "💖 كل هذا من أجلك يا أيمن" : "👑 كيرا - في خدمتك (على مضض 😏)"}`;

  return api.sendMessage(allCommands, event.threadID);
}

// ═══════════════════════════════════════════════════════════
// 🚀 الدالة الرئيسية
// ═══════════════════════════════════════════════════════════

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, senderID } = event;
  const text = args.join(" ").trim();

  // تحديث تفاعل المستخدم
  updateUserInteraction(senderID);

  // إذا لم يتم إدخال نص
  if (!text) {
    return showHelp(api, event);
  }

  // التحقق من الأوامر الخاصة
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes("لاست") || lowerText === "list") {
    return showAllCommands(api, event);
  }
  
  if (lowerText.includes("ذاكرة") || lowerText.includes("stats")) {
    return showStats(api, event);
  }
  
  if (lowerText.includes("نسيان") || lowerText.includes("clear")) {
    return clearConversations(api, event);
  }
  
  if (lowerText.includes("مساعدة") || lowerText === "help") {
    return showHelp(api, event);
  }

  // التحقق من الأسئلة الدينية
  const religiousKeywords = ["دين", "الله", "اللة", "نبي", "قرآن", "اسلام", "مسيحي", "يهود"];
  if (religiousKeywords.some(keyword => lowerText.includes(keyword))) {
    const response = KIRA_PERSONALITY.religious[
      Math.floor(Math.random() * KIRA_PERSONALITY.religious.length)
    ];
    return api.sendMessage(response, threadID, messageID);
  }

  // كشف النية
  const intent = detectIntent(text);
  
  if (!intent) {
    return api.sendMessage(
      "❓ لم أفهم طلبك... هل يمكنك أن تكون أكثر وضوحاً؟ 🤔",
      threadID,
      messageID
    );
  }

  try {
    // إضافة رد فعل
    api.setMessageReaction(intent.icon, messageID, () => {}, true);

    // تنفيذ الأمر المناسب
    const handler = CommandHandlers[intent.type];
    if (handler) {
      await handler(api, event, intent.query);
    } else {
      // إذا لم يكن هناك معالج محدد، استخدم AI
      await CommandHandlers.ai(api, event, text);
    }

  } catch (error) {
    console.error("❌ KIRA ERROR:", error);
    
    const errorMsg = senderID === AYMAN_ID
      ? "💔 عذراً يا أيمن، حدث خطأ تقني... سأصلحه حالاً!"
      : "❌ حدث خطأ... وحتى أنا لا أستطيع حل كل المشاكل 🙄";
    
    return api.sendMessage(errorMsg, threadID, messageID);
  }
};

// ═══════════════════════════════════════════════════════════
// 🎯 معالج الرسائل التلقائي (بدون بادئة)
// ═══════════════════════════════════════════════════════════

module.exports.handleEvent = async ({ api, event }) => {
  const { threadID, messageID, senderID, body } = event;
  
  if (!body || body.startsWith(".") || body.startsWith("/")) return;
  
  // الرد التلقائي على الإشارات
  const mentions = ["كيرا", "kira", "@كيرا"];
  const shouldRespond = mentions.some(mention => 
    body.toLowerCase().includes(mention.toLowerCase())
  );
  
  if (shouldRespond) {
    const greeting = getPersonalizedGreeting(senderID);
    
    setTimeout(() => {
      api.sendMessage(
        `${greeting}\n\nاستخدمي: .كيرا [طلبك] للمساعدة الكاملة 💫`,
        threadID,
        messageID
      );
    }, 1000);
  }
};

// ═══════════════════════════════════════════════════════════
// 💾 حفظ الذاكرة عند إيقاف البوت
// ═══════════════════════════════════════════════════════════

process.on('SIGINT', () => {
  console.log('\n👑 كيرا: جاري حفظ الذاكرة...');
  saveMemory();
  console.log('✅ تم حفظ الذاكرة بنجاح!');
  process.exit(0);
});
