module.exports.config = {
  name: "اوامر",
  version: "4.0.0",
  hasPermssion: 0,
  credits: "ايمن",
  description: "عرض قائمة الأوامر حسب الفئة (إصلاح شامل)",
  commandCategory: "system",
  usages: "اوامر",
  cooldowns: 5
};

module.exports.handleEvent = async function({ api, event }) {
  const { reaction, messageReply } = event;
  // حذف الرسالة عند التفاعل بـ 😡
  if (reaction === "😡" && messageReply?.senderID === api.getCurrentUserID()) {
    return api.unsendMessage(messageReply.messageID);
  }
};

module.exports.handleReply = async function({ api, event, handleReply }) {
  const { threadID, messageID, body } = event;

  // التحقق من رقم الفئة المختارة
  let categoryName = "";
  let commandsList = "";

  if (body === "1") {
    categoryName = "الـمـرح - 𝗙𝗨𝗡";
    commandsList = "» حب، مطلوب، حمام، حضن، زواج، شنق، ترامب، بروفايل، نكت، صراحة";
  } 
  else if (body === "2") {
    categoryName = "الألـعـاب - 𝗚𝗔𝗠𝗘𝗦";
    commandsList = "» شخصيات، اعلام، اسئلة، احزر، عواصم، ترتيب";
  } 
  else if (body === "3") {
    categoryName = "الإدارة - 𝗔𝗗𝗠𝗜𝗡";
    commandsList = "» ابتايم، طرد، تقييد، اعدادات، حظر، فك_حظر";
  } 
  else {
    return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 ━━ ⌬\n\nالرقم غير صحيح! اختر (1 أو 2 أو 3) بالرد على الرسالة.", threadID, messageID);
  }

  const msg = `⌬ ━━ 𝗞𝗜𝗥𝗔 ${categoryName} ━━ ⌬\n\n` +
              `الأوامر المتاحة:\n${commandsList}\n\n` +
              `💡 يمكنك الرد بـ (😡) لحذف هذه الرسالة.`;

  // حذف قائمة الفئات القديمة لإبقاء الشات نظيفاً
  api.unsendMessage(handleReply.messageID);
  
  return api.sendMessage(msg, threadID, messageID);
};

module.exports.run = async function({ api, event }) {
  const { threadID, messageID } = event;

  const menu = `⌬ ━━ 𝗞𝗜𝗥𝗔 𝗛𝗘𝗟𝗣 ━━ ⌬\n\n` +
               `يرجى الرد برقم الفئة لعرض الأوامر:\n\n` +
               `𝟭. 【 الـمـرح - 𝗙𝗨𝗡 】\n` +
               `𝟮. 【 الألـعـاب - 𝗚𝗔𝗠𝗘𝗦 】\n` +
               `𝟯. 【 الإدارة - 𝗔𝗗𝗠𝗜𝗡 】\n\n` +
               `--- --- --- --- --- ---\n` +
               `💡 رد بـ (😡) على أي رسالة بوت لحذفها.`;

  return api.sendMessage(menu, threadID, (err, info) => {
    if (err) return console.log(err);
    global.client.handleReply.push({
      name: this.config.name,
      messageID: info.messageID,
      author: event.senderID
    });
  }, messageID);
};
