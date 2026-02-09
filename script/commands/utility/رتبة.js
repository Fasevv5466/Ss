const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "رتبة",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "ايمن",
  description: "عرض رتبة المستخدم في المجموعة",
  commandCategory: "utility",
  usages: "[@منشن] أو رد على رسالة",
  cooldowns: 5
};

module.exports.run = async function({ api, event, Users, Currencies }) {
  const { threadID, messageID, mentions, messageReply, senderID } = event;

  try {
    let targetID = senderID;

    if (messageReply) {
      targetID = messageReply.senderID;
    } else if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    }

    const userName = await Users.getNameUser(targetID);
    const money = await Currencies.getData(targetID);
    const userMoney = money ? money.money : 0;

    const allData = await Currencies.getAll();
    const allUsers = allData.filter(user => user.money > 0);
    
    allUsers.sort((a, b) => b.money - a.money);
    
    const userRank = allUsers.findIndex(user => user.userID === targetID) + 1;

    const level = Math.floor(userMoney / 1000);
    const expForNextLevel = ((level + 1) * 1000) - userMoney;

    return api.sendMessage(
      `⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\n👤 المستخدم: ${userName}\n💰 العملات: ${userMoney.toLocaleString()}\n📊 الرتبة: #${userRank}\n⭐ المستوى: ${level}\n📈 النقاط المتبقية: ${expForNextLevel}`,
      threadID,
      messageID
    );

  } catch (error) {
    console.error("رتبة - خطأ:", error);
    return api.sendMessage(
      `⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\n❌ حدث خطأ أثناء جلب المعلومات\n📝 ${error.message}`,
      threadID,
      messageID
    );
  }
};
