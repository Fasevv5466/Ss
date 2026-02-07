const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const request = require("request");
const QRCode = require("qrcode");
const jimp = require("jimp");
const QRCodeReader = require("qrcode-reader");

module.exports.config = {
  name: "kira",
  version: "3.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "🧠 كيرا - المساعدة الذكية الشاملة (موسيقى، صور، ترجمة، باركود، سكرين، أفلام، أنمي)",
  commandCategory: "ai",
  usages: "كيرا [الطلب]",
  cooldowns: 5,
  dependencies: {
    "axios": "",
    "fs-extra": "",
    "request": "",
    "qrcode": "",
    "jimp": "",
    "qrcode-reader": ""
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
  },
  compress: {
    keywords: ["ضغط", "صغر", "قلل حجم", "compress", "ضغط الصورة"],
    icon: "📉"
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

// 🎵 وظيفة الموسيقى (Spotify/Deezer)
async function handleMusic(api, event, query) {
  const { threadID, messageID, senderID } = event;
  
  if (!query) {
    return api.sendMessage(
      "◈ ───『 𝑲𝑰𝑹𝑨 𝑴𝑼𝑺𝑰𝑪 』─── ◈\n\n🎵 أخبرني ما الأغنية التي تريدها؟\n💡 مثال: كيرا سمعيني عمرو دياب\n\n◈ ────────────── ◈",
      threadID, messageID
    );
  }
  
  try {
    api.setMessageReaction("🔍", messageID, () => {}, true);
    
    const res = await axios.get(`https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=1`);
    if (!res.data.data?.length) {
      return api.sendMessage("❌ لم أجد هذه الأغنية سيدي!", threadID, messageID);
    }
    
    const song = res.data.data[0];
    const cachePath = path.join(__dirname, "../../cache", `music_${Date.now()}_${senderID}.mp3`);
    await fs.ensureDir(path.dirname(cachePath));
    
    const audioRes = await axios.get(song.preview, { responseType: "arraybuffer" });
    await fs.writeFile(cachePath, Buffer.from(audioRes.data));
    
    const coverRes = await axios.get(song.album.cover_big, { responseType: "stream" });
    
    api.setMessageReaction("🎵", messageID, () => {}, true);
    
    await api.sendMessage({
      body: `◈ ───『 🎵 』─── ◈\n\n🎤 ${song.artist.name}\n🎼 ${song.title}\n\n◈ ────────────── ◈`,
      attachment: coverRes.data
    }, threadID);
    
    await api.sendMessage({
      body: `🎵 تم جلب الأغنية بنجاح!`,
      attachment: fs.createReadStream(cachePath)
    }, threadID, () => {
      if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
      api.setMessageReaction("✅", messageID, () => {}, true);
    }, messageID);
    
  } catch (err) {
    console.error(err);
    return api.sendMessage("❌ حدث خطأ في جلب الأغنية!", threadID, messageID);
  }
}

// 🖼️ وظيفة البحث عن الصور (Pinterest)
async function handleImages(api, event, query) {
  const { threadID, messageID } = event;
  
  if (!query) {
    return api.sendMessage(
      "◈ ───『 𝑲𝑰𝑹𝑨 𝑰𝑴𝑨𝑮𝑬𝑺 』─── ◈\n\n🖼️ ما الصور التي تريدها؟\n💡 مثال: كيرا جيبلي صور قطط\n\n◈ ────────────── ◈",
      threadID, messageID
    );
  }
  
  try {
    api.setMessageReaction("🔍", messageID, () => {}, true);
    
    const options = {
      url: `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}&rs=typed`,
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'cookie': 'csrftoken=92c7c57416496066c4cd5a47a2448e28; _auth=1;'
      }
    };
    
    request(options, async (error, response, body) => {
      if (error) throw error;
      
      const matches = body.match(/https:\/\/i\.pinimg\.com\/originals\/[^.]+\.jpg/g);
      if (!matches?.length) {
        return api.sendMessage("❌ لم أجد صور لهذا الموضوع!", threadID, messageID);
      }
      
      const attachments = [];
      const limit = Math.min(10, matches.length);
      const cachePath = path.join(__dirname, "../../cache");
      await fs.ensureDir(cachePath);
      
      for (let i = 0; i < limit; i++) {
        try {
          const imgRes = await axios.get(matches[i], { responseType: "arraybuffer" });
          const filePath = path.join(cachePath, `img_${Date.now()}_${i}.jpg`);
          await fs.writeFile(filePath, Buffer.from(imgRes.data));
          attachments.push(fs.createReadStream(filePath));
          
          setTimeout(() => {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          }, 5000);
        } catch (e) { continue; }
      }
      
      if (!attachments.length) {
        return api.sendMessage("❌ فشل تحميل الصور!", threadID, messageID);
      }
      
      api.setMessageReaction("✅", messageID, () => {}, true);
      return api.sendMessage({
        body: `◈ ───『 🖼️ 』─── ◈\n\n✅ ${attachments.length} صورة عن: ${query}\n\n◈ ────────────── ◈`,
        attachment: attachments
      }, threadID, messageID);
    });
    
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
      "◈ ───『 𝑲𝑰𝑹𝑨 𝑺𝑪𝑹𝑬𝑬𝑵 』─── ◈\n\n📸 أعطني رابط الموقع!\n💡 مثال: كيرا صورلي google.com\n\n◈ ────────────── ◈",
      threadID, messageID
    );
  }
  
  if (!url.startsWith("http")) url = "https://" + url;
  
  try {
    api.setMessageReaction("⏳", messageID, () => {}, true);
    
    const cachePath = path.join(__dirname, "../../cache", `screen_${Date.now()}.png`);
    await fs.ensureDir(path.dirname(cachePath));
    
    const screenshotUrl = `https://image.thum.io/get/width/1200/crop/800/noanimate/${url}`;
    const res = await axios.get(screenshotUrl, { responseType: 'arraybuffer' });
    await fs.writeFile(cachePath, Buffer.from(res.data));
    
    api.setMessageReaction("✅", messageID, () => {}, true);
    
    await api.sendMessage({
      body: `◈ ───『 📸 』─── ◈\n\n✅ تم تصوير الموقع\n🔗 ${url}\n\n◈ ────────────── ◈`,
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
      "◈ ───『 𝑲𝑰𝑹𝑨 𝑸𝑹 』─── ◈\n\n📱 ما المحتوى للباركود؟\n💡 مثال: كيرا اعملي باركود google.com\n\n◈ ────────────── ◈",
      threadID, messageID
    );
  }
  
  try {
    const emojis = ["1⃣","2⃣","3⃣","4⃣","5⃣","6⃣","7⃣","8⃣","9⃣","🔟"];
    for (const emoji of emojis) {
      await new Promise(r => setTimeout(r, 100));
      api.setMessageReaction(emoji, messageID, () => {}, true);
    }
    
    const cachePath = path.join(__dirname, "../../cache", `qr_${Date.now()}.png`);
    await fs.ensureDir(path.dirname(cachePath));
    
    await QRCode.toFile(cachePath, query, {
      color: { dark: '#000000', light: '#ffffff' },
      width: 500,
      margin: 2
    });
    
    await api.sendMessage({
      body: `◈ ───『 📱 』─── ◈\n\n✅ تم إنشاء الباركود\n📝 ${query.substring(0,50)}...\n\n◈ ────────────── ◈`,
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
      "◈ ───『 𝑲𝑰𝑹𝑨 𝑻𝑹𝑨𝑵𝑺𝑳𝑨𝑻𝑬 』─── ◈\n\n🌐 ما النص للترجمة؟\n💡 مثال: كيرا ترجملي Hello World\n\n◈ ────────────── ◈",
      threadID, messageID
    );
  }
  
  try {
    api.setMessageReaction("🔄", messageID, () => {}, true);
    
    const res = await axios.get(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ar&dt=t&q=${encodeURIComponent(query)}`
    );
    
    const translation = res.data[0].map(item => item[0]).join("");
    const fromLang = res.data[2] || "auto";
    
    api.setMessageReaction("✅", messageID, () => {}, true);
    
    return api.sendMessage(
      `◈ ───『 🌐 』─── ◈\n\n📝 ${translation}\n\n🔤 ${fromLang} ➜ العربية\n\n◈ ────────────── ◈`,
      threadID, messageID
    );
    
  } catch (err) {
    console.error(err);
    return api.sendMessage("❌ فشل الترجمة!", threadID, messageID);
  }
}

// 🎤 وظيفة تحويل النص لصوت
async function handleTTS(api, event, query) {
  const { threadID, messageID, senderID } = event;
  
  if (!query) {
    return api.sendMessage(
      "◈ ───『 𝑲𝑰𝑹𝑨 𝑻𝑻𝑺 』─── ◈\n\n🎤 ما النص للقراءة؟\n💡 مثال: كيرا قولي مرحبا\n\n◈ ────────────── ◈",
      threadID, messageID
    );
  }
  
  try {
    api.setMessageReaction("🎤", messageID, () => {}, true);
    
    const cachePath = path.join(__dirname, "../../cache", `tts_${Date.now()}_${senderID}.mp3`);
    await fs.ensureDir(path.dirname(cachePath));
    
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(query)}&tl=ar&client=tw-ob`;
    const res = await axios.get(ttsUrl, { responseType: 'arraybuffer' });
    await fs.writeFile(cachePath, Buffer.from(res.data));
    
    await api.sendMessage({
      body: `◈ ───『 🎤 』─── ◈\n\n✅ تم قراءة النص\n📝 ${query.substring(0,100)}...\n\n◈ ────────────── ◈`,
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
  
  const categories = {
    "اكشن": ["John Wick", "Mad Max: Fury Road", "The Dark Knight"],
    "دراما": ["The Shawshank Redemption", "Forrest Gump", "Joker"],
    "رعب": ["The Conjuring", "The Exorcist", "It"],
    "كوميديا": ["The Hangover", "Deadpool", "Superbad"],
    "خيال": ["Interstellar", "Inception", "The Matrix"]
  };
  
  let movieName = query;
  if (categories[query]) {
    const list = categories[query];
    movieName = list[Math.floor(Math.random() * list.length)];
  }
  
  if (!movieName) {
    return api.sendMessage(
      "◈ ───『 𝑲𝑰𝑹𝑨 𝑴𝑶𝑽𝑰𝑬𝑺 』─── ◈\n\n🎬 أخبرني نوع الفلم أو الاسم!\n💡 مثال: كيرا اقترحلي فلم اكشن\n\n◈ ────────────── ◈",
      threadID, messageID
    );
  }
  
  try {
    api.setMessageReaction("🔍", messageID, () => {}, true);
    
    const res = await axios.get(`https://api.popcat.xyz/imdb?q=${encodeURIComponent(movieName)}`);
    if (res.data.error) {
      return api.sendMessage("❌ لم أجد هذا الفلم!", threadID, messageID);
    }
    
    const data = res.data;
    const translateRes = await axios.get(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ar&dt=t&q=${encodeURIComponent(data.plot)}`
    );
    const plotAr = translateRes.data[0].map(x => x[0]).join("");
    
    const cachePath = path.join(__dirname, "../../cache", `movie_${Date.now()}.jpg`);
    await fs.ensureDir(path.dirname(cachePath));
    
    const posterRes = await axios.get(data.poster, { responseType: 'arraybuffer' });
    await fs.writeFile(cachePath, Buffer.from(posterRes.data));
    
    api.setMessageReaction("✅", messageID, () => {}, true);
    
    await api.sendMessage({
      body: `◈ ───『 🎬 』─── ◈\n\n🎥 ${data.title}\n📅 ${data.year}\n⭐ ${data.rating}/10\n\n📖 ${plotAr}\n\n◈ ────────────── ◈`,
      attachment: fs.createReadStream(cachePath)
    }, threadID, () => {
      if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
    }, messageID);
    
  } catch (err) {
    console.error(err);
    return api.sendMessage("❌ حدث خطأ في البحث عن الفلم!", threadID, messageID);
  }
}

// 🌸 وظيفة البحث عن الأنمي
async function handleAnime(api, event, query) {
  const { threadID, messageID } = event;
  
  const categories = {
    "اكشن": ["Attack on Titan", "Demon Slayer", "Jujutsu Kaisen"],
    "دراما": ["Your Lie in April", "Violet Evergarden", "Clannad"],
    "رعب": ["Death Note", "Parasyte", "Another"],
    "كوميديا": ["Gintama", "Konosuba", "Spy x Family"]
  };
  
  let animeName = query;
  if (categories[query]) {
    const list = categories[query];
    animeName = list[Math.floor(Math.random() * list.length)];
  }
  
  if (!animeName) {
    return api.sendMessage(
      "◈ ───『 𝑲𝑰𝑹𝑨 𝑨𝑵𝑰𝑴𝑬 』─── ◈\n\n🌸 أخبرني نوع الأنمي أو الاسم!\n💡 مثال: كيرا اقترحلي انمي اكشن\n\n◈ ────────────── ◈",
      threadID, messageID
    );
  }
  
  try {
    api.setMessageReaction("🔍", messageID, () => {}, true);
    
    const res = await axios.get(`https://api.popcat.xyz/imdb?q=${encodeURIComponent(animeName)}`);
    if (res.data.error) {
      return api.sendMessage("❌ لم أجد هذا الأنمي!", threadID, messageID);
    }
    
    const data = res.data;
    const translateRes = await axios.get(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ar&dt=t&q=${encodeURIComponent(data.plot)}`
    );
    const plotAr = translateRes.data[0].map(x => x[0]).join("");
    
    const cachePath = path.join(__dirname, "../../cache", `anime_${Date.now()}.jpg`);
    await fs.ensureDir(path.dirname(cachePath));
    
    const posterRes = await axios.get(data.poster, { responseType: 'arraybuffer' });
    await fs.writeFile(cachePath, Buffer.from(posterRes.data));
    
    api.setMessageReaction("✅", messageID, () => {}, true);
    
    await api.sendMessage({
      body: `◈ ───『 🌸 』─── ◈\n\n📺 ${data.title}\n📅 ${data.year}\n⭐ ${data.rating}/10\n\n📖 ${plotAr}\n\n◈ ────────────── ◈`,
      attachment: fs.createReadStream(cachePath)
    }, threadID, () => {
      if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
    }, messageID);
    
  } catch (err) {
    console.error(err);
    return api.sendMessage("❌ حدث خطأ في البحث عن الأنمي!", threadID, messageID);
  }
}

// ⚡ المعالج الرئيسي
module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID, body } = event;
  
  const triggerWords = ["كيرا", "كايرا", "kira"];
  const startsWithTrigger = triggerWords.some(w => body.toLowerCase().startsWith(w.toLowerCase()));
  
  if (!startsWithTrigger) return;
  
  let userMessage = body;
  for (const trigger of triggerWords) {
    if (body.toLowerCase().startsWith(trigger.toLowerCase())) {
      userMessage = body.slice(trigger.length).trim();
      break;
    }
  }
  
  if (!userMessage) {
    return api.sendMessage(
      "◈ ───『 𝑲𝑰𝑹𝑨 𝑨𝑰 』─── ◈\n\n" +
      "💫 أنا كيرا، مساعدتك الذكية!\n\n" +
      "📚 يمكنني:\n" +
      "🎵 الموسيقى: كيرا سمعيني [أغنية]\n" +
      "🖼️ الصور: كيرا جيبلي صور [شيء]\n" +
      "🎬 الأفلام: كيرا اقترحلي فلم\n" +
      "🌸 الأنمي: كيرا اقترحلي انمي\n" +
      "📱 الباركود: كيرا اعملي باركود\n" +
      "🌐 الترجمة: كيرا ترجملي [نص]\n" +
      "🎤 النطق: كيرا قولي [نص]\n" +
      "📸 السكرين: كيرا صورلي [رابط]\n\n" +
      "◈ ────────────── ◈",
      threadID, messageID
    );
  }
  
  const intent = detectIntent(userMessage);
  
  if (!intent) {
    return api.sendMessage(
      "◈ ───『 𝑲𝑰𝑹𝑨 』─── ◈\n\n❓ عذراً، لم أفهم طلبك.\n💡 جرب: كيرا سمعيني أغنية\n\n◈ ────────────── ◈",
      threadID, messageID
    );
  }
  
  try {
    api.setMessageReaction(intent.icon, messageID, () => {}, true);
    
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
    return api.sendMessage(
      "◈ ───『 𝑲𝑰𝑹𝑨 𝑬𝑹𝑹𝑶𝑹 』─── ◈\n\n❌ حدث خطأ تقني!\n\n◈ ────────────── ◈",
      threadID, messageID
    );
  }
};

// 🌟 معالج الأحداث (بدون بادئة)
module.exports.handleEvent = async function({ api, event }) {
  const { body } = event;
  if (!body) return;
  
  const triggerWords = ["كيرا", "كايرا", "kira"];
  const startsWithTrigger = triggerWords.some(w => body.toLowerCase().startsWith(w.toLowerCase()));
  
  if (startsWithTrigger) {
    return this.run({ api, event, args: [] });
  }
};
