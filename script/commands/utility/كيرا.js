const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const request = require("request");
const QRCode = require("qrcode");
const jimp = require("jimp");

// تأكد من إنشاء مجلد cache إذا لم يكن موجوداً
if (!fs.existsSync(path.join(__dirname, "cache"))) {
  fs.mkdirSync(path.join(__dirname, "cache"), { recursive: true });
}

module.exports.config = {
  name: "كيرا",  // ✅ تغيير هنا
  version: "3.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "🧠 كيرا - المساعدة الذكية الشاملة",
  commandCategory: "ai",
  usages: "كيرا [الطلب]",
  cooldowns: 5,
  dependencies: {
    "axios": "",
    "fs-extra": "",
    "request": "",
    "qrcode": "",
    "jimp": ""
  }
};

// 🎯 قاعدة بيانات المرادفات الذكية
const AI_COMMANDS = {
  music: {
    keywords: ["سمعني", "سمعيني", "جيبلي أغنية", "جيب أغنية", "شغلي", "شغل", "موسيقى", "أغنية", "اغنية", "بحث أغنية", "music", "song", "play"],
    icon: "🎵"
  },
  images: {
    keywords: ["جيبلي صور", "جيب صور", "ابحثلي صور", "ابحث صور", "صور عن", "صورة", "صور", "images", "photos", "pics", "ابحث عن صور"],
    icon: "🖼️"
  },
  screenshot: {
    keywords: ["صورلي موقع", "صور موقع", "سكرين", "لقطة شاشة", "screenshot", "snap", "صورة للموقع"],
    icon: "📸"
  },
  qrcode: {
    keywords: ["باركود", "اعملي باركود", "اعمل باركود", "اعملي QR", "qr", "كود", "barcode", "qr code"],
    icon: "📱"
  },
  translate: {
    keywords: ["ترجملي", "ترجم", "ترجمة", "translate", "ترجمه"],
    icon: "🌐"
  },
  tts: {
    keywords: ["قولي", "قول", "اقرأ", "نطق", "say", "speak", "اقرألي"],
    icon: "🎤"
  },
  movies: {
    keywords: ["اقترحلي فلم", "اقترح فلم", "فلم", "فيلم", "movie", "film", "ابحث عن فلم", "فلم عن"],
    icon: "🎬"
  },
  anime: {
    keywords: ["اقترحلي انمي", "اقترح انمي", "انمي", "أنمي", "anime", "ابحث عن انمي"],
    icon: "🌸"
  }
};

// 🧠 دالة الذكاء الاصطناعي - كشف النية
function detectIntent(message) {
  const lowerMsg = message.toLowerCase().trim();
  
  for (const [action, config] of Object.entries(AI_COMMANDS)) {
    for (const keyword of config.keywords) {
      if (lowerMsg.includes(keyword.toLowerCase())) {
        return {
          action,
          keyword,
          query: extractQuery(lowerMsg, keyword),
          icon: config.icon
        };
      }
    }
  }
  return null;
}

// 📝 استخراج النص بعد الكلمة المفتاحية
function extractQuery(message, keyword) {
  const index = message.toLowerCase().indexOf(keyword.toLowerCase());
  if (index === -1) return "";
  
  let query = message.slice(index + keyword.length).trim();
  const fillers = ["لي", "لى", "عن", "ل", "من", "في", "على", "ال", "الـ"];
  
  for (const filler of fillers) {
    if (query.startsWith(filler + " ")) {
      query = query.slice(filler.length + 1).trim();
    }
  }
  return query;
}

// 🎵 وظيفة الموسيقى
async function handleMusic(api, event, query) {
  const { threadID, messageID, senderID } = event;
  
  if (!query) {
    return api.sendMessage(
      "🎵 أخبرني ما الأغنية التي تريدها؟\nمثال: كيرا سمعيني عمرو دياب",
      threadID, messageID
    );
  }
  
  try {
    api.setMessageReaction("🔍", messageID, () => {}, true);
    
    const res = await axios.get(`https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=1`);
    if (!res.data.data?.length) {
      return api.sendMessage("❌ لم أجد هذه الأغنية!", threadID, messageID);
    }
    
    const song = res.data.data[0];
    const cachePath = path.join(__dirname, "cache", `music_${Date.now()}_${senderID}.mp3`);
    
    // جلب الصوت
    const audioRes = await axios.get(song.preview, { responseType: "arraybuffer" });
    await fs.writeFile(cachePath, Buffer.from(audioRes.data));
    
    // إرسال النتيجة
    await api.sendMessage({
      body: `🎵 ${song.artist.name} - ${song.title}`,
      attachment: fs.createReadStream(cachePath)
    }, threadID, () => {
      if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
    }, messageID);
    
  } catch (err) {
    console.error(err);
    return api.sendMessage("❌ حدث خطأ في جلب الأغنية!", threadID, messageID);
  }
}

// 🖼️ وظيفة البحث عن الصور
async function handleImages(api, event, query) {
  const { threadID, messageID } = event;
  
  if (!query) {
    return api.sendMessage(
      "🖼️ ما الصور التي تريدها؟\nمثال: كيرا جيبلي صور قطط",
      threadID, messageID
    );
  }
  
  try {
    api.setMessageReaction("🔍", messageID, () => {}, true);
    
    // طريقة بسيطة لجلب الصور من Unsplash (بدون Pinterest المعقد)
    const unsplashUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&client_id=YOUR_UNSPLASH_KEY&per_page=5`;
    
    const res = await axios.get(unsplashUrl);
    if (!res.data.results?.length) {
      return api.sendMessage("❌ لم أجد صور لهذا الموضوع!", threadID, messageID);
    }
    
    const attachments = [];
    const cachePath = path.join(__dirname, "cache");
    
    for (let i = 0; i < Math.min(3, res.data.results.length); i++) {
      try {
        const imgUrl = res.data.results[i].urls.regular;
        const imgRes = await axios.get(imgUrl, { responseType: "arraybuffer" });
        const filePath = path.join(cachePath, `img_${Date.now()}_${i}.jpg`);
        await fs.writeFile(filePath, Buffer.from(imgRes.data));
        attachments.push(fs.createReadStream(filePath));
        
        // حذف الملف بعد 5 ثواني
        setTimeout(() => {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }, 5000);
      } catch (e) { continue; }
    }
    
    if (!attachments.length) {
      return api.sendMessage("❌ فشل تحميل الصور!", threadID, messageID);
    }
    
    return api.sendMessage({
      body: `✅ ${attachments.length} صورة عن: ${query}`,
      attachment: attachments
    }, threadID, messageID);
    
  } catch (err) {
    console.error(err);
    return api.sendMessage("❌ حدث خطأ في جلب الصور!", threadID, messageID);
  }
}

// 📸 وظيفة تصوير المواقع
async function handleScreenshot(api, event, query) {
  const { threadID, messageID } = event;
  
  let url = query;
  if (!url?.includes(".")) {
    return api.sendMessage(
      "📸 أعطني رابط الموقع!\nمثال: كيرا صورلي google.com",
      threadID, messageID
    );
  }
  
  if (!url.startsWith("http")) url = "https://" + url;
  
  try {
    api.setMessageReaction("⏳", messageID, () => {}, true);
    
    const cachePath = path.join(__dirname, "cache", `screen_${Date.now()}.png`);
    
    // استخدم خدمة بسيطة
    const screenshotUrl = `https://image.thum.io/get/width/800/crop/600/noanimate/${url}`;
    const res = await axios.get(screenshotUrl, { responseType: 'arraybuffer' });
    await fs.writeFile(cachePath, Buffer.from(res.data));
    
    await api.sendMessage({
      body: `✅ تم تصوير الموقع\n🔗 ${url}`,
      attachment: fs.createReadStream(cachePath)
    }, threadID, () => {
      if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
    }, messageID);
    
  } catch (err) {
    console.error(err);
    return api.sendMessage("❌ فشل تصوير الموقع!", threadID, messageID);
  }
}

// 📱 وظيفة إنشاء الباركود
async function handleQRCode(api, event, query) {
  const { threadID, messageID } = event;
  
  if (!query) {
    return api.sendMessage(
      "📱 ما المحتوى للباركود؟\nمثال: كيرا اعملي باركود google.com",
      threadID, messageID
    );
  }
  
  try {
    const cachePath = path.join(__dirname, "cache", `qr_${Date.now()}.png`);
    
    await QRCode.toFile(cachePath, query, {
      color: { dark: '#000000', light: '#ffffff' },
      width: 300,
      margin: 1
    });
    
    await api.sendMessage({
      body: `✅ تم إنشاء الباركود\n📝 ${query.substring(0,50)}`,
      attachment: fs.createReadStream(cachePath)
    }, threadID, () => {
      if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
    }, messageID);
    
  } catch (err) {
    console.error(err);
    return api.sendMessage("❌ فشل إنشاء الباركود!", threadID, messageID);
  }
}

// 🌐 وظيفة الترجمة
async function handleTranslate(api, event, query) {
  const { threadID, messageID } = event;
  
  if (!query) {
    return api.sendMessage(
      "🌐 ما النص للترجمة؟\nمثال: كيرا ترجملي Hello World",
      threadID, messageID
    );
  }
  
  try {
    const res = await axios.get(
      `https://api.popcat.xyz/translate?to=ar&text=${encodeURIComponent(query)}`
    );
    
    if (res.data.translated) {
      return api.sendMessage(
        `🌐 الترجمة:\n${res.data.translated}`,
        threadID, messageID
      );
    }
    
    return api.sendMessage("❌ فشل الترجمة!", threadID, messageID);
    
  } catch (err) {
    console.error(err);
    return api.sendMessage("❌ حدث خطأ في الترجمة!", threadID, messageID);
  }
}

// 🎤 وظيفة تحويل النص لصوت
async function handleTTS(api, event, query) {
  const { threadID, messageID, senderID } = event;
  
  if (!query) {
    return api.sendMessage(
      "🎤 ما النص للقراءة؟\nمثال: كيرا قولي مرحبا",
      threadID, messageID
    );
  }
  
  try {
    const cachePath = path.join(__dirname, "cache", `tts_${Date.now()}_${senderID}.mp3`);
    
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(query)}&tl=ar&client=tw-ob`;
    const res = await axios.get(ttsUrl, { responseType: 'arraybuffer' });
    await fs.writeFile(cachePath, Buffer.from(res.data));
    
    await api.sendMessage({
      body: `✅ تم قراءة النص\n📝 ${query.substring(0,50)}`,
      attachment: fs.createReadStream(cachePath)
    }, threadID, () => {
      if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
    }, messageID);
    
  } catch (err) {
    console.error(err);
    return api.sendMessage("❌ فشل قراءة النص!", threadID, messageID);
  }
}

// 🎬 وظيفة البحث عن الأفلام
async function handleMovies(api, event, query) {
  const { threadID, messageID } = event;
  
  if (!query) {
    return api.sendMessage(
      "🎬 أخبرني نوع الفلم أو الاسم!\nمثال: كيرا اقترحلي فلم اكشن",
      threadID, messageID
    );
  }
  
  try {
    const res = await axios.get(`https://api.popcat.xyz/imdb?q=${encodeURIComponent(query)}`);
    if (res.data.error) {
      return api.sendMessage("❌ لم أجد هذا الفلم!", threadID, messageID);
    }
    
    const data = res.data;
    const message = `🎬 ${data.title}
📅 ${data.year}
⭐ ${data.rating}/10
🎭 ${data.genres}
📖 ${data.plot.substring(0,200)}...`;
    
    return api.sendMessage(message, threadID, messageID);
    
  } catch (err) {
    console.error(err);
    return api.sendMessage("❌ حدث خطأ في البحث عن الفلم!", threadID, messageID);
  }
}

// 🌸 وظيفة البحث عن الأنمي
async function handleAnime(api, event, query) {
  const { threadID, messageID } = event;
  
  if (!query) {
    return api.sendMessage(
      "🌸 أخبرني نوع الأنمي أو الاسم!\nمثال: كيرا اقترحلي انمي اكشن",
      threadID, messageID
    );
  }
  
  try {
    const res = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=1`);
    if (!res.data.data?.length) {
      return api.sendMessage("❌ لم أجد هذا الأنمي!", threadID, messageID);
    }
    
    const data = res.data.data[0];
    const message = `🌸 ${data.title}
📅 ${data.year || 'غير معروف'}
⭐ ${data.score || '?'}/10
🎭 ${data.genres?.map(g => g.name).join(', ') || 'غير معروف'}
📖 ${data.synopsis?.substring(0,200) || 'لا يوجد وصف'}...`;
    
    return api.sendMessage(message, threadID, messageID);
    
  } catch (err) {
    console.error(err);
    return api.sendMessage("❌ حدث خطأ في البحث عن الأنمي!", threadID, messageID);
  }
}

// ⚡ المعالج الرئيسي
module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID, body } = event;
  
  const triggerWords = ["كيرا", "كايرا"];
  let userMessage = body;
  let triggered = false;
  
  for (const trigger of triggerWords) {
    if (body.toLowerCase().startsWith(trigger.toLowerCase())) {
      userMessage = body.slice(trigger.length).trim();
      triggered = true;
      break;
    }
  }
  
  if (!triggered) return;
  
  if (!userMessage) {
    return api.sendMessage(
      "💫 أنا كيرا، مساعدتك الذكية!\n\n" +
      "📚 يمكنني:\n" +
      "🎵 الموسيقى: كيرا سمعيني [أغنية]\n" +
      "🖼️ الصور: كيرا جيبلي صور [شيء]\n" +
      "🎬 الأفلام: كيرا اقترحلي فلم\n" +
      "🌸 الأنمي: كيرا اقترحلي انمي\n" +
      "📱 الباركود: كيرا اعملي باركود\n" +
      "🌐 الترجمة: كيرا ترجملي [نص]\n" +
      "🎤 النطق: كيرا قولي [نص]\n" +
      "📸 السكرين: كيرا صورلي [رابط]",
      threadID, messageID
    );
  }
  
  const intent = detectIntent(userMessage);
  
  if (!intent) {
    return api.sendMessage(
      "❓ عذراً، لم أفهم طلبك.\n💡 جرب: كيرا سمعيني أغنية",
      threadID, messageID
    );
  }
  
  try {
    switch(intent.action) {
      case "music":
        return await handleMusic(api, event, intent.query);
      case "images":
        return await handleImages(api, event, intent.query);
      case "screenshot":
        return await handleScreenshot(api, event, intent.query);
      case "qrcode":
        return await handleQRCode(api, event, intent.query);
      case "translate":
        return await handleTranslate(api, event, intent.query);
      case "tts":
        return await handleTTS(api, event, intent.query);
      case "movies":
        return await handleMovies(api, event, intent.query);
      case "anime":
        return await handleAnime(api, event, intent.query);
      default:
        return api.sendMessage("❓ وظيفة غير مدعومة حالياً!", threadID, messageID);
    }
  } catch (error) {
    console.error(error);
    return api.sendMessage("❌ حدث خطأ تقني!", threadID, messageID);
  }
};

// 🌟 معالج الأحداث
module.exports.handleEvent = async function({ api, event }) {
  const { body, threadID } = event;
  if (!body) return;
  
  // إذا بدأ الكلام بكلمة كيرا
  if (body.toLowerCase().startsWith("كيرا") || body.toLowerCase().startsWith("كايرا")) {
    return this.run({ api, event, args: [] });
  }
};
