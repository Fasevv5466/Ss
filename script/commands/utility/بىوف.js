const Canvas = require("@napi-rs/canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const mongodb = require(path.join(process.cwd(), "includes", "mongodb.js"));

module.exports.config = {
  name: "بروفايل",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "ايمن - Ultra Detailed Profile Card",
  description: "بطاقة بروفايل دقيقة ومفصلة للغاية",
  commandCategory: "info",
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

    const data = await mongodb.getUserData(targetID);
    
    if (!data || !data.currency) {
      return api.sendMessage("❌ لم يتم العثور على بيانات المستخدم!", threadID, messageID);
    }
    
    const { currency, calculated } = data;
    const userInfo = await api.getUserInfo(targetID);
    const username = data.user.name || userInfo[targetID].name || "مستخدم";
    
    api.sendMessage("🎨 جاري إنشاء البطاقة الاحترافية...", threadID, messageID);
    
    const card = await createUltraDetailedCard({
      userID: targetID,
      username: username,
      money: currency.money || 0,
      exp: currency.exp || 0,
      level: currency.level || 1,
      msgCount: currency.messageCount || 0,
      rank: calculated.rank,
      progress: calculated.progress,
      expNeeded: calculated.expNeeded,
      nextLevelExp: calculated.nextLevelExp,
      streak: currency.streak || 0
    });
    
    const cachePath = path.join(__dirname, "cache", `profile_ultra_${targetID}.png`);
    await fs.ensureDir(path.join(__dirname, "cache"));
    await fs.writeFile(cachePath, card);
    
    return api.sendMessage({
      body: `╔═══════════════╗\n` +
            `║  𝗣𝗥𝗢𝗙𝗜𝗟𝗘 𝗖𝗔𝗥𝗗  ║\n` +
            `╚═══════════════╝\n\n` +
            `👤 ${username}\n` +
            `🆔 ${targetID}\n` +
            `${calculated.rank.emoji} ${calculated.rank.name} | ⭐ لفل ${currency.level}\n` +
            `💰 ${formatNumber(currency.money)} $\n` +
            `✨ ${formatNumber(currency.exp)} XP\n` +
            `📊 ${Math.round(calculated.progress)}% للمستوى التالي\n` +
            `💬 ${formatNumber(currency.messageCount)} رسالة\n` +
            `🔥 ${currency.streak} يوم متتالي`,
      attachment: fs.createReadStream(cachePath)
    }, threadID, () => {
        if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
    }, messageID);
    
  } catch (error) {
    console.error("❌ خطأ:", error);
    return api.sendMessage("❌ حدث خطأ في النظام!", threadID, messageID);
  }
};

function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

async function createUltraDetailedCard(data) {
  const W = 1100;
  const H = 700;
  const canvas = Canvas.createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  // ══════════════ الخلفية المتدرجة الاحترافية ══════════════
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, "#0f0c29");
  bgGrad.addColorStop(0.5, "#302b63");
  bgGrad.addColorStop(1, "#24243e");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // شبكة خلفية دقيقة
  ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
  ctx.lineWidth = 0.5;
  for (let i = 0; i < W; i += 20) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, H);
    ctx.stroke();
  }
  for (let j = 0; j < H; j += 20) {
    ctx.beginPath();
    ctx.moveTo(0, j);
    ctx.lineTo(W, j);
    ctx.stroke();
  }

  // دوائر متوهجة عشوائية
  for (let i = 0; i < 8; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const r = 30 + Math.random() * 70;
    const color = `rgba(${100 + Math.random() * 155}, ${100 + Math.random() * 155}, 255, 0.08)`;
    
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, color);
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // ══════════════ الإطار الخارجي المزدوج ══════════════
  // إطار خارجي
  ctx.strokeStyle = "#7c4dff";
  ctx.lineWidth = 3;
  ctx.shadowColor = "#7c4dff";
  ctx.shadowBlur = 25;
  ctx.strokeRect(12, 12, W - 24, H - 24);
  
  // إطار داخلي
  ctx.strokeStyle = "#9c7eff";
  ctx.lineWidth = 1.5;
  ctx.shadowBlur = 15;
  ctx.strokeRect(22, 22, W - 44, H - 44);
  ctx.shadowBlur = 0;

  // زوايا مضيئة
  drawCorner(ctx, 25, 25, 30, "#7c4dff", "tl");
  drawCorner(ctx, W - 25, 25, 30, "#7c4dff", "tr");
  drawCorner(ctx, 25, H - 25, 30, "#7c4dff", "bl");
  drawCorner(ctx, W - 25, H - 25, 30, "#7c4dff", "br");

  // ══════════════ صورة البروفايل مع إطار سداسي ══════════════
  const avSize = 240;
  const avX = 160;
  const avY = H/2;

  // رسم سداسي متوهج
  ctx.strokeStyle = "#7c4dff";
  ctx.lineWidth = 4;
  ctx.shadowColor = "#7c4dff";
  ctx.shadowBlur = 30;
  drawHexagon(ctx, avX, avY, avSize/2 + 15);
  ctx.stroke();
  
  ctx.lineWidth = 2.5;
  ctx.shadowBlur = 20;
  drawHexagon(ctx, avX, avY, avSize/2 + 25);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // الصورة
  try {
    const url = `https://graph.facebook.com/${data.userID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const res = await axios.get(url, { responseType: "arraybuffer" });
    const img = await Canvas.loadImage(Buffer.from(res.data));
    
    ctx.save();
    ctx.beginPath();
    ctx.arc(avX, avY, avSize/2, 0, Math.PI*2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, avX - avSize/2, avY - avSize/2, avSize, avSize);
    ctx.restore();
    
    // إطار الصورة
    ctx.strokeStyle = "#7c4dff";
    ctx.lineWidth = 3;
    ctx.shadowColor = "#7c4dff";
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(avX, avY, avSize/2, 0, Math.PI*2);
    ctx.stroke();
    ctx.shadowBlur = 0;
    
  } catch(e) {
    // صورة افتراضية
    ctx.fillStyle = "#1a1f3a";
    ctx.beginPath();
    ctx.arc(avX, avY, avSize/2, 0, Math.PI*2);
    ctx.fill();
    
    ctx.font = "bold 80px Arial";
    ctx.fillStyle = "#7c4dff";
    ctx.textAlign = "center";
    ctx.fillText("?", avX, avY + 25);
  }

  // شارة المستوى
  drawLevelBadge(ctx, avX, avY - avSize/2 - 25, data.level, data.rank);

  // ══════════════ قسم المعلومات الرئيسي ══════════════
  const infoX = 380;
  const infoY = 70;

  // العنوان الرئيسي
  ctx.font = "bold 22px Arial";
  ctx.fillStyle = "#7c4dff";
  ctx.textAlign = "left";
  ctx.shadowColor = "#7c4dff";
  ctx.shadowBlur = 10;
  ctx.fillText("◈ PLAYER PROFILE ◈", infoX, infoY);
  ctx.shadowBlur = 0;

  // اسم المستخدم
  ctx.font = "bold 52px Arial";
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "#ffffff";
  ctx.shadowBlur = 12;
  ctx.fillText(data.username, infoX, infoY + 55);
  
  ctx.shadowColor = "#7c4dff";
  ctx.shadowBlur = 20;
  ctx.fillText(data.username, infoX, infoY + 55);
  ctx.shadowBlur = 0;

  // خط فاصل متوهج
  const lineY = infoY + 75;
  const lineGrad = ctx.createLinearGradient(infoX, lineY, infoX + 650, lineY);
  lineGrad.addColorStop(0, "rgba(124, 77, 255, 0)");
  lineGrad.addColorStop(0.5, "#7c4dff");
  lineGrad.addColorStop(1, "rgba(124, 77, 255, 0)");
  ctx.strokeStyle = lineGrad;
  ctx.lineWidth = 2;
  ctx.shadowColor = "#7c4dff";
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.moveTo(infoX, lineY);
  ctx.lineTo(infoX + 650, lineY);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // ID المستخدم
  ctx.font = "20px Courier New";
  ctx.fillStyle = "#9c7eff";
  ctx.fillText(`USER ID: ${data.userID}`, infoX, infoY + 110);

  // الرتبة والمستوى
  ctx.font = "bold 28px Arial";
  ctx.fillStyle = "#ffd700";
  ctx.fillText(`${data.rank.emoji} ${data.rank.name}`, infoX, infoY + 150);
  
  ctx.font = "26px Arial";
  ctx.fillStyle = "#aaaaaa";
  ctx.fillText(`| Level ${data.level}`, infoX + 200, infoY + 150);

  // ══════════════ البطاقات الإحصائية المفصلة ══════════════
  const statsY = infoY + 200;
  const cardW = 200;
  const cardH = 110;
  const gap = 20;

  // XP
  drawDetailedStatCard(ctx, infoX, statsY, cardW, cardH, 
    "✨", "EXPERIENCE", data.exp, "#00d4ff", `${data.expNeeded} للمستوى التالي`);

  // Money
  drawDetailedStatCard(ctx, infoX + cardW + gap, statsY, cardW, cardH,
    "💰", "BALANCE", data.money, "#00ff88", "Kira Coins");

  // Messages
  drawDetailedStatCard(ctx, infoX + (cardW + gap) * 2, statsY, cardW, cardH,
    "💬", "MESSAGES", data.msgCount, "#ff6b9d", "رسالة مرسلة");

  // ══════════════ شريط التقدم المفصل ══════════════
  const progY = statsY + cardH + 40;
  const progW = cardW * 3 + gap * 2;
  const progH = 35;

  // عنوان الشريط
  ctx.font = "bold 18px Arial";
  ctx.fillStyle = "#aaaaaa";
  ctx.textAlign = "left";
  ctx.fillText("LEVEL PROGRESS", infoX, progY - 12);

  // خلفية الشريط
  ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  ctx.strokeStyle = "#7c4dff";
  ctx.lineWidth = 2.5;
  ctx.shadowColor = "#7c4dff";
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.roundRect(infoX, progY, progW, progH, progH/2);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;

  // التقدم المتدرج
  const progFilled = (data.progress / 100) * progW;
  if (progFilled > 0) {
    const grad = ctx.createLinearGradient(infoX, progY, infoX + progFilled, progY);
    grad.addColorStop(0, "#7c4dff");
    grad.addColorStop(0.3, "#9c7eff");
    grad.addColorStop(0.6, "#7c4dff");
    grad.addColorStop(1, "#5c3aff");
    
    ctx.fillStyle = grad;
    ctx.shadowColor = "#7c4dff";
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.roundRect(infoX, progY, progFilled, progH, progH/2);
    ctx.fill();
    
    // لمعة متحركة
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.beginPath();
    ctx.roundRect(infoX, progY, progFilled, progH/2, progH/4);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // نص النسبة المئوية
  ctx.font = "bold 18px Arial";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.shadowColor = "#000000";
  ctx.shadowBlur = 4;
  ctx.fillText(`${Math.round(data.progress)}%`, infoX + progW/2, progY + 23);
  ctx.shadowBlur = 0;

  // XP المطلوب
  ctx.font = "14px Arial";
  ctx.fillStyle = "#9c7eff";
  ctx.textAlign = "right";
  ctx.fillText(`${formatNumber(data.expNeeded)} XP needed`, infoX + progW, progY + progH + 20);

  // ══════════════ معلومات إضافية ══════════════
  const extraY = progY + progH + 50;
  
  // Streak
  if (data.streak > 0) {
    ctx.font = "bold 16px Arial";
    ctx.fillStyle = "#ff6b35";
    ctx.textAlign = "left";
    ctx.fillText(`🔥 Streak: ${data.streak} days`, infoX, extraY);
  }

  // توقيع
  ctx.font = "11px Arial";
  ctx.fillStyle = "#555555";
  ctx.textAlign = "right";
  ctx.fillText("KIRA BOT • Ultra Detailed Profile • by Ayman", W - 30, H - 25);

  return canvas.toBuffer("image/png");
}

function drawDetailedStatCard(ctx, x, y, w, h, emoji, label, value, color, subtitle) {
  // خلفية البطاقة
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.shadowColor = color;
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 12);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;

  // الإيموجي
  ctx.font = "36px Arial";
  ctx.textAlign = "left";
  ctx.fillText(emoji, x + 18, y + 45);

  // العنوان
  ctx.font = "bold 13px Arial";
  ctx.fillStyle = "#aaaaaa";
  ctx.textAlign = "right";
  ctx.fillText(label, x + w - 18, y + 25);

  // القيمة
  ctx.font = "bold 30px Arial";
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  ctx.fillText(formatNumber(value), x + w - 18, y + 62);
  ctx.shadowBlur = 0;

  // عنوان فرعي
  if (subtitle) {
    ctx.font = "11px Arial";
    ctx.fillStyle = "#777777";
    ctx.fillText(subtitle, x + w - 18, y + 80);
  }
}

function drawLevelBadge(ctx, x, y, level, rank) {
  const badgeSize = 70;
  
  // دائرة الخلفية
  ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
  ctx.strokeStyle = "#ffd700";
  ctx.lineWidth = 3;
  ctx.shadowColor = "#ffd700";
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.arc(x, y, badgeSize/2, 0, Math.PI*2);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;

  // المستوى
  ctx.font = "bold 28px Arial";
  ctx.fillStyle = "#ffd700";
  ctx.textAlign = "center";
  ctx.shadowColor = "#ffd700";
  ctx.shadowBlur = 15;
  ctx.fillText(level, x, y + 10);
  ctx.shadowBlur = 0;
}

function drawHexagon(ctx, x, y, radius) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const px = x + radius * Math.cos(angle);
    const py = y + radius * Math.sin(angle);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function drawCorner(ctx, x, y, size, color, position) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  
  ctx.beginPath();
  if (position === "tl") {
    ctx.moveTo(x + size, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y + size);
  } else if (position === "tr") {
    ctx.moveTo(x - size, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y + size);
  } else if (position === "bl") {
    ctx.moveTo(x + size, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y - size);
  } else if (position === "br") {
    ctx.moveTo(x - size, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y - size);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}
