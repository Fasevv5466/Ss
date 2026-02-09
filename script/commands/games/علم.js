const axios = require("axios");

module.exports.config = {
  name: "علم",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "ايمن",
  description: "لعبة تخمين أعلام الدول",
  commandCategory: "games",
  usages: "علم",
  cooldowns: 5
};

module.exports.handleReply = async function({ api, event, handleReply, Users, Currencies }) {
  const { threadID, messageID, senderID, body } = event;

  if (handleReply.author !== senderID) return;

  const userAnswer = body.toLowerCase().trim();
  const correctAnswer = handleReply.country.toLowerCase();

  const coinsReward = 250;

  if (userAnswer === correctAnswer) {
    await Currencies.increaseMoney(senderID, coinsReward);
    
    api.unsendMessage(handleReply.messageID);
    
    return api.sendMessage(
      `⌬ ━━ 𝗞𝗜𝗥𝗔 GAMES ━━ ⌬\n\n🎉 إجابة صحيحة!\n\n🏆 المحاولة: ${handleReply.attempts + 1}\n💰 المكافأة: ${coinsReward} عملة\n🌍 الدولة: ${handleReply.country}`,
      threadID,
      messageID
    );
  } else {
    if (handleReply.attempts < 4) {
      handleReply.attempts++;
      
      return api.sendMessage(
        `⌬ ━━ 𝗞𝗜𝗥𝗔 GAMES ━━ ⌬\n\n❌ إجابة خاطئة!\n\n🔄 المحاولة: ${handleReply.attempts}/5\n💡 حاول مرة أخرى`,
        threadID,
        (err, info) => {
          if (!err) {
            global.client.handleReply.push({
              name: this.config.name,
              messageID: info.messageID,
              author: senderID,
              country: handleReply.country,
              attempts: handleReply.attempts
            });
          }
        },
        messageID
      );
    } else {
      api.unsendMessage(handleReply.messageID);
      
      return api.sendMessage(
        `⌬ ━━ 𝗞𝗜𝗥𝗔 GAMES ━━ ⌬\n\n😔 انتهت المحاولات!\n\n🌍 الإجابة الصحيحة: ${handleReply.country}`,
        threadID,
        messageID
      );
    }
  }
};

module.exports.run = async function({ api, event }) {
  const { threadID, messageID, senderID } = event;

  try {
    const apiUrl = "https://catbox-mnib.onrender.com/flag";
    const { data } = await axios.get(apiUrl);

    if (!data || !data.link || !data.name) {
      throw new Error("فشل الحصول على بيانات العلم");
    }

    const streamURL = (await axios.get(data.link, { responseType: "stream" })).data;

    return api.sendMessage(
      {
        body: `⌬ ━━ 𝗞𝗜𝗥𝗔 GAMES ━━ ⌬\n\n🎮 لعبة تخمين العلم\n\n❓ ما هي الدولة صاحبة هذا العلم؟\n📊 المحاولات: 1/5\n\nقم بالرد على هذه الرسالة بالإجابة`,
        attachment: streamURL
      },
      threadID,
      (err, info) => {
        if (!err) {
          global.client.handleReply.push({
            name: this.config.name,
            messageID: info.messageID,
            author: senderID,
            country: data.name,
            attempts: 1
          });
        }
      },
      messageID
    );

  } catch (error) {
    console.error("علم - خطأ:", error);
    return api.sendMessage(
      `⌬ ━━ 𝗞𝗜𝗥𝗔 GAMES ━━ ⌬\n\n❌ حدث خطأ أثناء تحميل اللعبة\n📝 ${error.message}`,
      threadID,
      messageID
    );
  }
};

