const Canvas = require("@napi-rs/canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const mongodb = require(path.join(process.cwd(), "includes", "mongodb.js"));

module.exports.config = {
  name: "بنك",
  version: "3.0.0",
  hasPermssion: 0,
  credits: "ايمن - Cyberpunk Style",
  description: "بطاقة بروفايل سايبربانك",
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

    const data = await mongodb.getUserData(targetID);
    
    if (!data || !data.currency) {
      return api.sendMessage("❌ لم يتم العثور على بيانات المستخدم!", threadID, messageID);
    }
    
    const { currency, calculated } = data;
    const userInfo = await api.getUserInfo(targetID);
    const username = data.user.name || userInfo[targetID].name || "مستخدم";
    
    // تحديد إذا كان مطور
    const isDeveloper = global.config.ADMINBOT && global.config.ADMINBOT.includes(targetID);
    
    api.sendMessage("🎨 جاري إنشاء البطاقة السايبربانك...", threadID, messageID);
    
    const card = await createCyberpunkCard({
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
      streak: currency.streak || 0,
      isDeveloper: isDeveloper
    });
    
    const cachePath = path.join(__dirname, "cache", `profile_cyber_${targetID}.png`);
    await fs.ensureDir(path.join(__dirname, "cache"));
    await fs.writeFile(cachePath, card);
    
    return api.sendMessage({
      body: `╔═══════════════╗\n` +
            `║  𝗖𝗬𝗕𝗘𝗥 𝗣𝗥𝗢𝗙𝗜𝗟𝗘  ║\n` +
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

// ══════════════════════════════════════════════════════════
// 🎨 تحديد ألوان السايبربانك حسب XP
// ══════════════════════════════════════════════════════════
function getCyberpunkTheme(exp, isDeveloper) {
  if (isDeveloper) {
    return {
      name: "مطور",
      emoji: "👑",
      // أحمر نيوني داكن مظلم
      primary: "#ff0040",
      secondary: "#cc0033",
      accent: "#ff1a4d",
      glow: "#ff0044",
      background: ["#1a0008", "#2b0010", "#200008"],
      particles: ["#ff0040", "#cc0033", "#ff1a4d", "#990022", "#ff0055"],
      border: "#ff0044",
      isSpecial: true
    };
  }
  
  if (exp < 200) {
    // مبتدئ - أصفر نيون
    return {
      name: "مبتدئ",
      emoji: "🌱",
      primary: "#ffff00",
      secondary: "#fff700",
      accent: "#ffed00",
      glow: "#ffff00",
      background: ["#1a1a00", "#2b2b00", "#1f1f00"],
      particles: ["#ffff00", "#fff700", "#ffed00"],
      border: "#ffff00"
    };
  } else if (exp < 400) {
    // جندي - أخضر نيون
    return {
      name: "جندي",
      emoji: "🎖️",
      primary: "#00ff00",
      secondary: "#00ff88",
      accent: "#00ffcc",
      glow: "#00ff44",
      background: ["#001a00", "#002b00", "#001f00"],
      particles: ["#00ff00", "#00ff88", "#00ffcc"],
      border: "#00ff00"
    };
  } else if (exp < 700) {
    // عسكري - أزرق نيون
    return {
      name: "عسكري",
      emoji: "⚔️",
      primary: "#00d4ff",
      secondary: "#0088ff",
      accent: "#00ffff",
      glow: "#00aaff",
      background: ["#001a2b", "#00152b", "#001a33"],
      particles: ["#00d4ff", "#0088ff", "#00ffff"],
      border: "#00d4ff"
    };
  } else if (exp < 1000) {
    // ضابط - برتقالي نيون
    return {
      name: "ضابط",
      emoji: "🎗️",
      primary: "#ff8800",
      secondary: "#ff6600",
      accent: "#ffaa00",
      glow: "#ff9900",
      background: ["#2b1500", "#331a00", "#2b1800"],
      particles: ["#ff8800", "#ff6600", "#ffaa00"],
      border: "#ff8800"
    };
  } else if (exp < 2500) {
    // قائد - فضي نيون
    return {
      name: "قائد",
      emoji: "⭐",
      primary: "#c0c0c0",
      secondary: "#e0e0e0",
      accent: "#ffffff",
      glow: "#d0d0d0",
      background: ["#1a1a1a", "#2b2b2b", "#222222"],
      particles: ["#c0c0c0", "#e0e0e0", "#ffffff"],
      border: "#c0c0c0"
    };
  } else {
    // وزير - ذهبي نيون
    return {
      name: "وزير",
      emoji: "👑",
      primary: "#ffd700",
      secondary: "#ffed00",
      accent: "#fff700",
      glow: "#ffe700",
      background: ["#2b2200", "#332900", "#2b2500"],
      particles: ["#ffd700", "#ffed00", "#fff700"],
      border: "#ffd700"
    };
  }
}

// ══════════════════════════════════════════════════════════
// 🎨 الدالة الرئيسية لإنشاء البطاقة السايبربانك
// ══════════════════════════════════════════════════════════
async function createCyberpunkCard(data) {
  const W = 1100;
  const H = 700;
  const canvas = Canvas.createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  // الحصول على theme السايبربانك
  const theme = getCyberpunkTheme(data.exp, data.isDeveloper);

  // ══════════════ خلفية سايبربانك داكنة ══════════════
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, theme.background[0]);
  bgGrad.addColorStop(0.5, theme.background[1]);
  bgGrad.addColorStop(1, theme.background[2]);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // شبكة سايبربانك
  ctx.strokeStyle = `rgba(${hexToRgb(theme.border)}, 0.12)`;
  ctx.lineWidth = 1;
  for (let i = 0; i < W; i += 30) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, H);
    ctx.stroke();
  }
  for (let j = 0; j < H; j += 30) {
    ctx.beginPath();
    ctx.moveTo(0, j);
    ctx.lineTo(W, j);
    ctx.stroke();
  }

  // جزيئات متوهجة
  const particleCount = theme.isSpecial ? 60 : 35;
  for (let i = 0; i < particleCount; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const r = 1.5 + Math.random() * (theme.isSpecial ? 6 : 3);
    const colorIndex = Math.floor(Math.random() * theme.particles.length);
    const color = theme.particles[colorIndex];
    
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
    grad.addColorStop(0, color);
    grad.addColorStop(0.4, `${color}99`);
    grad.addColorStop(1, `${color}00`);
    
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r * 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // ══════════════ الحاوية الرئيسية السايبربانك ══════════════
  const containerX = 40;
  const containerY = 40;
  const containerW = W - 80;
  const containerH = H - 80;

  // خلفية الحاوية
  ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
  ctx.beginPath();
  ctx.roundRect(containerX, containerY, containerW, containerH, 20);
  ctx.fill();

  // إطار مزدوج سايبربانك
  ctx.strokeStyle = theme.border;
  ctx.lineWidth = 4;
  ctx.shadowColor = theme.glow;
  ctx.shadowBlur = 30;
  ctx.stroke();

  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = 2;
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.roundRect(containerX + 5, containerY + 5, containerW - 10, containerH - 10, 18);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // خطوط زوايا سايبربانك
  drawCyberCorners(ctx, containerX, containerY, containerW, containerH, theme);

  // ══════════════ صورة البروفايل السداسية ══════════════
  const avatarX = containerX + 70;
  const avatarY = containerY + 90;
  const avatarSize = 140;

  try {
    const avatarUrl = `https://graph.facebook.com/${data.userID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const response = await axios.get(avatarUrl, { responseType: "arraybuffer" });
    const avatarImg = await Canvas.loadImage(Buffer.from(response.data));

    // دوائر توهج خلفية
    for (let i = 4; i >= 0; i--) {
      const r = avatarSize/2 + (i * 12);
      const alpha = 0.6 - (i * 0.1);
      
      ctx.fillStyle = `${theme.primary}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
      ctx.shadowColor = theme.primary;
      ctx.shadowBlur = 35;
      ctx.beginPath();
      ctx.arc(avatarX, avatarY, r, 0, Math.PI*2);
      ctx.fill();
    }

    // رسم الصورة سداسية
    ctx.save();
    ctx.shadowBlur = 0;
    ctx.beginPath();
    drawHexagon(ctx, avatarX, avatarY, avatarSize/2);
    ctx.clip();
    ctx.drawImage(avatarImg, avatarX - avatarSize/2, avatarY - avatarSize/2, avatarSize, avatarSize);
    ctx.restore();

    // إطار سداسي نيون
    ctx.strokeStyle = theme.primary;
    ctx.lineWidth = 5;
    ctx.shadowColor = theme.primary;
    ctx.shadowBlur = 40;
    ctx.beginPath();
    drawHexagon(ctx, avatarX, avatarY, avatarSize/2);
    ctx.stroke();

    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 25;
    ctx.beginPath();
    drawHexagon(ctx, avatarX, avatarY, avatarSize/2 - 6);
    ctx.stroke();
    ctx.shadowBlur = 0;

  } catch (error) {
    console.error("Error loading avatar:", error);
  }

  // شارة المستوى
  drawCyberLevelBadge(ctx, avatarX, avatarY + avatarSize/2 + 45, data.level, theme);

  // ══════════════ معلومات المستخدم ══════════════
  const infoX = containerX + 240;
  const infoY = containerY + 60;

  // الاسم
  ctx.font = "bold 42px Arial";
  ctx.fillStyle = theme.primary;
  ctx.textAlign = "left";
  ctx.shadowColor = theme.primary;
  ctx.shadowBlur = 35;
  ctx.fillText(data.username, infoX, infoY);
  ctx.shadowBlur = 0;

  // الرتبة والمستوى
  ctx.font = "bold 24px Arial";
  ctx.fillStyle = theme.accent;
  ctx.shadowColor = theme.accent;
  ctx.shadowBlur = 20;
  ctx.fillText(`${theme.emoji} ${theme.name} • LVL ${data.level}`, infoX, infoY + 45);
  ctx.shadowBlur = 0;

  // User ID
  ctx.font = "14px 'Courier New'";
  ctx.fillStyle = theme.secondary;
  ctx.shadowColor = theme.secondary;
  ctx.shadowBlur = 12;
  ctx.fillText(`ID: ${data.userID}`, infoX, infoY + 75);
  ctx.shadowBlur = 0;

  // ══════════════ البطاقات الثلاث (XP - MONEY - MSG) ══════════════
  const cardsY = infoY + 110;
  const cardW = 270;
  const cardH = 110;
  const cardSpacing = 20;

  // البطاقة الأولى: XP
  drawCyberStatCard(ctx, infoX, cardsY, cardW, cardH, "✨", "EXPERIENCE", data.exp, theme, "XP");

  // البطاقة الثانية: MONEY
  drawCyberStatCard(ctx, infoX + cardW + cardSpacing, cardsY, cardW, cardH, "💰", "MONEY", data.money, theme, "$");

  // البطاقة الثالثة: MESSAGES
  drawCyberStatCard(ctx, infoX, cardsY + cardH + cardSpacing, cardW, cardH, "💬", "MESSAGES", data.msgCount, theme, "MSG");

  // ══════════════ شريط التقدم ══════════════
  const progY = cardsY + (cardH * 2) + cardSpacing + 30;
  const progW = (cardW * 2) + cardSpacing;
  const progH = 35;

  // خلفية الشريط
  ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  ctx.beginPath();
  ctx.roundRect(infoX, progY, progW, progH, progH/2);
  ctx.fill();

  ctx.strokeStyle = theme.border;
  ctx.lineWidth = 2;
  ctx.shadowColor = theme.border;
  ctx.shadowBlur = 15;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // التقدم الممتلئ
  const progFilled = (data.progress / 100) * progW;
  if (progFilled > 0) {
    const grad = ctx.createLinearGradient(infoX, progY, infoX + progFilled, progY);
    if (theme.isSpecial) {
      // تدرج أحمر نيوني للمطور
      grad.addColorStop(0, theme.particles[0]);
      grad.addColorStop(0.33, theme.particles[1]);
      grad.addColorStop(0.66, theme.particles[2]);
      grad.addColorStop(1, theme.particles[3]);
    } else {
      grad.addColorStop(0, theme.primary);
      grad.addColorStop(0.5, theme.accent);
      grad.addColorStop(1, theme.secondary);
    }
    
    ctx.fillStyle = grad;
    ctx.shadowColor = theme.glow;
    ctx.shadowBlur = 40;
    ctx.beginPath();
    ctx.roundRect(infoX, progY, progFilled, progH, progH/2);
    ctx.fill();

    // لمعة
    const shineGrad = ctx.createLinearGradient(infoX, progY, infoX + progFilled, progY);
    shineGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
    shineGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.5)");
    shineGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = shineGrad;
    ctx.beginPath();
    ctx.roundRect(infoX, progY, progFilled, progH/2, progH/4);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // نص النسبة المئوية
  ctx.font = "bold 20px Arial";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.shadowColor = theme.primary;
  ctx.shadowBlur = 25;
  ctx.fillText(`${Math.round(data.progress)}%`, infoX + progW/2, progY + 24);
  ctx.shadowBlur = 0;

  // XP المطلوب
  ctx.font = "15px Arial";
  ctx.fillStyle = theme.accent;
  ctx.textAlign = "right";
  ctx.shadowColor = theme.accent;
  ctx.shadowBlur = 12;
  ctx.fillText(`${formatNumber(data.expNeeded)} XP needed`, infoX + progW, progY + progH + 22);
  ctx.shadowBlur = 0;

  // ══════════════ Streak ══════════════
  if (data.streak > 0) {
    const streakY = progY + progH + 55;
    ctx.font = "bold 18px Arial";
    ctx.fillStyle = theme.isSpecial ? theme.particles[2] : "#ff6b35";
    ctx.textAlign = "left";
    ctx.shadowColor = theme.isSpecial ? theme.particles[2] : "#ff6b35";
    ctx.shadowBlur = 18;
    ctx.fillText(`🔥 STREAK: ${data.streak} DAYS`, infoX, streakY);
    ctx.shadowBlur = 0;
  }

  // ══════════════ التوقيع ══════════════
  ctx.font = "12px 'Courier New'";
  ctx.fillStyle = theme.secondary;
  ctx.textAlign = "right";
  ctx.shadowColor = theme.secondary;
  ctx.shadowBlur = 12;
  ctx.fillText("⚡ KIRA BOT • CYBERPUNK SYSTEM • BY AYMAN ⚡", W - 50, H - 35);
  ctx.shadowBlur = 0;

  return canvas.toBuffer("image/png");
}

// ══════════════════════════════════════════════════════════
// 🎨 دالة رسم بطاقة إحصائية سايبربانك
// ══════════════════════════════════════════════════════════
function drawCyberStatCard(ctx, x, y, w, h, emoji, label, value, theme, unit) {
  // خلفية سوداء شفافة
  ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 12);
  ctx.fill();
  
  // إطار نيون
  ctx.strokeStyle = theme.border;
  ctx.lineWidth = 3;
  ctx.shadowColor = theme.border;
  ctx.shadowBlur = 25;
  ctx.stroke();
  
  // إطار داخلي
  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = 1.5;
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.roundRect(x + 3, y + 3, w - 6, h - 6, 10);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // توهج داخلي
  const innerGrad = ctx.createRadialGradient(x + w/2, y + h/2, 0, x + w/2, y + h/2, w/2);
  innerGrad.addColorStop(0, `${theme.primary}18`);
  innerGrad.addColorStop(1, `${theme.primary}00`);
  ctx.fillStyle = innerGrad;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 12);
  ctx.fill();

  // الإيموجي
  ctx.font = "35px Arial";
  ctx.textAlign = "left";
  ctx.shadowColor = theme.accent;
  ctx.shadowBlur = 18;
  ctx.fillText(emoji, x + 18, y + 45);
  ctx.shadowBlur = 0;

  // العنوان
  ctx.font = "bold 13px Arial";
  ctx.fillStyle = theme.accent;
  ctx.textAlign = "right";
  ctx.shadowColor = theme.accent;
  ctx.shadowBlur = 12;
  ctx.fillText(label, x + w - 18, y + 25);
  ctx.shadowBlur = 0;

  // القيمة
  ctx.font = "bold 30px Arial";
  ctx.fillStyle = theme.primary;
  ctx.shadowColor = theme.primary;
  ctx.shadowBlur = 28;
  ctx.fillText(formatNumberShort(value), x + w - 18, y + 60);
  ctx.shadowBlur = 0;

  // الوحدة
  if (unit) {
    ctx.font = "bold 11px Arial";
    ctx.fillStyle = theme.secondary;
    ctx.shadowColor = theme.secondary;
    ctx.shadowBlur = 10;
    ctx.fillText(unit, x + w - 18, y + 80);
    ctx.shadowBlur = 0;
  }
}

// ══════════════════════════════════════════════════════════
// 🎨 دالة رسم شارة المستوى السايبربانك
// ══════════════════════════════════════════════════════════
function drawCyberLevelBadge(ctx, x, y, level, theme) {
  const badgeSize = 75;
  
  // دوائر توهج خلفية
  for (let i = 3; i >= 0; i--) {
    const r = badgeSize/2 + (i * 7);
    const alpha = 0.7 - (i * 0.15);
    
    ctx.fillStyle = `${theme.primary}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
    ctx.shadowColor = theme.primary;
    ctx.shadowBlur = 28 - (i * 5);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI*2);
    ctx.fill();
  }
  
  // الدائرة الأساسية
  ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
  ctx.beginPath();
  ctx.arc(x, y, badgeSize/2, 0, Math.PI*2);
  ctx.fill();
  
  // إطار مزدوج
  ctx.strokeStyle = theme.border;
  ctx.lineWidth = 4;
  ctx.shadowColor = theme.border;
  ctx.shadowBlur = 32;
  ctx.stroke();
  
  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = 2;
  ctx.shadowBlur = 22;
  ctx.beginPath();
  ctx.arc(x, y, badgeSize/2 - 5, 0, Math.PI*2);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // المستوى
  ctx.font = "bold 32px Arial";
  ctx.fillStyle = theme.primary;
  ctx.textAlign = "center";
  ctx.shadowColor = theme.primary;
  ctx.shadowBlur = 38;
  ctx.fillText(level, x, y + 10);
  ctx.shadowBlur = 0;
}

// ══════════════════════════════════════════════════════════
// 🎨 دالة رسم زوايا سايبربانك
// ══════════════════════════════════════════════════════════
function drawCyberCorners(ctx, x, y, w, h, theme) {
  const size = 35;
  const thickness = 4;
  
  // الزاوية العلوية اليسرى
  ctx.strokeStyle = theme.primary;
  ctx.lineWidth = thickness;
  ctx.shadowColor = theme.primary;
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.moveTo(x + size, y + 15);
  ctx.lineTo(x + 15, y + 15);
  ctx.lineTo(x + 15, y + size);
  ctx.stroke();
  
  // الزاوية العلوية اليمنى
  ctx.beginPath();
  ctx.moveTo(x + w - size, y + 15);
  ctx.lineTo(x + w - 15, y + 15);
  ctx.lineTo(x + w - 15, y + size);
  ctx.stroke();
  
  // الزاوية السفلية اليسرى
  ctx.beginPath();
  ctx.moveTo(x + size, y + h - 15);
  ctx.lineTo(x + 15, y + h - 15);
  ctx.lineTo(x + 15, y + h - size);
  ctx.stroke();
  
  // الزاوية السفلية اليمنى
  ctx.beginPath();
  ctx.moveTo(x + w - size, y + h - 15);
  ctx.lineTo(x + w - 15, y + h - 15);
  ctx.lineTo(x + w - 15, y + h - size);
  ctx.stroke();
  
  ctx.shadowBlur = 0;
}

// ══════════════════════════════════════════════════════════
// 🎨 دالة رسم سداسي
// ══════════════════════════════════════════════════════════
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

// ══════════════════════════════════════════════════════════
// 🎨 دالة مساعدة لتحويل Hex إلى RGB
// ══════════════════════════════════════════════════════════
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? 
    `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
    "255, 255, 255";
}

function formatNumberShort(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}
