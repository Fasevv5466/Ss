module.exports = function ({ api, models, Users, Threads, Currencies }) {
  const fs = require("fs");
  const path = require("path");
  const stringSimilarity = require("string-similarity"),
    escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    logger = require("../../utils/log.js");
  const moment = require("moment-timezone");

  return async function ({ event }) {
    const dateNow = Date.now();
    const time = moment.tz("Asia/Baghdad").format("HH:mm:ss DD/MM/YYYY");
    const { allowInbox, PREFIX, ADMINBOT, DeveloperMode, adminOnly, YASSIN } = global.config;

    const { userBanned, threadBanned, threadInfo, threadData, commandBanned } = global.data;
    const { commands, cooldowns } = global.client;

    var { body, senderID, threadID, messageID } = event;

    if (!body) return; 

    senderID = String(senderID);
    threadID = String(threadID);
    const threadSetting = threadData.get(threadID) || {};
    const prefix = threadSetting.hasOwnProperty("PREFIX") ? threadSetting.PREFIX : PREFIX;
    const prefixRegex = new RegExp(`^(<@!?${senderID}>|${escapeRegex(prefix)})\\s*`);

    const [matchedPrefix] = body.match(prefixRegex) || [null];
    if (!matchedPrefix) return;
    const args = body.slice(matchedPrefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    var command = commands.get(commandName);
    
    if (threadBanned.has(threadID) && !ADMINBOT.includes(senderID)) return;
    if (userBanned.has(senderID) && !ADMINBOT.includes(senderID)) return;
    if (YASSIN === "true" && !ADMINBOT.includes(senderID)) return;

    if (!command) {
      var allCommandName = Array.from(commands.keys());
      const checker = stringSimilarity.findBestMatch(commandName, allCommandName);

      if (checker.bestMatch.rating >= 0.8) {
        command = commands.get(checker.bestMatch.target);
      } else if (matchedPrefix) {

        const closestMatch = checker.bestMatch.target;
        const funnyReplies = [
          `📓 ───────────────\n  ┝  خطأ: "${commandName}" غير مسجل\n  ┝  قصدك: '${closestMatch}'؟\n📓 ───────────────`,
          `📓 ───────────────\n  ┝  ابحث عن اسم آخر..\n  ┝  جرب: '${closestMatch}'\n📓 ───────────────`,
          `📓 ───────────────\n  ┝  خطأ في العنوان!\n  ┝  ربما تقصد: '${closestMatch}'؟\n📓 ───────────────`,
          `📓 ───────────────\n  ┝  نظامي لا يدعم هراءك\n  ┝  استخدم: '${closestMatch}'\n📓 ───────────────`,
          `📓 ───────────────\n  ┝  توقف عن العبث\n  ┝  الأمر الصحيح: '${closestMatch}'\n📓 ───────────────`
        ];

        return api.sendMessage(
          funnyReplies[Math.floor(Math.random() * funnyReplies.length)],
          threadID,
          messageID
        );
      }
    }

    if (commandBanned.get(threadID) || commandBanned.get(senderID)) {
      if (!ADMINBOT.includes(senderID)) {
        const banThreads = commandBanned.get(threadID) || [];
        const banUsers = commandBanned.get(senderID) || [];
        if (banThreads.includes(command.config.name)) {
          return api.sendMessage(`📓 ───────────────\n  ┝  تنبيه: محظور هنا!\n  ┝  الأمر: ${command.config.name}\n📓 ───────────────`, threadID, messageID);
        } else if (banUsers.includes(command.config.name)) {
          return api.sendMessage(`📓 ───────────────\n  ┝  تنبيه: أنت محظور!\n  ┝  القرار: قطعي\n📓 ───────────────`, threadID, messageID);
        }
      }
    }

    if (command.config.commandCategory.toLowerCase() == "nsfw" && !global.data.threadAllowNSFW.includes(threadID) && !ADMINBOT.includes(senderID)) {
      return api.sendMessage(`📓 ───────────────\n  ┝  تنبيه: محتوى مقيد\n  ┝  الحالة: غير مسموح\n📓 ───────────────`, threadID, messageID);
    }

    var permssion = 0;
    const threadInfoo2 = threadInfo.get(threadID) || (await Threads.getInfo(threadID));
    const find = threadInfoo2.adminIDs.find((el) => el.id == senderID);
    if (ADMINBOT.includes(senderID.toString())) permssion = 2;
    else if (find) permssion = 1;

    if (command.config.hasPermssion > permssion) {
      return api.sendMessage(`📓 ───────────────\n  ┝  تنبيه: الصلاحية!\n  ┝  الحالة: لا تملك حق العبث\n📓 ───────────────`, event.threadID, event.messageID);
    }

    if (!client.cooldowns.has(command.config.name)) {
      client.cooldowns.set(command.config.name, new Map());
    }
    const timestamps = client.cooldowns.get(command.config.name);
    const expirationTime = (command.config.cooldowns || 1) * 1000;
    if (timestamps.has(senderID) && dateNow < timestamps.get(senderID) + expirationTime) {
      return api.setMessageReaction("⏳", event.messageID, () => {}, true);
    }

    try {
      const Obj = { api, event, args, models, Users, Threads, Currencies, permssion, getText: () => {} };
      command.run(Obj);
      timestamps.set(senderID, dateNow);
      return;
    } catch (e) {
      return api.sendMessage(`📓 ───────────────\n  ┝  تنبيه: خطأ تقني\n  ┝  السبب: معالجة الطلب\n📓 ───────────────`, threadID);
    }
  };
};
