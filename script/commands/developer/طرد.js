const axios = require("axios");

module.exports.config = {
  name: "طرد",
  version: "3.0.0",
  hasPermssion: 2,
  credits: "Heba",
  description: "طرد أعضاء",
  commandCategory: "developer",
  usages: "[@منشن/رد/الكل]",
  cooldowns: 2
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID, senderID, mentions, messageReply } = event;
  const botID = api.getCurrentUserID();
  const config = global.config || {};
  const botAdmins = config.MODERATORS || config.MODERATOR || [];
  
  if (!botAdmins.includes(senderID.toString())) {
    return api.sendMessage(
      `◈ ───« رفـض »─── ◈
│
◯ │ الأمـر
◯ │ لـلـمـطـور فـقـط
│
◈ ─────────────── ◈`,
      threadID, 
      messageID
    );
  }

  if (args[0] === "الكل") {
    const threadInfo = await api.getThreadInfo(threadID);
    if (!threadInfo.adminIDs.some(admin => admin.id === botID)) {
      return api.sendMessage(
        `◈ ───« لـيـس مسـؤول »─── ◈
│
◯ │ الـبـوت
◯ │ لـيـس مسـؤولاً
│
◈ ─────────────── ◈`,
        threadID, 
        messageID
      );
    }
    
    const listID = threadInfo.participantIDs.filter(id => id != botID && !botAdmins.includes(id.toString()));
    
    api.sendMessage(
      `◈ ───« إبـادة »─── ◈
│
◯ │ جـاري تـصـفـيـة
◯ │ ${listID.length} عـضـواً
│
◈ ─────────────── ◈`,
      threadID
    );
    
    for (const id of listID) {
      await new Promise(resolve => setTimeout(resolve, 500));
      api.removeUserFromGroup(id, threadID);
    }
    return;
  }

  let targetID;
  if (Object.keys(mentions).length > 0) targetID = Object.keys(mentions)[0];
  else if (messageReply) targetID = messageReply.senderID;
  else if (args[0] && args[0].match(/^\d+$/)) targetID = args[0];
  else {
    return api.sendMessage(
      `◈ ───« طـرد »─── ◈
│
◯ │ رد ع رسـالـة
◯ │ أو مـنـشـن
◯ │ أو .طـرد الـكـل
│
◈ ─────────────── ◈`,
      threadID, 
      messageID
    );
  }

  if (botAdmins.includes(targetID.toString())) {
    return api.sendMessage(
      `◈ ───« خـط أحـمـر »─── ◈
│
◯ │ لا يـمـكـن
◯ │ طـرد الـمـطـور
│
◈ ─────────────── ◈`,
      threadID, 
      messageID
    );
  }

  try {
    const threadInfo = await api.getThreadInfo(threadID);
    if (!threadInfo.adminIDs.some(admin => admin.id === botID)) {
      return api.sendMessage(
        `◈ ───« لـيـس مسـؤول »─── ◈
│
◯ │ عـذراً
◯ │ يـجـب أن أكـون مسـؤولاً
│
◈ ─────────────── ◈`,
        threadID, 
        messageID
      );
    }

    api.removeUserFromGroup(targetID, threadID, (err) => {
      if (err) return api.sendMessage(
        `◈ ───« فـشـل »─── ◈
│
◯ │ فـشـل
◯ │ فـي الـطـرد
│
◈ ─────────────── ◈`,
        threadID, 
        messageID
      );
      return api.sendMessage(
        `◈ ───« نـجـاح »─── ◈
│
◯ │ تـم رمـي
◯ │ الـقـمـامـة خـارجاً
│
◈ ─────────────── ◈`,
        threadID, 
        messageID
      );
    });
    
  } catch (error) {
    return api.sendMessage(
      `◈ ───« خـطـأ »─── ◈
│
◯ │ خـطـأ
◯ │ فـي جـلـب الـمـعـلـومـات
│
◈ ─────────────── ◈`,
      threadID, 
      messageID
    );
  }
};

module.exports.handleReaction = async function({ api, event }) {
  const { threadID, userID, messageID, reaction } = event;
  const config = global.config || {};
  const botAdmins = config.MODERATORS || config.MODERATOR || [];
  
  if (!botAdmins.includes(userID.toString()) || reaction !== "🐢") return;
  
  try {
    const msgInfo = await api.getMessageInfo(messageID);
    const targetID = msgInfo.senderID;
    const botID = api.getCurrentUserID();

    if (botAdmins.includes(targetID.toString())) return;
    
    api.removeUserFromGroup(targetID, threadID, (err) => {
      if (err) return;
      return api.sendMessage(
        `◈ ───« تـم »─── ◈
│
◯ │ تـم التـخـلـص
◯ │ مـن الـقـمـامـة 🐢
│
◈ ─────────────── ◈`,
        threadID
      );
    });
  } catch (error) {
    return;
  }
};
