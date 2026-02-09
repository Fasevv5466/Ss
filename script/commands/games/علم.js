const axios = require("axios");

module.exports.config = {
  name: "علم",
  version: "1.1.0",
  hasPermssion: 0,
  credits: "ايمن",
  description: "لعبة تخمين أعلام الدول (نسخة مستقرة)",
  commandCategory: "games",
  usages: "علم",
  cooldowns: 5
};

module.exports.handleReply = async function({ api, event, handleReply, Currencies }) {
  const { threadID, messageID, senderID, body } = event;

  if (handleReply.author !== senderID) return;

  const userAnswer = body.toLowerCase().trim();
  const correctAnswer = handleReply.country.toLowerCase().trim();

  const coinsReward = 500; // زدت لك المكافأة لعيونك

  if (userAnswer === correctAnswer) {
    await Currencies.increaseMoney(senderID, coinsReward);
    
    // مسح الرد القديم لعدم تراكم الردود
    api.unsendMessage(handleReply.messageID);
    
    return api.sendMessage(
      `⌬ ━━ 𝗞𝗜𝗥𝗔 𝗚𝗔𝗠𝗘𝗦 ━━ ⌬\n\n🎉 كفو! إجابة صحيحة\n\n🌍 الدولة: ${handleReply.country}\n💰 المكافأة: ${coinsReward}$ عملة`,
      threadID,
      messageID
    );
  } else {
    handleReply.attempts++;
    
    if (handleReply.attempts < 5) {
      return api.sendMessage(
        `⌬ ━━ 𝗞𝗜𝗥𝗔 𝗚𝗔𝗠𝗘𝗦 ━━ ⌬\n\n❌ إجابة خاطئة يا بطل!\n\n🔄 المحاولة: ${handleReply.attempts}/5\n💡 حاول مرة أخرى (رد على الرسالة)`,
        threadID,
        (err, info) => {
          global.client.handleReply.push({
            name: this.config.name,
            messageID: info.messageID,
            author: senderID,
            country: handleReply.country,
            attempts: handleReply.attempts
          });
        },
        messageID
      );
    } else {
      api.unsendMessage(handleReply.messageID);
      return api.sendMessage(
        `⌬ ━━ 𝗞𝗜𝗥𝗔 𝗚𝗔𝗠𝗘𝗦 ━━ ⌬\n\n😔 حظ أوفر! انتهت المحاولات\n\n🌍 الدولة الصحيحة كانت: ${handleReply.country}`,
        threadID,
        messageID
      );
    }
  }
};

module.exports.run = async function({ api, event }) {
  const { threadID, messageID, senderID } = event;

  try {
    // استخدام API مستقر جداً للأعلام
    const res = await axios.get("https://restcountries.com/v3.1/all");
    const countries = res.data;
    
    // اختيار دولة عشوائية تملك اسماً عربياً (أو سنستخدم الاسم الشائع)
    const randomCountry = countries[Math.floor(Math.random() * countries.length)];
    
    // محاولة جلب الاسم بالعربي إذا توفر، وإلا نستخدم الإنجليزي
    const countryName = randomCountry.translations.ara ? randomCountry.translations.ara.common : randomCountry.name.common;
    const flagUrl = randomCountry.flags.png;

    const streamURL = (await axios.get(flagUrl, { responseType: "stream" })).data;

    return api.sendMessage(
      {
        body: `⌬ ━━ 𝗞𝗜𝗥𝗔 𝗚𝗔𝗠𝗘𝗦 ━━ ⌬\n\n🎮 لعبة تخمين العلم\n\n❓ ما هي الدولة صاحبة هذا العلم؟\n📊 المحاولات: 5\n\n💡 رد على الرسالة بالإجابة الصحيحة!`,
        attachment: streamURL
      },
      threadID,
      (err, info) => {
        global.client.handleReply.push({
          name: this.config.name,
          messageID: info.messageID,
          author: senderID,
          country: countryName,
          attempts: 1
        });
      },
      messageID
    );

  } catch (error) {
    console.error("علم - خطأ:", error);
    return api.sendMessage(`❌ حدث خطأ في النظام: ${error.message}`, threadID, messageID);
  }
};
