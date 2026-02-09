module.exports.config = {
  name: "فريند",
  version: "2.2.0",
  hasPermssion: 2,
  credits: "ايمن",
  description: "إدارة قائمة الأصدقاء (حذف، بحث، تنظيف)",
  commandCategory: "developer",
  usages: "فريند [اسم أو بدون]",
  cooldowns: 5
};

module.exports.handleReply = async function({ api, event, handleReply }) {
  const { threadID, messageID, senderID, body } = event;
  if (senderID != handleReply.author) return;

  const choice = body.toLowerCase();
  if (choice === "الغاء") {
    api.unsendMessage(handleReply.messageID);
    return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 ━━ ⌬\n\nتم إلغاء العملية.", threadID);
  }

  if (choice === "الكل") {
    let count = 0;
    for (let uid of handleReply.uids) {
      try { await api.unfriend(uid); count++; } catch (e) {}
    }
    api.unsendMessage(handleReply.messageID);
    return api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 ━━ ⌬\n\n✅ تم حذف ${count} صديق بنجاح.`, threadID);
  }

  const num = parseInt(choice);
  if (!isNaN(num) && num > 0 && num <= handleReply.uids.length) {
    const uid = handleReply.uids[num - 1];
    try {
      await api.unfriend(uid);
      api.unsendMessage(handleReply.messageID);
      return api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 ━━ ⌬\n\n✅ تم حذف الصديق رقم [${num}] بنجاح.`, threadID);
    } catch (e) {
      return api.sendMessage("❌ فشل الحذف.", threadID);
    }
  }
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID, senderID } = event;

  if (!global.config.ADMINBOT.includes(senderID)) return;

  try {
    const friends = await api.getFriendsList();
    if (!friends || friends.length === 0) return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 ━━ ⌬\n\nلا يوجد أصدقاء حالياً.", threadID);

    let search = args.join(" ").toLowerCase();
    let filtered = search ? friends.filter(f => f.fullName.toLowerCase().includes(search)) : friends.slice(0, 20);

    if (filtered.length === 0) return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 ━━ ⌬\n\nلا توجد نتائج.", threadID);

    let msg = `⌬ ━━ 𝗞𝗜𝗥𝗔 𝗗𝗘𝗩 ━━ ⌬\n\n`;
    let uids = [];
    
    filtered.forEach((f, i) => {
      msg += `${i + 1}. ${f.fullName}\n`;
      uids.push(f.userID);
    });

    msg += `\nرد بـ [رقم] أو [الكل] أو [الغاء]`;

    return api.sendMessage(msg, threadID, (err, info) => {
      global.client.handleReply.push({
        name: this.config.name,
        author: senderID,
        messageID: info.messageID,
        uids: uids
      });
    }, messageID);

  } catch (e) {
    return api.sendMessage("❌ خطأ في جلب البيانات.", threadID);
  }
};
