module.exports.config = {
  name: "نيم",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "عمر",
  description: "قم بتغيير لقبك في مجموعتك أو الشخص الذي تضع علامة عليه",
  commandCategory: "utility",
  usages: "[اللقب] أو [اللقب @منشن]",
  cooldowns: 3
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;
  const name = args.join(" ");
  const mention = Object.keys(event.mentions)[0];
  
  if (!name) {
    return api.sendMessage(
      `◈ ───『 تغيير اللقب 』─── ◈
│
◯ │ الاستخدام : نيم [اللقب]
◯ │ أو : نيم [اللقب] @شخص
◯ │ لتغيير لقبك أو لقب شخص آخر
│
◈ ─────────────── ◈`,
      threadID,
      messageID
    );
  }
  
  if (!mention) {
    try {
      await api.changeNickname(name, threadID, event.senderID);
      api.setMessageReaction("✅", messageID, () => {}, true);
      return api.sendMessage(
        `◈ ───『 تم التغيير 』─── ◈
│
◯ │ تم تغيير لقبك بنجاح
◯ │ اللقب الجديد : ${name}
│
◈ ─────────────── ◈`,
        threadID,
        messageID
      );
    } catch (error) {
      return api.sendMessage(
        `◈ ───『 خطأ 』─── ◈
│
◯ │ فشل تغيير اللقب
◯ │ قد تكون غير مسموح لك
│
◈ ─────────────── ◈`,
        threadID,
        messageID
      );
    }
  }
  
  if (mention) {
    try {
      const cleanName = name.replace(event.mentions[mention], "").trim();
      await api.changeNickname(cleanName, threadID, mention);
      api.setMessageReaction("✅", messageID, () => {}, true);
      return api.sendMessage(
        `◈ ───『 تم التغيير 』─── ◈
│
◯ │ تم تغيير لقب العضو بنجاح
◯ │ اللقب الجديد : ${cleanName}
◯ │ للعضو الممنشن
│
◈ ─────────────── ◈`,
        threadID,
        messageID
      );
    } catch (error) {
      return api.sendMessage(
        `◈ ───『 خطأ 』─── ◈
│
◯ │ فشل تغيير لقب العضو
◯ │ قد تكون غير مسموح لك
◯ │ أو البوت ليس مشرفاً
│
◈ ─────────────── ◈`,
        threadID,
        messageID
      );
    }
  }
}
