module.exports.config = {
  name: "ضيفي",
  version: "2.5.0",
  hasPermssion: 2,
  credits: "ayman",
  description: "إضافة مستخدم للمجموعة",
  commandCategory: "developer",
  usages: "ضيفي [الرابط / الآيدي / بالرد]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, body, type, messageReply, senderID } = event;
  
  const prefix = global.config.PREFIX || ".";
  if (!body.startsWith(prefix)) return;

  const botID = api.getCurrentUserID();
  const threadInfo = await api.getThreadInfo(threadID);
  const participantIDs = threadInfo.participantIDs.map(e => parseInt(e));

  let idToAdd;
  
  if (type === "message_reply") {
    idToAdd = messageReply.senderID;
  } else if (args.length > 0) {
    idToAdd = args[0];
  } else {
    return api.sendMessage(
      `◈ ───« إضـافـة »─── ◈
│
◯ │ يـرجـى وضـع :
◯ │ آيـدي أو رابـط
◯ │ أو الـرد ع رسـالـة
│
◈ ─────────────── ◈`,
      threadID, 
      messageID
    );
  }

  async function adduser(id) {
    id = parseInt(id);
    if (participantIDs.includes(id)) {
      return api.sendMessage(
        `◈ ───« مـوجـود »─── ◈
│
◯ │ هـذا الـمـسـتـخـدم
◯ │ مـوجـود فـي الـمـجـمـوعـة
│
◈ ─────────────── ◈`,
        threadID, 
        messageID
      );
    }

    api.setMessageReaction("⏳", messageID, () => {}, true);

    try {
      await api.addUserToGroup(id, threadID);
      api.setMessageReaction("✅", messageID, () => {}, true);
      
      if (threadInfo.approvalMode && !threadInfo.adminIDs.some(e => e.id == botID)) {
        return api.sendMessage(
          `◈ ───« طـلـب »─── ◈
│
◯ │ تـم إرسـال
◯ │ طـلـب إضـافـة
◯ │ إلـى الإنـتـظـار
│
◈ ─────────────── ◈`,
          threadID, 
          messageID
        );
      } else {
        return api.sendMessage(
          `◈ ───« تـم »─── ◈
│
◯ │ تـم الإضـافـة
◯ │ بـنـجـاح
│
◈ ─────────────── ◈`,
          threadID, 
          messageID
        );
      }
    } catch (err) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage(
        `◈ ───« فـشـل »─── ◈
│
◯ │ تـعـذر الإضـافـة
◯ │ خـصـوصـيـة أو لـيـس مسـؤول
│
◈ ─────────────── ◈`,
        threadID, 
        messageID
      );
    }
  }

  if (isNaN(idToAdd) && idToAdd.includes("facebook.com")) {
    return api.sendMessage(
      `◈ ───« رابـط »─── ◈
│
◯ │ إضـافـة الـروابـط
◯ │ تـتـطـلـب مـعـالـجـة
◯ │ اخـتـر الآيـدي أو الـرد
│
◈ ─────────────── ◈`,
      threadID, 
      messageID
    );
  } else {
    await adduser(idToAdd);
  }
};
