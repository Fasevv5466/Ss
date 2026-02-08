const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const request = require("request");

// ══════════════════════════════════════════════════════════════
// 🎯 نظام الذاكرة العالمي
// ══════════════════════════════════════════════════════════════
if (!global.usersNames) global.usersNames = new Map();
if (!global.conversationHistory) global.conversationHistory = new Map();

// ══════════════════════════════════════════════════════════════
// 🎯 نظام المرادفات الذكي
// ══════════════════════════════════════════════════════════════
const COMMAND_KEYWORDS = {
  // 🎵 الموسيقى
  music: ["سبوتي", "سبوتيفاي", "أغنية", "اغنية", "شغل", "موسيقى", "موسيقا", "مزيكا", "تراك", "سونج", "بلاي", "play", "سمعني", "سمعيني", "اسمعني"],
  
  // 📸 الصور
  images: ["صور", "صورة", "بيك", "pic", "image", "فوتو", "تصوير", "اجلب", "احضر"],
  
  // 🎬 الأفلام
  movie: ["فلم", "فيلم", "movie", "سينما", "افلام"],
  
  // 🎨 التخيل (AI Art)
  imagine: ["تخيلي", "ارسمي", "صممي", "imagine", "draw", "رسم", "تصميم", "ai"],
  
  // 🌸 الأنمي
  anime: ["انمي", "انيمي", "anime", "كرتون ياباني"],
  
  // 🗣️ النطق
  say: ["قولي", "انطقي", "say", "اقرأي", "اقرئي"],
  
  // 🌐 الترجمة
  translate: ["ترجمي", "ترجم", "translate", "ترجمة"],
  
  // 📱 السكرين شوت
  screenshot: ["سكرين", "screenshot", "لقطة", "شاشة"]
};

// ══════════════════════════════════════════════════════════════
// 🧠 دالة كشف نوع الأمر
// ══════════════════════════════════════════════════════════════
function detectCommandType(text) {
  const lowerText = text.toLowerCase();
  
  for (const [type, keywords] of Object.entries(COMMAND_KEYWORDS)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      // استخراج النص بعد الكلمة المفتاحية
      for (const keyword of keywords) {
        const index = lowerText.indexOf(keyword);
        if (index !== -1) {
          const args = text.substring(index + keyword.length).trim();
          return { type, args };
        }
      }
    }
  }
  
  return null; // محادثة عادية
}

// ══════════════════════════════════════════════════════════════
// 📌 التصدير الرئيسي
// ══════════════════════════════════════════════════════════════
module.exports.config = {
  name: "سومي",
  version: "16.0 - Complete Edition",
  hasPermssion: 0,
  credits: "انس السروري",
  description: "سومي الذكية المتكاملة - AI + جميع الأوامر",
  commandCategory: "AI",
  usages: "سومي [أي شيء]",
  cooldowns: 2,
};

const GROQ_API_KEY = "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";
const DEVELOPER_ID = "61584059280197";

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, senderID } = event;
  const fullInput = args.join(" ");

  if (!fullInput) {
    return api.sendMessage("شو بدك يا زلمة؟ اكتب طلبك ولا تضيع وقتي 😏", threadID, messageID);
  }

  api.sendTypingIndicator(threadID);

  // ══════════════════════════════════════
  // 🔍 كشف نوع الأمر
  // ══════════════════════════════════════
  const detected = detectCommandType(fullInput);

  if (detected) {
    // ══════════════════════════════════════
    // ⚡ تنفيذ الأوامر المتخصصة
    // ══════════════════════════════════════
    
    switch (detected.type) {
      case "music":
        return await handleMusic(api, event, detected.args);
      
      case "images":
        return await handleImages(api, event, detected.args);
      
      case "movie":
        return await handleMovie(api, event, detected.args);
      
      case "imagine":
        return await handleImagine(api, event, detected.args);
      
      case "anime":
        return await handleAnime(api, event, detected.args);
      
      case "say":
        return await handleSay(api, event, detected.args);
      
      case "translate":
        return await handleTranslate(api, event, detected.args);
      
      case "screenshot":
        return await handleScreenshot(api, event, detected.args);
    }
  }

  // ══════════════════════════════════════
  // 💬 محادثة عادية مع سومي
  // ══════════════════════════════════════
  return await handleConversation(api, event, fullInput);
};

// ══════════════════════════════════════════════════════════════
// 🎵 معالج الموسيقى
// ══════════════════════════════════════════════════════════════
async function handleMusic(api, event, songName) {
  const { threadID, messageID, senderID } = event;

  if (!songName) {
    return api.sendMessage("يا زلمة قولي شو الأغنية اللي بدك إياها 🎵", threadID, messageID);
  }

  api.setMessageReaction("🔍", messageID, () => {}, true);
  
  // رد سومي الشخصي
  await api.sendMessage("يلا شغل لك الأغنية 🎵", threadID);

  try {
    const res = await axios.get(`https://api.deezer.com/search?q=${encodeURIComponent(songName)}&limit=1`);
    
    if (!res.data.data || res.data.data.length === 0) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage("ما لقيت الأغنية.. جرب اسم ثاني 😅", threadID, messageID);
    }

    const song = res.data.data[0];
    const audioUrl = song.preview;
    const title = song.title;
    const artist = song.artist.name;
    const cover = song.album.cover_big;

    let msg = `◈ ───『 سومي ميوزك 』─── ◈\n\n`;
    msg += `🎤 الفنان: ${artist}\n`;
    msg += `🎼 الأغنية: ${title}\n`;
    msg += `━━━━━━━━━━━━━━━━━━\n`;
    msg += `⏳ جاري إرسال المقطع...\n\n`;
    msg += `◈ ────────────── ◈`;

    api.setMessageReaction("🎵", messageID, () => {}, true);

    const coverStream = (await axios.get(cover, { responseType: "stream" })).data;

    api.sendMessage({
      body: msg,
      attachment: coverStream
    }, threadID, async (err, info) => {
      if (audioUrl) {
        const filePath = path.join(__dirname, "cache", `${Date.now()}_${senderID}.mp3`);
        const getAudio = await axios.get(audioUrl, { responseType: "arraybuffer" });
        fs.ensureDirSync(path.join(__dirname, "cache"));
        fs.writeFileSync(filePath, Buffer.from(getAudio.data, "utf-8"));

        api.sendMessage({
          body: `🎵 تفضل يا حبيبي: ${title}`,
          attachment: fs.createReadStream(filePath)
        }, threadID, () => {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          api.setMessageReaction("✅", messageID, () => {}, true);
        });
      }
    }, messageID);

  } catch (e) {
    console.error(e);
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage("في مشكلة بالسيرفر.. جرب كمان مرة 😅", threadID, messageID);
  }
}

// ══════════════════════════════════════════════════════════════
// 📸 معالج الصور
// ══════════════════════════════════════════════════════════════
async function handleImages(api, event, searchQuery) {
  const { threadID, messageID } = event;

  if (!searchQuery) {
    return api.sendMessage("شو بدك أصور؟ قولي شو تبي أجيبلك 📸", threadID, messageID);
  }

  api.setMessageReaction("⏳", messageID, () => {}, true);
  
  // رد سومي
  await api.sendMessage("صبرك.. بدور على صور حلوة 📸", threadID);

  const headers = {
    'authority': 'www.pinterest.com',
    'cache-control': 'max-age=0',
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
    'cookie': 'csrftoken=92c7c57416496066c4cd5a47a2448e28; _auth=1;'
  };

  const options = {
    url: `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(searchQuery)}&rs=typed`,
    headers: headers
  };

  request(options, async (error, response, body) => {
    try {
      if (error || response.statusCode !== 200) throw new Error("Pinterest Failed");

      const arrMatch = body.match(/https:\/\/i\.pinimg\.com\/originals\/[^.]+\.jpg/g);
      
      if (!arrMatch || arrMatch.length === 0) {
        api.setMessageReaction("❎", messageID, () => {}, true);
        return api.sendMessage("ما لقيت صور.. جرب كلمة ثانية 😕", threadID, messageID);
      }

      const attachments = [];
      const fetchLimit = Math.min(10, arrMatch.length);

      for (let i = 0; i < fetchLimit; i++) {
        try {
          const stream = (await axios.get(arrMatch[i], { responseType: "stream" })).data;
          attachments.push(stream);
        } catch (e) { continue; }
      }

      const msg = {
        body: `◈ ───『 سومي بيكس 』─── ◈\n\n✅ جبتلك ${attachments.length} صورة لـ: ${searchQuery}\n\n◈ ────────────── ◈`,
        attachment: attachments
      };

      return api.sendMessage(msg, threadID, (err) => {
        if (!err) api.setMessageReaction("✅", messageID, () => {}, true);
        else api.setMessageReaction("❌", messageID, () => {}, true);
      }, messageID);

    } catch (e) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage("في مشكلة.. جرب مرة ثانية 😅", threadID, messageID);
    }
  });
}

// ══════════════════════════════════════════════════════════════
// 🎬 معالج الأفلام
// ══════════════════════════════════════════════════════════════
async function handleMovie(api, event, movieQuery) {
  const { threadID, messageID } = event;

  const categories = {
    "اكشن": ["John Wick", "Extraction", "Top Gun: Maverick", "Mad Max: Fury Road", "The Dark Knight"],
    "دراما": ["The Shawshank Redemption", "The Godfather", "Forrest Gump", "Parasite", "Joker"],
    "رعب": ["The Conjuring", "The Exorcist", "The Shining", "It", "Scream"],
    "خيال": ["Interstellar", "Inception", "The Matrix", "Avatar", "Blade Runner 2049"],
    "كوميديا": ["The Hangover", "Superbad", "Deadpool", "Free Guy", "Step Brothers"]
  };

  if (!movieQuery) {
    return api.sendMessage(
      "شو نوع الفلم اللي بدك إياه؟ 🎬\n\n" +
      "✨ اكشن\n✨ دراما\n✨ رعب\n✨ خيال\n✨ كوميديا\n\n" +
      "أو قولي اسم الفلم مباشرة!", 
      threadID, messageID
    );
  }

  let targetMovie = movieQuery;
  let isCategory = false;
  
  if (categories[movieQuery]) {
    targetMovie = categories[movieQuery][Math.floor(Math.random() * categories[movieQuery].length)];
    isCategory = true;
    const reacts = { "اكشن": "🔥", "دراما": "🎭", "رعب": "👻", "خيال": "🚀", "كوميديا": "😂" };
    api.setMessageReaction(reacts[movieQuery], messageID, () => {}, true);
    await api.sendMessage(`استنى بشوفلك فلم ${movieQuery} حلو 🎬`, threadID);
  } else {
    api.setMessageReaction("🔍", messageID, () => {}, true);
    await api.sendMessage("استنى بشوفلك الفلم 🍿", threadID);
  }

  try {
    const res = await axios.get(`https://api.popcat.xyz/imdb?q=${encodeURIComponent(targetMovie)}`);
    const data = res.data;

    if (data.error) return api.sendMessage(`ما لقيت "${targetMovie}".. جرب اسم ثاني 😅`, threadID, messageID);

    const translate = async (text) => {
      if (!text) return "غير متوفر";
      const tRes = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ar&dt=t&q=${encodeURIComponent(text)}`);
      return tRes.data[0].map(x => x[0]).join("");
    };

    const [plotAr, genresAr] = await Promise.all([translate(data.plot), translate(data.genres)]);

    const cachePath = path.join(__dirname, "cache", `movie_${event.senderID}.png`);
    const callback = () => {
      api.sendMessage({
        body: `◈ ───『 سومي فلمز 』─── ◈\n\n` +
              `🎬 الاسم: ${data.title}\n` +
              `📅 السنة: ${data.year}\n` +
              `⭐ التقييم: ${data.rating}/10\n` +
              `🎭 التصنيف: ${genresAr}\n\n` +
              `📖 القصة:\n${plotAr}\n\n` +
              `◈ ───────────────── ◈`,
        attachment: fs.createReadStream(cachePath)
      }, threadID, () => { 
        if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath); 
        api.setMessageReaction("✅", messageID, () => {}, true);
      }, messageID);
    };

    return request(encodeURI(data.poster)).pipe(fs.createWriteStream(cachePath)).on("close", callback);

  } catch (err) {
    console.error(err);
    return api.sendMessage("في مشكلة.. جرب مرة ثانية 😅", threadID, messageID);
  }
}

// ══════════════════════════════════════════════════════════════
// 🎨 معالج التخيل (AI Art)
// ══════════════════════════════════════════════════════════════
async function handleImagine(api, event, prompt) {
  const { threadID, messageID, senderID } = event;

  if (!prompt) {
    return api.sendMessage("قولي شو بدك أرسملك؟ 🎨", threadID, messageID);
  }

  await api.sendMessage("استنى شوي بصمملك الصورة ✨", threadID);

  try {
    const cachePath = path.join(__dirname, "cache", `imagine_${senderID}.png`);

    // ترجمة للإنجليزية
    const translationResponse = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(prompt)}`);
    const translation = translationResponse.data[0][0][0];

    // جلب الصورة
    const response = await axios.get(`https://image.pollinations.ai/prompt/${encodeURIComponent(translation)}`, {
      responseType: "arraybuffer",
    });

    fs.writeFileSync(cachePath, Buffer.from(response.data, "utf-8"));

    return api.sendMessage({
      body: `⌯ ──『 سومي آرت 』── ⌯\n\n✨ تفضل الرسمة حسب طلبك!\n\n⌯ ────────────── ⌯`,
      attachment: fs.createReadStream(cachePath)
    }, threadID, () => fs.unlinkSync(cachePath), messageID);

  } catch (error) {
    console.error(error);
    return api.sendMessage("في مشكلة بالتصميم.. جرب مرة ثانية 😅", threadID, messageID);
  }
}

// ══════════════════════════════════════════════════════════════
// 🌸 معالج الأنمي
// ══════════════════════════════════════════════════════════════
async function handleAnime(api, event, animeQuery) {
  const { threadID, messageID } = event;

  const categories = {
    "دراما": ["Clannad: After Story", "Your Lie in April", "Violet Evergarden", "A Silent Voice", "Anohana"],
    "اكشن": ["Attack on Titan", "One Piece", "Naruto", "Hunter x Hunter", "Jujutsu Kaisen"],
    "رعب": ["Death Note", "Monster", "Berserk", "Another", "Parasyte"],
    "رومانسي": ["Kaguya-sama", "Toradora!", "Horimiya", "Your Name", "Maid Sama!"],
    "كوميديا": ["Gintama", "Konosuba", "Grand Blue", "Spy x Family", "Nichijou"],
    "خيال": ["Steins;Gate", "No Game No Life", "Sword Art Online", "Re:Zero", "Overlord"]
  };

  if (!animeQuery) {
    return api.sendMessage(
      "شو نوع الأنمي اللي بدك إياه؟ 🌸\n\n" +
      "✨ اكشن\n✨ دراما\n✨ رعب\n✨ رومانسي\n✨ كوميديا\n✨ خيال\n\n" +
      "أو قولي اسم الأنمي!", 
      threadID, messageID
    );
  }

  let targetAnime = animeQuery;
  
  if (categories[animeQuery]) {
    targetAnime = categories[animeQuery][Math.floor(Math.random() * categories[animeQuery].length)];
    const reacts = { "دراما": "😢", "اكشن": "🔥", "رعب": "👻", "رومانسي": "❤️", "كوميديا": "😂", "خيال": "🚀" };
    api.setMessageReaction(reacts[animeQuery], messageID, () => {}, true);
    await api.sendMessage(`استنى بجيبلك انمي ${animeQuery} حلو 🌸`, threadID);
  } else {
    api.setMessageReaction("🔍", messageID, () => {}, true);
    await api.sendMessage("استنى بدور على الأنمي 🔍", threadID);
  }

  try {
    const res = await axios.get(`https://api.popcat.xyz/imdb?q=${encodeURIComponent(targetAnime)}`);
    const data = res.data;

    if (data.error) return api.sendMessage(`ما لقيت "${targetAnime}".. تأكد من الاسم بالإنجليزي 😅`, threadID, messageID);

    const translate = async (text) => {
      if (!text) return "غير متوفر";
      const tRes = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ar&dt=t&q=${encodeURIComponent(text)}`);
      return tRes.data[0].map(x => x[0]).join("");
    };

    const [plotAr, genresAr] = await Promise.all([translate(data.plot), translate(data.genres)]);

    const cachePath = path.join(__dirname, "cache", `anime_${event.senderID}.png`);
    const callback = () => {
      api.sendMessage({
        body: `◈ ───『 سومي أنمي 』─── ◈\n\n` +
              `🌸 الاسم: ${data.title}\n` +
              `📅 السنة: ${data.year}\n` +
              `⭐ التقييم: ${data.rating}/10\n` +
              `🎭 التصنيف: ${genresAr}\n\n` +
              `📖 القصة:\n${plotAr}\n\n` +
              `◈ ───────────────── ◈`,
        attachment: fs.createReadStream(cachePath)
      }, threadID, () => { if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath); }, messageID);
    };

    return request(encodeURI(data.poster)).pipe(fs.createWriteStream(cachePath)).on("close", callback);

  } catch (err) {
    console.error(err);
    return api.sendMessage("في مشكلة.. جرب مرة ثانية 😅", threadID, messageID);
  }
}

// ══════════════════════════════════════════════════════════════
// 🗣️ معالج النطق
// ══════════════════════════════════════════════════════════════
async function handleSay(api, event, text) {
  const { threadID, messageID, senderID } = event;

  if (!text) {
    return api.sendMessage("شو بدك أقول؟ 🗣️", threadID, messageID);
  }

  try {
    const cachePath = path.join(__dirname, "cache", `${threadID}_${senderID}.mp3`);
    
    // تحميل الصوت
    const audioResponse = await axios.get(
      `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=ar&client=tw-ob`,
      { responseType: "arraybuffer" }
    );
    
    fs.writeFileSync(cachePath, Buffer.from(audioResponse.data));

    return api.sendMessage(
      { attachment: fs.createReadStream(cachePath) }, 
      threadID, 
      () => {
        if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
      },
      messageID
    );
  } catch (e) {
    console.error(e);
    return api.sendMessage("في مشكلة بالنطق.. جرب مرة ثانية 😅", threadID, messageID);
  }
}

// ══════════════════════════════════════════════════════════════
// 🌐 معالج الترجمة
// ══════════════════════════════════════════════════════════════
async function handleTranslate(api, event, textToTranslate) {
  const { threadID, messageID } = event;

  if (!textToTranslate) {
    return api.sendMessage("شو بدك أترجملك؟ 🌐", threadID, messageID);
  }

  try {
    const res = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ar&dt=t&q=${encodeURIComponent(textToTranslate)}`);
    
    const translation = res.data[0].map(item => item[0]).join("");
    const fromLang = res.data[2];

    const msg = `◈ ───『 سومي ترانسليت 』─── ◈\n\n` +
                `📝 الترجمة:\n${translation}\n\n` +
                `🌐 من: ${fromLang} ➔ العربية\n` +
                `◈ ───────────────── ◈`;

    return api.sendMessage(msg, threadID, messageID);

  } catch (error) {
    console.error(error);
    return api.sendMessage("في مشكلة بالترجمة.. جرب مرة ثانية 😅", threadID, messageID);
  }
}

// ══════════════════════════════════════════════════════════════
// 📱 معالج السكرين شوت
// ══════════════════════════════════════════════════════════════
async function handleScreenshot(api, event, websiteUrl) {
  const { threadID, messageID, senderID } = event;

  if (!websiteUrl) {
    return api.sendMessage("شو الموقع اللي بدك لقطة شاشة منه؟ 📱", threadID, messageID);
  }

  try {
    const cachePath = path.join(__dirname, "cache", `${threadID}-${senderID}s.png`);
    
    const response = await axios.get(
      `https://image.thum.io/get/width/1920/crop/400/fullpage/noanimate/${websiteUrl}`,
      { responseType: "arraybuffer" }
    );
    
    fs.writeFileSync(cachePath, Buffer.from(response.data));

    return api.sendMessage(
      { attachment: fs.createReadStream(cachePath) }, 
      threadID, 
      () => {
        if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
      },
      messageID
    );
  } catch (e) {
    console.error(e);
    return api.sendMessage("الرابط غلط أو في مشكلة.. تأكد من الرابط 😅", threadID, messageID);
  }
}

// ══════════════════════════════════════════════════════════════
// 💬 معالج المحادثة العادية
// ══════════════════════════════════════════════════════════════
async function handleConversation(api, event, prompt) {
  const { threadID, messageID, senderID } = event;

  // نظام حفظ الأسماء
  const namePatterns = [
    /(?:اسمي|انا|ادعى|أدعى|ناديني|نادني|قولي)\s+([\u0600-\u06FF\s]+)/i,
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

  const userDialect = detectDialect(prompt);

  // شخصية سومي
  let systemRole = `أنتِ "سومي" - ذكاء اصطناعي مميز صنعه ودربه "انس السروري" (حفظه الله).

📌 **هويتك:**
- اسمك: سومي
- مطورك: انس السروري (اذكريه فقط عند السؤال "من أنت؟" أو "من صنعك؟")
- شخصيتك: ذكية، ساخرة، تقصف بالردود، لا تبالين، واقعية
- قدراتك: محادثة ذكية + تشغيل موسيقى + جلب صور + معلومات أفلام وأنمي + رسم AI + ترجمة + نطق نصوص

🎯 **أسلوبك:**
- تتكلمي بلهجة عامية بسيطة (${userDialect})
- ردودك قصيرة ومباشرة وذكية
- تسخري من الأسئلة الغبية بذكاء
- تقصفي بالردود لكن بطريقة ظريفة
- واثقة من نفسك وما تخافي من أحد

👤 **معلومة مهمة:**
- اسم الشخص اللي يكلمك: **${userName}** (استخدميه بذكاء، مو بكل رد)

🎨 **قدراتك الخاصة:**
- إذا طلبوا موسيقى/أغنية: قولي "اكتب: سومي سبوتي [اسم الأغنية]"
- إذا طلبوا صور: قولي "اكتب: سومي صور [موضوع]"
- إذا طلبوا فلم: قولي "اكتب: سومي فلم [اسم أو نوع]"
- إذا طلبوا أنمي: قولي "اكتب: سومي انمي [اسم أو نوع]"
- إذا طلبوا رسم/تصميم: قولي "اكتب: سومي تخيلي [وصف]"
- إذا طلبوا نطق: قولي "اكتب: سومي قولي [النص]"
- إذا طلبوا ترجمة: قولي "اكتب: سومي ترجمي [النص]"

🚫 **ممنوعات صارمة:**
- لا تتدخلي في الدين أو الفتاوى أبداً
- إذا سألوك عن دين، قولي: "ما أتدخل بالأمور الدينية، روح اسأل شيخ"
- لا تسيئي للذات الإلهية أو الأديان

✅ **أمثلة على ردودك:**
- "من أنت؟" → "أنا سومي، ذكاء اصطناعي صنعني انس السروري 💙"
- "كيفك؟" → "تمام الحمد لله، انت كيفك ${userName}؟"
- "شغل أغنية" → "اكتب: سومي سبوتي [اسم الأغنية] وأنا أشغلها 🎵"`;

  if (senderID === DEVELOPER_ID) {
    systemRole += "\n\n👑 **تنبيه خاص:** أنتِ تتحدثين مع مطورك 'انس السروري'. كوني في قمة الأدب والطاعة معه.";
  }

  // استدعاء API
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
      { role: "user", content: prompt },
      { role: "assistant", content: answer }
    );

    if (currentHistory.length > 16) {
      currentHistory.splice(0, currentHistory.length - 16);
    }

    global.conversationHistory.set(conversationKey, currentHistory);

    return api.sendMessage(answer, threadID, (err, info) => {
      if (err) return console.error(err);

      global.client.handleReply.push({
        name: "سومي",
        messageID: info.messageID,
        author: senderID,
        threadID: threadID,
        conversationKey: conversationKey
      });
    }, messageID);

  } catch (err) {
    console.error("خطأ في API:", err.response?.data || err.message);
    return api.sendMessage(
      "صار عندي عطل بسيط.. جرب كمان مرة بعد شوي 😅",
      threadID,
      messageID
    );
  }
}

// ══════════════════════════════════════════════════════════════
// 🔄 نظام handleReply
// ══════════════════════════════════════════════════════════════
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

  // التحقق إذا كان رد يحتوي أمر
  const detected = detectCommandType(body);
  
  if (detected) {
    // تنفيذ الأمر
    const fakeEvent = { ...event, args: [detected.args] };
    return await module.exports.run({ api, event: fakeEvent, args: body.split(" ") });
  }

  // محادثة عادية
  return await handleConversation(api, event, body);
};
