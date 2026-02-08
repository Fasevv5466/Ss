// ═══════════════════════════════════════════════════════════
// 👑 KIRA - حماية
// المطور: Ayman ♛
// الوصف: تفعيل نظام الحماية الإمبراطوري (الاسم، الصورة، المسؤولين)
// ═══════════════════════════════════════════════════════════

module.exports.config = {
  name: "حماية",
  aliases: [],
  version: "2.0.0",
  hasPermssion: 1,
  credits: "Ayman ♛",
  description: "تفعيل نظام الحماية الإمبراطوري (الاسم، الصورة، المسؤولين)",
  commandCategory: "utility",
  usages: "[تشغيل / إيقاف]",
  cooldowns: 5
};

module.exports.run = async ({ api, event, Threads }) => {
    const { threadID, messageID } = event;
    const botID = api.getCurrentUserID();
    
    // 🛡️ التحقق من صلاحيات البوت
    const threadInfo = await api.getThreadInfo(threadID);
    if (!threadInfo.adminIDs.some(item => item.id == botID)) {
      return api.sendMessage("◈ ───『 تـنـبـيـه مـلـكـي 』─── ◈\n\n◯ سيدي، يجب ترقية البوت لمسؤول أولاً لتفعيل جدار الحماية.\n———————————————\n◈ ─────────────── ◈", threadID, messageID);
    }

    let data = (await Threads.getData(threadID)).data || {};
    
    // تبديل حالة الحماية
    if (typeof data["guard"] == "undefined" || data["guard"] == false) {
        data["guard"] = true;
    } else {
        data["guard"] = false;
    }

    await Threads.setData(threadID, { data });
    global.data.threadData.set(threadID, data);

    const status = (data["guard"] == true) ? "تـفـعـيـل ✅" : "إيـقـاف ❌";
    
    return api.sendMessage(`◈ ───『 جـدار الـحـمـايـة 』─── ◈\n\n◯ الـحـالـة : ${status}\n◉ الـنظام: حـماية الإدارة والـخصائص\n———————————————\n◯ مـلاحـظـة :\n◉ سيمنع البوت أي محاولة لتغيير إعدادات المجموعة.\n———————————————\n◈ ─────────────── ◈\n│←› بـأوامـر: الإمـبـراطـور أيـمـن 👑`, threadID, messageID);
};
