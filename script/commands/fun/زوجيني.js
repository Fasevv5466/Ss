module.exports.config = {
  name: "زوجيني",
  version: "2.1.0",
  hasPermssion: 0,
  credits: "ايمن",
  description: "زواج عشوائي أو من الشخص الذي ترد على رسالته",
  commandCategory: "fun",
  usages: "زوجيني (أو بالرد على رسالة شخص)",
  cooldowns: 5
};

module.exports.run = async function({ api, event, Users }) {
  const axios = require("axios");
  const fs = require("fs-extra");
  const path = require("path");
  const { threadID, messageID, senderID, type, messageReply } = event;

  let id;
  let isReply = false;

  // التحقق إذا كان هناك رد على رسالة (Reply)
  if (type === "message_reply") {
    id = messageReply.senderID;
    isReply = true;
  } else {
    // اختيار شخص عشوائي إذا لم يكن هناك رد
    let threadInfo = await api.getThreadInfo(threadID);
    let participants = threadInfo.participantIDs;
    let listID = participants.filter(ID => ID !== senderID);
    
    if (listID.length === 0) {
      return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 ━━ ⌬\n\nلا يوجد أعضاء كافيين في المجموعة للزواج!", threadID, messageID);
    }
    id = listID[Math.floor(Math.random() * listID.length)];
  }

  // جلب أسماء الطرفين
  const name1 = (await Users.getData(senderID)).name;
  const name2 = (await Users.getData(id)).name;
  const lovePercent = Math.floor(Math.random() * 101);

  const waitingMsg = isReply ? `جاري عقد قرانك على ${name2}...` : "جاري البحث عن شريك حياتك وفحص التوافق...";
  api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 ━━ ⌬\n\n${waitingMsg}`, threadID, messageID);

  const cacheDir = path.join(__dirname, "cache");
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

  const path1 = path.join(cacheDir, `avt_${senderID}.png`);
  const path2 = path.join(cacheDir, `avt_${id}.png`);

  try {
    // جلب صور البروفايل (باستخدام توكن عام للصور)
    const getAvt = async (uid, savePath) => {
      const imgRes = await axios.get(`https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" });
      fs.writeFileSync(savePath, Buffer.from(imgRes.data));
    };

    await Promise.all([getAvt(senderID, path1), getAvt(id, path2)]);

    const msg = {
      body: `⌬ ━━ 𝗞𝗜𝗥𝗔 𝗠𝗔𝗥𝗥𝗜𝗔𝗚𝗘 ━━ ⌬\n\n` +
            `${isReply ? "🎉 تم القبول! أعلنتكما زوجاً وزوجة" : "💍 ألف مبروك! وجدت لك الشريك المناسب"}\n\n` +
            `👤 الزوج الأول: ${name1}\n` +
            `👤 الزوج الثاني: ${name2}\n\n` +
            `❤️ نسبة التوافق: ${lovePercent}%\n` +
            `✨ باركوا للعروسين الجدد!`,
      mentions: [
        { tag: name1, id: senderID },
        { tag: name2, id: id }
      ],
      attachment: [fs.createReadStream(path1), fs.createReadStream(path2)]
    };

    return api.sendMessage(msg, threadID, () => {
      if (fs.existsSync(path1)) fs.unlinkSync(path1);
      if (fs.existsSync(path2)) fs.unlinkSync(path2);
    }, messageID);

  } catch (err) {
    console.error(err);
    return api.sendMessage(
      `⌬ ━━ 𝗞𝗜𝗥𝗔 ━━ ⌬\n\n` +
      `🎊 مبروك الزواج!\n` +
      `💖 الشريك: ${name2}\n` +
      `📊 نسبة الحب: ${lovePercent}%`,
      threadID,
      messageID
    );
  }
};
