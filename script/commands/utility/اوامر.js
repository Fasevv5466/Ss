module.exports.config = {
  name: "اوامر",
  version: "6.0.0",
  hasPermssion: 0,
  credits: "ايمن",
  description: "قائمة الأوامر الرسمية لبوت كيرا",
  commandCategory: "النظام",
  usages: "اوامر",
  cooldowns: 5
};

module.exports.handleEvent = async function({ api, event }) {
  const { reaction, messageReply } = event;
  // محرك الحذف الصامت بالتفاعل 😡
  if (reaction === "😡" && messageReply?.senderID === api.getCurrentUserID()) {
    return api.unsendMessage(messageReply.messageID);
  }
};

module.exports.handleReply = async function({ api, event, handleReply }) {
  const { threadID, messageID, body } = event;
  
  let categoryName = "";
  let commandsList = "";

  switch (body) {
    case "1":
      categoryName = "الـمـرح - 𝗙𝗨𝗡";
      commandsList = "» حب، مطلوب، حمام، حضن، زواج، شنق، ترامب، بروفايل، نكت، صراحة";
      break;
    case "2":
      categoryName = "الإدارة - 𝗔𝗗𝗠𝗜𝗡";
      commandsList = "» طرد، تقييد، حظر، فك_حظر، كشف، غادر، نداء، مسح، إضافة";
      break;
    case "3":
      categoryName = "الـمـطـور - 𝗗𝗘𝗩𝗘𝗟𝗢𝗣𝗘𝗥";
      commandsList = "» تحديث، جلب، ملف، ايفينت، تنفيذ، إعادة_تشغيل، تقرير";
      break;
    case "4":
      categoryName = "الألـعـاب - 𝗚𝗔𝗠𝗘𝗦";
      commandsList = "» شخصيات، اعلام، اسئلة، احزر، عواصم، ترتيب، لغز، كراش";
      break;
    case "5":
      categoryName = "الـمـيـديـا - 𝗠𝗘𝗗𝗜𝗔";
      commandsList = "» تيكتوك، فيسبوك، انستقرام، يوتيوب، أغنية، فيديو، تحميل";
      break;
    case "6":
      categoryName = "الـصـور - 𝗣𝗜𝗖";
      commandsList = "» صورة، خلفيات، رسم، قطة، كلب، أنمي، لوحة";
      break;
    case "7":
      categoryName = "الـخدمات - 𝗨𝗧𝗜𝗟𝗜𝗧𝗬";
      commandsList = "» ابتايم، وقت، تاريخ، طقس، ترجمة، حساب، تحويل، رابط";
      break;
    default:
      return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 ━━ ⌬\n\nعذراً، اختر رقماً من 1 إلى 7 فقط", threadID, messageID);
  }

  const msg = `⌬ ━━ 𝗞𝗜𝗥𝗔 ${categoryName} ━━ ⌬\n\n${commandsList}`;

  // حذف القائمة الرئيسية لتسهيل التصفح
  api.unsendMessage(handleReply.messageID);
  
  return api.sendMessage(msg, threadID, messageID);
};

module.exports.run = async function({ api, event }) {
  const { threadID, messageID } = event;

  const menu = `⌬ ━━ 𝗞𝗜𝗥𝗔 𝗛𝗘𝗟𝗣 ━━ ⌬\n\n` +
               `مرحباً بك، رد برقم الفئة المطلوبة:\n\n` +
               `𝟭. 【 الـمـرح - 𝗙𝗨𝗡 】\n` +
               `𝟮. 【 الإدارة - 𝗔𝗗𝗠𝗜𝗡 】\n` +
               `𝟯. 【 الـمـطـور - 𝗗𝗘𝗩𝗘𝗟𝗢𝗣𝗘𝗥 】\n` +
               `𝟰. 【 الألـعـاب - 𝗚𝗔𝗠𝗘𝗦 】\n` +
               `𝟱. 【 الـمـيـديـا - 𝗠𝗘𝗗𝗜𝗔 】\n` +
               `𝟲. 【 الـصـور - 𝗣𝗜𝗖 】\n` +
               `𝟳. 【 الـخدمات - 𝗨𝗧𝗜𝗟𝗜𝗧𝗬 】`;

  return api.sendMessage(menu, threadID, (err, info) => {
    global.client.handleReply.push({
      name: this.config.name,
      messageID: info.messageID,
      author: event.senderID
    });
  }, messageID);
};
