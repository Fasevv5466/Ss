/**
 * ╔══════════════════════════════════════════════╗
 * ║     🎮 لعبة تخمين شخصيات الأنمي              ║
 * ║     بوت Mirai Messenger                      ║
 * ║     الأمر: !أنمي  أو  !anime                 ║
 * ╚══════════════════════════════════════════════╝
 *
 * 📂 طريقة التثبيت:
 *   1. ضع هذا الملف في: modules/commands/anime.js
 *   2. ضع ملف anbu.json في: modules/commands/cache/anbu.json
 *   3. أعد تشغيل البوت
 *
 * 🎯 طريقة اللعب:
 *   - اكتب !أنمي  لبدء السؤال
 *   - البوت يعطي تلميح أول
 *   - إذا جاوبت صح → صورة الشخصية + نقطة
 *   - إذا جاوبت غلط → تلميح ثانٍ
 *   - وهكذا حتى 3 تلميحات ثم تنتهي الجولة
 */

const fs = require('fs');
const path = require('path');

// ══════════════════════════════════════
//   إعدادات الأمر
// ══════════════════════════════════════
module.exports.config = {
  name: "شخصية",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Y-ANBU",
  description: "🎮 خمّن شخصية الأنمي من التلميحات واجمع النقاط!",
  commandCategory: "العاب",
  usages: "!أنمي",
  cooldowns: 5
};

// ══════════════════════════════════════
//   تحميل قاعدة البيانات
// ══════════════════════════════════════
let characters = [];
try {
  const filePath = path.join(__dirname, 'cache', 'anbu.json');
  characters = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  console.log(`[أنمي] ✅ تم تحميل ${characters.length} شخصية`);
} catch (err) {
  console.error('[أنمي] ❌ خطأ في قراءة anbu.json:', err.message);
}

// ══════════════════════════════════════
//   نظام النقاط (يُخزّن في الذاكرة)
// ══════════════════════════════════════
const scores = {}; // { userID: points }

function addPoint(userID) {
  scores[userID] = (scores[userID] || 0) + 1;
}

function getScore(userID) {
  return scores[userID] || 0;
}

// ══════════════════════════════════════
//   دالة اختيار شخصية عشوائية
// ══════════════════════════════════════
function getRandomCharacter() {
  return characters[Math.floor(Math.random() * characters.length)];
}

// ══════════════════════════════════════
//   تنسيق رسالة التلميح
// ══════════════════════════════════════
function buildHintMessage(hintText, hintNumber) {
  const icons = ['🕵️', '🔍', '💡'];
  const icon = icons[hintNumber - 1] || '❓';
  return (
    `${icon} التلميح رقم ${hintNumber}:\n` +
    `━━━━━━━━━━━━━━━\n` +
    `${hintText}\n\n` +
    `✏️ اكتب اسم الشخصية للإجابة!`
  );
}

// ══════════════════════════════════════
//   دالة تطبيع النص للمقارنة
// ══════════════════════════════════════
function normalize(str) {
  return str
    .trim()
    .toLowerCase()
    .replace(/[أإآا]/g, 'ا')
    .replace(/[ة]/g, 'ه')
    .replace(/[ى]/g, 'ي')
    .replace(/\s+/g, ' ');
}

// ══════════════════════════════════════
//   عند تشغيل الأمر: !أنمي
// ══════════════════════════════════════
module.exports.run = async function ({ api, event }) {
  const { threadID } = event;

  // التحقق من توفر الشخصيات
  if (!characters || characters.length === 0) {
    return api.sendMessage(
      '❌ لا توجد شخصيات في قاعدة البيانات!\nتأكد من وجود ملف cache/anbu.json',
      threadID
    );
  }

  // اختر شخصية عشوائية
  const character = getRandomCharacter();

  // أرسل التلميح الأول
  const msg = buildHintMessage(character.hints[0], 1);

  api.sendMessage(
    `🎮 خمّن من أنا؟\n━━━━━━━━━━━━━━━\n${msg}`,
    threadID,
    (err, info) => {
      if (err) return;

      // سجّل handleReply للرد التفاعلي
      global.client.handleReply.push({
        name: module.exports.config.name,
        messageID: info.messageID,
        threadID: threadID,
        character: character,
        hintIndex: 1  // التلميح التالي هو رقم 2
      });
    }
  );
};

// ══════════════════════════════════════
//   عند الرد: التحقق من الإجابة
// ══════════════════════════════════════
module.exports.handleReply = async function ({ api, event, handleReply }) {
  const { threadID, senderID, body } = event;
  const { character, hintIndex } = handleReply;

  const userAnswer = normalize(body);
  const correctAnswer = normalize(character.name);

  // ✅ إجابة صحيحة
  if (userAnswer === correctAnswer) {
    addPoint(senderID);
    const totalScore = getScore(senderID);

    // أرسل رسالة النجاح مع الصورة
    try {
      const imgUrl = character.image;

      // حاول إرسال مع صورة
      const axios = require('axios');
      const response = await axios.get(imgUrl, { responseType: 'stream', timeout: 8000 });

      api.sendMessage(
        {
          body:
            `✅ إجابة صحيحة! مبروك! 🎉\n` +
            `━━━━━━━━━━━━━━━\n` +
            `🌟 الشخصية: ${character.name}\n` +
            `⭐ نقاطك: ${totalScore} نقطة\n` +
            `━━━━━━━━━━━━━━━\n` +
            `💬 اكتب !أنمي للعب مرة أخرى`,
          attachment: response.data
        },
        threadID
      );
    } catch {
      // إذا فشل تحميل الصورة → أرسل نص فقط
      api.sendMessage(
        `✅ إجابة صحيحة! مبروك! 🎉\n` +
        `━━━━━━━━━━━━━━━\n` +
        `🌟 الشخصية: ${character.name}\n` +
        `⭐ نقاطك: ${totalScore} نقطة\n` +
        `━━━━━━━━━━━━━━━\n` +
        `💬 اكتب !أنمي للعب مرة أخرى`,
        threadID
      );
    }
    return;
  }

  // ❌ إجابة خاطئة - هل يوجد تلميح آخر؟
  if (hintIndex < character.hints.length) {
    const nextHint = character.hints[hintIndex];
    const msg = buildHintMessage(nextHint, hintIndex + 1);

    api.sendMessage(
      `❌ إجابة خاطئة!\n${msg}`,
      threadID,
      (err, info) => {
        if (err) return;

        // استمر في الاستماع للرد
        global.client.handleReply.push({
          name: module.exports.config.name,
          messageID: info.messageID,
          threadID: threadID,
          character: character,
          hintIndex: hintIndex + 1
        });
      }
    );
  } else {
    // ❌ انتهت التلميحات
    api.sendMessage(
      `💔 انتهت التلميحات! لم يفز أحد هذه الجولة.\n` +
      `━━━━━━━━━━━━━━━\n` +
      `🔑 الإجابة الصحيحة كانت: ${character.name}\n` +
      `━━━━━━━━━━━━━━━\n` +
      `💬 اكتب !أنمي للعب مرة أخرى`,
      threadID
    );
  }
};
