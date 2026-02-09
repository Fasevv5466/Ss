module.exports.config = {
  name: "تقييم",
  version: "1.0.0",
  hasPermssion: 2,
  credits: "ايمن",
  description: "تنفيذ كود JavaScript",
  commandCategory: "developer",
  usages: "[كود]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
  const { threadID, messageID, senderID } = event;
  const adminBot = global.config.ADMINBOT[0];

  if (senderID !== adminBot) {
    return api.sendMessage(
      "⌬ ━━ 𝗞𝗜𝗥𝗔 DEVELOPER ━━ ⌬\n\n❌ هذا الأمر مخصص للمطور فقط",
      threadID,
      messageID
    );
  }

  const code = args.join(" ");
  
  if (!code) {
    return api.sendMessage(
      "⌬ ━━ 𝗞𝗜𝗥𝗔 DEVELOPER ━━ ⌬\n\n⚠️ يرجى إدخال الكود المراد تنفيذه",
      threadID,
      messageID
    );
  }

  try {
    let result = eval(code);
    
    if (result instanceof Promise) {
      result = await result;
    }

    if (typeof result !== "string") {
      result = require("util").inspect(result, { depth: 1 });
    }

    return api.sendMessage(
      `⌬ ━━ 𝗞𝗜𝗥𝗔 DEVELOPER ━━ ⌬\n\n✅ النتيجة:\n\n${result}`,
      threadID,
      messageID
    );

  } catch (error) {
    return api.sendMessage(
      `⌬ ━━ 𝗞𝗜𝗥𝗔 DEVELOPER ━━ ⌬\n\n❌ حدث خطأ:\n\n${error.message}`,
      threadID,
      messageID
    );
  }
};
