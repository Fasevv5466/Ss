const Canvas = require("@napi-rs/canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
// استدعاء قاعدة بيانات KIRA الملحقة
const db = require("../includes/mongodb.js");

// ══════════════════════════════════════════════════════════════════
// 🚀 KIRA Bot - Advanced Rank System (DB Linked)
// ══════════════════════════════════════════════════════════════════
// المطور: ايمن
// الربط: شامل مع includes/mongodb.js
// ══════════════════════════════════════════════════════════════════

module.exports.config = {
  name: "رانك",
  version: "3.5.0",
  role: 0,
  author: "ايمن",
  description: "بطاقة رانك مرتبطة بقاعدة بيانات MongoDB الخاصة بـ KIRA",
  category: "economy",
  usages: "[@mention]",
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

    // 🔗 الربط مع mongodb.js لجلب البيانات الحقيقية لـ KIRA
    const data = await db.getUserData(targetID);
    if (!data) return api.sendMessage("❌ فشل نظام KIRA في الوصول لقاعدة البيانات.", threadID, messageID);

    const money = data.currency.money || 0;
    const exp = data.currency.exp || 0;
    const username = data.user.name || (await api.getUserInfo(targetID))[targetID].name;
    
    // ملاحظة: بما أن حقل الرسائل غير موجود بالسكيمة حالياً، سنعتبره 0 أو نضيفه لاحقاً
    const msgCount = 0; 
    
    const rankData = calculateRank(exp);
    
    api.sendMessage("🎨 جاري سحب بياناتك من السحابة ومعالجتها...", threadID, messageID);
    
    const card = await createRankCard({
      userID: targetID,
      username: username,
      money: money,
      exp: exp,
      msgCount: msgCount,
      rankData: rankData
    });
    
    const cachePath = path.join(__dirname, "cache", `rank_${targetID}.png`);
    await fs.ensureDir(path.join(__dirname, "cache"));
    await fs.writeFile(cachePath, card);
    
    return api.sendMessage({
      body: `⌬ ━━━ 𝗞𝗜𝗥𝗔 𝗥𝗔𝗡𝗞 ━━━ ⌬\n👤 المستخدم: ${username}\n🏆 المستوى: ${rankData.current.level}\n✨ الخبرة: ${exp.toLocaleString()}`,
      attachment: fs.createReadStream(cachePath)
    }, threadID, () => {
        if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
    }, messageID);
    
  } catch (error) {
    console.error("❌ KIRA DB-Rank Error:", error);
    return api.sendMessage("❌ خطأ في الاتصال بقاعدة بيانات KIRA.", threadID, messageID);
  }
};

// ═══ نظام الرتب الجهنمي ═══
const RANKS = [
  { level: 0, name: "مبتدئ", emoji: "🔰", color: "#ffffff", minExp: 0 },
  { level: 1, name: "محارب", emoji: "⚔️", color: "#ff9900", minExp: 100 },
  { level: 2, name: "فارس", emoji: "🛡️", color: "#00ccff", minExp: 300 },
  { level: 3, name: "نخبة", emoji: "💎", color: "#9900ff", minExp: 600 },
  { level: 4, name: "بطل", emoji: "👑", color: "#ffcc00", minExp: 1000 },
  { level: 5, name: "أسطورة", emoji: "⚡", color: "#ff6600", minExp: 1500 },
  { level: 6, name: "ملك", emoji: "🔱", color: "#ff0066", minExp: 2200 },
  { level: 7, name: "إمبراطور", emoji: "🌟", color: "#ff0000", minExp: 3000 },
  { level: 8, name: "إله الحرب", emoji: "🔥", color: "#cc0000", minExp: 4000 },
  { level: 9, name: "سيد الجحيم", emoji: "😈", color: "#ff0000", minExp: 5500 }
];

function calculateRank(exp) {
  let rank = RANKS[0];
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (exp >= RANKS[i].minExp) { rank = RANKS[i]; break; }
  }
  const nextRank = RANKS[rank.level + 1] || rank;
  const diff = nextRank.minExp - rank.minExp;
  const progress = diff === 0 ? 100 : Math.min(((exp - rank.minExp) / diff) * 100, 100);
  return { current: rank, next: nextRank, progress: progress, expToNext: nextRank.minExp - exp };
}

// ═══ رسم البطاقة (KIRA Style) ═══
async function createRankCard(data) {
  const WIDTH = 1200, HEIGHT = 600;
  const canvas = Canvas.createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  // خلفية مع تدرج شعاعي عميق
  ctx.fillStyle = "#050000";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  const grad = ctx.createRadialGradient(WIDTH/2, HEIGHT/2, 0, WIDTH/2, HEIGHT/2, 900);
  grad.addColorStop(0, "rgba(150, 0, 0, 0.25)");
  grad.addColorStop(1, "black");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // صورة البروفايل مع توهج نيون مكثف
  const avatarX = 100, avatarY = 150, avatarSize = 280;
  try {
    const avatarImg = await axios.get(`https://graph.facebook.com/${data.userID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" });
    const avatar = await Canvas.loadImage(Buffer.from(avatarImg.data));
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize/2, avatarY + avatarSize/2, avatarSize/2, 0, Math.PI*2);
    ctx.clip();
    ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
    ctx.restore();
  } catch(e) { ctx.fillStyle = "#200"; ctx.beginPath(); ctx.arc(avatarX + avatarSize/2, avatarY + avatarSize/2, avatarSize/2, 0, Math.PI*2); ctx.fill(); }

  ctx.strokeStyle = "#ff0000";
  ctx.lineWidth = 12;
  ctx.shadowColor = "#ff0000";
  ctx.shadowBlur = 45;
  ctx.beginPath(); ctx.arc(avatarX + avatarSize/2, avatarY + avatarSize/2, avatarSize/2 + 6, 0, Math.PI*2); ctx.stroke();
  ctx.shadowBlur = 0;

  // إعدادات النصوص الساطعة (عربي/إنجليزي) لـ KIRA
  const writeNeon = (text, x, y, size, color) => {
    ctx.font = `bold ${size}px Arial`;
    ctx.shadowColor = color;
    ctx.shadowBlur = 30;
    ctx.fillStyle = "#ffffff"; // السطوع العالي
    ctx.fillText(text, x, y);
    ctx.shadowBlur = 0;
  };

  writeNeon(data.username, 450, 200, 60, "#ffffff");
  writeNeon(`${data.rankData.current.emoji} ${data.rankData.current.name}`, 450, 280, 50, data.rankData.current.color);

  // الإحصائيات المالية من الـ MongoDB
  ctx.font = "32px Arial";
  ctx.fillStyle = "#aaa";
  ctx.fillText("💰 الرصيد الحالي:", 450, 360);
  ctx.fillText("🔥 القوة (XP):", 450, 430);

  ctx.fillStyle = "#fff";
  ctx.textAlign = "right";
  ctx.fillText(data.money.toLocaleString() + " $", 1100, 360);
  ctx.fillText(data.exp.toLocaleString() + " XP", 1100, 430);

  // شريط التقدم
  const barX = 100, barY = 520, barW = 1000, barH = 35;
  ctx.fillStyle = "#110000";
  ctx.beginPath(); ctx.roundRect(barX, barY, barW, barH, 20); ctx.fill();
  
  const progressW = (data.rankData.progress / 100) * barW;
  ctx.fillStyle = "#ff0000";
  ctx.shadowColor = "#ff0000";
  ctx.shadowBlur = 20;
  ctx.beginPath(); ctx.roundRect(barX, barY, progressW, barH, 20); ctx.fill();
  ctx.shadowBlur = 0;

  return canvas.toBuffer("image/png");
}
