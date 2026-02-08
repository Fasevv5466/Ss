// ═══════════════════════════════════════════════════════════
// 👑 KIRA - افلام
// المطور: Ayman ♛
// الوصف: عرض بوسترات أفلام عالمية عشوائية من الأرشيف
// ═══════════════════════════════════════════════════════════

module.exports.config = {
  name: "افلام",
  aliases: [],
  version: "1.1.0",
  hasPermssion: 0,
  credits: "Ayman ♛",
  description: "عرض بوسترات أفلام عالمية عشوائية من الأرشيف",
  commandCategory: "media",
  usages: " ",
  cooldowns: 5,
  dependencies: {
    "axios": "",
    "fs-extra": ""
  }
};

module.exports.run = async ({ api, event }) => {
  const axios = require("axios");
  const fs = require("fs-extra");
  const { threadID, messageID } = event;

  // أرشيف روابط البوسترات الإمبراطورية
  const links = [
    "https://cdn.shopify.com/s/files/1/0057/3728/3618/products/sonichedgehog2_500x749.jpg",
    "https://cdn.shopify.com/s/files/1/0057/3728/3618/products/nobody_xlg_500x749.jpg",
    "https://cdn.shopify.com/s/files/1/0057/3728/3618/products/uncharted_s270z86d_500x749.jpg",
    "https://cdn.shopify.com/s/files/1/0057/3728/3618/products/dune_axfdsg2v_500x749.jpg",
    "https://cdn.shopify.com/s/files/1/0057/3728/3618/products/ambulance_hadvlyai_500x749.jpg",
    "https://i.postimg.cc/Wbg1yTM7/photo-5384209807751363513-y.jpg",
    "https://i.postimg.cc/h4HGMf7j/photo-5384209807751363514-y.jpg",
    "https://i.postimg.cc/v81BWWTk/photo-5384209807751363563-y.jpg",
    "https://i.postimg.cc/4yHrm4J2/photo-5384209807751363564-y.jpg",
    "https://i.postimg.cc/DmVRsV0v/photo-5384209807751363565-y.jpg",
    "https://i.postimg.cc/Fz1hGQh0/photo-5384209807751363590-x.jpg",
    "https://i.postimg.cc/vB8C1hc4/photo-5384209807751363430-x.jpg"
    // ... يمكنك إضافة بقية الروابط هنا بنفس التنسيق
  ];

  const path = __dirname + `/cache/movie_poster_${Date.now()}.jpg`;
  const randomLink = links[Math.floor(Math.random() * links.length)];

  api.sendMessage("🎬 جاري سحب البوستر من صالة العرض...", threadID, messageID);

  try {
    const res = await axios.get(randomLink, { responseType: "arraybuffer" });
    fs.writeFileSync(path, Buffer.from(res.data, "utf-8"));

    return api.sendMessage({
      body: "🎞️ تم اختيار هذا الفيلم لك سيدي:",
      attachment: fs.createReadStream(path)
    }, threadID, () => {
      if (fs.existsSync(path)) fs.unlinkSync(path);
    }, messageID);

  } catch (error) {
    console.error(error);
    return api.sendMessage("⚠️ حدث خطأ أثناء محاولة جلب صورة الفيلم.", threadID, messageID);
  }
};
