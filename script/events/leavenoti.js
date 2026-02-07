const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const moment = require("moment-timezone");

module.exports.config = {
  name: "joinNoti",
  eventType: ["log:subscribe"],
  version: "1.6.0",
  credits: "Ayman",
  description: "ترحيب ملكي بالأعضاء الجدد مع معالجة أخطاء متقدمة"
};

module.exports.run = async function({ api, event, Users, Threads }) {
  const { threadID } = event;
  const time = moment.tz("Asia/Baghdad").format("HH:mm:ss DD/MM/YYYY");
  const hours = parseInt(moment.tz("Asia/Baghdad").format("HH"));

  // 1. إذا دخل البوت إلى المجموعة
  if (event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
    try {
      api.changeNickname(`[ ${global.config.PREFIX} ] • ${global.config.BOTNAME || "هبة"}`, threadID, api.getCurrentUserID());
      return api.sendMessage(`✅ تـم تـفـعـيـل الـنـظـام بـنـجـاح!\n🤖 أنـا الـآن جـاهـزة لـخـدمـتـكـم، اكـتـب (${global.config.PREFIX}الاوامر) لـلـإسـتـكـشـاف.`, threadID);
    } catch (e) { console.log(e) }
  }

  // 2. ترحيب الأعضاء الجدد
  try {
    const threadInfo = await api.getThreadInfo(threadID);
    const { threadName, participantIDs } = threadInfo;
    const addedParticipants = event.logMessageData.addedParticipants;
    
    let nameArray = [];
    let memLength = [];
    let i = 0;

    for (const user of addedParticipants) {
      const id = user.userFbId;
      const userName = user.fullName;
      nameArray.push(userName);
      memLength.push(participantIDs.length + i++);

      // تسجيل العضو في قاعدة البيانات بشكل آمن
      if (global.data && global.data.allUserID && !global.data.allUserID.includes(id)) {
        try {
          await Users.createData(id, { name: userName, data: {} });
          global.data.userName.set(id, userName);
          global.data.allUserID.push(id);
        } catch (dbErr) { console.log("خطأ تسجيل داتا: " + dbErr) }
      }
    }

    // تحديد الوقت والتحية
    let session = hours >= 5 && hours < 12 ? "صباح الخير ☕" : hours >= 12 && hours < 17 ? "طاب يومك ☀️" : hours >= 17 && hours < 21 ? "مساء الخير 🌆" : "ليلة سعيدة ✨";

    const authorName = await Users.getNameUser(event.author) || "عضو المجموعة";

    let msg = `╭─────╼✨╾─────╮\n  تـرحـيـب مـلـكـي جـديـد\n╰─────╼✨╾─────╯\n\n` +
              `👋 أهـلاً بـك: [ ${nameArray.join(", ")} ]\n` +
              `🏰 فـي مـجـمـوعـة: [ ${threadName} ]\n` +
              `👥 أنـت الـعـضـو رقـم: [ ${memLength.join(", ")} ]\n\n` +
              `📥 تـمـت إضـافـتـك بـواسطـة: [ ${authorName} ]\n` +
              `⏰ الـوقـت الآن: [ ${time} ]\n\n` +
              `💡 ${session} نـتـمـنى لـك وقـتـاً مـمـتـعـاً مـعـنا!\n` +
              `━━━━━━━━━━━━━━`;

    // نظام تحميل الصور مع حماية من الفشل
    const gifs = [
      "https://media.giphy.com/media/AQUJBBWdybhKTykygq/giphy.gif",
      "https://media.giphy.com/media/1448TKNMMg4BFu/giphy.gif",
      "https://media.giphy.com/media/LML5ldpTKLPelFtBfY/giphy.gif"
    ];
    const randomGif = gifs[Math.floor(Math.random() * gifs.length)];
    const pathGif = path.join(__dirname, "cache", `join_${Date.now()}_${Math.random()}.gif`);

    try {
      const response = await axios.get(randomGif, { responseType: "arraybuffer", timeout: 5000 });
      fs.ensureDirSync(path.join(__dirname, "cache"));
      fs.writeFileSync(pathGif, Buffer.from(response.data, "utf-8"));

      return api.sendMessage({
        body: msg,
        attachment: fs.createReadStream(pathGif)
      }, threadID, () => {
        if (fs.existsSync(pathGif)) fs.unlinkSync(pathGif);
      });
    } catch (imgErr) {
      // إذا فشل تحميل الصورة، يرسل الترحيب كنص فقط ولا يتوقف البوت
      return api.sendMessage(msg, threadID);
    }

  } catch (e) {
    console.error("خطأ عام في نظام الترحيب: " + e);
  }
};
