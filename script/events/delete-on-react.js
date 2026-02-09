// ════════════════════════════════════════════════════════════
// 🗑️ نظام حذف رسائل البوت عند التفاعل - فيسبوك ماسنجر
// ════════════════════════════════════════════════════════════
// 
// ضع هذا الملف في: script/events/delete-on-react.js
//
// ════════════════════════════════════════════════════════════

module.exports.config = {
  name: "delete-on-react",
  eventType: ["message_reaction"],
  version: "2.0.0",
  credits: "KIRA Enhanced",
  description: "حذف رسائل البوت عند التفاعل بأي إيموجي محدد"
};

// قائمة التفاعلات التي تؤدي للحذف
const DELETE_REACTIONS = [
  "👍",  // إبهام للأعلى
  "😡",  // غضب
  "🗑️", // سلة مهملات
  "❌",  // علامة X
  "💔",  // قلب مكسور
  "🚫",  // ممنوع
  "⛔"   // علامة توقف
];

// تفعيل/تعطيل الـ Debug Mode
const DEBUG_MODE = true;

function log(message, type = "info") {
  if (!DEBUG_MODE) return;
  
  const timestamp = new Date().toLocaleTimeString('ar-IQ');
  const prefix = {
    info: "ℹ️",
    success: "✅",
    error: "❌",
    warning: "⚠️"
  }[type] || "📝";
  
  console.log(`[${timestamp}] ${prefix} ${message}`);
}

module.exports.run = async function({ api, event }) {
  try {
    const { messageID, reaction, messageReply, userID, threadID } = event;
    
    // التحقق من أن الرسالة المتفاعل معها موجودة
    if (!messageReply) {
      log("تفاعل على رسالة بدون reply", "warning");
      return;
    }
    
    // الحصول على ID البوت
    const botID = api.getCurrentUserID();
    
    log(`تفاعل: ${reaction} | مستخدم: ${userID} | مجموعة: ${threadID}`);
    log(`رسالة: ${messageReply.messageID} | مرسل: ${messageReply.senderID}`);
    log(`ID البوت: ${botID}`);
    
    // التحقق من أن الرسالة من البوت
    if (messageReply.senderID !== botID) {
      log("الرسالة ليست من البوت، تجاهل", "info");
      return;
    }
    
    // التحقق من أن التفاعل من القائمة المسموحة
    if (!DELETE_REACTIONS.includes(reaction)) {
      log(`التفاعل "${reaction}" ليس في قائمة الحذف`, "info");
      return;
    }
    
    log(`✨ محاولة حذف الرسالة: ${messageReply.messageID}`, "info");
    
    // محاولة الحذف
    try {
      await api.unsendMessage(messageReply.messageID);
      log("تم حذف الرسالة بنجاح! 🎉", "success");
      
    } catch (deleteError) {
      log(`فشل الحذف في المحاولة الأولى: ${deleteError.message}`, "error");
      
      // محاولة ثانية بعد ثانية واحدة
      setTimeout(async () => {
        try {
          await api.unsendMessage(messageReply.messageID);
          log("تم الحذف في المحاولة الثانية! 🎉", "success");
        } catch (retryError) {
          log(`فشلت المحاولة الثانية: ${retryError.message}`, "error");
          
          // إرسال رسالة للمستخدم
          api.sendMessage(
            "❌ عذراً، لا أستطيع حذف هذه الرسالة. تحقق من صلاحيات البوت.",
            threadID
          );
        }
      }, 1000);
    }
    
  } catch (error) {
    log(`خطأ عام في معالجة التفاعل: ${error.message}`, "error");
    console.error(error);
  }
};

// للتوافق مع نظام الأحداث
module.exports.handleEvent = async function({ api, event }) {
  // فقط للتفاعلات
  if (event.type === "message_reaction") {
    return await this.run({ api, event });
  }
};

// ════════════════════════════════════════════════════════════
// 📝 طريقة الاستخدام:
// ════════════════════════════════════════════════════════════
//
// 1. ضع هذا الملف في: script/events/delete-on-react.js
// 2. أعد تشغيل البوت: npm start
// 3. عند رد البوت على أي أمر، تفاعل على رسالته بأي من:
//    👍 😡 🗑️ ❌ 💔 🚫 ⛔
// 4. سيتم حذف الرسالة تلقائياً!
//
// ════════════════════════════════════════════════════════════
// 🔧 التخصيص:
// ════════════════════════════════════════════════════════════
//
// لإضافة تفاعلات جديدة، عدّل المصفوفة DELETE_REACTIONS
// لإيقاف الـ Debug، اجعل DEBUG_MODE = false
//
// ════════════════════════════════════════════════════════════
