module.exports.config = {
  name: "لاست",
  version: '1.0.1',
  credits: 'Ayman',
  hasPermssion: 2,
  description: 'قائمة المجموعات التي يتواجد فيها البوت',
  commandCategory: 'developer',
  usages: 'لاست',
  cooldowns: 15
};

module.exports.handleReply = async function({ api, event, args, Threads, handleReply }) {
  const config = global.config || {};
  const botAdmins = config.MODERATORS || config.MODERATOR || [];
  
  if (!botAdmins.includes(event.senderID.toString())) return;

  const arg = event.body.split(" ");
  const idgr = handleReply.groupid[arg[1] - 1];

  switch (handleReply.type) {
    case "reply":
      if (arg[0] === "حظر") {
        const data = (await Threads.getData(idgr)).data || {};
        data.banned = 1;
        await Threads.setData(idgr, { data });
        global.data.threadBanned.set(parseInt(idgr), 1);
        api.sendMessage(
          `◈ ───« تـم الـحـظـر »─── ◈
│
◯ │ تـم حـظـر الـمـجـمـوعـة بـنـجـاح
◯ │ مـعـرف الـمـجـمـوعـة : ${idgr}
◯ │ تـاريـخ الـحـظـر : ${new Date().toLocaleString()}
◯ │ الـمـحـظـور مـن : إرسـال رسـائـل
◯ │ مـدة الـحـظـر : غـيـر مـحـدودة
◯ │ الـسـبـب : قـرار مـن إدارة الـبـوت
◯ │ تـذكـيـر : يـمـكـن إزالـة الـحـظـر مـن الإدارة
│
◈ ─────────────── ◈`,
          event.threadID, 
          event.messageID
        );
        break;
      }

      if (arg[0] === "خروج" || arg[0] === "غادري") {
        await api.removeUserFromGroup(`${api.getCurrentUserID()}`, idgr);
        const threadName = (await Threads.getData(idgr)).name || "اسم غير متوفر";
        api.sendMessage(
          `◈ ───« تـم الـخـروج »─── ◈
│
◯ │ تـم الـخـروج بـنـجـاح مـن الـمـجـمـوعـة
◯ │ اسـم الـمـجـمـوعـة : ${threadName}
◯ │ مـعـرف الـمـجـمـوعـة : ${idgr}
◯ │ تـاريـخ الـخـروج : ${new Date().toLocaleString()}
◯ │ سـبـب الـخـروج : أمـر مـن الإدارة
◯ │ تـذكـيـر : يـمـكـن الـعـودة مـجـدداً لاحـقاً
◯ │ شـكـراً لـكـم عـلـى الـوقـت الـجـمـيـل
│
◈ ─────────────── ◈`,
          event.threadID, 
          event.messageID
        );
        break;
      }
      break;
  }
};

module.exports.run = async function({ api, event, Threads }) {
  const config = global.config || {};
  const botAdmins = config.MODERATORS || config.MODERATOR || [];
  
  if (!botAdmins.includes(event.senderID.toString())) {
    return api.sendMessage(
      `◈ ───« رفـض دخـول »─── ◈
│
◯ │ عـذراً، هـذا الأمـر مـخـصـص فـقـط
◯ │ لإدارة الـبـوت والـمـطـوريـن الـمـسـؤوليـن
◯ │ لـيـس لـديك صـلاحـيـات لاسـتـخـدام هـذا الأمـر
◯ │ يـرجـى الـتـوجـه لـلإدارة لـلـمـزيـد مـن المـعـلـومـات
◯ │ شـكـراً لـفـهـمـك ولـتـعـاونـك الـقـيـم
│
◈ ─────────────── ◈`,
      event.threadID, 
      event.messageID
    );
  }

  const inbox = await api.getThreadList(100, null, ['INBOX']);
  const list = [...inbox].filter(group => group.isSubscribed && group.isGroup);

  let listthread = [];

  for (const groupInfo of list) {
    const data = await api.getThreadInfo(groupInfo.threadID);
    listthread.push({
      id: groupInfo.threadID,
      name: groupInfo.name,
      sotv: data.userInfo.length,
    });
  }

  const listbox = listthread.sort((a, b) => b.sotv - a.sotv);

  let msg = '◈ ───« قـائـمـة الـمـجـمـوعـات »─── ◈\n│\n';
  let i = 1;
  const groupid = [];

  for (const group of listbox) {
    msg += `◯ │ ${i++}. ${group.name}\n`;
    msg += `◯ │   الـمـعـرف : ${group.id}\n`;
    msg += `◯ │   الأعـضـاء : ${group.sotv}\n`;
    msg += `◯ │   ــــــــــــــــــــــــــ\n`;
    groupid.push(group.id);
  }

  msg += `│\n`;
  msg += `◯ │ 💡 ردد بـ "خـروج" + رقـم الـمـجـمـوعـة لـلـخـروج\n`;
  msg += `◯ │ 💡 ردد بـ "حـظـر" + رقـم الـمـجـمـوعـة لـحـظـرهـا\n`;
  msg += `◯ │ 💡 عـدد الـمـجـمـوعـات : ${groupid.length}\n`;
  msg += `◯ │ 💡 أقـدم مـجـمـوعـة : ${listbox[0]?.name || "غير متوفر"}\n`;
  msg += `◯ │ 💡 أكـبـر مـجـمـوعـة : ${Math.max(...listbox.map(g => g.sotv))} عـضـو\n`;
  msg += `◯ │ 💡 أصـغـر مـجـمـوعـة : ${Math.min(...listbox.map(g => g.sotv))} عـضـو\n`;
  msg += `│\n◈ ─────────────── ◈`;

  api.sendMessage(msg, event.threadID, (e, data) => {
    api.setMessageReaction("✅", event.messageID, () => {}, true);
    global.client.handleReply.push({
      name: this.config.name,
      author: event.senderID,
      messageID: data.messageID,
      groupid,
      type: 'reply'
    });
  });
};
