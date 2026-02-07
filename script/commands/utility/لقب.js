/**
 * ═══════════════════════════════════════════════════════════════
 * 📓 KIRA SYSTEM - NICKNAME MANAGER
 * ───────────────────────────────────────────────────────────────
 * 🖋️ Developed with precision by: 𝓐𝓨Ꮇ𝓐𝓝 
 * ═══════════════════════════════════════════════════════════════
 */

module.exports.config = {
  name: "لقب",
  version: "1.1.0",
  hasPermssion: 0,
  credits: "𝐚𝐲𝐦𝐚𝐧",
  description: "تغيير لقبك أو لقب الشخص الذي تقوم بعمل منشن له في المجموعة",
  commandCategory: "الخدمات 📓",
  usages: "[اللقب الجديد] أو [@منشن اللقب الجديد]",
  cooldowns: 3
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID, senderID, mentions } = event;
  
  try {
    // 1. حالة تغيير لقب شخص آخر عبر المنشن
    if (Object.keys(mentions).length > 0) {
      let mentionID = Object.keys(mentions)[0];
      let replaceName = mentions[mentionID];
      let nickname = args.join(" ").replace(replaceName, "").trim();
      
      if (!nickname) return api.sendMessage("📓 يرجى كتابة اللقب الذي تريد وضعه بعد المنشن.", threadID, messageID);
      
      return api.changeNickname(nickname, threadID, mentionID, (err) => {
        if (err) return api.sendMessage("❌ لا يمكنني تغيير لقب هذا الشخص، قد لا أملك الصلاحيات الكافية.", threadID, messageID);
        api.setMessageReaction("✅", messageID, () => {}, true);
      });
    }
    
    // 2. حالة تغيير لقب المستخدم نفسه
    else {
      let nickname = args.join(" ");
      if (!nickname) return api.sendMessage("📓 يرجى كتابة اللقب الجديد الذي تريده.", threadID, messageID);
      
      return api.changeNickname(nickname, threadID, senderID, (err) => {
        if (err) return api.sendMessage("❌ حدث خطأ أثناء تغيير لقبك.", threadID, messageID);
        api.setMessageReaction("✅", messageID, () => {}, true);
      });
    }
  } catch (e) {
    console.error(e);
    api.sendMessage("❌ حدث خطأ غير متوقع في النظام.", threadID, messageID);
  }
};
