const axios = require('axios');
const FormData = require('form-data');

module.exports.config = {
  name: "ارفع",
  version: "1.1.0",
  hasPermssion: 0,
  credits: "ايمن",
  description: "رفع الصور والفيديوهات والملفات الصوتية على Catbox والحصول على رابط مباشر",
  commandCategory: "utility",
  usages: "قم بالرد على أي ملف بـ .ارفع",
  cooldowns: 5
};

module.exports.run = async function({ api, event }) {
  const { threadID, messageID, type, messageReply } = event;

  // التحقق من أن المستخدم قام بالرد على رسالة تحتوي على مرفق
  if (type !== "message_reply" || !messageReply.attachments || messageReply.attachments.length === 0) {
    return api.sendMessage("⚠️ يا رعاك الله، يجب أن تقوم بالرد على (صورة، فيديو، أو ملف صوتي) لرفعه.", threadID, messageID);
  }

  try {
    // إرسال رسالة انتظار
    const waitingMsg = await api.sendMessage("⏳ جاري معالجة الملف ورفعه على Catbox...", threadID);

    const attachment = messageReply.attachments[0];
    const fileUrl = attachment.url;

    // 1. جلب الملف من خوادم فيسبوك كمجرى بيانات (Stream)
    const fileStream = await axios.get(fileUrl, { responseType: 'stream' });

    // 2. إعداد فورم البيانات للرفع
    const formData = new FormData();
    formData.append('reqtype', 'fileupload');
    formData.append('fileToUpload', fileStream.data);

    // 3. إرسال الطلب إلى API الخاص بـ Catbox
    const response = await axios.post('https://catbox.moe/user/api.php', formData, {
      headers: formData.getHeaders()
    });

    // حذف رسالة الانتظار
    api.unsendMessage(waitingMsg.messageID);

    // 4. إرسال الرابط النهائي للمستخدم
    return api.sendMessage(
      `⌬ ━━ 𝗖𝗔𝗧𝗕𝗢𝗫 𝗨𝗣𝗟𝗢𝗔𝗗 ━━ ⌬\n\n` +
      `✅ تم الرفع بنجاح!\n` +
      `🔗 الرابط المباشر:\n${response.data}\n\n` +
      `💡 يمكنك استخدامه في أوامر أخرى أو مشاركته.`,
      threadID,
      messageID
    );

  } catch (error) {
    console.error("خطأ في أمر ارفع:", error);
    return api.sendMessage(`❌ عذراً يا سيدي، حدث خطأ أثناء الرفع:\n${error.message}`, threadID, messageID);
  }
};
