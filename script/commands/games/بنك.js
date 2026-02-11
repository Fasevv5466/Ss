const Canvas = require("@napi-rs/canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// تأكد من أن المسار صحيح لملف المونغو عندك
const mongodb = require(path.join(process.cwd(), "includes", "mongodb.js"));

module.exports.config = {
  name: "بنك",
  version: "14.0.1",
  hasPermssion: 0,
  credits: "ايمن - VOID EMPEROR",
  description: "عرض بطاقة الإمبراطور الفراغي الخاصة بك 🌌",
  commandCategory: "games",
  usages: "[@منشن]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  
  try {
    let targetID = senderID;
    if (Object.keys(event.mentions).length > 0) {
      targetID = Object.keys(event.mentions)[0];
    } else if (event.type === "message_reply") {
      targetID = event.messageReply.senderID;
    }

    // جلب البيانات مع التعامل مع احتمالية عدم وجودها
    const data = await mongodb.getUserData(targetID);
    if (!data) {
      return api.sendMessage("❌ هذا المستخدم غير مسجل في قاعدة البيانات!", threadID, messageID);
    }
    
    // تصحيح استخراج المتغيرات لتناسب بنية MongoDB الشائعة
    const currency = data.currency || data; 
    const calculated = data.calculated || { rank: { name: "مبتدئ", emoji: "👶" }, progress: 0, expNeeded: 1000 };
    const user = data.user || { name: (await api.getUserInfo(targetID))[targetID].name };
    
    const username = user.name || "مستخدم";
    const isDeveloper = global.config.ADMINBOT && global.config.ADMINBOT.includes(targetID);
    
    // إشعار البدء
    const loadingMsg = await api.sendMessage("⚡ جاري استدعاء قوة الفراغ...", threadID);
    
    const card = await createVoidEmperorCard({
      userID: targetID,
      username: username.toUpperCase(),
      money: currency.money || 0,
      exp: currency.exp || 0,
      level: currency.level || 1,
      msgCount: currency.messageCount || 0,
      rank: calculated.rank,
      progress: calculated.progress || 0,
      expNeeded: calculated.expNeeded || 100,
      isDeveloper: isDeveloper
    });
    
    const cachePath = path.join(__dirname, "cache", `void_${targetID}.png`);
    if (!fs.existsSync(path.join(__dirname, "cache"))) fs.mkdirSync(path.join(__dirname, "cache"));
    
    await fs.writeFile(cachePath, card);
    
    // حذف رسالة التحميل وإرسال البطاقة
    api.unsendMessage(loadingMsg.messageID);

    return api.sendMessage({
      body: `╔══════════════════╗\n   🌌 VOID EMPEROR SYSTEM\n╚══════════════════╝\n\n👤 الـمـسـتـخـدم: ${username}\n⚡ الـرتـبـة: ${calculated.rank.name}\n💰 الـرصـيـد: ${formatNumber(currency.money)}$`,
      attachment: fs.createReadStream(cachePath)
    }, threadID, () => {
        if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
    }, messageID);
    
  } catch (error) {
    console.error("❌ VOID ERROR:", error);
    return api.sendMessage(`❌ فشل النظام في معالجة القوة الفراغية!`, threadID, messageID);
  }
};

// --- دالة التنسيق ---
function formatNumber(num) {
  return num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0";
}

// --- دالة جلب الثيم (تأكد من مطابقة أسماء الرتب) ---
function getVoidTheme(rank, isDeveloper) {
  const rName = (rank && rank.name) ? rank.name : "مبتدئ";
  if (isDeveloper) return { name: "SYSTEM OWNER", primary: "#8b5cf6", secondary: "#a78bfa", accent: "#c4b5fd", neon: "#d8b4fe", dark: "#4c1d95", glow: "#f3e8ff", bg1: "#050507", bg2: "#0d0f18", bg3: "#1a1b2e" };
  
  const themes = {
    "مبتدئ": { name: "ROOKIE", primary: "#22c55e", secondary: "#4ade80", accent: "#86efac", neon: "#bbf7d0", dark: "#166534", glow: "#dcfce7", bg1: "#050507", bg2: "#0d0f18", bg3: "#1a1b2e" },
    "محارب": { name: "SOLDIER", primary: "#eab308", secondary: "#facc15", accent: "#fde047", neon: "#fef08a", dark: "#854d0e", glow: "#fef9c3", bg1: "#050507", bg2: "#0d0f18", bg3: "#1a1b2e" },
    "فارس": { name: "WARRIOR", primary: "#06b6d4", secondary: "#22d3ee", accent: "#67e8f9", neon: "#a5f3fc", dark: "#164e63", glow: "#cffafe", bg1: "#050507", bg2: "#0d0f18", bg3: "#1a1b2e" },
    "ملك": { name: "VOID EMPEROR", primary: "#dc2626", secondary: "#ef4444", accent: "#f87171", neon: "#fca5a5", dark: "#7f1d1d", glow: "#fee2e2", bg1: "#050507", bg2: "#0d0f18", bg3: "#1a1b2e" }
  };
  return themes[rName] || { name: "IMMORTAL", primary: "#7c3aed", secondary: "#8b5cf6", accent: "#a78bfa", neon: "#c4b5fd", dark: "#5b21b6", glow: "#ede9fe", bg1: "#050507", bg2: "#0d0f18", bg3: "#1a1b2e" };
}

// --- بقية دوال الرسم (نفس الكود الأصلي بدون تغيير في الجرافيك) ---
// (انسخ بقية الدوال من كودك الأصلي هنا: createVoidEmperorCard, drawOctagonalAvatar, إلخ...)
