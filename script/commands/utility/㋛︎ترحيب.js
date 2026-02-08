// ═══════════════════════════════════════════════════════════
// 👑 KIRA - ترحيب
// المطور: Ayman ♛
// الوصف: تفعيل أو إيقاف رسائل الترحيب الملكية بالأعضاء الجدد
// ═══════════════════════════════════════════════════════════

module.exports.config = {
  name: "ترحيب",
  aliases: [],
  version: "2.0.0",
  hasPermssion: 1,
  credits: "Ayman ♛",
  description: "تفعيل أو إيقاف رسائل الترحيب الملكية بالأعضاء الجدد",
  commandCategory: "utility",
  usages: "[تشغيل / إيقاف]",
  cooldowns: 2
};

module.exports.languages = {
  "en": {
    "on": "تـم تـفـعـيـل ✅",
    "off": "تـم إيـقـاف ❌",
    "successText": "نظام الترحيب بالعضو الجديد"
  }
}

module.exports.run = async function ({ api, event, Threads, getText }) {
  const { threadID, messageID } = event;
  let data = (await Threads.getData(threadID)).data;

  // تبديل الحالة
  if (typeof data["joinNoti"] == "undefined" || data["joinNoti"] == true) {
    data["joinNoti"] = false;
  } else {
    data["joinNoti"] = true;
  }

  await Threads.setData(threadID, { data });
  global.data.threadData.set(threadID, data);

  const status = (data["joinNoti"] == false) ? getText("off") : getText("on");
  
  // الرد بالزخرفة الإمبراطورية
  return api.sendMessage(`◈ ───『 نـظـام الـتـرحـيـب 』─── ◈\n\n` +
                         `◯ الـحـالـة : ${status}\n` +
                         `◉ الإجـراء : ${getText("successText")}\n` +
                         `———————————————\n` +
                         `◯ مـلاحـظـة :\n` +
                         `◉ سيقوم البوت الآن بمخاطبة القادمين الجدد\n` +
                         `———————————————\n` +
                         `◈ ─────────────── ◈\n` +
                         `│←› بـأوامـر: الإمـبـراطـور أيـمـن 👑`, threadID, messageID);
}
