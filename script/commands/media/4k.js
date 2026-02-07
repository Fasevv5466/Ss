
/**
 * ═══════════════════════════════════════════════════════════════
 * 📓 KIRA SYSTEM - 4K IMAGE UPSCALE (PRO VERSION)
 * ───────────────────────────────────────────────────────────────
 * 🖋️ Developed with precision by: 𝓐𝓨Ꮇ𝓐𝓝 
 * ═══════════════════════════════════════════════════════════════
 */

const axios = require('axios');
const fs = require('fs-extra'); 
const path = require('path');
const stream = require('stream');
const { promisify } = require('util');

const pipeline = promisify(stream.pipeline);
const API_ENDPOINT = "https://free-goat-api.onrender.com/4k"; 
const CACHE_DIR = path.join(__dirname, 'cache');

// وظيفة استخراج الرابط مأخوذة من كودك الأصلي
function extractImageUrl(args, event) {
    let imageUrl = args.find(arg => arg.startsWith('http'));

    if (!imageUrl && event.messageReply && event.messageReply.attachments && event.messageReply.attachments.length > 0) {
        const imageAttachment = event.messageReply.attachments.find(att => att.type === 'photo' || att.type === 'image');
        if (imageAttachment && imageAttachment.url) {
            imageUrl = imageAttachment.url;
        }
    }
    return imageUrl;
}

module.exports.config = {
    name: "4k",
    version: "1.0",
    hasPermssion: 0,
    credits: "𝐚𝐲𝐦𝐚𝐧",
    description: "تحسين جودة الصور إلى 4K باستخدام الذكاء الاصطناعي",
    commandCategory: "الوسائط 📓",
    usages: "[رابط صورة] أو [بالرد على صورة]",
    cooldowns: 15
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;

    // 1. استخراج الرابط
    const imageUrl = extractImageUrl(args, event);

    if (!imageUrl) {
      return api.sendMessage("📓 يرجى تقديم رابط صورة أو الرد على صورة لتحسينها.", threadID, messageID);
    }

    if (!fs.existsSync(CACHE_DIR)) {
        fs.mkdirSync(CACHE_DIR, { recursive: true });
    }

    // التفاعل بالانتظار مأخوذ من كودك
    api.setMessageReaction("⏳", messageID, () => {}, true);
    
    let tempFilePath; 

    try {
      // 1. بناء رابط الـ API
      const fullApiUrl = `${API_ENDPOINT}?url=${encodeURIComponent(imageUrl)}`;
      
      // 2. طلب تحسين الصورة من الـ API
      const apiResponse = await axios.get(fullApiUrl, { timeout: 45000 });
      const data = apiResponse.data;

      if (!data.image) {
        throw new Error("استجاب الـ API بنجاح ولكن رابط الصورة مفقود.");
      }

      const upscaledImageUrl = data.image;

      // 3. تحميل الستريم للصورة المحسنة
      const imageDownloadResponse = await axios.get(upscaledImageUrl, {
          responseType: 'stream',
          timeout: 60000,
      });
      
      // 4. حفظ الستريم في ملف مؤقت (Hash)
      const fileHash = Date.now() + Math.random().toString(36).substring(2, 8);
      tempFilePath = path.join(CACHE_DIR, `upscale_4k_${fileHash}.jpg`);
      
      await pipeline(imageDownloadResponse.data, fs.createWriteStream(tempFilePath));

      // التفاعل بالنجاح
      api.setMessageReaction("✅", messageID, () => {}, true);
      
      // 5. إرسال الصورة النهائية
      await api.sendMessage({
        body: `📓 تم تحسين الصورة إلى 4K بنجاح!`,
        attachment: fs.createReadStream(tempFilePath)
      }, threadID, () => {
          // مسح الملف المؤقت بعد الإرسال
          if (fs.existsSync(tempFilePath)) {
              fs.unlinkSync(tempFilePath);
          }
      }, messageID);

    } catch (error) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      
      let errorMessage = "❌ فشل تحسين الصورة. حدث خطأ ما.";
      if (error.response) {
         if (error.response.status === 400) {
             errorMessage = `❌ خطأ 400: الرابط المقدم قد يكون غير صالح أو الصورة بحجم غير مدعوم.`;
         } else {
             errorMessage = `❌ خطأ HTTP ${error.response.status}. الـ API قد يكون متوقفاً.`;
         }
      } else if (error.message.includes('timeout')) {
         errorMessage = `❌ انتهت مهلة الطلب (استجابة الـ API بطيئة جداً).`;
      } else if (error.message) {
         errorMessage = `❌ ${error.message}`;
      }

      console.error("4K Upscale Command Error:", error);
      api.sendMessage(errorMessage, threadID, messageID);

      // تنظيف الملف في حالة الخطأ أيضاً
      if (tempFilePath && fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
      }
    }
};
