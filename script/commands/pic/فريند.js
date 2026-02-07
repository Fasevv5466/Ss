module.exports.config = {
  name: "فريند",
  version: "2.1.0",
  hasPermssion: 2,
  credits: "Heba",
  description: "إدارة الأصدقاء",
  commandCategory: "developer",
  usages: "فريند أو فريند [اسم]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const config = global.config || {};
  const botAdmins = config.MODERATORS || config.MODERATOR || [];

  if (!botAdmins.includes(senderID.toString())) {
    return api.sendMessage(
      `◈ ───« رفـض »─── ◈
│
◯ │ هـذا الأمـر لـلـمـطـور فـقـط
◯ │ لـيـس لـديك صـلاحـيـات
◯ │ اتـصـل بـالإدارة
│
◈ ─────────────── ◈`,
      threadID, 
      messageID
    );
  }

  try {
    const friends = await api.getFriendsList();
    if (!friends || friends.length === 0) {
      return api.sendMessage(
        `◈ ───« فـارغ »─── ◈
│
◯ │ لـيـس لـدي أصـدقـاء
◯ │ الـقـائـمـة فـارغـة
│
◈ ─────────────── ◈`,
        threadID, 
        messageID
      );
    }

    let searchName = args.join(" ").toLowerCase();
    let filteredFriends = searchName 
      ? friends.filter(f => f.fullName.toLowerCase().includes(searchName)) 
      : friends.slice(0, 20);

    if (filteredFriends.length === 0) {
      return api.sendMessage(
        `◈ ───« لـم أجـد »─── ◈
│
◯ │ لـم أجـد : ${searchName}
◯ │ جـرب اسـم آخـر
◯ │ أو لا تـبـحـث
│
◈ ─────────────── ◈`,
        threadID, 
        messageID
      );
    }

    let msg = `◈ ───« الأصـدقـاء »─── ◈\n│\n`;
    let uids = [];
    
    filteredFriends.forEach((friend, i) => {
      msg += `◯ │ ${i + 1}. ${friend.fullName}\n`;
      uids.push(friend.userID);
    });

    msg += `│\n◈ ─────────────── ◈\n`;
    msg += `◯ │ 💡 رد بـرقـم لـحـذفـه\n`;
    msg += `◯ │ 💡 رد بـكـل لـحـذف الـكـل\n`;
    msg += `◯ │ 💡 رد بـغـاء للإلـغـاء\n`;
    msg += `◯ │ الـعـدد : ${uids.length}\n`;
    msg += `◈ ─────────────── ◈`;

    return api.sendMessage(msg, threadID, (err, info) => {
      global.client.handleReply.push({
        name: this.config.name,
        author: senderID,
        messageID: info.messageID,
        uids: uids,
        type: "delete_choice"
      });
    }, messageID);

  } catch (e) {
    return api.sendMessage(
      `◈ ───« خـطـأ »─── ◈
│
◯ │ حـدث خـطـأ
◯ │ فـي جـلـب الـبـيـانـات
│
◈ ─────────────── ◈`,
      threadID, 
      messageID
    );
  }
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
  const { threadID, messageID, senderID, body } = event;
  if (String(senderID) !== String(handleReply.author)) return;

  if (body === "الغاء") {
    api.unsendMessage(handleReply.messageID);
    return api.sendMessage(
      `◈ ───« إلـغـاء »─── ◈
│
◯ │ تـم الإلـغـاء
◯ │ بـنـجـاح
│
◈ ─────────────── ◈`,
      threadID
    );
  }

  if (body === "الكل") {
    api.unsendMessage(handleReply.messageID);
    api.sendMessage(
      `◈ ───« جـاري »─── ◈
│
◯ │ جـاري الـحـذف
◯ │ الـجـمـيـع
│
◈ ─────────────── ◈`,
      threadID
    );
    
    let count = 0;
    for (const uid of handleReply.uids) {
      try { 
        await api.unfriend(uid); 
        count++; 
      } catch (e) {}
    }
    
    return api.sendMessage(
      `◈ ───« تـم »─── ◈
│
◯ │ تـم حـذف : ${count}
◯ │ مـن الـقـائـمـة
│
◈ ─────────────── ◈`,
      threadID
    );
  }

  const selected = body.split(/\s+/).map(n => parseInt(n)).filter(n => !isNaN(n) && n > 0 && n <= handleReply.uids.length);
  
  if (selected.length === 0) return;

  let success = 0;
  for (const index of selected) {
    try {
      await api.unfriend(handleReply.uids[index - 1]);
      success++;
    } catch (e) {}
  }

  api.unsendMessage(handleReply.messageID);
  return api.sendMessage(
    `◈ ───« نـجـاح »─── ◈
│
◯ │ تـم حـذف : ${success}
◯ │ بـنـجـاح
│
◈ ─────────────── ◈`,
    threadID
  );
};
