const fs = require('fs');

module.exports.config = {
    name: "حذف",
    version: "3.0.0",
    hasPermssion: 0,
    credits: "هيبا",
    description: "حذف الرسائل",
    commandCategory: "admin",
    usages: "[عدد/كل] أو بالرد",
    cooldowns: 2
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID, type, messageReply } = event;

    if (type === "message_reply") {
        api.setMessageReaction("⏳", messageID, () => {}, true);
        try {
            await api.unsendMessage(messageReply.messageID);
            return api.setMessageReaction("✅", messageID, () => {}, true);
        } catch (e) {
            return api.sendMessage(
              `◈ ───« خـطـأ »─── ◈
│
◯ │ لا يـمـكـنـي
◯ │ حـذف هـذه
◯ │ الـرسـالـة
│
◈ ─────────────── ◈`,
              threadID, 
              messageID
            );
        }
    }

    if (args.length === 0) {
        return api.sendMessage(
          `◈ ───« حـذف »─── ◈
│
◯ │ .حـذـف [عـدد]
◯ │ لـحـذـف كـمـيـة
◯ │ .حـذف كـل
◯ │ لـتـنـظـيـف
◯ │ الـرد ع رسـالـة
◯ │ بـ .حـذف
◯ │ لـحـذـفـهـا
│
◈ ─────────────── ◈`,
          threadID, 
          messageID
        );
    }

    const target = args[0].toLowerCase();
    api.setMessageReaction("⏳", messageID, () => {}, true);

    try {
        let messagesToDelete = [];

        if (target === "كل") {
            messagesToDelete = await api.getThreadHistory(threadID, 50);
        } else {
            const count = parseInt(target);
            if (isNaN(count) || count < 1 || count > 100) {
                return api.sendMessage(
                  `◈ ───« خـطـأ »─── ◈
│
◯ │ يـرجـى
◯ │ رقـم
◯ │ مـن 1 إلـى 100
│
◈ ─────────────── ◈`,
                  threadID, 
                  messageID
                );
            }
            messagesToDelete = await api.getThreadHistory(threadID, count);
        }

        let deletedCount = 0;
        for (const msg of messagesToDelete) {
            try {
                await api.unsendMessage(msg.messageID);
                deletedCount++;
                await new Promise(res => setTimeout(res, 300));
            } catch (e) {}
        }

        api.setMessageReaction("✅", messageID, () => {}, true);
        const resMsg = await api.sendMessage(
          `◈ ───« حـذف »─── ◈
│
◯ │ تـم تـنـظـيـف
◯ │ ${deletedCount}
◯ │ رسـالـة
│
◈ ─────────────── ◈`,
          threadID
        );
        
        setTimeout(() => api.unsendMessage(resMsg.messageID), 5000);

    } catch (e) {
        return api.sendMessage(
          `◈ ───« خـطـأ »─── ◈
│
◯ │ خـطـأ
◯ │ فـي الـحـذف
│
◈ ─────────────── ◈`,
          threadID, 
          messageID
        );
    }
};

module.exports.handleEvent = async function({ api, event }) {
    if (event.type === "message_reaction" && event.reaction === "😡") {
        try {
            const msgInfo = await api.getMessageInfo(event.messageID);
            if (msgInfo.senderID === api.getCurrentUserID()) {
                await api.unsendMessage(event.messageID);
            }
        } catch (e) {}
    }
};
