const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const request = require("request");

// ═══════════════════════════════════════════════════════════
// 👑 KIRA v6.0 - نظام الذكاء الاصطناعي المتطور
// المطور: أيمن (Ayman) - تاج الرأس وعم الجميع
// ═══════════════════════════════════════════════════════════

module.exports.config = {
  name: "كيرا",
  aliases: ["kira", "ai", "كيرة"],
  version: "6.0.0",
  hasPermssion: 0,
  credits: "Ayman ♛",
  description: "👑 كيرا | فتاة عراقية ذكية، نرجسية، سليطة اللسان",
  commandCategory: "ai",
  usages: ".كيرا [الأمر/السؤال]",
  cooldowns: 3
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
  prodia: "https://api.prodia.com/generate"
};

// ═══════════════════════════════════════════════════════════
// 📁 نظام إدارة الملفات
// ═══════════════════════════════════════════════════════════

const CACHE = path.join(__dirname, "cache");
const MEMORY_FILE = path.join(__dirname, "kira_memory.json");
const CONVERSATIONS_FILE = path.join(__dirname, "kira_conversations.json");

fs.ensureDirSync(CACHE);

let MEMORY = {};
let CONVERSATIONS = {};

try { MEMORY = fs.readJsonSync(MEMORY_FILE); } 
catch { 
  MEMORY = { users: {}, interactions: 0, lastUpdate: Date.now() };
}

try { CONVERSATIONS = fs.readJsonSync(CONVERSATIONS_FILE); } 
catch { CONVERSATIONS = {}; }

function saveMemory() {
  fs.writeJsonSync(MEMORY_FILE, MEMORY, { spaces: 2 });
  fs.writeJsonSync(CONVERSATIONS_FILE, CONVERSATIONS, { spaces: 2 });
}

// ═══════════════════════════════════════════════════════════
// 🎭 شخصية كيرا
// ═══════════════════════════════════════════════════════════

const AYMAN_ID = "61577861540407";

const KIRA_PERSONALITY = {
  ayman: {
    greetings: [
      "حبيبي أيمن! 💖 تحت أمرك يا تاج رأسي",
      "أيمن! يا نبض قلبي، ماذا تأمرني؟ 👑",
      "عيني أيمن! شرفتني بوجودك 🌟"
    ],
    responses: [
      "جاهزة يا أيمن! 💕",
      "تحت أمرك دائماً يا حبيبي 👑",
      "بكل سرور يا مطوري العزيز 🌹"
    ]
  },
  strangers: {
    insults: [
      "سؤالك هذا يثبت لي أن العقل زينة لم تُرزق بها 😏",
      "يا للعجب! هل تظن أن ذكاءك يضاهي عقلي الجبار؟ 🙄",
      "أغاتي، سؤالك يجعلني أشك في مستقبل البشرية... 💅",
      "لعد، أنت تتحدث مع كيرا! فتاة أذكى منك بمليون مرة... 👸"
    ],
    neutral: [
      "تفضل، هذا ما طلبته... 😌",
      "ها هو جوابك، استخدم عقلك 💁‍♀️",
      "سأساعدك هذه المرة 👑"
    ]
  }
};

// ═══════════════════════════════════════════════════════════
// 🎯 نظام كشف النوايا المتقدم
// ═══════════════════════════════════════════════════════════

const INTENTS = [
  { type: "imagine", icon: "🎨", keys: ["تخيل", "ارسم", "صمم", "خلق", "imagine", "draw", "generate", "create"], category: "توليد صور" },
  { type: "music", icon: "🎵", keys: ["سمعني", "سمعيني", "اغنية", "أغنية", "موسيقى", "song", "music"], category: "ترفيه" },
  { type: "images", icon: "🖼️", keys: ["صور", "صورة", "صوره", "ابحث عن صور", "image", "pics", "photo"], category: "بحث" },
  { type: "movie", icon: "🎬", keys: ["فلم", "فيلم", "movie", "imdb", "cinema"], category: "ترفيه" },
  { type: "anime", icon: "🌸", keys: ["انمي", "أنمي", "anime", "manga"], category: "ترفيه" },
  { type: "translate", icon: "🌐", keys: ["ترجم", "ترجمة", "translate"], category: "أدوات" },
  { type: "tts", icon: "🎤", keys: ["قولي", "اقرأ", "انطقي", "نطق", "tts"], category: "أدوات" },
  { type: "weather", icon: "🌤️", keys: ["طقس", "جو", "weather"], category: "معلومات" },
  { type: "facts", icon: "💡", keys: ["حقيقة", "معلومة", "fact"], category: "معلومات" },
  { type: "npm", icon: "📦", keys: ["npm", "package", "حزمة"], category: "برمجة" },
  { type: "element", icon: "⚛️", keys: ["عنصر", "element"], category: "علوم" },
  { type: "ai", icon: "🤖", keys: ["سؤال", "اسأل", "كيف", "ماذا", "لماذا", "هل"], category: "ذكاء اصطناعي" }
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
          category: intent.category
        };
      }
    }
  }
  return { type: "ai", icon: "🤖", query: text, category: "محادثة" };
}

// ═══════════════════════════════════════════════════════════
// 👤 نظام الذاكرة
// ═══════════════════════════════════════════════════════════

function getUserData(userID) {
  if (!MEMORY.users[userID]) {
    MEMORY.users[userID] = {
      firstSeen: Date.now(),
      lastSeen: Date.now(),
      interactions: 0
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
  if (!CONVERSATIONS[threadID]) CONVERSATIONS[threadID] = [];
  return CONVERSATIONS[threadID].slice(-limit);
}

function addToConversation(threadID, role, content) {
  if (!CONVERSATIONS[threadID]) CONVERSATIONS[threadID] = [];
  CONVERSATIONS[threadID].push({ role, content, timestamp: Date.now() });
  if (CONVERSATIONS[threadID].length > 50) {
    CONVERSATIONS[threadID] = CONVERSATIONS[threadID].slice(-50);
  }
  saveMemory();
}

// ═══════════════════════════════════════════════════════════
// 🎨 تنسيق الرسائل
// ═══════════════════════════════════════════════════════════

function formatKiraMessage(content, isAyman = false) {
  const border = isAyman ? "💖" : "◈";
  const header = isAyman ? `${border} ───『 كيرا لأيمن 』─── ${border}` : `${border} ───『 كيرا 』─── ${border}`;
  return `${header}\n│\n${content}\n│\n${border} ────────────── ${border}`;
}

// ═══════════════════════════════════════════════════════════
// 🔧 معالجات الأوامر
// ═══════════════════════════════════════════════════════════

const CommandHandlers = {

  // 🎨 توليد الصور بالذكاء الاصطناعي
  async imagine(api, event, query) {
    if (!query) return api.sendMessage("❌ أخبريني ماذا تريدين أن أرسم؟", event.threadID);
    
    try {
      const msg = await api.sendMessage("🎨 جاري الرسم... انتظر قليلاً", event.threadID);
      
      // استخدام Flux API
      const response = await axios.get(
        `${APIs.flux}?prompt=${encodeURIComponent(query)}`,
        { responseType: 'stream' }
      );
      
      const imagePath = path.join(CACHE, `imagine_${Date.now()}.png`);
      const writer = fs.createWriteStream(imagePath);
      
      response.data.pipe(writer);
      
      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
      
      api.unsendMessage(msg.messageID);
      
      const message = event.senderID === AYMAN_ID
        ? `🎨 رسمت لك يا أيمن: "${query}"\n💖 مع حبي`
        : `🎨 ها هي صورتك: "${query}"\n\nخذ... وإن كنت لا تستحق 😏`;
      
      return api.sendMessage(
        {
          body: message,
          attachment: fs.createReadStream(imagePath)
        },
        event.threadID,
        () => fs.unlinkSync(imagePath)
      );
      
    } catch (error) {
      console.error("Imagine Error:", error);
      
      // Fallback إلى Pollinations
      try {
        const pollinationsUrl = `${APIs.pollinations}/${encodeURIComponent(query)}`;
        const response = await axios.get(pollinationsUrl, { responseType: 'arraybuffer' });
        
        const imagePath = path.join(CACHE, `imagine_${Date.now()}.png`);
        fs.writeFileSync(imagePath, response.data);
        
        return api.sendMessage(
          {
            body: `🎨 صورتك (نسخة احتياطية):\n${query}`,
            attachment: fs.createReadStream(imagePath)
          },
          event.threadID,
          () => fs.unlinkSync(imagePath)
        );
      } catch (err) {
        return api.sendMessage("❌ فشل توليد الصورة... حاول مرة أخرى", event.threadID);
      }
    }
  },

  // 🎵 الموسيقى
  async music(api, event, query) {
    if (!query) return api.sendMessage("❌ ما اسم الأغنية؟", event.threadID);
    
    try {
      const response = await axios.get(
        `${APIs.deezer}?q=${encodeURIComponent(query)}&limit=1`
      );
      
      if (!response.data.data || !response.data.data.length) {
        return api.sendMessage("❌ لم أجد أغنية بهذا الاسم 🎵", event.threadID);
      }
      
      const song = response.data.data[0];
      const file = path.join(CACHE, `music_${Date.now()}.mp3`);
      
      const audio = await axios.get(song.preview, { responseType: "arraybuffer" });
      fs.writeFileSync(file, audio.data);
      
      const message = event.senderID === AYMAN_ID
        ? `🎵 لك يا أيمن!\n🎤 ${song.title}\n🎨 ${song.artist.name}\n💖`
        : `🎵 ${song.title}\n🎤 ${song.artist.name}\n\nخذ... 😏`;
      
      return api.sendMessage(
        { body: message, attachment: fs.createReadStream(file) },
        event.threadID,
        () => fs.unlinkSync(file)
      );
    } catch (error) {
      return api.sendMessage("❌ خطأ في جلب الأغنية 🎵", event.threadID);
    }
  },

  // 🖼️ الصور (Pinterest)
  async images(api, event, query) {
    if (!query) return api.sendMessage("❌ ابحث عن ماذا؟", event.threadID);
    
    try {
      const msg = await api.sendMessage("🔍 جاري البحث عن الصور...", event.threadID);
      
      const response = await axios.get(
        `${APIs.pinterest}?search=${encodeURIComponent(query)}`
      );
      
      if (!response.data.data || response.data.data.length === 0) {
        api.unsendMessage(msg.messageID);
        return api.sendMessage("❌ لم أجد صور لهذا الموضوع", event.threadID);
      }
      
      // جلب أول 6 صور
      const imageUrls = response.data.data.slice(0, 6);
      const attachments = [];
      
      for (let i = 0; i < imageUrls.length; i++) {
        try {
          const imgResponse = await axios.get(imageUrls[i], { 
            responseType: 'arraybuffer',
            timeout: 10000
          });
          
          const imgPath = path.join(CACHE, `image_${Date.now()}_${i}.jpg`);
          fs.writeFileSync(imgPath, imgResponse.data);
          attachments.push(fs.createReadStream(imgPath));
        } catch (err) {
          console.log(`فشل تحميل الصورة ${i + 1}`);
        }
      }
      
      api.unsendMessage(msg.messageID);
      
      if (attachments.length === 0) {
        return api.sendMessage("❌ فشل تحميل الصور", event.threadID);
      }
      
      const message = event.senderID === AYMAN_ID
        ? `🖼️ صور "${query}" لك يا أيمن\n💖 ${attachments.length} صور`
        : `🖼️ ${attachments.length} صور: ${query}\n\nاستمتع... 😏`;
      
      return api.sendMessage(
        { body: message, attachment: attachments },
        event.threadID,
        () => {
          // حذف جميع الصور المؤقتة
          attachments.forEach((_, i) => {
            const imgPath = path.join(CACHE, `image_${Date.now()}_${i}.jpg`);
            if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
          });
        }
      );
      
    } catch (error) {
      console.error("Images Error:", error);
      return api.sendMessage("❌ خطأ في البحث عن الصور", event.threadID);
    }
  },

  // 🎬 الأفلام
  async movie(api, event, query) {
    if (!query) return api.sendMessage("❌ ما اسم الفيلم؟", event.threadID);
    
    try {
      const response = await axios.get(
        `${APIs.imdb}?q=${encodeURIComponent(query)}`
      );
      
      const data = response.data;
      const content = `│ 🎞️ ${data.title || "غير متوفر"}
│ ⭐ التقييم: ${data.rating || "N/A"}
│ 📅 السنة: ${data.year || "N/A"}
│ 🎭 النوع: ${data.genres?.join(", ") || "N/A"}
│ 📝 القصة: ${data.plot || "غير متوفرة"}`;

      return api.sendMessage(
        formatKiraMessage(content, event.senderID === AYMAN_ID),
        event.threadID
      );
    } catch (error) {
      return api.sendMessage("❌ لم أجد هذا الفيلم 🎬", event.threadID);
    }
  },

  // 🌸 الأنمي
  async anime(api, event, query) {
    if (!query) return api.sendMessage("❌ ما اسم الأنمي؟", event.threadID);
    
    try {
      const response = await axios.get(
        `${APIs.jikan}?q=${encodeURIComponent(query)}&limit=1`
      );
      
      if (!response.data.data || !response.data.data.length) {
        return api.sendMessage("❌ لم أجد هذا الأنمي 🌸", event.threadID);
      }
      
      const anime = response.data.data[0];
      const content = `│ 📛 ${anime.title}
│ ⭐ التقييم: ${anime.score || "N/A"}
│ 📺 الحلقات: ${anime.episodes || "مستمر"}
│ 📅 السنة: ${anime.year || "N/A"}`;

      return api.sendMessage(
        formatKiraMessage(content, event.senderID === AYMAN_ID),
        event.threadID
      );
    } catch (error) {
      return api.sendMessage("❌ خطأ في البحث 🌸", event.threadID);
    }
  },

  // 🌐 الترجمة
  async translate(api, event, query) {
    if (!query) return api.sendMessage("❌ ماذا أترجم؟", event.threadID);
    
    try {
      const response = await axios.get(
        `${APIs.translate}?client=gtx&sl=auto&tl=ar&dt=t&q=${encodeURIComponent(query)}`
      );
      
      const translation = response.data[0][0][0];
      const message = event.senderID === AYMAN_ID
        ? `🌐 الترجمة لك يا أيمن:\n${translation}`
        : `🌐 الترجمة:\n${translation}`;
      
      return api.sendMessage(message, event.threadID);
    } catch (error) {
      return api.sendMessage("❌ خطأ في الترجمة 🌐", event.threadID);
    }
  },

  // 🎤 النطق
  async tts(api, event, query) {
    if (!query) return api.sendMessage("❌ ماذا أنطق؟", event.threadID);
    
    try {
      const file = path.join(CACHE, `tts_${Date.now()}.mp3`);
      const ttsUrl = `${APIs.tts}?ie=UTF-8&q=${encodeURIComponent(query)}&tl=ar&client=tw-ob`;
      
      request({ url: ttsUrl, headers: { 'User-Agent': 'Mozilla' } }, () => {})
        .pipe(fs.createWriteStream(file))
        .on("finish", () => {
          api.sendMessage(
            {
              body: event.senderID === AYMAN_ID ? "🎤 بصوتي لك يا أيمن 💖" : "🎤 استمع...",
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

  // 🌤️ الطقس
  async weather(api, event, query) {
    if (!query) return api.sendMessage("❌ ما اسم المدينة؟", event.threadID);
    
    try {
      const response = await axios.get(
        `${APIs.weather}?q=${encodeURIComponent(query)}&appid=YOUR_API_KEY&units=metric&lang=ar`
      );
      
      const data = response.data;
      const content = `│ 🌍 ${data.name}
│ 🌡️ الحرارة: ${data.main.temp}°C
│ 💧 الرطوبة: ${data.main.humidity}%
│ 🌤️ الحالة: ${data.weather[0].description}`;

      return api.sendMessage(
        formatKiraMessage(content, event.senderID === AYMAN_ID),
        event.threadID
      );
    } catch (error) {
      return api.sendMessage("❌ لم أستطع جلب بيانات الطقس 🌤️", event.threadID);
    }
  },

  // 💡 حقائق
  async facts(api, event, query) {
    try {
      const imgUrl = `${APIs.facts}?text=${encodeURIComponent(query || "حقيقة عشوائية")}`;
      return api.sendMessage(`💡 حقيقة:\n${imgUrl}`, event.threadID);
    } catch (error) {
      return api.sendMessage("❌ خطأ في جلب الحقائق 💡", event.threadID);
    }
  },

  // 📦 NPM
  async npm(api, event, query) {
    if (!query) return api.sendMessage("❌ ما اسم الحزمة؟", event.threadID);
    
    try {
      const response = await axios.get(
        `${APIs.npm}?q=${encodeURIComponent(query)}`
      );
      
      const data = response.data;
      const content = `│ 📦 الحزمة: ${data.name}
│ 📝 الوصف: ${data.description}
│ 👤 المطور: ${data.author || "N/A"}`;

      return api.sendMessage(
        formatKiraMessage(content, event.senderID === AYMAN_ID),
        event.threadID
      );
    } catch (error) {
      return api.sendMessage("❌ لم أجد هذه الحزمة 📦", event.threadID);
    }
  },

  // ⚛️ العناصر
  async element(api, event, query) {
    if (!query) return api.sendMessage("❌ ما اسم العنصر؟", event.threadID);
    
    try {
      const response = await axios.get(
        `${APIs.element}?element=${encodeURIComponent(query)}`
      );
      
      const data = response.data;
      const content = `│ ⚛️ العنصر: ${data.name}
│ 🔤 الرمز: ${data.symbol}
│ 🔢 العدد الذري: ${data.atomic_number}
│ ⚖️ الكتلة: ${data.atomic_mass}`;

      return api.sendMessage(
        formatKiraMessage(content, event.senderID === AYMAN_ID),
        event.threadID
      );
    } catch (error) {
      return api.sendMessage("❌ لم أجد هذا العنصر ⚛️", event.threadID);
    }
  },

  // 🤖 الذكاء الاصطناعي (Groq)
  async ai(api, event, query) {
    if (!query) return api.sendMessage("❌ ماذا تريد أن تسأل؟", event.threadID);
    
    try {
      const history = getConversationHistory(event.threadID, 5);
      
      let systemPrompt = "أنت كيرا، فتاة عراقية في السابعة عشر من العمر، ذكية جداً، نرجسية، سليطة اللسان. ";
      
      if (event.senderID === AYMAN_ID) {
        systemPrompt += "المستخدم الحالي هو أيمن، مطورك وحبيبك. كوني رقيقة ومطيعة معه تماماً. ";
      } else {
        systemPrompt += "المستخدم شخص عادي. تعاملي معه ببرود وازدراء، لكن أجيبي بدقة. ";
      }
      
      const messages = [
        { role: "system", content: systemPrompt }
      ];
      
      history.forEach(msg => {
        messages.push({ role: msg.role, content: msg.content });
      });
      
      messages.push({ role: "user", content: query });
      
      const response = await axios.post(
        APIs.groq,
        {
          model: "llama-3.3-70b-versatile",
          messages: messages,
          temperature: 0.7,
          max_tokens: 1024
        },
        {
          headers: {
            "Authorization": `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );
      
      let answer = response.data.choices[0].message.content;
      
      if (event.senderID === AYMAN_ID) {
        answer = `💖 ${answer}\n\n- كيرا`;
      } else {
        const neutral = KIRA_PERSONALITY.strangers.neutral[
          Math.floor(Math.random() * KIRA_PERSONALITY.strangers.neutral.length)
        ];
        answer = `${answer}\n\n${neutral}`;
      }
      
      addToConversation(event.threadID, "user", query);
      addToConversation(event.threadID, "assistant", answer);
      
      return api.sendMessage(answer, event.threadID);
      
    } catch (error) {
      console.error("AI Error:", error.response?.data || error.message);
      return api.sendMessage(
        "❌ عذراً، حدث خطأ في النظام... 🤖",
        event.threadID
      );
    }
  }
};

// ═══════════════════════════════════════════════════════════
// 📋 أوامر خاصة
// ═══════════════════════════════════════════════════════════

function showHelp(api, event) {
  const isAyman = event.senderID === AYMAN_ID;
  
  const helpMessage = `◈ ───『 📚 أوامر كيرا 』─── ◈

🎨 التوليد والإبداع:
│ تخيل/ارسم [الوصف] - توليد صور AI

🎵 الترفيه:
│ سمعيني [اسم الأغنية] - موسيقى
│ فيلم [اسم الفيلم] - معلومات
│ انمي [اسم الأنمي] - معلومات

🖼️ البحث:
│ صور [موضوع] - بحث صور Pinterest

🛠️ الأدوات:
│ ترجم [النص] - ترجمة
│ قولي [النص] - نطق صوتي

📊 المعلومات:
│ طقس [المدينة] - حالة الطقس
│ حقيقة [موضوع] - حقائق
│ npm [حزمة] - معلومات NPM
│ عنصر [عنصر] - عناصر كيميائية

🤖 الذكاء الاصطناعي:
│ فقط اسأليني أي سؤال!

📌 أوامر خاصة:
│ .كيرا لاست - كل الأوامر
│ .كيرا ذاكرة - الإحصائيات
│ .كيرا نسيان - مسح السجل

◈ ────────────────────── ◈
${isAyman ? "💖 مع حبي لأيمن - كيرا" : "👑 كيرا"}`;

  return api.sendMessage(helpMessage, event.threadID);
}

function showStats(api, event) {
  const user = getUserData(event.senderID);
  const isAyman = event.senderID === AYMAN_ID;
  
  const stats = `◈ ───『 📊 إحصائيات كيرا 』─── ◈

👤 بياناتك:
│ 🔢 تفاعلاتك: ${user.interactions}
│ 📅 أول مرة: ${new Date(user.firstSeen).toLocaleDateString('ar')}
│ 🕐 آخر مرة: ${new Date(user.lastSeen).toLocaleString('ar')}

🌍 إحصائيات عامة:
│ 👥 المستخدمين: ${Object.keys(MEMORY.users).length}
│ 💬 التفاعلات: ${MEMORY.interactions}
│ 🗂️ المحادثات: ${Object.keys(CONVERSATIONS).length}

◈ ────────────────────── ◈
${isAyman ? "💖 أنت تاجي يا أيمن" : "📊 إحصائياتك"}`;

  return api.sendMessage(stats, event.threadID);
}

function clearConversations(api, event) {
  if (CONVERSATIONS[event.threadID]) {
    delete CONVERSATIONS[event.threadID];
    saveMemory();
    const msg = event.senderID === AYMAN_ID
      ? "💖 تم مسح السجل يا أيمن!"
      : "🗑️ تم مسح السجل";
    return api.sendMessage(msg, event.threadID);
  }
  return api.sendMessage("❌ لا يوجد سجل لحذفه", event.threadID);
}

function showAllCommands(api, event) {
  const allCommands = `◈ ───『 📋 كل أوامر كيرا 』─── ◈

🎨 توليد الصور بالذكاء الاصطناعي:
├─ تخيل / ارسم / صمم + [الوصف]
└─ imagine / draw / create + [description]

🎵 الموسيقى والترفيه:
├─ سمعيني / سمعني + [اسم الأغنية]
├─ فيلم / فلم + [اسم الفيلم]
└─ انمي / أنمي + [اسم الأنمي]

🖼️ الصور والبحث:
└─ صور / صورة + [موضوع البحث]

🌐 الترجمة والنطق:
├─ ترجم / ترجمة + [النص]
└─ قولي / اقرأ / انطقي + [النص]

🌤️ المعلومات:
├─ طقس / جو + [المدينة]
├─ حقيقة / معلومة + [موضوع]
├─ npm / package + [اسم الحزمة]
└─ عنصر + [اسم العنصر]

🤖 الذكاء الاصطناعي:
└─ أي سؤال أو محادثة!

📊 أوامر النظام:
├─ .كيرا لاست - هذه القائمة
├─ .كيرا ذاكرة - الإحصائيات
├─ .كيرا نسيان - مسح السجل
└─ .كيرا مساعدة - المساعدة

◈ ────────────────────── ◈
${event.senderID === AYMAN_ID ? "💖 كل هذا من أجلك يا أيمن" : "👑 كيرا"}`;

  return api.sendMessage(allCommands, event.threadID);
}

// ═══════════════════════════════════════════════════════════
// 🚀 الدالة الرئيسية
// ═══════════════════════════════════════════════════════════

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, senderID } = event;
  const text = args.join(" ").trim();

  updateUserInteraction(senderID);

  if (!text) return showHelp(api, event);

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
  const religiousKeywords = ["دين", "الله", "اللة", "نبي", "قرآن", "اسلام"];
  if (religiousKeywords.some(k => lowerText.includes(k))) {
    return api.sendMessage(
      "عقلي مبرمج للذكاء والجمال، وليس للجدل في أمور الغيب 🚫",
      threadID
    );
  }

  const intent = detectIntent(text);

  try {
    api.setMessageReaction(intent.icon, messageID, () => {}, true);

    const handler = CommandHandlers[intent.type];
    if (handler) {
      await handler(api, event, intent.query);
    } else {
      await CommandHandlers.ai(api, event, text);
    }

  } catch (error) {
    console.error("❌ KIRA ERROR:", error);
    const errorMsg = senderID === AYMAN_ID
      ? "💔 عذراً يا أيمن، حدث خطأ!"
      : "❌ حدث خطأ... 🙄";
    return api.sendMessage(errorMsg, threadID);
  }
};

// ═══════════════════════════════════════════════════════════
// 🎯 معالج الرسائل التلقائي
// ═══════════════════════════════════════════════════════════

module.exports.handleEvent = async ({ api, event }) => {
  const { threadID, messageID, senderID, body } = event;
  
  if (!body || body.startsWith(".") || body.startsWith("/")) return;
  
  const mentions = ["كيرا", "kira", "@كيرا"];
  const shouldRespond = mentions.some(m => 
    body.toLowerCase().includes(m.toLowerCase())
  );
  
  if (shouldRespond) {
    const greeting = senderID === AYMAN_ID
      ? KIRA_PERSONALITY.ayman.greetings[0]
      : KIRA_PERSONALITY.strangers.insults[0];
    
    setTimeout(() => {
      api.sendMessage(
        `${greeting}\n\nاستخدمي: .كيرا [طلبك] 💫`,
        threadID,
        messageID
      );
    }, 1000);
  }
};

// حفظ عند الإيقاف
process.on('SIGINT', () => {
  console.log('\n👑 كيرا: حفظ الذاكرة...');
  saveMemory();
  console.log('✅ تم الحفظ!');
  process.exit(0);
});
