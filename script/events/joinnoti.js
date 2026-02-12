module.exports.config = {
  name: "joinNoti",
  eventType: ["log:subscribe"],
  version: "1.0.2",
  credits: "Mirai Team - Fixed by Ayman",
  description: "إشعار انضمام أعضاء جدد"
};

module.exports.run = async function({ api, event, Users }) {
  const { threadID } = event;

  // ✅ إذا البوت هو اللي انضم
  if (event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
    api.changeNickname(
      `[ ${global.config.PREFIX} ] • ${global.config.BOTNAME || "KIRA Bot"}`, 
      threadID, 
      api.getCurrentUserID()
    );
    return api.sendMessage(`✅ تم الاتصال بنجاح!`, threadID);
  }

  // ✅ معالجة انضمام أعضاء عاديين
  try {
    // ✅ استيراد مباشر بدلاً من global.nodemodule
    const fs = require("fs-extra");
    const path = require("path");
    
    const { threadName, participantIDs } = await api.getThreadInfo(threadID);

    const nameArray = [];
    const mentions = [];
    const memLength = [];
    let i = 0;

    for (const id in event.logMessageData.addedParticipants) {
      const userName = event.logMessageData.addedParticipants[id].fullName;
      nameArray.push(userName);
      mentions.push({ tag: userName, id });
      memLength.push(participantIDs.length - i++);

      if (!global.data.allUserID.includes(id)) {
        await Users.createData(id, { name: userName, data: {} });
        global.data.userName.set(id, userName);
        global.data.allUserID.push(id);
      }
    }
    memLength.sort((a, b) => a - b);

    const threadData = global.data.threadData.get(parseInt(threadID)) || {};
    
    // ✅ رسالة عربية واضحة
    let msg = threadData.customJoin || 
      `✿——————————————✿\n` +
      `🎉 مرحباً: {name}\n` +
      `📍 أهلاً بك في: {threadName}\n` +
      `👥 أنت العضو رقم: {soThanhVien}\n` +
      `✨ تمت الإضافة بواسطة: {author}\n` +
      `💝 نتمنى لك وقتاً ممتعاً\n` +
      `✿——————————————✿`;

    const getData = await Users.getData(event.author);
    const nameAuthor = getData?.name || "رابط دعوة";

    // التوقيت (اختياري - يمكن حذفه إذا لم يُستخدم)
    const moment = require("moment-timezone");
    const time = moment.tz("Asia/Baghdad");
    const gio = parseInt(time.format("HH"));
    
    let get = "صباح الخير";
    if (gio >= 11) get = "مساء الخير";
    if (gio >= 14) get = "عصر الخير";
    if (gio >= 19) get = "مساء الخير";

    msg = msg
      .replace(/\{name}/g, nameArray.join(", "))
      .replace(/\{soThanhVien}/g, memLength.join(", "))
      .replace(/\{threadName}/g, threadName)
      .replace(/\{author}/g, nameAuthor)
      .replace(/\{get}/g, get);

    // ✅ إرسال بدون مرفق (تجنب مشاكل الملفات المفقودة)
    const formPush = { 
      body: msg, 
      mentions 
    };

    return api.sendMessage(formPush, threadID);

  } catch (e) {
    console.error("❌ Join Notification Error:", e.message);
    console.error("Stack:", e.stack);
    
    // ✅ إرسال رسالة بسيطة كـ fallback
    try {
      return api.sendMessage("👋 مرحباً بالأعضاء الجدد!", threadID);
    } catch (fallbackError) {
      console.error("❌ حتى رسالة الـ fallback فشلت:", fallbackError.message);
    }
  }
};
