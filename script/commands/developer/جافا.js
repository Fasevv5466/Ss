module.exports.config = {
  name: "جافا",
  version: "1.0.5",
  hasPermssion: 2,
  credits: "Heba",
  description: "سحب ملفات البرمجة",
  commandCategory: "developer",
  usages: "[اسم الملف.js]",
  cooldowns: 2
};

module.exports.run = async ({ args, api, event, Users }) => {
  const fs = require("fs-extra");
  const stringSimilarity = require('string-similarity');
  const { threadID, messageID, senderID, type, messageReply } = event;

  const config = global.config || {};
  const botAdmins = config.MODERATORS || config.MODERATOR || [];
  
  if (!botAdmins.includes(senderID.toString())) {
    return api.sendMessage(
      `◈ ───« رفـض »─── ◈
│
◯ │ هـذا الأمـر
◯ │ لـلـمـطـور
◯ │ فـقـط
│
◈ ─────────────── ◈`,
      threadID, 
      messageID
    );
  }

  const file = args.join(" ");
  if (!file) {
    return api.sendMessage(
      `◈ ───« جـافـا »─── ◈
│
◯ │ يـرجـى
◯ │ كـتـابـة
◯ │ اسـم الـمـلـف
│
◈ ─────────────── ◈`,
      threadID, 
      messageID
    );
  }
  
  if (!file.endsWith('.js')) {
    return api.sendMessage(
      `◈ ───« خـطـأ »─── ◈
│
◯ │ يـجـب أن
◯ │ يـنـتـهـي
◯ │ بـ .js
│
◈ ─────────────── ◈`,
      threadID, 
      messageID
    );
  }

  const pathFile = __dirname + "/" + file;

  if (!fs.existsSync(pathFile)) {
    const allFiles = fs.readdirSync(__dirname).filter((f) => f.endsWith(".js")).map(item => item.replace(/\.js/g, ""));
    const checker = stringSimilarity.findBestMatch(file.replace(".js", ""), allFiles);
    const bestMatch = checker.bestMatch.target;

    if (checker.bestMatch.rating >= 0.4) {
      return api.sendMessage(
        `◈ ───« لـم أجـد »─── ◈
│
◯ │ لـم أجـد
◯ │ الـمـلـف
◯ │ هـل تـقـصـد
◯ │ ${bestMatch}.js ؟
◯ │ تـفـاعـل بـ 👍
◯ │ لـلإرسـال
│
◈ ─────────────── ◈`,
        threadID, 
        (error, info) => {
          global.client.handleReaction.push({
            name: this.config.name,
            author: senderID,
            messageID: info.messageID,
            file: bestMatch + ".js",
            type: type == "message_reply" ? "reply" : "normal",
            targetID: type == "message_reply" ? messageReply.senderID : threadID
          });
        }, 
        messageID
      );
    } else {
      return api.sendMessage(
        `◈ ───« لـم أجـد »─── ◈
│
◯ │ لـم أجـد
◯ │ أي مـلـف
◯ │ بـهـذا الأسـم
│
◈ ─────────────── ◈`,
        threadID, 
        messageID
      );
    }
  }

  return sendFile(api, threadID, messageID, file, type == "message_reply" ? messageReply.senderID : threadID, Users);
};

module.exports.handleReaction = async ({ api, event, handleReaction, Users }) => {
  const { file, author, targetID } = handleReaction;
  if (event.userID != author) return;

  api.unsendMessage(handleReaction.messageID);
  return sendFile(api, event.threadID, event.messageID, file, targetID, Users);
};

async function sendFile(api, threadID, messageID, file, targetID, Users) {
  const fs = require("fs-extra");
  const pathFile = __dirname + "/" + file;
  const pathTxt = __dirname + "/" + file.replace(".js", ".txt");

  try {
    fs.copyFileSync(pathFile, pathTxt);
    const userName = (await Users.getData(targetID))?.name || "سيدي";

    api.sendMessage({
      body: `◈ ───« جـافـا »─── ◈
│
◯ │ الـمـلـف : ${file}
◯ │ إلـى : ${userName}
◯ │ تـم الإرسـال
◯ │ بـنـجـاح
│
◈ ─────────────── ◈`,
      attachment: fs.createReadStream(pathTxt)
    }, targetID, (err) => {
      if (err) {
        api.sendMessage(
          `◈ ───« فـشـل »─── ◈
│
◯ │ فـشـل
◯ │ إرسـال
◯ │ الـمـلـف
│
◈ ─────────────── ◈`,
          threadID, 
          messageID
        );
      }
      else if (targetID !== threadID) {
        api.sendMessage(
          `◈ ───« تـم »─── ◈
│
◯ │ تـم إرسـال
◯ │ ${file}
◯ │ إلـى
◯ │ ${userName}
│
◈ ─────────────── ◈`,
          threadID, 
          messageID
        );
      }
      
      if (fs.existsSync(pathTxt)) fs.unlinkSync(pathTxt);
    });
  } catch (e) {
    api.sendMessage(
      `◈ ───« خـطـأ »─── ◈
│
◯ │ خـطـأ :
◯ │ ${e.message}
◯ │ فـي الإرسـال
│
◈ ─────────────── ◈`,
      threadID, 
      messageID
    );
  }
}
