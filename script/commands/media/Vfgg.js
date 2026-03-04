const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const sessions = {};
const playerLimits = {};
const settings = {
  maxGames: 4,
  limitWindow: 10 * 60 * 1000,
  maxBackSteps: 5
};

function checkLimit(id) {
  const now = Date.now();
  if (!playerLimits[id]) {
    playerLimits[id] = { total: 1, startTime: now };
    return { ok: true };
  }
  if (now - playerLimits[id].startTime > settings.limitWindow) {
    playerLimits[id] = { total: 1, startTime: now };
    return { ok: true };
  }
  if (playerLimits[id].total >= settings.maxGames) {
    const timeLeft = Math.ceil((settings.limitWindow - (now - playerLimits[id].startTime)) / 60000);
    return { ok: false, msg: `⏳ وصلت للحد الأقصى (${settings.maxGames} ألعاب)\n⏰ انتظر ${timeLeft} دقيقة` };
  }
  playerLimits[id].total++;
  return { ok: true };
}

async function sendQuestion(api, threadID, messageID, uid) {
  const s = sessions[uid];
  const info = s.info;
  const bar = '█'.repeat(Math.floor((info.progress || 0) / 10)) + '▒'.repeat(10 - Math.floor((info.progress || 0) / 10)) + ` ${info.progress || 0}%`;
  const remaining = settings.maxBackSteps - s.backSteps;
  const text = `👤 ${s.name}

🧞‍♂️ ${info.question}

📊 ${bar}
❓ سؤال ${s.questionNum}
🔙 تراجعات متبقية: ${remaining}

✅ نعم (0) | ❌ لا (1)
😅 لا أعلم (2) | 🤔 ربما (3)
😀 لا اعتقد (4)
🔁 تراجع | ❌ إنهاء`;
  const msg = await api.sendMessage(text, threadID, messageID);
  if (global && global.client && Array.isArray(global.client.handleReply)) {
    global.client.handleReply.push({
      name: "اكيناتور",
      messageID: msg.messageID,
      author: uid,
      uid,
    });
  }
  return msg;
}

module.exports.config = {
  name: "المارد",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "TILMN.AI",
  description: "لعبة أكيناتور متصلة بالسيرفر",
  commandCategory: "🎮 الألعاب",
  usages: "اكيناتور [ar|en|fr]",
  cooldowns: 5,
  handleReply: true
};

module.exports.run = async function({ api, event, args, Users }) {
  const uid = event.senderID;
  const limit = checkLimit(uid);
  if (!limit.ok) return api.sendMessage(limit.msg, event.threadID, event.messageID);
  if (sessions[uid]) {
    delete sessions[uid];
  }
  const language = args[0] && ['ar','en','fr'].includes(args[0].toLowerCase()) ? args[0].toLowerCase() : 'ar';
  try {
    const res = await axios.get(`https://ooooooooo-6j3r.onrender.com/start?lang=${language}`);
    const info = res.data;
    if (!info.question) return api.sendMessage('❌ حدث خطأ في بدء اللعبة', event.threadID, event.messageID);
    let name = "مستخدم";
    try {
      const u = await Users.getData(uid);
      if (u && u.name) name = u.name;
    } catch(e){}
    sessions[uid] = {
      uid,
      name,
      info,
      backSteps: 0,
      questionNum: 1,
      threadID: event.threadID,
      lastUpdate: Date.now()
    };
    return sendQuestion(api, event.threadID, event.messageID, uid);
  } catch (err) {
    return api.sendMessage('❌ خطأ في الاتصال بالخادم', event.threadID, event.messageID);
  }
};

async function handleAnswer(api, event, uid, text) {
  const s = sessions[uid];
  if (!s) return;
  s.lastUpdate = Date.now();
  const lower = text.trim().toLowerCase();
  const endCmds = ['إنهاء','انهاء','الغاء','end'];
  if (endCmds.includes(lower)) {
    delete sessions[uid];
    return api.sendMessage('🧞‍♂️ تم إنهاء اللعبة', event.threadID, event.messageID);
  }
  const backCmds = ['تراجع','رجوع','back'];
  if (backCmds.includes(lower)) {
    if (s.backSteps >= settings.maxBackSteps) return api.sendMessage(`⚠️ تراجعت كثير!\n🚫 الحد الأقصى ${settings.maxBackSteps} مرات`, event.threadID, event.messageID);
    try {
      const res = await axios.get(`https://ooooooooo-6j3r.onrender.com/back`);
      const info = res.data;
      if (info.question) {
        s.info = info;
        s.backSteps++;
        if (s.questionNum > 1) s.questionNum--;
        return sendQuestion(api, event.threadID, event.messageID, uid);
      } else {
        return api.sendMessage('❌ ما ينفع تتراجع أكثر', event.threadID, event.messageID);
      }
    } catch (e) {
      return api.sendMessage('❌ خطأ في التراجع', event.threadID, event.messageID);
    }
  }
  const answers = {
    'نعم': '0','yes':'0','0':'0',
    'لا': '1','no':'1','1':'1',
    'لا أعلم':'2','لا اعلم':'2','ماعرف':'2','2':'2',
    'ربما':'3','maybe':'3','3':'3',
    'لا اعتقد':'4','4':'4'
  };
  if (!Object.keys(answers).includes(lower)) return;
  const choice = answers[lower];
  try {
    const res = await axios.get(`https://ooooooooo-6j3r.onrender.com/answer?choice=${choice}`);
    const info = res.data;
    if (info.win) {
      const result = `☠️ TILMN AKINATOR ༈༻

🤖 تم التخمين ⚙️
🧞‍♂️ الشخصية: ${info.suggestion_name}
🧾 الوصف: ${info.suggestion_desc || 'لا يوجد'}
📊 الثقة: ${info.confidence}%
❓ الأسئلة: ${s.questionNum}`;
      delete sessions[uid];
      if (info.suggestion_photo) {
        try {
          const imagePath = path.join(__dirname, `akinator_${uid}.jpg`);
          const imageRes = await axios.get(info.suggestion_photo, { responseType: "arraybuffer" });
          await fs.outputFile(imagePath, imageRes.data);
          return api.sendMessage({ body: result, attachment: fs.createReadStream(imagePath) }, event.threadID, () => { try { if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath); } catch(e){} }, event.messageID);
        } catch (e) {
          return api.sendMessage(result, event.threadID, event.messageID);
        }
      } else {
        return api.sendMessage(result, event.threadID, event.messageID);
      }
    } else {
      s.info = info;
      s.questionNum++;
      return sendQuestion(api, event.threadID, event.messageID, uid);
    }
  } catch (e) {
    delete sessions[uid];
    return api.sendMessage('❌ خطأ في الإجابة', event.threadID, event.messageID);
  }
}

module.exports.handleReply = async function({ api, event, handleReply }) {
  const uid = event.senderID;
  if (!sessions[uid]) return;
  const text = (event.body || "").trim();
  if (!text) return;
  return handleAnswer(api, event, uid, text);
};

module.exports.handleEvent = async function({ api, event }) {
  const uid = event.senderID;
  if (!sessions[uid]) return;
  const text = (event.body || "").trim();
  if (!text) return;
  return handleAnswer(api, event, uid, text);
};
