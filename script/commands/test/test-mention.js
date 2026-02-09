// ════════════════════════════════════════════════════════════
// 🧪 أوامر التشخيص - Facebook Messenger Bot
// ════════════════════════════════════════════════════════════

// ┌───────────────────────────────────────────────────────────┐
// │ 1️⃣  أمر test-mention - اختبار المنشن والرد              │
// └───────────────────────────────────────────────────────────┘
//
// ضع هذا في: script/commands/test/test-mention.js

module.exports.config = {
  name: "test-mention",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "KIRA Diagnostic",
  description: "اختبار آلية المنشن والرد والـ ID",
  commandCategory: "test",
  usages: "test-mention [@mention] أو test-mention [ID] أو (رد على رسالة)",
  cooldowns: 0
};

module.exports.run = async function({ api, event, args, Users }) {
  const { threadID, messageID, senderID, mentions, type, messageReply } = event;
  
  let output = "";
  output += "════════════════════════════════════\n";
  output += "🧪 تشخيص شامل للأمر\n";
  output += "════════════════════════════════════\n\n";
  
  // معلومات أساسية
  output += "📋 معلومات الرسالة:\n";
  output += `   النوع: ${type}\n`;
  output += `   المرسل: ${senderID}\n`;
  output += `   المجموعة: ${threadID}\n`;
  output += `   البريفكس: ${global.config.PREFIX || 'غير محدد'}\n\n`;
  
  // تحليل المنشن
  output += "🏷️  تحليل المنشن:\n";
  const mentionKeys = Object.keys(mentions);
  output += `   عدد المنشنات: ${mentionKeys.length}\n`;
  
  if (mentionKeys.length > 0) {
    output += `   ✅ يوجد منشن!\n`;
    output += `   الأول: ${mentionKeys[0]}\n`;
    
    try {
      const name = await Users.getNameUser(mentionKeys[0]);
      output += `   الاسم: ${name}\n`;
    } catch (e) {
      output += `   الاسم: (فشل الحصول عليه)\n`;
    }
  } else {
    output += `   ❌ لا يوجد منشن\n`;
  }
  output += "\n";
  
  // تحليل الرد
  output += "📨 تحليل الرد:\n";
  if (messageReply) {
    output += `   ✅ يوجد رد!\n`;
    output += `   ID المُرسل: ${messageReply.senderID}\n`;
    output += `   ID الرسالة: ${messageReply.messageID}\n`;
    
    try {
      const name = await Users.getNameUser(messageReply.senderID);
      output += `   الاسم: ${name}\n`;
    } catch (e) {
      output += `   الاسم: (فشل الحصول عليه)\n`;
    }
  } else {
    output += `   ❌ لا يوجد رد\n`;
  }
  output += "\n";
  
  // تحليل الـ Args
  output += "📝 تحليل Args:\n";
  output += `   العدد: ${args.length}\n`;
  if (args.length > 0) {
    output += `   المحتوى:\n`;
    args.forEach((arg, index) => {
      output += `      [${index}]: ${arg}\n`;
      // تحقق إذا كان ID صحيح
      if (!isNaN(arg.replace(/[@\s]/g, ''))) {
        output += `      ✅ يبدو كـ ID صحيح\n`;
      }
    });
  } else {
    output += `   ❌ فارغ\n`;
  }
  output += "\n";
  
  // محاكاة استخراج targetID
  output += "🎯 محاكاة استخراج الهدف:\n";
  let targetID = null;
  let method = "لا شيء";
  
  if (mentionKeys.length > 0) {
    targetID = mentionKeys[0];
    method = "منشن";
  } else if (type === "message_reply") {
    targetID = messageReply.senderID;
    method = "رد";
  } else if (args[0]) {
    const cleanID = args[0].replace(/[@\s]/g, '');
    if (!isNaN(cleanID)) {
      targetID = cleanID;
      method = "ID مباشر";
    }
  }
  
  if (targetID) {
    output += `   ✅ تم العثور على هدف!\n`;
    output += `   الطريقة: ${method}\n`;
    output += `   ID: ${targetID}\n`;
    
    try {
      const name = await Users.getNameUser(targetID);
      output += `   الاسم: ${name}\n`;
    } catch (e) {
      output += `   الاسم: (فشل الحصول عليه)\n`;
    }
  } else {
    output += `   ❌ لم يتم العثور على هدف\n`;
    output += `   جرب:\n`;
    output += `   • test-mention @شخص\n`;
    output += `   • test-mention [ID]\n`;
    output += `   • رد على رسالة واكتب: test-mention\n`;
  }
  output += "\n";
  
  output += "════════════════════════════════════\n";
  output += "💡 نصيحة: أفضل طريقة هي الرد على رسالة!\n";
  output += "════════════════════════════════════";
  
  return api.sendMessage(output, threadID, messageID);
};

// ════════════════════════════════════════════════════════════


// ┌───────────────────────────────────────────────────────────┐
// │ 2️⃣  أمر test-reaction - اختبار حذف التفاعل              │
// └───────────────────────────────────────────────────────────┘
//
// ضع هذا في: script/commands/test/test-reaction.js

module.exports.config = {
  name: "test-reaction",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "KIRA Diagnostic",
  description: "اختبار حذف الرسالة بالتفاعل",
  commandCategory: "test",
  usages: "test-reaction",
  cooldowns: 0
};

module.exports.run = async function({ api, event }) {
  const { threadID, messageID } = event;
  
  let message = "";
  message += "════════════════════════════════════\n";
  message += "🧪 اختبار حذف الرسالة بالتفاعل\n";
  message += "════════════════════════════════════\n\n";
  
  message += "📝 التعليمات:\n";
  message += "1️⃣  تفاعل على هذه الرسالة بأي من:\n";
  message += "   👍 😡 🗑️ ❌ 💔 🚫 ⛔\n\n";
  
  message += "2️⃣  يجب أن تُحذف الرسالة تلقائياً!\n\n";
  
  message += "3️⃣  راقب console للمعلومات\n\n";
  
  message += "════════════════════════════════════\n";
  message += "⚠️ ملاحظة: التفاعل على رسالة البوت فقط!\n";
  message += "════════════════════════════════════";
  
  return api.sendMessage(message, threadID, messageID);
};

module.exports.handleEvent = async function({ api, event }) {
  const { reaction, messageReply, userID, threadID } = event;
  
  if (!reaction || !messageReply) return;
  
  // التحقق من أن الرسالة من البوت
  if (messageReply.senderID !== api.getCurrentUserID()) {
    return;
  }
  
  const deleteReactions = ["👍", "😡", "🗑️", "❌", "💔", "🚫", "⛔"];
  
  console.log("\n🧪 ═══ اختبار الحذف ═══");
  console.log(`   التفاعل: ${reaction}`);
  console.log(`   المستخدم: ${userID}`);
  console.log(`   الرسالة: ${messageReply.messageID}`);
  console.log(`   ID البوت: ${api.getCurrentUserID()}`);
  
  if (deleteReactions.includes(reaction)) {
    console.log("   ✅ التفاعل مطابق!");
    console.log("   🗑️ محاولة الحذف...");
    
    try {
      await api.unsendMessage(messageReply.messageID);
      console.log("   ✅ تم الحذف بنجاح! 🎉\n");
      
      // إرسال رسالة تأكيد للمستخدم
      api.sendMessage(
        `✅ نجح الاختبار! تم حذف الرسالة بالتفاعل ${reaction}`,
        threadID
      );
      
    } catch (error) {
      console.log(`   ❌ فشل الحذف: ${error.message}\n`);
      
      // إرسال رسالة خطأ للمستخدم
      api.sendMessage(
        `❌ فشل الاختبار!\n` +
        `الخطأ: ${error.message}\n\n` +
        `تحقق من:\n` +
        `• صلاحيات البوت\n` +
        `• أنك تفاعلت على رسالة البوت\n` +
        `• أن الأحداث تعمل بشكل صحيح`,
        threadID
      );
    }
  } else {
    console.log(`   ℹ️ التفاعل "${reaction}" ليس في القائمة\n`);
  }
};

// ════════════════════════════════════════════════════════════


// ┌───────────────────────────────────────────────────────────┐
// │ 3️⃣  أمر debug-event - عرض كل الأحداث                    │
// └───────────────────────────────────────────────────────────┘
//
// ضع هذا في: script/commands/test/debug-event.js

module.exports.config = {
  name: "debug-event",
  version: "1.0.0",
  hasPermssion: 2, // للأدمن فقط
  credits: "KIRA Diagnostic",
  description: "عرض معلومات مفصلة عن حدث معين",
  commandCategory: "test",
  usages: "debug-event",
  cooldowns: 0
};

module.exports.run = async function({ api, event }) {
  const { threadID, messageID } = event;
  
  // إزالة الحقول الكبيرة لتجنب رسالة طويلة جداً
  const cleanEvent = { ...event };
  delete cleanEvent.attachments;
  
  let output = "";
  output += "════════════════════════════════════\n";
  output += "🐛 Debug Event Data\n";
  output += "════════════════════════════════════\n\n";
  
  output += "```json\n";
  output += JSON.stringify(cleanEvent, null, 2);
  output += "\n```\n\n";
  
  output += "════════════════════════════════════\n";
  output += "💡 استخدم هذه المعلومات للتشخيص\n";
  output += "════════════════════════════════════";
  
  return api.sendMessage(output, threadID, messageID);
};

// ════════════════════════════════════════════════════════════


// ┌───────────────────────────────────────────────────────────┐
// │ 4️⃣  أمر test-all - اختبار شامل                          │
// └───────────────────────────────────────────────────────────┘
//
// ضع هذا في: script/commands/test/test-all.js

module.exports.config = {
  name: "test-all",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "KIRA Diagnostic",
  description: "اختبار شامل لكل وظائف البوت",
  commandCategory: "test",
  usages: "test-all",
  cooldowns: 0
};

module.exports.run = async function({ api, event, Users }) {
  const { threadID, messageID, senderID } = event;
  
  let report = "";
  report += "════════════════════════════════════\n";
  report += "🔍 تقرير الفحص الشامل\n";
  report += "════════════════════════════════════\n\n";
  
  // 1. فحص API
  report += "1️⃣  فحص API:\n";
  try {
    const botID = api.getCurrentUserID();
    report += `   ✅ API متصل\n`;
    report += `   ID البوت: ${botID}\n`;
  } catch (e) {
    report += `   ❌ API غير متصل: ${e.message}\n`;
  }
  report += "\n";
  
  // 2. فحص Global Data
  report += "2️⃣  فحص Global Data:\n";
  try {
    report += `   الأوامر: ${global.client.commands.size}\n`;
    report += `   الأحداث: ${global.client.events.size}\n`;
    report += `   المحظورين: ${global.data.userBanned.size}\n`;
    report += `   المجموعات المحظورة: ${global.data.threadBanned.size}\n`;
  } catch (e) {
    report += `   ❌ خطأ في Global Data: ${e.message}\n`;
  }
  report += "\n";
  
  // 3. فحص Config
  report += "3️⃣  فحص الإعدادات:\n";
  try {
    report += `   البريفكس: ${global.config.PREFIX}\n`;
    report += `   اسم البوت: ${global.config.BOTNAME}\n`;
    report += `   وضع التطوير: ${global.config.DeveloperMode ? 'مفعّل' : 'معطّل'}\n`;
    report += `   الدخول من الخاص: ${global.config.allowInbox ? 'مسموح' : 'ممنوع'}\n`;
  } catch (e) {
    report += `   ❌ خطأ في الإعدادات: ${e.message}\n`;
  }
  report += "\n";
  
  // 4. فحص Users
  report += "4️⃣  فحص نظام المستخدمين:\n";
  try {
    const name = await Users.getNameUser(senderID);
    report += `   ✅ نظام المستخدمين يعمل\n`;
    report += `   اسمك: ${name}\n`;
  } catch (e) {
    report += `   ❌ خطأ في المستخدمين: ${e.message}\n`;
  }
  report += "\n";
  
  // 5. فحص الأحداث المهمة
  report += "5️⃣  فحص الأحداث:\n";
  const importantEvents = [
    'delete-on-react',
    'listen',
    'log'
  ];
  
  importantEvents.forEach(eventName => {
    if (global.client.events.has(eventName)) {
      report += `   ✅ ${eventName}\n`;
    } else {
      report += `   ❌ ${eventName} غير موجود\n`;
    }
  });
  report += "\n";
  
  // 6. فحص الأوامر المهمة
  report += "6️⃣  فحص الأوامر:\n";
  const importantCommands = [
    'حضن',
    'شنق',
    'test-mention',
    'test-reaction'
  ];
  
  importantCommands.forEach(cmdName => {
    if (global.client.commands.has(cmdName)) {
      report += `   ✅ ${cmdName}\n`;
    } else {
      report += `   ⚠️ ${cmdName} غير موجود\n`;
    }
  });
  report += "\n";
  
  report += "════════════════════════════════════\n";
  report += "✅ انتهى الفحص الشامل\n";
  report += "════════════════════════════════════";
  
  return api.sendMessage(report, threadID, messageID);
};

// ════════════════════════════════════════════════════════════
// 📝 ملاحظات مهمة:
// ════════════════════════════════════════════════════════════
//
// • أنشئ مجلد: script/commands/test
// • ضع كل أمر في ملف منفصل داخل المجلد
// • أعد تشغيل البوت بعد إضافة الأوامر
// • استخدم الأوامر للتشخيص السريع
//
// ════════════════════════════════════════════════════════════
