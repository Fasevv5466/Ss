
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "4k",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "ayman",
  description: "تحسين جودة الصور إلى 4K باستخدام الذكاء الاصطناعي",
  commandCategory: "media",
  usages: "4k [رابط الصورة أو الرد على صورة]",
  cooldowns: 15
};

module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
  const { threadID, messageID, senderID } = event;
  
  try {
    const API_ENDPOINT = "https://free-goat-api.onrender.com/4k";
    const CACHE_DIR = path.join(__dirname, 'cache');
    
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }

    let imageUrl = args.find(arg => arg.startsWith('http'));

    if (!imageUrl && event.messageReply && event.messageReply.attachments && event.messageReply.attachments.length > 0) {
      const imageAttachment = event.messageReply.attachments.find(att => att.type === 'photo' || att.type === 'image');
      if (imageAttachment && imageAttachment.url) {
        imageUrl = imageAttachment.url;
      }
    }

    if (!imageUrl) {
      return api.sendMessage("✨ | 𝟰𝗞 𝗜𝗠𝗔𝗚𝗘 𝗘𝗡𝗛𝗔𝗡𝗖𝗘𝗥\n━━━━━━━━━━━━━━━━━━\n❌ | يرجى تقديم رابط صورة أو الرد على صورة لتحسين جودتها.\n━━━━━━━━━━━━━━━━━━\n💡 | مثال: 4k [رابط الصورة]", threadID, messageID);
    }

    await api.sendMessage("✨ | 𝟰𝗞 𝗜𝗠𝗔𝗚𝗘 𝗘𝗡𝗛𝗔𝗡𝗖𝗘𝗥\n━━━━━━━━━━━━━━━━━━\n⏳ | جاري تحسين جودة الصورة إلى 4K...\n🔄 | قد تستغرق العملية بضع ثوانٍ", threadID, messageID);

    const fullApiUrl = `${API_ENDPOINT}?url=${encodeURIComponent(imageUrl)}`;
    const apiResponse = await axios.get(fullApiUrl, { timeout: 45000 });
    const data = apiResponse.data;

    if (!data.image) {
      throw new Error("❌ | فشل API في إرجاع الصورة المحسنة.");
    }

    const upscaledImageUrl = data.image;
    const imageDownloadResponse = await axios.get(upscaledImageUrl, {
      responseType: 'stream',
      timeout: 60000,
    });

    const fileHash = Date.now() + Math.random().toString(36).substring(2, 8);
    const tempFilePath = path.join(CACHE_DIR, `upscale_4k_${fileHash}.jpg`);
    
    const writer = fs.createWriteStream(tempFilePath);
    imageDownloadResponse.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    await api.sendMessage({
      body: "✨ | 𝟰𝗞 𝗜𝗠𝗔𝗚𝗘 𝗘𝗡𝗛𝗔𝗡𝗖𝗘𝗥\n━━━━━━━━━━━━━━━━━━\n✅ | تم تحسين جودة الصورة إلى 4K بنجاح!\n🎨 | الجودة المحسنة: 4096x4096 بكسل\n⚡ | جاهزة للاستخدام",
      attachment: fs.createReadStream(tempFilePath)
    }, threadID, messageID);

    fs.unlinkSync(tempFilePath);

  } catch (error) {
    console.error("خطأ في أمر 4k:", error);
    
    let errorMessage = "✨ | 𝟰𝗞 𝗜𝗠𝗔𝗚𝗘 𝗘𝗡𝗛𝗔𝗡𝗖𝗘𝗥\n━━━━━━━━━━━━━━━━━━\n❌ | فشل في تحسين جودة الصورة.\n🔧 | السبب: ";
    
    if (error.response) {
      if (error.response.status === 400) {
        errorMessage += "رابط الصورة غير صالح أو الصورة صغيرة/كبيرة جداً.";
      } else {
        errorMessage += `خطأ في الخادم (${error.response.status}).`;
      }
    } else if (error.message.includes('timeout')) {
      errorMessage += "انتهت مهلة الطلب. حاول مرة أخرى.";
    } else {
      errorMessage += error.message;
    }
    
    api.sendMessage(errorMessage, threadID, messageID);
  }
};
