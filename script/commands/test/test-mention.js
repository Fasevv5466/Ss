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
  
  let output = "════════════════════════════════════\n🧪 تشخيص شامل للأمر\n════════════════════════════════════\n\n";
  output += `📋 معلومات الرسالة:\n   النوع: ${type}\n   المرسل: ${senderID}\n   المجموعة: ${threadID}\n\n`;
  
  const mentionKeys = Object.keys(mentions);
  output += `🏷️ تحليل المنشن:\n   عدد المنشنات: ${mentionKeys.length}\n`;
  if (mentionKeys.length > 0) {
    output += `   ✅ يوجد منشن! ID: ${mentionKeys[0]}\n`;
  } else {
    output += `   ❌ لا يوجد منشن\n`;
  }
  output += "\n";

  output += "📨 تحليل الرد:\n";
  if (messageReply) {
    output += `   ✅ يوجد رد! ID المُرسل: ${messageReply.senderID}\n`;
  } else {
    output += `   ❌ لا يوجد رد\n`;
  }

  let targetID = mentionKeys.length > 0 ? mentionKeys[0] : (type === "message_reply" ? messageReply.senderID : (args[0] && !isNaN(args[0].replace(/[@\s]/g, '')) ? args[0].replace(/[@\s]/g, '') : null));
  
  if (targetID) {
    output += `\n🎯 الهدف المستخرج: ${targetID}\n`;
    try {
      const name = await Users.getNameUser(targetID);
      output += `   الاسم: ${name}\n`;
    } catch (e) { output += `   الاسم: فشل الجلب\n`; }
  } else {
    output += `\n❌ لم يتم تحديد هدف\n`;
  }
  
  output += "\n════════════════════════════════════";
  return api.sendMessage(output, threadID, messageID);
};
