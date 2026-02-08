// ═══════════════════════════════════════════════════════════
// 👑 KIRA - يوت
// المطور: Ayman ♛
// الوصف: بحث يوتيوب احترافي بمكاتب البوت والعد التنازلي
// ═══════════════════════════════════════════════════════════

const youtube = require("youtube-search-api");

module.exports.config = {
  name: "يوت",
  aliases: [],
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Ayman ♛",
  description: "بحث يوتيوب احترافي بمكاتب البوت والعد التنازلي",
  commandCategory: "media",
  usePrefix: true,
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;
  const query = args.join(" ");

  if (!query) return api.sendMessage("✨ سيدي أيمن، أخبرني ماذا تريد أن نبحث في يوتيوب؟", threadID, messageID);

  // إرسال رسالة البداية التي سيتغير فيها العداد
  api.sendMessage("🔎 جاري البحث في يوتيوب... [ 3 ]", threadID, async (err, info) => {
    
    // العد التنازلي التفاعلي بتعديل نفس الرسالة
    setTimeout(() => api.editMessage("🔎 جاري البحث في يوتيوب... [ 2 ]", info.messageID), 1000);
    setTimeout(() => api.editMessage("🔎 جاري البحث في يوتيوب... [ 1 ]", info.messageID), 2000);

    setTimeout(async () => {
      try {
        // استخدام المكتبة المثبتة عندك في package.json
        const data = await youtube.GetListByKeyword(query, false, 5);
        
        if (!data.items || data.items.length === 0) {
          return api.editMessage("❌ لم أجد أي نتائج لهذا البحث يا سيدي.", info.messageID);
        }

        let msg = `✨ **نـتـائـج يـوتيـوب لـلـبـحـث: ${query}** ✨\n━━━━━━━━━━━━━━\n\n`;

        data.items.forEach((item, i) => {
          const title = item.title;
          const id = item.id;
          const duration = item.length?.simpleText || "غير معروف";
          const link = `https://www.youtube.com/watch?v=${id}`;
          
          msg += `${i + 1}. 📺 **${title.substring(0, 45)}...**\n`;
          msg += `⏳ الـمدة: ${duration}\n`;
          msg += `🔗 الـرابط: ${link}\n\n`;
        });

        msg += `━━━━━━━━━━━━━━\n💡 استخدم الرابط مع أمر (.المستكشف) للتحميل!`;

        // إرسال النتيجة النهائية وتغيير التفاعل
        api.editMessage(msg, info.messageID);
        api.setMessageReaction("🎬", messageID, () => {}, true);

      } catch (e) {
        console.error(e);
        api.editMessage("❌ حدث خطأ أثناء جلب البيانات من المكتبة الداخلية.", info.messageID);
      }
    }, 3000);
  }, messageID);
};
