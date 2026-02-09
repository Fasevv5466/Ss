module.exports.config = {
  name: "صور",
  version: "2.7.0",
  hasPermssion: 0,
  credits: "ايمن",
  description: "البحث عن 10 صور بجودة عالية",
  commandCategory: "pic",
  usages: "صور [نص البحث]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const axios = require("axios");
  const fs = require("fs-extra");
  const path = require("path");
  const { threadID, messageID } = event;

  const query = args.join(" ").trim();
  if (!query) {
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 PIC ━━ ⌬\n\nيرجى كتابة ما تريد البحث عنه (مثلاً: صور سيارات)", threadID, messageID);
  }

  api.setMessageReaction("⏳", messageID, () => {}, true);

  try {
    // استخدام محرك بحث الصور بدلاً من السكرابينج اليدوي المتعطل
    // ملاحظة للمطور: يفضل استخدام API مستقر لبنترست أو جوجل
    const res = await axios.get(`https://api.boxvtn.biz/api/pinterest?search=${encodeURIComponent(query)}`);
    const images = res.data.data;

    if (!images || images.length === 0) {
      api.setMessageReaction("❎", messageID, () => {}, true);
      return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 PIC ━━ ⌬\n\nلم يتم العثور على صور لهذا البحث.", threadID, messageID);
    }

    const imgData = [];
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.ensureDirSync(cacheDir);

    // اختيار أول 10 صور
    const selectedImages = images.slice(0, 10);
    
    // تحميل الصور بشكل متوازي لتسريع العملية
    const downloadPromises = selectedImages.map(async (url, i) => {
      try {
        const imagePath = path.join(cacheDir, `pic_${i}_${Date.now()}.jpg`);
        const response = await axios.get(url, { responseType: "arraybuffer", timeout: 10000 });
        fs.writeFileSync(imagePath, Buffer.from(response.data));
        return imagePath;
      } catch (e) {
        return null;
      }
    });

    const paths = await Promise.all(downloadPromises);
    const validPaths = paths.filter(p => p !== null);

    if (validPaths.length === 0) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 PIC ━━ ⌬\n\nفشل تحميل الصور، حاول مرة أخرى.", threadID, messageID);
    }

    const attachments = validPaths.map(p => fs.createReadStream(p));

    api.setMessageReaction("✅", messageID, () => {}, true);

    return api.sendMessage({
      body: `⌬ ━━ 𝗞𝗜𝗥𝗔 𝗣𝗜𝗖 ━━ ⌬\n\nإليك أفضل ${validPaths.length} صور عن: ${query}`,
      attachment: attachments
    }, threadID, () => {
      // تنظيف الملفات بعد الإرسال
      validPaths.forEach(p => {
        if (fs.existsSync(p)) fs.unlinkSync(p);
      });
    }, messageID);

  } catch (error) {
    console.error(error);
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 PIC ━━ ⌬\n\nحدث خطأ في الاتصال بمخدم الصور.", threadID, messageID);
  }
};
