
module.exports.config = {
  name: "unsendbyreaction",
  version: "1.0.0",
  credits: "ايمن",
  hasPermssion: 0,
  description: "حذف رسائل البوت عند التفاعل بـ 😡",
  commandCategory: "events"
};

module.exports.handleEvent = async function({ api, event }) {
  // التحقق من أن الحدث هو تفاعل
  if (event.type !== "message_reaction") return;
  
  // التحقق من أن التفاعل هو 😡
  if (event.reaction !== "😡") return;
  
  try {
    // الحصول على معلومات الرسالة
    const messageInfo = await api.getMessageInfo(event.messageID);
    
    // التحقق من أن الرسالة من البوت نفسه
    if (messageInfo.senderID === api.getCurrentUserID()) {
      // حذف الرسالة
      await api.unsendMessage(event.messageID);
    }
  } catch (error) {
    // تجاهل الأخطاء بصمت
    console.log("Error in unsendbyreaction:", error);
  }
};
