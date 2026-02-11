const Canvas = require("@napi-rs/canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const mongodb = require(path.join(process.cwd(), "includes", "mongodb.js"));

module.exports.config = {
  name: "بنك",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "ايمن - Ultra Detailed Profile Card",
  description: "بطاقة بروفايل دقيقة ومفصلة للغاية",
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
      streak: currency.streak || 0,
      isDeveloper: isDeveloper
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

// ══════════════════════════════════════════════════════════
// 🎨 تحديد الألوان حسب XP
// ══════════════════════════════════════════════════════════
function getRankTheme(exp, isDeveloper) {
  if (isDeveloper) {
    return {
      name: "مطور",
      emoji: "👑",
      // ألوان نيون بنفسجية متعددة
      primary: "#b829ff",
      secondary: "#ff29d4",
      accent: "#29fff5",
      glow: "#d429ff",
      background: ["#1a0033", "#330066", "#1a0040"],
      particles: ["#b829ff", "#ff29d4", "#29fff5", "#8829ff", "#ff29a6"],
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
      particles: ["#ffff00", "#fff700", "#ffed00"]
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
      particles: ["#00ff00", "#00ff88", "#00ffcc"]
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
      particles: ["#00d4ff", "#0088ff", "#00ffff"]
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
      particles: ["#ff8800", "#ff6600", "#ffaa00"]
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
      particles: ["#c0c0c0", "#e0e0e0", "#ffffff"]
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
      particles: ["#ffd700", "#ffed00", "#fff700"]
    };
  }
}

// ══════════════════════════════════════════════════════════
// 🎨 الدالة الرئيسية لإنشاء البطاقة
// ══════════════════════════════════════════════════════════
async function createUltraDetailedCard(data) {
  const W = 1100;
  const H = 700;
  const canvas = Canvas.createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  // الحصول على theme الرتبة
  const theme = getRankTheme(data.exp, data.isDeveloper);

  // ══════════════ الخلفية النيون المتدرجة ══════════════
  if (theme.isSpecial) {
    // خلفية متحركة للمطور
    const bgGrad = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W, H)/2);
    bgGrad.addColorStop(0, theme.background[0]);
    bgGrad.addColorStop(0.5, theme.background[1]);
    bgGrad.addColorStop(1, theme.background[2]);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);
    
    // موجات نيون متعددة
    for (let i = 0; i < 5; i++) {
      const waveGrad = ctx.createLinearGradient(0, H * i / 5, W, H * (i + 1) / 5);
      waveGrad.addColorStop(0, `rgba(184, 41, 255, ${0.05 + i * 0.02})`);
      waveGrad.addColorStop(0.5, `rgba(255, 41, 212, ${0.05 + i * 0.02})`);
      waveGrad.addColorStop(1, `rgba(41, 255, 245, ${0.05 + i * 0.02})`);
      ctx.fillStyle = waveGrad;
      ctx.fillRect(0, 0, W, H);
    }
  } else {
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, theme.background[0]);
    bgGrad.addColorStop(0.5, theme.background[1]);
    bgGrad.addColorStop(1, theme.background[2]);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);
  }

  // شبكة نيون
  ctx.strokeStyle = `rgba(${hexToRgb(theme.primary)}, 0.08)`;
  ctx.lineWidth = 1;
  ctx.shadowColor = theme.primary;
  ctx.shadowBlur = 5;
  for (let i = 0; i < W; i += 25) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, H);
    ctx.stroke();
  }
  for (let j = 0; j < H; j += 25) {
    ctx.beginPath();
    ctx.moveTo(0, j);
    ctx.lineTo(W, j);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;

  // جزيئات نيون متوهجة
  const particleCount = theme.isSpecial ? 50 : 30;
  for (let i = 0; i < particleCount; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const r = 2 + Math.random() * (theme.isSpecial ? 8 : 4);
    const colorIndex = Math.floor(Math.random() * theme.particles.length);
    const color = theme.particles[colorIndex];
    
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
    grad.addColorStop(0, color);
    grad.addColorStop(0.3, `${color}bb`);
    grad.addColorStop(1, `${color}00`);
    
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r * 4, 0, Math.PI * 2);
    ctx.fill();
    
    // نقطة مركزية
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = theme.isSpecial ? 20 : 15;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // دوائر نيون كبيرة
  for (let i = 0; i < (theme.isSpecial ? 12 : 6); i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const r = 40 + Math.random() * 100;
    const colorIndex = Math.floor(Math.random() * theme.particles.length);
    const color = theme.particles[colorIndex];
    
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, `${color}22`);
    grad.addColorStop(0.5, `${color}11`);
    grad.addColorStop(1, `${color}00`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // ══════════════ إطار نيون متوهج ══════════════
  // إطار خارجي
  ctx.strokeStyle = theme.primary;
  ctx.lineWidth = 4;
  ctx.shadowColor = theme.primary;
  ctx.shadowBlur = 40;
  ctx.strokeRect(15, 15, W - 30, H - 30);
  
  // إطار أوسط
  ctx.strokeStyle = theme.secondary;
  ctx.lineWidth = 2.5;
  ctx.shadowBlur = 30;
  ctx.strokeRect(22, 22, W - 44, H - 44);
  
  // إطار داخلي
  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = 1.5;
  ctx.shadowBlur = 20;
  ctx.strokeRect(30, 30, W - 60, H - 60);
  ctx.shadowBlur = 0;

  // زوايا نيون مزدوجة
  drawNeonCorner(ctx, 28, 28, 40, theme.primary, theme.secondary, "tl");
  drawNeonCorner(ctx, W - 28, 28, 40, theme.primary, theme.secondary, "tr");
  drawNeonCorner(ctx, 28, H - 28, 40, theme.primary, theme.secondary, "bl");
  drawNeonCorner(ctx, W - 28, H - 28, 40, theme.primary, theme.secondary, "br");

  // ══════════════ صورة البروفايل مع إطار نيون ══════════════
  const avSize = 260;
  const avX = 170;
  const avY = H/2;

  // دوائر نيون متعددة حول الصورة
  for (let i = 0; i < 4; i++) {
    const radius = avSize/2 + 20 + (i * 15);
    const alpha = 1 - (i * 0.2);
    
    ctx.strokeStyle = theme.particles[i % theme.particles.length];
    ctx.lineWidth = 3 - (i * 0.5);
    ctx.shadowColor = theme.particles[i % theme.particles.length];
    ctx.shadowBlur = 35 - (i * 5);
    ctx.beginPath();
    ctx.arc(avX, avY, radius, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;

  // سداسي نيون خارجي
  if (theme.isSpecial) {
    // سداسي دوار للمطور
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = theme.particles[i];
      ctx.lineWidth = 4 - i;
      ctx.shadowColor = theme.particles[i];
      ctx.shadowBlur = 40;
      ctx.save();
      ctx.translate(avX, avY);
      ctx.rotate((Math.PI / 6) * i);
      ctx.translate(-avX, -avY);
      drawHexagon(ctx, avX, avY, avSize/2 + 30 + (i * 10));
      ctx.stroke();
      ctx.restore();
    }
  } else {
    ctx.strokeStyle = theme.primary;
    ctx.lineWidth = 5;
    ctx.shadowColor = theme.primary;
    ctx.shadowBlur = 40;
    drawHexagon(ctx, avX, avY, avSize/2 + 25);
    ctx.stroke();
  }
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
    
    // إطار الصورة النيون
    ctx.strokeStyle = theme.primary;
    ctx.lineWidth = 5;
    ctx.shadowColor = theme.primary;
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(avX, avY, avSize/2, 0, Math.PI*2);
    ctx.stroke();
    
    // حلقة داخلية
    ctx.strokeStyle = theme.secondary;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(avX, avY, avSize/2 - 5, 0, Math.PI*2);
    ctx.stroke();
    ctx.shadowBlur = 0;
    
  } catch(e) {
    // صورة افتراضية نيون
    const avatarGrad = ctx.createRadialGradient(avX, avY, 0, avX, avY, avSize/2);
    avatarGrad.addColorStop(0, theme.background[1]);
    avatarGrad.addColorStop(1, theme.background[0]);
    ctx.fillStyle = avatarGrad;
    ctx.beginPath();
    ctx.arc(avX, avY, avSize/2, 0, Math.PI*2);
    ctx.fill();
    
    ctx.font = "bold 100px Arial";
    ctx.fillStyle = theme.primary;
    ctx.textAlign = "center";
    ctx.shadowColor = theme.primary;
    ctx.shadowBlur = 40;
    ctx.fillText("?", avX, avY + 35);
    ctx.shadowBlur = 0;
  }

  // شارة المستوى النيون
  drawNeonLevelBadge(ctx, avX, avY - avSize/2 - 35, data.level, theme);

  // ══════════════ قسم المعلومات النيون ══════════════
  const infoX = 420;
  const infoY = 80;

  // العنوان الرئيسي
  ctx.font = "bold 26px Arial";
  ctx.fillStyle = theme.secondary;
  ctx.textAlign = "left";
  ctx.shadowColor = theme.secondary;
  ctx.shadowBlur = 25;
  ctx.fillText("◈◈◈ PLAYER PROFILE ◈◈◈", infoX, infoY);
  ctx.shadowBlur = 0;

  // اسم المستخدم - نيون مزدوج
  ctx.font = "bold 56px Arial";
  
  // ظل خارجي
  ctx.fillStyle = theme.accent;
  ctx.shadowColor = theme.accent;
  ctx.shadowBlur = 50;
  ctx.fillText(data.username, infoX + 2, infoY + 57);
  
  // النص الأساسي
  ctx.fillStyle = theme.primary;
  ctx.shadowColor = theme.primary;
  ctx.shadowBlur = 40;
  ctx.fillText(data.username, infoX, infoY + 55);
  ctx.shadowBlur = 0;

  // خط فاصل نيون متدرج
  const lineY = infoY + 80;
  const lineGrad = ctx.createLinearGradient(infoX, lineY, infoX + 650, lineY);
  lineGrad.addColorStop(0, `${theme.primary}00`);
  lineGrad.addColorStop(0.2, theme.primary);
  lineGrad.addColorStop(0.5, theme.accent);
  lineGrad.addColorStop(0.8, theme.secondary);
  lineGrad.addColorStop(1, `${theme.secondary}00`);
  
  ctx.strokeStyle = lineGrad;
  ctx.lineWidth = 3;
  ctx.shadowColor = theme.primary;
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.moveTo(infoX, lineY);
  ctx.lineTo(infoX + 650, lineY);
  ctx.stroke();
  
  // خط ثانوي
  ctx.lineWidth = 1.5;
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.moveTo(infoX, lineY + 3);
  ctx.lineTo(infoX + 650, lineY + 3);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // ID المستخدم
  ctx.font = "bold 22px Courier New";
  ctx.fillStyle = theme.accent;
  ctx.shadowColor = theme.accent;
  ctx.shadowBlur = 15;
  ctx.fillText(`USER ID: ${data.userID}`, infoX, infoY + 120);
  ctx.shadowBlur = 0;

  // الرتبة والمستوى
  ctx.font = "bold 32px Arial";
  ctx.fillStyle = theme.primary;
  ctx.shadowColor = theme.primary;
  ctx.shadowBlur = 30;
  ctx.fillText(`${theme.emoji} ${theme.name}`, infoX, infoY + 165);
  
  ctx.font = "28px Arial";
  ctx.fillStyle = theme.secondary;
  ctx.shadowColor = theme.secondary;
  ctx.shadowBlur = 20;
  ctx.fillText(`| Level ${data.level}`, infoX + 220, infoY + 165);
  ctx.shadowBlur = 0;

  // ══════════════ البطاقات الإحصائية النيون ══════════════
  const statsY = infoY + 220;
  const cardW = 200;
  const cardH = 115;
  const gap = 20;

  // XP
  drawNeonStatCard(ctx, infoX, statsY, cardW, cardH, 
    "✨", "EXPERIENCE", data.exp, theme, `${formatNumber(data.expNeeded)} next`);

  // Money
  drawNeonStatCard(ctx, infoX + cardW + gap, statsY, cardW, cardH,
    "💰", "BALANCE", data.money, theme, "Kira Coins");

  // Messages
  drawNeonStatCard(ctx, infoX + (cardW + gap) * 2, statsY, cardW, cardH,
    "💬", "MESSAGES", data.msgCount, theme, "sent");

  // ══════════════ شريط التقدم النيون ══════════════
  const progY = statsY + cardH + 50;
  const progW = cardW * 3 + gap * 2;
  const progH = 40;

  // عنوان الشريط
  ctx.font = "bold 20px Arial";
  ctx.fillStyle = theme.accent;
  ctx.textAlign = "left";
  ctx.shadowColor = theme.accent;
  ctx.shadowBlur = 15;
  ctx.fillText("⚡ LEVEL PROGRESS ⚡", infoX, progY - 15);
  ctx.shadowBlur = 0;

  // خلفية الشريط
  ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
  ctx.strokeStyle = theme.primary;
  ctx.lineWidth = 3;
  ctx.shadowColor = theme.primary;
  ctx.shadowBlur = 25;
  ctx.beginPath();
  ctx.roundRect(infoX, progY, progW, progH, progH/2);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;

  // التقدم النيون المتدرج
  const progFilled = (data.progress / 100) * progW;
  if (progFilled > 0) {
    const grad = ctx.createLinearGradient(infoX, progY, infoX + progFilled, progY);
    if (theme.isSpecial) {
      // تدرج قوس قزح للمطور
      grad.addColorStop(0, theme.particles[0]);
      grad.addColorStop(0.25, theme.particles[1]);
      grad.addColorStop(0.5, theme.particles[2]);
      grad.addColorStop(0.75, theme.particles[3]);
      grad.addColorStop(1, theme.particles[4]);
    } else {
      grad.addColorStop(0, theme.primary);
      grad.addColorStop(0.5, theme.accent);
      grad.addColorStop(1, theme.secondary);
    }
    
    ctx.fillStyle = grad;
    ctx.shadowColor = theme.glow;
    ctx.shadowBlur = 35;
    ctx.beginPath();
    ctx.roundRect(infoX, progY, progFilled, progH, progH/2);
    ctx.fill();
    
    // لمعة متحركة
    const shineGrad = ctx.createLinearGradient(infoX, progY, infoX + progFilled, progY);
    shineGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
    shineGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.4)");
    shineGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = shineGrad;
    ctx.beginPath();
    ctx.roundRect(infoX, progY, progFilled, progH/2, progH/4);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // نص النسبة المئوية
  ctx.font = "bold 22px Arial";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.shadowColor = theme.primary;
  ctx.shadowBlur = 30;
  ctx.fillText(`${Math.round(data.progress)}%`, infoX + progW/2, progY + 27);
  ctx.shadowBlur = 0;

  // XP المطلوب
  ctx.font = "16px Arial";
  ctx.fillStyle = theme.accent;
  ctx.textAlign = "right";
  ctx.shadowColor = theme.accent;
  ctx.shadowBlur = 15;
  ctx.fillText(`${formatNumber(data.expNeeded)} XP needed`, infoX + progW, progY + progH + 25);
  ctx.shadowBlur = 0;

  // ══════════════ معلومات إضافية ══════════════
  const extraY = progY + progH + 60;
  
  // Streak
  if (data.streak > 0) {
    ctx.font = "bold 18px Arial";
    ctx.fillStyle = theme.isSpecial ? theme.particles[1] : "#ff6b35";
    ctx.textAlign = "left";
    ctx.shadowColor = theme.isSpecial ? theme.particles[1] : "#ff6b35";
    ctx.shadowBlur = 20;
    ctx.fillText(`🔥 Streak: ${data.streak} days`, infoX, extraY);
    ctx.shadowBlur = 0;
  }

  // توقيع نيون
  ctx.font = "13px Arial";
  ctx.fillStyle = theme.secondary;
  ctx.textAlign = "right";
  ctx.shadowColor = theme.secondary;
  ctx.shadowBlur = 15;
  ctx.fillText("✨ KIRA BOT • Ultra Neon Profile • by Ayman ✨", W - 35, H - 30);
  ctx.shadowBlur = 0;

  return canvas.toBuffer("image/png");
}

// ══════════════════════════════════════════════════════════
// 🎨 دالة رسم بطاقة إحصائية نيون
// ══════════════════════════════════════════════════════════
function drawNeonStatCard(ctx, x, y, w, h, emoji, label, value, theme, subtitle) {
  // خلفية البطاقة مع توهج
  ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 15);
  ctx.fill();
  
  // إطار نيون مزدوج
  ctx.strokeStyle = theme.primary;
  ctx.lineWidth = 3;
  ctx.shadowColor = theme.primary;
  ctx.shadowBlur = 25;
  ctx.stroke();
  
  ctx.strokeStyle = theme.secondary;
  ctx.lineWidth = 1.5;
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.roundRect(x + 3, y + 3, w - 6, h - 6, 12);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // توهج خلفية داخلي
  const innerGrad = ctx.createRadialGradient(x + w/2, y + h/2, 0, x + w/2, y + h/2, w/2);
  innerGrad.addColorStop(0, `${theme.primary}22`);
  innerGrad.addColorStop(1, `${theme.primary}00`);
  ctx.fillStyle = innerGrad;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 15);
  ctx.fill();

  // الإيموجي
  ctx.font = "40px Arial";
  ctx.textAlign = "left";
  ctx.shadowColor = theme.accent;
  ctx.shadowBlur = 20;
  ctx.fillText(emoji, x + 20, y + 50);
  ctx.shadowBlur = 0;

  // العنوان
  ctx.font = "bold 14px Arial";
  ctx.fillStyle = theme.accent;
  ctx.textAlign = "right";
  ctx.shadowColor = theme.accent;
  ctx.shadowBlur = 15;
  ctx.fillText(label, x + w - 20, y + 28);
  ctx.shadowBlur = 0;

  // القيمة
  ctx.font = "bold 32px Arial";
  ctx.fillStyle = theme.primary;
  ctx.shadowColor = theme.primary;
  ctx.shadowBlur = 30;
  ctx.fillText(formatNumber(value), x + w - 20, y + 68);
  ctx.shadowBlur = 0;

  // عنوان فرعي
  if (subtitle) {
    ctx.font = "12px Arial";
    ctx.fillStyle = theme.secondary;
    ctx.shadowColor = theme.secondary;
    ctx.shadowBlur = 10;
    ctx.fillText(subtitle, x + w - 20, y + 88);
    ctx.shadowBlur = 0;
  }
}

// ══════════════════════════════════════════════════════════
// 🎨 دالة رسم شارة المستوى النيون
// ══════════════════════════════════════════════════════════
function drawNeonLevelBadge(ctx, x, y, level, theme) {
  const badgeSize = 85;
  
  // دوائر خلفية متوهجة
  for (let i = 3; i >= 0; i--) {
    const r = badgeSize/2 + (i * 8);
    const alpha = 0.8 - (i * 0.15);
    
    ctx.fillStyle = `${theme.primary}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
    ctx.shadowColor = theme.primary;
    ctx.shadowBlur = 30 - (i * 5);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI*2);
    ctx.fill();
  }
  
  // الدائرة الأساسية
  ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
  ctx.beginPath();
  ctx.arc(x, y, badgeSize/2, 0, Math.PI*2);
  ctx.fill();
  
  // إطار نيون
  ctx.strokeStyle = theme.primary;
  ctx.lineWidth = 4;
  ctx.shadowColor = theme.primary;
  ctx.shadowBlur = 35;
  ctx.stroke();
  
  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = 2;
  ctx.shadowBlur = 25;
  ctx.beginPath();
  ctx.arc(x, y, badgeSize/2 - 5, 0, Math.PI*2);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // المستوى
  ctx.font = "bold 36px Arial";
  ctx.fillStyle = theme.primary;
  ctx.textAlign = "center";
  ctx.shadowColor = theme.primary;
  ctx.shadowBlur = 40;
  ctx.fillText(level, x, y + 12);
  ctx.shadowBlur = 0;
}

// ══════════════════════════════════════════════════════════
// 🎨 دالة رسم زاوية نيون
// ══════════════════════════════════════════════════════════
function drawNeonCorner(ctx, x, y, size, color1, color2, position) {
  // الطبقة الأولى
  ctx.strokeStyle = color1;
  ctx.lineWidth = 3;
  ctx.shadowColor = color1;
  ctx.shadowBlur = 25;
  
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
  
  // الطبقة الثانية
  ctx.strokeStyle = color2;
  ctx.lineWidth = 1.5;
  ctx.shadowBlur = 15;
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

function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}
