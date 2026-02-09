module.exports.config = {
  name: "autoAction",
  eventType: ["message"],
  version: "1.0.0",
  credits: "ايمن",
  description: "تشغيل أوامر المنشن تلقائياً من الإعدادات"
};

module.exports.run = async function({ api, event, args, Users, Threads, Currencies }) {
  const { body, mentions, threadID, messageID } = event;
  
  // جلب الإعدادات من config.json
  const config = global.config.autoAction;

  if (!config || !config.status || !body) return;

  for (const keyword in config.keywords) {
    // التحقق إذا كانت الرسالة تبدأ بالكلمة (مثلاً: حضن @اسم)
    if (body.startsWith(keyword) || body.startsWith(global.config.PREFIX + keyword)) {
      
      // التأكد من وجود منشن أو رد على رسالة
      if (Object.keys(mentions).length > 0 || event.type === "message_reply") {
        const commandName = config.keywords[keyword];
        const command = global.client.commands.get(commandName);

        if (command) {
          // تشغيل الأمر فوراً
          return command.run({ api, event, args: body.split(/\s+/).slice(1), Users, Threads, Currencies });
        }
      }
    }
  }
};
