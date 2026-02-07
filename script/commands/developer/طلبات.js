module.exports.config = {
  name: "طلبات",
  version: "1.1.0",
  hasPermssion: 2,
  credits: "Heba",
  description: "إدارة طلبات المجموعات",
  commandCategory: "developer",
  usages: "طلبات",
  cooldowns: 5
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
  const { threadID, messageID, senderID, body } = event;
  const config = global.config || {};
  const botAdmins = config.MODERATORS || config.MODERATOR || [];
  
  if (!botAdmins.includes(senderID.toString())) return;

  const args = body.split(" ");
  const action = args[0].toLowerCase();
  const nums = args.slice(1).map(n => parseInt(n)).filter(n => !isNaN(n));

  if (nums.length === 0) return;

  const emojiNumbers = ["0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];
  let remaining = nums.length;
  let msg = "";

  api.setMessageReaction(remaining <= 10 ? emojiNumbers[remaining] : "⏳", messageID, () => {}, true);

  try {
    for (let num of nums) {
      let index = num - 1;
      if (!handleReply.listRequest[index]) continue;
      
      let tid = handleReply.listRequest[index].threadID;
      let name = handleReply.listRequest[index].name;

      if (action === "قبول" || action === "اوافق") {
        await api.sendMessage(
          `◈ ───« مـرحـبـاً »─── ◈
│
◯ │ تـم قـبـول
◯ │ طـلـب الانـضـمام
◯ │ شـكـراً لـك
│
◈ ─────────────── ◈`,
          tid
        );
        msg += `✅ ${name}\n`;
      } else if (action === "رفض" || action === "ارفض") {
        await api.deleteThread(tid);
        msg += `❌ ${name}\n`;
      }

      remaining--;
      if (remaining >= 0) {
        api.setMessageReaction(remaining <= 10 ? emojiNumbers[remaining] : "⏳", messageID, () => {}, true);
      }
    }

    api.setMessageReaction("✅", messageID, () => {}, true);
    api.unsendMessage(handleReply.messageID);
    return api.sendMessage(
      `◈ ───« نـتـيـجـة »─── ◈
│
◯ │ ${msg}
◯ │ تـم الـمـعـالـجـة
│
◈ ─────────────── ◈`,
      threadID
    );

  } catch (e) {
    return api.sendMessage(
      `◈ ───« خـطـأ »─── ◈
│
◯ │ خـطـأ : ${e.message}
◯ │ فـي الـمـعـالـجـة
│
◈ ─────────────── ◈`,
      threadID, 
      messageID
    );
  }
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID, senderID } = event;
  const config = global.config || {};
  const botAdmins = config.MODERATORS || config.MODERATOR || [];

  if (!botAdmins.includes(senderID.toString())) {
    return api.sendMessage(
      `◈ ───« رفـض »─── ◈
│
◯ │ هـذا الأمـر
◯ │ لـلـمـطـور فـقـط
│
◈ ─────────────── ◈`,
      threadID, 
      messageID
    );
  }

  api.setMessageReaction("🔍", messageID, () => {}, true);

  try {
    api.getThreadList(50, null, ["PENDING"], (err, list) => {
      if (err) list = [];
      api.getThreadList(50, null, ["OTHER"], (err2, list2) => {
        if (err2) list2 = [];
        
        const combined = [...list, ...list2];
        const listRequest = combined.filter(t => t.isGroup && t.isSubscribed);

        if (listRequest.length === 0) {
          api.setMessageReaction("❌", messageID, () => {}, true);
          return api.sendMessage(
            `◈ ───« فـارغ »─── ◈
│
◯ │ لا تـوجـد
◯ │ طـلـبـات
│
◈ ─────────────── ◈`,
            threadID, 
            messageID
          );
        }

        let msg = `◈ ───« الـطـلـبـات »─── ◈\n│\n`;
        let listForReply = [];

        for (let i = 0; i < listRequest.length; i++) {
          let name = listRequest[i].name || "بـلا اسـم";
          let id = listRequest[i].threadID;
          msg += `◯ │ ${i + 1}. ${name}\n`;
          msg += `◯ │   آيـدي : ${id}\n`;
          listForReply.push({ threadID: id, name: name });
        }

        msg += `│\n◈ ─────────────── ◈\n`;
        msg += `◯ │ رد بـ (قـبـول رقـم)\n`;
        msg += `◯ │ أو (رفـض رقـم)\n`;
        msg += `◯ │ الـعـدد : ${listRequest.length}\n`;
        msg += `◈ ─────────────── ◈`;

        api.setMessageReaction("✅", messageID, () => {}, true);
        return api.sendMessage(msg, threadID, (e, data) => {
          global.client.handleReply.push({
            name: "طلبات",
            author: senderID,
            messageID: data.messageID,
            listRequest: listForReply
          });
        }, messageID);
      });
    });

  } catch (e) {
    return api.sendMessage(
      `◈ ───« خـطـأ »─── ◈
│
◯ │ فـشـل : ${e.message}
◯ │ فـي الـجـلـب
│
◈ ─────────────── ◈`,
      threadID, 
      messageID
    );
  }
};
