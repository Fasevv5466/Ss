// ═══════════════════════════════════════════════════════════
// 👑 KIRA - الطلبات
// المطور: Ayman ♛
// الوصف: إدارة طلبات المراسلة للمجموعات والمستخدمين بإشراف إمبراطوري
// ═══════════════════════════════════════════════════════════

module.exports.config = {
  name: "الطلبات",
  aliases: [],
  version: "2.0.0",
  credits: "Ayman ♛",
  hasPermssion: 2,
  description: "إدارة طلبات المراسلة للمجموعات والمستخدمين بإشراف إمبراطوري",
  commandCategory: "developer",
  usages: "[المستخدمين / المجموعات / الكل]",
  cooldowns: 5
};

module.exports.handleReply = async function({ api, event, handleReply }) {
  const EMPEROR_ID = "61577861540407";
  if (String(event.senderID) !== EMPEROR_ID) return;
  
  const { body, threadID, messageID } = event;
  const fs = require("fs-extra");
  var count = 0;

  if (isNaN(body) && (body.indexOf("c") == 0 || body.indexOf("cancel") == 0)) {
    return api.sendMessage(`◈ ───『 الـرفـض الـمـلـكـي 』─── ◈\n\n◯ تـم إلـغاء تـفـعيل الـطلبات بـنجاح سيدي.\n———————————————\n◈ ─────────────── ◈`, threadID, messageID);
  } else {
    const index = body.split(/\s+/);
    for (const singleIndex of index) {
      if (isNaN(singleIndex) || singleIndex <= 0 || singleIndex > handleReply.pending.length) {
        return api.sendMessage(`⚠️ الرقم ${singleIndex} غير موجود في السجلات سيدي.`, threadID, messageID);
      }
      
      const target = handleReply.pending[singleIndex - 1];
      api.unsendMessage(handleReply.messageID);
      
      // تعيين اسم البوت في المجموعة الجديدة
      api.changeNickname(`${(!global.config.BOTNAME) ? "EMPEROR BOT" : global.config.BOTNAME}`, target.threadID, api.getCurrentUserID());
      
      // رسالة القبول مع الزخرفة
      api.sendMessage(`◈ ───『 تـم الـقـبـول ✅ 』─── ◈\n\n◯ تـم انـضـمـام الـبـوت بـأوامـر مـن الإمـبـراطـور أيـمـن.\n◉ اسـتـمـتـعـوا بـالـخـدمـات الـمـلـكـيـة.\n———————————————\n◈ ─────────────── ◈`, target.threadID);
      count += 1;
    }
    return api.sendMessage(`◈ ───『 تـم الـتـنـفـيذ 』─── ◈\n\n◯ تـم قـبـول (${count}) طـلـب بـنـجـاح.\n———————————————\n◈ ─────────────── ◈`, threadID, messageID);
  }
}

module.exports.run = async function({ api, event, args }) {
  const EMPEROR_ID = "61577861540407";
  const { threadID, messageID, senderID } = event;

  if (senderID !== EMPEROR_ID) {
    return api.sendMessage("◈ ───『 تـنـبـيـه مـلـكـي 』─── ◈\n\n◯ هـذا الأمـر خـاص بـالإمـبـراطـور أيـمـن فـقـط.\n———————————————\n◈ ─────────────── ◈", threadID, messageID);
  }

  const commandName = this.config.name;
  var msg = "", index = 1;

  try {
    var spam = await api.getThreadList(100, null, ["OTHER"]) || [];
    var pending = await api.getThreadList(100, null, ["PENDING"]) || [];
    var list = [];
  } catch (e) { 
    return api.sendMessage("⚠️ سيدي، فشلت في استرجاع قوائم الانتظار.", threadID, messageID); 
  }

  switch (args[0]) {
    case "المستخدمين":
    case "u":
      list = [...spam, ...pending].filter(group => group.isGroup == false);
      break;
    case "المجموعات":
    case "t":
      list = [...spam, ...pending].filter(group => group.isSubscribed && group.isGroup);
      break;
    case "الكل":
    case "a":
      list = [...spam, ...pending].filter(group => group.isSubscribed);
      break;
    default:
      return api.sendMessage(`◈ ───『 لوحـة الـتحـكم 』─── ◈\n\n◯ خـيارات الإدارة :\n◉ ${global.config.PREFIX}${commandName} المستخدمين\n◉ ${global.config.PREFIX}${commandName} المجموعات\n◉ ${global.config.PREFIX}${commandName} الكل\n———————————————\n◈ ─────────────── ◈`, threadID, messageID);
  }

  for (const single of list) {
    msg += `┃${index++}┃ ${single.name}\n┃ID┃ ${single.threadID}\n───────────────\n`;
  }

  if (list.length != 0) {
    return api.sendMessage(`◈ ───『 قـائـمـة الانـتـظـار 』─── ◈\n\n${msg}\n◯ الرد برقم الطلب للموافقة سيدي.\n———————————————\n◈ ─────────────── ◈`, threadID, (error, info) => {
      global.client.handleReply.push({
        name: commandName,
        messageID: info.messageID,
        author: event.senderID,
        pending: list
      });
    }, messageID);
  } else {
    return api.sendMessage("◈ ───『 الـقـائـمـة فـارغـة 』─── ◈\n\n◯ لا يـوجـد طـلـبات تـحـت الانـتـظـار حـالـيـاً.\n———————————————\n◈ ─────────────── ◈", threadID, messageID);
  }
}
