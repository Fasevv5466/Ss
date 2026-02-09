const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "بنت",
  version: "2.1.0",
  hasPermssion: 0,
  credits: "ايمن",
  description: "سحب صور بنترست مباشرة (Scraping) بجودة عالية",
  commandCategory: "pic",
  usages: "[الكلمة] [العدد]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;

  let keySearch, numberImages;
  if (!isNaN(args[args.length - 1])) {
    numberImages = parseInt(args.pop());
    keySearch = args.join(" ");
  } else {
    keySearch = args.join(" ");
    numberImages = 6;
  }

  if (!keySearch) return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 ━━ ⌬\n\n💡 مثال: .بنت انمي 10", threadID, messageID);
  
  // نحدد الحد الأقصى لضمان سرعة الرفع وعدم حظر الأي بي
  if (numberImages > 10) numberImages = 10;

  try {
    const waitMsg = await api.sendMessage(`🔍 جاري سحب الصور من بنترست...`, threadID);

    // محاكاة متصفح حقيقي لتجنب الحظر
    const response = await axios.get(`https://www.pinterest.com/search/pins/?q=${encodeURIComponent(keySearch)}`, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
            "Accept-Language": "ar,en-US;q=0.9,en;q=0.8"
        }
    });

    const $ = cheerio.load(response.data);
    const images = [];

    // البحث عن روابط الصور الأصلية (Originals) داخل تاقات السكريبت
    const scripts = $("script");
    scripts.each((i, el) => {
        const content = $(el).html();
        if (content && content.includes("https://i.pinimg.com/originals/")) {
            const matches = content.match(/https:\/\/i\.pinimg\.com\/originals\/[^\s"']+/g);
            if (matches) images.push(...matches);
        }
    });

    const uniqueImages = [...new Set(images)];

    if (uniqueImages.length === 0) {
        api.unsendMessage(waitMsg.messageID);
        return api.sendMessage("❌ لم أتمكن من العثور على صور، حاول تغيير كلمة البحث.", threadID, messageID);
    }

    const attachments = [];
    const cacheDir = path.join(__dirname, "cache", `bnt_${Date.now()}`);
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    const limit = Math.min(uniqueImages.length, numberImages);

    for (let i = 0; i < limit; i++) {
      try {
        const imagePath = path.join(cacheDir, `${i}.jpg`);
        // استبدال روابط الحجم الصغير بالأصلي لضمان أعلى جودة
        let imgUrl = uniqueImages[i].replace(/\\u002f/g, "/");
        
        const imgRes = await axios.get(imgUrl, { responseType: "arraybuffer" });
        fs.writeFileSync(imagePath, Buffer.from(imgRes.data));
        attachments.push(fs.createReadStream(imagePath));
      } catch (e) { continue; }
    }

    api.unsendMessage(waitMsg.messageID);

    if (attachments.length === 0) {
        return api.sendMessage("❌ فشل تحميل الصور من الخوادم.", threadID, messageID);
    }

    await api.sendMessage({
      body: `⌬ ━━ 𝗞𝗜𝗥𝗔 𝗣𝗜𝗡𝗧𝗘𝗥𝗘𝗦𝗧 ━━ ⌬\n\n✅ تم جلب ${attachments.length} صورة بنظام السكرابينج\n🔍 البحث: ${keySearch}`,
      attachment: attachments
    }, threadID, () => fs.removeSync(cacheDir), messageID);

  } catch (error) {
    console.error(error);
    return api.sendMessage(`❌ حدث خطأ في النظام: ${error.message}`, threadID, messageID);
  }
};
