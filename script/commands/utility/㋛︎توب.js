// ═══════════════════════════════════════════════════════════
// 👑 KIRA - توب
// المطور: Ayman ♛
// الوصف: عرض قائمة النخبة (الأموال / المجموعات / التفاعل)
// ═══════════════════════════════════════════════════════════

module.exports.config = {
  name: "توب",
  aliases: [],
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Ayman ♛",
  description: "عرض قائمة النخبة (الأموال / المجموعات / التفاعل)",
  commandCategory: "utility",
  usages: "[الاموال / المجموعات / التفاعل]",
  cooldowns: 5
};

module.exports.run = async ({ event, api, args, Currencies, Users }) => {
  const { threadID, messageID } = event;
  const topLimit = parseInt(args[1]) || 10;

  // --- توب المجموعات (حصن الممالك) ---
  if (args[0] == "المجموعات" || args[0] == "groups") {
    let threadList = [];
    try {
      const data = await api.getThreadList(50, null, ["INBOX"]);
      for (const thread of data) {
        if (thread.isGroup) {
          threadList.push({ name: thread.name, count: thread.messageCount });
        }
      }
    } catch (e) { return console.log(e); }

    threadList.sort((a, b) => b.count - a.count);
    let msg = `◈ ───『 حـصون الإمـبـراطـوريـة 』─── ◈\n\n`;
    for (let i = 0; i < Math.min(topLimit, threadList.length); i++) {
      msg += `${i + 1}. ${threadList[i].name} ← {${threadList[i].count}} رسالة\n`;
    }
    msg += `\n│←› الـرقابة: الـتـوب ايـمـن 👑\n◈ ──────────────── ◈`;
    return api.sendMessage(msg, threadID, messageID);
  }

  // --- توب التفاعل (النخبة النشطة) ---
  else if (args[0] == "التفاعل" || args[0] == "level") {
    let allUsers = await Currencies.getAll(["userID", "exp"]);
    allUsers.sort((a, b) => b.exp - a.exp);
    
    let msg = `◈ ───『 نـخـبـة الـتـفاعـل 』─── ◈\n\n`;
    for (let i = 0; i < Math.min(topLimit, allUsers.length); i++) {
      const name = (await Users.getData(allUsers[i].userID)).name || "مستخدم غير معروف";
      msg += `${i + 1}. ${name} ← [${allUsers[i].exp}] نقطة\n`;
    }
    msg += `\n│←› الإدارة: الـتـوب ايـمـن 👑\n◈ ──────────────── ◈`;
    return api.sendMessage(msg, threadID, messageID);
  }

  // --- توب الأموال (خزائن الرعية) ---
  else if (args[0] == "الاموال" || args[0] == "money") {
    let allMoney = await Currencies.getAll(["userID", "money"]);
    allMoney.sort((a, b) => b.money - a.money);

    let msg = `◈ ───『 خـزائن الإمـبـراطـوريـة 』─── ◈\n\n`;
    for (let i = 0; i < Math.min(topLimit, allMoney.length); i++) {
      const name = (await Users.getData(allMoney[i].userID)).name || "مستخدم غير معروف";
      msg += `${i + 1}. ${name} ← {${allMoney[i].money}$}\n`;
    }
    msg += `\n💰 جـميع الأمـوال بـأمر مـن الـتـوب ايـمـن 👑\n◈ ──────────────── ◈`;
    return api.sendMessage(msg, threadID, messageID);
  }

  // --- رسالة المساعدة في حال الخطأ ---
  else {
    return api.sendMessage(`◈ ───『 تـنـبـيـه 』─── ◈\n\n⚠️ سيدي، يرجى تحديد نوع القائمة:\n← توب الاموال\n← توب المجموعات\n← توب التفاعل\n\n◈ ──────────────── ◈`, threadID, messageID);
  }
};
