module.exports.config = {
  name: "لاست",
  version: "1.1.0",
  credits: "Ayman",
  hasPermssion: 2,
  description: "عرض المجموعات والتحكم بها",
  commandCategory: "developer",
  usages: "لاست",
  cooldowns: 5
};

module.exports.handleReply = async function({ api, event, Threads, handleReply }) {
  if (event.senderID != "61577861540407") return;
  const { body, threadID, messageID } = event;
  const arg = body.split(" ");
  const idgr = handleReply.groupid[arg[1] - 1];
  const header = `⌬ ━━━━━━━━━━━━ ⌬`;

  if (!idgr) return api.sendMessage(`${header}\n⚠️ رقـم الـمـجـمـوعـة غـيـر صـحـيـح.`, threadID, messageID);

  if (arg[0] === "حظر") {
    const data = (await Threads.getData(idgr)).data || {};
    data.banned = 1;
    await Threads.setData(idgr, { data });
    global.data.threadBanned.set(parseInt(idgr), 1);
    return api.sendMessage(`${header}\n✅ تـم حـظـر الـمـجـمـوعـة:\n⪼ ${idgr}`, threadID, messageID);
  }

  if (arg[0] === "خروج" || arg[0] === "غادري") {
    await api.removeUserFromGroup(api.getCurrentUserID(), idgr);
    return api.sendMessage(`${header}\n✅ تـم الـخـروج مـن الـمـجـمـوعـة بـنـجـاح.`, threadID, messageID);
  }
};

module.exports.run = async function({ api, event }) {
  if (event.senderID != "61577861540407") return;
  const header = `⌬ ━━━━━━━━━━━━ ⌬\n      ⚙️ قـائـمـة الـمـجـمـوعات\n⌬ ━━━━━━━━━━━━ ⌬`;
  
  const inbox = await api.getThreadList(50, null, ['INBOX']);
  const list = inbox.filter(g => g.isSubscribed && g.isGroup);
  
  let msg = `${header}\n`, groupid = [], i = 1;

  for (const g of list) {
    msg += `${i++}. ${g.name}\n⪼ عـدد: ${g.participantIDs.length} | ID: ${g.threadID}\n\n`;
    groupid.push(g.threadID);
  }

  msg += `⌬ ━━━━━━━━━━━━ ⌬\n💡 رد بـ (خروج أو حظر) + الـرقـم`;

  return api.sendMessage(msg, event.threadID, (e, info) => {
    global.client.handleReply.push({
      name: this.config.name,
      messageID: info.messageID,
      groupid,
      type: 'reply'
    });
  }, event.messageID);
};
