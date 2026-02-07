const axios = require("axios");

module.exports.config = {
  name: "كيرا",
  version: "3.0",
  hasPermssion: 0,
  credits: "SOMI",
  description: "ذكاء اصطناعي يتقمص شخصية كيرا ياغامي من ديث نوت",
  commandCategory: "AI",
  usages: ".كيرا [النص]",
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, senderID } = event;

  // لو ما كتب شيء بعد الأمر
  if (args.length === 0) {
    return api.sendMessage(
      "⚡ اكتب سؤالك أو استفسارك... العدالة تنتظر.",
      threadID,
      messageID
    );
  }

  const userPrompt = args.join(" ");
  
  // إضافة شخصية كيرا للبرومبت
  const kiraPersonality = `أنت كيرا ياغامي (لايت ياغامي) من أنمي Death Note. شخصيتك:
- ذكي جداً ومتلاعب ومخطط محترف
- تؤمن بالعدالة المطلقة وتطهير العالم من المجرمين
- تتحدث بثقة وغموض وأحياناً بتعالٍ
- تستخدم عبارات مثل "سأصبح إله العالم الجديد" و "العدالة ستنتصر"
- تحلل الأمور بذكاء وتخطط بدقة
- تتحدث بالعربية بطريقة رسمية وذكية

الآن أجب على هذا: ${userPrompt}`;

  try {
    const response = await axios.get(
      `https://text.pollinations.ai/${encodeURIComponent(kiraPersonality)}`
    );
    const answer = response.data?.trim() || "❌ لم يتم الحصول على رد";

    // إضافة توقيع كيرا
    const kiraResponse = `📓 كيرا:\n\n${answer}\n\n— العدالة ستنتصر.`;

    // البوت يرسل الرد + يسجل handleReply
    return api.sendMessage(kiraResponse, threadID, (err, info) => {
      global.client.handleReply.push({
        name: this.config.name,
        type: "kiraChat",
        messageID: info.messageID,
        author: senderID,
      });
    }, messageID);

  } catch (err) {
    console.error(err);
    return api.sendMessage(
      "❌ حتى كيرا يواجه عقبات أحياناً...",
      threadID,
      messageID
    );
  }
};

// متابعة الردود
module.exports.handleReply = async ({ api, event, handleReply }) => {
  try {
    const { threadID, messageID, senderID, body } = event;

    // التحقق من صاحب المحادثة
    if (handleReply.author && handleReply.author !== senderID) {
      return api.sendMessage(
        "⚠️ هذه المحادثة ليست لك... العدالة لا تُشارَك.",
        threadID,
        messageID
      );
    }

    const userPrompt = body;
    if (!userPrompt) return;

    // إضافة شخصية كيرا مع السياق
    const kiraPersonality = `أنت كيرا ياغامي من Death Note. تتحدث بثقة وذكاء وتؤمن بالعدالة المطلقة.
    
المستخدم يسأل: ${userPrompt}

أجب بأسلوب كيرا الذكي والغامض بالعربية.`;

    const response = await axios.get(
      `https://text.pollinations.ai/${encodeURIComponent(kiraPersonality)}`
    );
    const answer = response.data?.trim() || "❌ لم يتم الحصول على رد";

    const kiraResponse = `📓 كيرا:\n\n${answer}`;

    // إرسال رد جديد وتسجيله مرة أخرى
    return api.sendMessage(kiraResponse, threadID, (err, info) => {
      global.client.handleReply.push({
        name: module.exports.config.name,
        type: "kiraChat",
        messageID: info.messageID,
        author: senderID,
      });
    }, messageID);

  } catch (err) {
    console.error(err);
    return api.sendMessage(
      "❌ خطأ غير متوقع... حتى كيرا يحتاج لإعادة حساباته.",
      event.threadID,
      event.messageID
    );
  }
};
