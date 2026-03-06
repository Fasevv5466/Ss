const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// ══════════════════════════════════════════════
// ─── بيانات الجلسات والحدود
// ══════════════════════════════════════════════
const sessions = {};
const playerLimits = {};
const settings = {
  maxGames: 4,
  limitWindow: 10 * 60 * 1000,
  maxBackSteps: 5
};

// ─── فحص حد الألعاب ──────────────────────────
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

// ─── إرسال السؤال ────────────────────────────
async function sendQuestion(api, threadID, messageID, uid) {
  const s = sessions[uid];
  if (!s) return;
  const info = s.info;
  const prog = info.progress || 0;
  const filled = Math.min(10, Math.floor(prog / 10));
  const bar = '█'.repeat(filled) + '▒'.repeat(10 - filled) + ` ${prog}%`;
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

  try {
    const msg = await api.sendMessage(text, threadID, messageID);

    // ✅ إضافة handleReply بالطريقة الصحيحة لبوتك
    if (global.client && Array.isArray(global.client.handleReply)) {
      // احذف الجلسة القديمة لنفس المستخدم إن وجدت
      global.client.handleReply = global.client.handleReply.filter(
        r => !(r.name === "المارد" && r.author === uid)
      );
      global.client.handleReply.push({
        name: "المارد",
        messageID: msg.messageID,
        author: uid,
        uid,
        threadID
      });
    }
    return msg;
  } catch (e) {
    console.log("[المارد] sendQuestion error:", e.message);
  }
}

// ══════════════════════════════════════════════
// ─── إعدادات الأمر
// ══════════════════════════════════════════════
module.exports.config = {
  name: "المارد",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "TILMN.AI",
  description: "لعبة أكيناتور - خمّن الشخصية",
  commandCategory: "🎮 الألعاب",
  usages: "المارد [ar|en|fr]",
  cooldowns: 5,
  handleReply: true
};

// ══════════════════════════════════════════════
// ─── تشغيل اللعبة
// ══════════════════════════════════════════════
module.exports.run = async function({ api, event, args, Users }) {
  const uid = String(event.senderID);
  const { threadID, messageID } = event;

  // فحص الحد
  const limit = checkLimit(uid);
  if (!limit.ok) return api.sendMessage(limit.msg, threadID, messageID);

  // إنهاء جلسة سابقة
  if (sessions[uid]) delete sessions[uid];

  const language = (args[0] && ['ar','en','fr'].includes(args[0].toLowerCase()))
    ? args[0].toLowerCase() : 'ar';

  try {
    const res = await axios.get(
      `https://ooooooooo-6j3r.onrender.com/start?lang=${language}`,
      { timeout: 15000 }
    );
    const info = res.data;
    if (!info || !info.question)
      return api.sendMessage('❌ حدث خطأ في بدء اللعبة، حاول مرة أخرى', threadID, messageID);

    // ✅ جلب الاسم - متوافق مع بوتك (Users.getInfo بدل getData)
    let name = "مستخدم";
    try {
      if (Users && Users.getInfo) {
        const u = await Users.getInfo(uid);
        if (u && u.name) name = u.name;
      } else if (global.data && global.data.userName && global.data.userName.has(uid)) {
        name = global.data.userName.get(uid);
      }
    } catch (e) {}

    sessions[uid] = {
      uid,
      name,
      info,
      backSteps: 0,
      questionNum: 1,
      threadID,
      lastUpdate: Date.now()
    };

    return sendQuestion(api, threadID, messageID, uid);

  } catch (err) {
    return api.sendMessage(
      `❌ خطأ في الاتصال بالخادم\n${err.message || ""}`,
      threadID, messageID
    );
  }
};

// ══════════════════════════════════════════════
// ─── معالجة الإجابة
// ══════════════════════════════════════════════
async function handleAnswer(api, event, uid) {
  const s = sessions[uid];
  if (!s) return;

  const { threadID, messageID } = event;
  const text = String(event.body || "").trim();
  if (!text) return;

  s.lastUpdate = Date.now();
  const lower = text.toLowerCase();

  // ─── إنهاء اللعبة ────────────────────────
  if (['إنهاء','انهاء','الغاء','خروج','end','exit'].includes(lower)) {
    delete sessions[uid];
    // احذف من handleReply
    if (global.client && Array.isArray(global.client.handleReply)) {
      global.client.handleReply = global.client.handleReply.filter(
        r => !(r.name === "المارد" && r.author === uid)
      );
    }
    return api.sendMessage('🧞‍♂️ تم إنهاء اللعبة، إلى المرة القادمة!', threadID, messageID);
  }

  // ─── التراجع ─────────────────────────────
  if (['تراجع','رجوع','back'].includes(lower)) {
    if (s.backSteps >= settings.maxBackSteps)
      return api.sendMessage(
        `⚠️ تراجعت كثير!\n🚫 الحد الأقصى ${settings.maxBackSteps} مرات`,
        threadID, messageID
      );
    try {
      const res = await axios.get('https://ooooooooo-6j3r.onrender.com/back', { timeout: 10000 });
      const info = res.data;
      if (info && info.question) {
        s.info = info;
        s.backSteps++;
        if (s.questionNum > 1) s.questionNum--;
        return sendQuestion(api, threadID, messageID, uid);
      } else {
        return api.sendMessage('❌ ما ينفع تتراجع أكثر', threadID, messageID);
      }
    } catch (e) {
      return api.sendMessage('❌ خطأ في التراجع', threadID, messageID);
    }
  }

  // ─── الإجابات ─────────────────────────────
  const answers = {
    'نعم':'0', 'yes':'0', '0':'0',
    'لا':'1', 'no':'1', '1':'1',
    'لا أعلم':'2', 'لا اعلم':'2', 'ماعرف':'2', 'idk':'2', '2':'2',
    'ربما':'3', 'maybe':'3', '3':'3',
    'لا اعتقد':'4', 'لا أعتقد':'4', '4':'4'
  };

  const choice = answers[lower];
  if (choice === undefined) return; // تجاهل الردود غير المعروفة

  try {
    const res = await axios.get(
      `https://ooooooooo-6j3r.onrender.com/answer?choice=${choice}`,
      { timeout: 10000 }
    );
    const info = res.data;

    if (!info) {
      delete sessions[uid];
      return api.sendMessage('❌ انتهت الجلسة، ابدأ من جديد', threadID, messageID);
    }

    // ─── فاز الأكيناتور ───────────────────
    if (info.win) {
      const result = `☠️ TILMN AKINATOR ༈༻

🤖 تم التخمين! ⚙️
🧞‍♂️ الشخصية: ${info.suggestion_name || "؟"}
🧾 الوصف: ${info.suggestion_desc || 'لا يوجد'}
📊 الثقة: ${info.confidence || "?"}%
❓ عدد الأسئلة: ${s.questionNum}`;

      delete sessions[uid];
      if (global.client && Array.isArray(global.client.handleReply)) {
        global.client.handleReply = global.client.handleReply.filter(
          r => !(r.name === "المارد" && r.author === uid)
        );
      }

      // إرسال مع صورة إن وجدت
      if (info.suggestion_photo) {
        try {
          const imagePath = path.join(__dirname, `akinator_${uid}.jpg`);
          const imageRes = await axios.get(info.suggestion_photo, {
            responseType: "arraybuffer",
            timeout: 10000
          });
          await fs.outputFile(imagePath, imageRes.data);
          return api.sendMessage(
            { body: result, attachment: fs.createReadStream(imagePath) },
            threadID,
            () => { try { fs.unlinkSync(imagePath); } catch (e) {} },
            messageID
          );
        } catch (e) {
          return api.sendMessage(result, threadID, messageID);
        }
      } else {
        return api.sendMessage(result, threadID, messageID);
      }

    } else {
      // ─── سؤال جديد ────────────────────
      s.info = info;
      s.questionNum++;
      return sendQuestion(api, threadID, messageID, uid);
    }

  } catch (e) {
    delete sessions[uid];
    return api.sendMessage('❌ خطأ في الإجابة، ابدأ لعبة جديدة', threadID, messageID);
  }
}

// ══════════════════════════════════════════════
// ─── handleReply - الرد على رسالة البوت
// ══════════════════════════════════════════════
module.exports.handleReply = async function({ api, event, handleReply: replyData }) {
  const uid = String(event.senderID);
  // ✅ تحقق إن الرد من نفس صاحب الجلسة
  if (replyData && replyData.author && replyData.author !== uid) return;
  if (!sessions[uid]) return;
  return handleAnswer(api, event, uid);
};

// ══════════════════════════════════════════════
// ─── handleEvent - يستمع لكل الرسائل كبديل
// ══════════════════════════════════════════════
module.exports.handleEvent = async function({ api, event }) {
  // تجاهل الرسائل بدون body
  if (!event.body) return;
  const uid = String(event.senderID);
  // فقط لو في جلسة نشطة لهذا المستخدم
  if (!sessions[uid]) return;
  // تجاهل لو مش في نفس المجموعة
  if (sessions[uid].threadID !== event.threadID) return;
  return handleAnswer(api, event, uid);
};
