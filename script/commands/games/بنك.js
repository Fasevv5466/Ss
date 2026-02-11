const Canvas = require("@napi-rs/canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const mongodb = require(path.join(process.cwd(), "includes", "mongodb.js"));

module.exports.config = {
  name: "بنك",
  version: "5.0.0",
  hasPermssion: 0,
  credits: "ايمن - Ultimate Edition",
  description: "بطاقة بروفايل أسطورية مع تأثيرات متقدمة",
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
    
    const isDeveloper = global.config.ADMINBOT && global.config.ADMINBOT.includes(targetID);
    
    api.sendMessage("✨ جاري إنشاء بطاقة أسطورية...", threadID, messageID);
    
    const card = await createUltimateCard({
      userID: targetID,
      username: username,
      money: currency.money || 0,
      exp: currency.exp || 0,
      level: currency.level || 1,
      msgCount: currency.messageCount || 0,
      rank: calculated.rank,
      progress: calculated.progress,
      expNeeded: calculated.expNeeded,
      streak: currency.streak || 0,
      isDeveloper: isDeveloper
    });
    
    const cachePath = path.join(__dirname, "cache", `ultimate_${targetID}.png`);
    await fs.ensureDir(path.join(__dirname, "cache"));
    await fs.writeFile(cachePath, card);
    
    return api.sendMessage({
      body: `╔═══════════════╗\n` +
            `║ 𝗨𝗟𝗧𝗜𝗠𝗔𝗧𝗘 𝗖𝗔𝗥𝗗 ║\n` +
            `╚═══════════════╝\n\n` +
            `👤 ${username}\n` +
            `🆔 ${targetID}\n` +
            `${calculated.rank.emoji} ${calculated.rank.name} | ⭐ Level ${currency.level}\n` +
            `💰 ${formatNumber(currency.money)} $\n` +
            `✨ ${formatNumber(currency.exp)} XP\n` +
            `💬 ${formatNumber(currency.messageCount)} MSG\n` +
            `🔥 ${currency.streak} Days Streak`,
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
// 🎨 تحديد الثيم المتقدم
// ══════════════════════════════════════════════════════════
function getUltimateTheme(exp, isDeveloper) {
  if (isDeveloper) {
    return {
      name: "DEVELOPER",
      primary: "#8B0000",
      secondary: "#CD0000",
      accent: "#FF0000",
      glow: "#FF1A1A",
      particles: ["#8B0000", "#CD0000", "#FF0000", "#FF1A1A", "#FF4444"],
      bgDark: "#0a0000",
      bgMid: "#120000"
    };
  }
  
  if (exp < 200) {
    return { 
      name: "BEGINNER", 
      primary: "#FFD700", secondary: "#FFA500", accent: "#FFFF00", glow: "#FFED00",
      particles: ["#FFD700", "#FFA500", "#FFFF00", "#FFED00", "#FFE44D"],
      bgDark: "#1a1500", bgMid: "#2b2200"
    };
  } else if (exp < 400) {
    return { 
      name: "SOLDIER", 
      primary: "#00FF00", secondary: "#00FF88", accent: "#00FFCC", glow: "#00FF44",
      particles: ["#00FF00", "#00FF88", "#00FFCC", "#00FF44", "#44FF88"],
      bgDark: "#001a00", bgMid: "#002b00"
    };
  } else if (exp < 700) {
    return { 
      name: "WARRIOR", 
      primary: "#00D4FF", secondary: "#0088FF", accent: "#00FFFF", glow: "#00AAFF",
      particles: ["#00D4FF", "#0088FF", "#00FFFF", "#00AAFF", "#44D4FF"],
      bgDark: "#001a2b", bgMid: "#002b44"
    };
  } else if (exp < 1000) {
    return { 
      name: "OFFICER", 
      primary: "#FF8800", secondary: "#FF6600", accent: "#FFAA00", glow: "#FF9900",
      particles: ["#FF8800", "#FF6600", "#FFAA00", "#FF9900", "#FFBB44"],
      bgDark: "#2b1500", bgMid: "#442200"
    };
  } else if (exp < 2500) {
    return { 
      name: "LEADER", 
      primary: "#C0C0C0", secondary: "#E0E0E0", accent: "#FFFFFF", glow: "#D0D0D0",
      particles: ["#C0C0C0", "#E0E0E0", "#FFFFFF", "#D0D0D0", "#F0F0F0"],
      bgDark: "#1a1a1a", bgMid: "#2b2b2b"
    };
  } else {
    return { 
      name: "MINISTER", 
      primary: "#FFD700", secondary: "#FFED00", accent: "#FFF700", glow: "#FFE700",
      particles: ["#FFD700", "#FFED00", "#FFF700", "#FFE700", "#FFFF44"],
      bgDark: "#2b2200", bgMid: "#443300"
    };
  }
}

// ══════════════════════════════════════════════════════════
// 🎨 الدالة الرئيسية المحسّنة
// ══════════════════════════════════════════════════════════
async function createUltimateCard(data) {
  const W = 1248;
  const H = 827;
  const canvas = Canvas.createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  const theme = getUltimateTheme(data.exp, data.isDeveloper);

  // ══════════════ خلفية متدرجة عميقة ══════════════
  const bgGrad = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W, H)/2);
  bgGrad.addColorStop(0, theme.bgMid);
  bgGrad.addColorStop(0.5, theme.bgDark);
  bgGrad.addColorStop(1, "#000000");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // ══════════════ نمط سداسي في الخلفية ══════════════
  drawHexagonalPattern(ctx, theme);

  // ══════════════ شبكة نيون متقدمة ══════════════
  ctx.strokeStyle = `rgba(${hexToRgb(theme.primary)}, 0.12)`;
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

  // ══════════════ جزيئات ضوئية متحركة ══════════════
  for (let i = 0; i < 80; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const r = 0.5 + Math.random() * 2.5;
    const colorIndex = Math.floor(Math.random() * theme.particles.length);
    const color = theme.particles[colorIndex];
    
    const particleGrad = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
    particleGrad.addColorStop(0, color);
    particleGrad.addColorStop(0.5, `${color}88`);
    particleGrad.addColorStop(1, `${color}00`);
    
    ctx.fillStyle = particleGrad;
    ctx.beginPath();
    ctx.arc(x, y, r * 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // ══════════════ خطوط الزوايا العلوية المحسّنة ══════════════
  drawEnhancedTopLines(ctx, theme);

  // ══════════════ هيدر أسطوري ══════════════
  drawUltimateHeader(ctx, theme);

  // ══════════════ معلومات المستخدم المحسّنة ══════════════
  await drawEnhancedUserInfo(ctx, data, theme);

  // ══════════════ صورة البروفايل مع تأثيرات ══════════════
  await drawEnhancedAvatar(ctx, data.userID, theme);

  // ══════════════ شارة المستوى الأسطورية ══════════════
  drawLegendaryLevelBadge(ctx, data.level, theme);

  // ══════════════ الأشرطة المحسّنة ══════════════
  drawEnhancedStatBars(ctx, data, theme);

  // ══════════════ خطوط الزوايا السفلية ══════════════
  drawEnhancedBottomLines(ctx, theme);

  // ══════════════ توقيع فخم ══════════════
  ctx.font = "14px 'Courier New'";
  ctx.fillStyle = theme.secondary;
  ctx.textAlign = "center";
  ctx.shadowColor = theme.secondary;
  ctx.shadowBlur = 15;
  ctx.fillText("✦ KIRA BANK • ULTIMATE EDITION • POWERED BY AYMAN ✦", W/2, H - 25);
  ctx.shadowBlur = 0;

  return canvas.toBuffer("image/png");
}

// ══════════════════════════════════════════════════════════
// 🎨 رسم نمط سداسي في الخلفية
// ══════════════════════════════════════════════════════════
function drawHexagonalPattern(ctx, theme) {
  const hexSize = 40;
  const hexHeight = hexSize * Math.sqrt(3);
  
  ctx.strokeStyle = `rgba(${hexToRgb(theme.primary)}, 0.05)`;
  ctx.lineWidth = 1;
  
  for (let row = 0; row < 20; row++) {
    for (let col = 0; col < 30; col++) {
      const x = col * hexSize * 1.5 + (row % 2) * hexSize * 0.75;
      const y = row * hexHeight * 0.5;
      
      if (Math.random() > 0.7) {
        drawHexagon(ctx, x, y, hexSize / 2);
        ctx.stroke();
      }
    }
  }
}

// ══════════════════════════════════════════════════════════
// 🎨 هيدر أسطوري محسّن
// ══════════════════════════════════════════════════════════
function drawUltimateHeader(ctx, theme) {
  const centerX = 624;
  const y = 60;
  
  // توهج خلفي قوي
  const glowGrad = ctx.createRadialGradient(centerX, y + 28, 0, centerX, y + 28, 350);
  glowGrad.addColorStop(0, `${theme.primary}22`);
  glowGrad.addColorStop(0.5, `${theme.primary}11`);
  glowGrad.addColorStop(1, `${theme.primary}00`);
  ctx.fillStyle = glowGrad;
  ctx.fillRect(centerX - 350, y - 20, 700, 96);
  
  // الشكل السداسي المتقدم
  ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
  ctx.beginPath();
  ctx.moveTo(centerX - 290, y);
  ctx.lineTo(centerX + 290, y);
  ctx.lineTo(centerX + 320, y + 28);
  ctx.lineTo(centerX + 290, y + 56);
  ctx.lineTo(centerX - 290, y + 56);
  ctx.lineTo(centerX - 320, y + 28);
  ctx.closePath();
  ctx.fill();

  // إطارات متعددة
  ctx.strokeStyle = theme.primary;
  ctx.lineWidth = 4;
  ctx.shadowColor = theme.primary;
  ctx.shadowBlur = 35;
  ctx.stroke();
  
  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = 2;
  ctx.shadowBlur = 25;
  ctx.beginPath();
  ctx.moveTo(centerX - 285, y + 4);
  ctx.lineTo(centerX + 285, y + 4);
  ctx.lineTo(centerX + 313, y + 28);
  ctx.lineTo(centerX + 285, y + 52);
  ctx.lineTo(centerX - 285, y + 52);
  ctx.lineTo(centerX - 313, y + 28);
  ctx.closePath();
  ctx.stroke();
  ctx.shadowBlur = 0;

  // النص مع تأثير holographic
  ctx.font = "bold 38px Arial";
  ctx.fillStyle = theme.primary;
  ctx.textAlign = "center";
  ctx.shadowColor = theme.primary;
  ctx.shadowBlur = 40;
  ctx.fillText("KIRA BANK", centerX, y + 40);
  
  // طبقة ثانية للنص
  ctx.fillStyle = theme.accent;
  ctx.shadowBlur = 25;
  ctx.fillText("KIRA BANK", centerX + 1, y + 39);
  ctx.shadowBlur = 0;
}

// ══════════════════════════════════════════════════════════
// 🎨 معلومات المستخدم المحسّنة
// ══════════════════════════════════════════════════════════
async function drawEnhancedUserInfo(ctx, data, theme) {
  const x = 110;
  const y = 240;

  // أيقونة جانبية محسّنة
  for (let i = 3; i >= 0; i--) {
    ctx.strokeStyle = `${theme.primary}${Math.floor((0.3 - i * 0.05) * 255).toString(16).padStart(2, '0')}`;
    ctx.lineWidth = 6 - i;
    ctx.shadowColor = theme.primary;
    ctx.shadowBlur = 30 - i * 5;
    ctx.beginPath();
    ctx.arc(x, y, 35 + i * 5, Math.PI * 0.75, Math.PI * 1.25);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;

  // الاسم مع تأثير توهج
  ctx.font = "bold 68px Arial";
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "left";
  ctx.shadowColor = "#FFFFFF";
  ctx.shadowBlur = 35;
  ctx.fillText(data.username, x + 50, y + 15);
  
  // طبقة ثانية للتوهج
  ctx.shadowColor = theme.primary;
  ctx.shadowBlur = 50;
  ctx.fillText(data.username, x + 50, y + 15);
  ctx.shadowBlur = 0;

  // صندوق ID محسّن
  const idY = y + 60;
  const idW = 380;
  const idH = 58;
  
  // توهج خلفي
  const idGlow = ctx.createRadialGradient(x + idW/2, idY + idH/2, 0, x + idW/2, idY + idH/2, idW/2);
  idGlow.addColorStop(0, `${theme.primary}18`);
  idGlow.addColorStop(1, `${theme.primary}00`);
  ctx.fillStyle = idGlow;
  ctx.fillRect(x - 20, idY - 10, idW + 40, idH + 20);
  
  // الخلفية
  ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
  ctx.beginPath();
  ctx.moveTo(x - 10, idY);
  ctx.lineTo(x + idW - 20, idY);
  ctx.lineTo(x + idW, idY + idH);
  ctx.lineTo(x + 10, idY + idH);
  ctx.closePath();
  ctx.fill();

  // إطارات متعددة
  ctx.strokeStyle = theme.primary;
  ctx.lineWidth = 3;
  ctx.shadowColor = theme.primary;
  ctx.shadowBlur = 22;
  ctx.stroke();
  
  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = 1.5;
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.moveTo(x - 7, idY + 3);
  ctx.lineTo(x + idW - 23, idY + 3);
  ctx.lineTo(x + idW - 3, idY + idH - 3);
  ctx.lineTo(x + 13, idY + idH - 3);
  ctx.closePath();
  ctx.stroke();
  ctx.shadowBlur = 0;

  // نص ID
  ctx.font = "bold 24px 'Courier New'";
  ctx.fillStyle = theme.accent;
  ctx.shadowColor = theme.accent;
  ctx.shadowBlur = 18;
  ctx.fillText("ID", x + 20, idY + 38);
  
  ctx.fillStyle = theme.primary;
  ctx.shadowColor = theme.primary;
  ctx.shadowBlur = 22;
  ctx.fillText(`#${data.userID}`, x + 80, idY + 38);
  ctx.shadowBlur = 0;
}

// ══════════════════════════════════════════════════════════
// 🎨 صورة البروفايل المحسّنة
// ══════════════════════════════════════════════════════════
async function drawEnhancedAvatar(ctx, userID, theme) {
  const x = 968;
  const y = 300;
  const size = 290;

  try {
    const avatarUrl = `https://graph.facebook.com/${userID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const response = await axios.get(avatarUrl, { responseType: "arraybuffer" });
    const avatarImg = await Canvas.loadImage(Buffer.from(response.data));

    // توهج خلفي متدرج
    for (let i = 8; i >= 0; i--) {
      const r = size/2 + (i * 20);
      const alpha = 0.4 - (i * 0.045);
      
      const glowGrad = ctx.createRadialGradient(x, y, size/2, x, y, r);
      glowGrad.addColorStop(0, `${theme.primary}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`);
      glowGrad.addColorStop(0.6, `${theme.accent}${Math.floor(alpha * 0.7 * 255).toString(16).padStart(2, '0')}`);
      glowGrad.addColorStop(1, `${theme.primary}00`);
      
      ctx.fillStyle = glowGrad;
      ctx.shadowColor = theme.primary;
      ctx.shadowBlur = 50;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI*2);
      ctx.fill();
    }

    // الصورة دائرية
    ctx.save();
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(x, y, size/2, 0, Math.PI*2);
    ctx.clip();
    ctx.drawImage(avatarImg, x - size/2, y - size/2, size, size);
    ctx.restore();

    // إطارات متعددة محسّنة
    // إطار 1 (الأساسي)
    ctx.strokeStyle = theme.primary;
    ctx.lineWidth = 7;
    ctx.shadowColor = theme.primary;
    ctx.shadowBlur = 45;
    ctx.beginPath();
    ctx.arc(x, y, size/2, 0, Math.PI*2);
    ctx.stroke();

    // إطار 2 (الأوسط)
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 4;
    ctx.shadowBlur = 35;
    ctx.beginPath();
    ctx.arc(x, y, size/2 + 14, 0, Math.PI*2);
    ctx.stroke();

    // إطار 3 (الخارجي)
    ctx.strokeStyle = theme.secondary;
    ctx.lineWidth = 3;
    ctx.shadowBlur = 28;
    ctx.beginPath();
    ctx.arc(x, y, size/2 + 25, 0, Math.PI*2);
    ctx.stroke();
    
    // إطار رابع شفاف
    ctx.strokeStyle = theme.glow;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(x, y, size/2 + 34, 0, Math.PI*2);
    ctx.stroke();
    
    ctx.shadowBlur = 0;

  } catch (error) {
    console.error("Error loading avatar:", error);
  }
}

// ══════════════════════════════════════════════════════════
// 🎨 شارة المستوى الأسطورية
// ══════════════════════════════════════════════════════════
function drawLegendaryLevelBadge(ctx, level, theme) {
  const x = 968;
  const y = 500;
  const size = 90;

  // توهج خلفي
  for (let i = 5; i >= 0; i--) {
    const r = size/2 + (i * 12);
    const alpha = 0.5 - (i * 0.08);
    ctx.fillStyle = `${theme.primary}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
    ctx.shadowColor = theme.primary;
    ctx.shadowBlur = 35;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI*2);
    ctx.fill();
  }

  // الدائرة الأساسية
  ctx.fillStyle = "rgba(0, 0, 0, 0.95)";
  ctx.beginPath();
  ctx.arc(x, y, size/2, 0, Math.PI*2);
  ctx.fill();

  // إطارات متعددة
  ctx.strokeStyle = theme.primary;
  ctx.lineWidth = 5;
  ctx.shadowColor = theme.primary;
  ctx.shadowBlur = 40;
  ctx.stroke();

  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = 3;
  ctx.shadowBlur = 28;
  ctx.beginPath();
  ctx.arc(x, y, size/2 - 7, 0, Math.PI*2);
  ctx.stroke();
  
  ctx.strokeStyle = theme.secondary;
  ctx.lineWidth = 2;
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.arc(x, y, size/2 - 13, 0, Math.PI*2);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // النص
  ctx.font = "bold 38px Arial";
  ctx.fillStyle = theme.primary;
  ctx.textAlign = "center";
  ctx.shadowColor = theme.primary;
  ctx.shadowBlur = 45;
  ctx.fillText(level, x, y + 13);
  
  ctx.fillStyle = theme.accent;
  ctx.shadowBlur = 30;
  ctx.fillText(level, x + 1, y + 12);
  ctx.shadowBlur = 0;
}

// ══════════════════════════════════════════════════════════
// 🎨 الأشرطة المحسّنة
// ══════════════════════════════════════════════════════════
function drawEnhancedStatBars(ctx, data, theme) {
  const startX = 60;
  const startY = 425;
  const barW = 650;
  const barH = 98;
  const spacing = 8;

  drawEnhancedBar(ctx, startX, startY, barW, barH, "💰", "BALANCE", 
    formatNumberShort(data.money), theme, data.money, Math.max(data.money + 1000, 10000), true);

  drawEnhancedBar(ctx, startX, startY + barH + spacing, barW, barH, "⚡", "XP", 
    formatNumberShort(data.exp), theme, data.exp, data.exp + data.expNeeded, false);

  drawEnhancedBar(ctx, startX, startY + (barH + spacing) * 2, barW, barH, "💬", "MSG", 
    formatNumberShort(data.msgCount), theme, data.msgCount, Math.max(data.msgCount + 100, 1000), false);
}

// ══════════════════════════════════════════════════════════
// 🎨 رسم شريط واحد محسّن
// ══════════════════════════════════════════════════════════
function drawEnhancedBar(ctx, x, y, w, h, icon, label, value, theme, current, max, isGold) {
  // توهج خلفي
  const barGlow = ctx.createRadialGradient(x + w/2, y + h/2, 0, x + w/2, y + h/2, w/2);
  barGlow.addColorStop(0, `${theme.primary}15`);
  barGlow.addColorStop(1, `${theme.primary}00`);
  ctx.fillStyle = barGlow;
  ctx.fillRect(x - 20, y - 10, w + 40, h + 20);

  // الخلفية
  ctx.fillStyle = "rgba(0, 0, 0, 0.92)";
  ctx.beginPath();
  ctx.moveTo(x + 18, y);
  ctx.lineTo(x + w - 18, y);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.closePath();
  ctx.fill();

  // إطار مزدوج
  ctx.strokeStyle = theme.primary;
  ctx.lineWidth = 4;
  ctx.shadowColor = theme.primary;
  ctx.shadowBlur = 32;
  ctx.stroke();

  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = 2;
  ctx.shadowBlur = 22;
  ctx.beginPath();
  ctx.moveTo(x + 20, y + 3);
  ctx.lineTo(x + w - 20, y + 3);
  ctx.lineTo(x + w - 2, y + h - 3);
  ctx.lineTo(x + 2, y + h - 3);
  ctx.closePath();
  ctx.stroke();
  ctx.shadowBlur = 0;

  // زوايا الزينة المحسّنة
  const cornerSize = 32;
  ctx.strokeStyle = theme.glow;
  ctx.lineWidth = 2.5;
  ctx.shadowColor = theme.glow;
  ctx.shadowBlur = 18;
  
  ctx.beginPath();
  ctx.moveTo(x + cornerSize + 18, y + 14);
  ctx.lineTo(x + 18, y + 14);
  ctx.lineTo(x + 18, y + cornerSize);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(x + w - cornerSize, y + h - 14);
  ctx.lineTo(x + w, y + h - 14);
  ctx.lineTo(x + w, y + h - cornerSize);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // الأيقونة
  if (isGold) {
    // دولار ذهبي فخم
    const iconGrad = ctx.createRadialGradient(x + 52, y + h/2, 0, x + 52, y + h/2, 25);
    iconGrad.addColorStop(0, "#FFD700");
    iconGrad.addColorStop(0.6, "#FFA500");
    iconGrad.addColorStop(1, "#FF8C00");
    
    ctx.fillStyle = iconGrad;
    ctx.shadowColor = "#FFD700";
    ctx.shadowBlur = 35;
    ctx.beginPath();
    ctx.arc(x + 52, y + h/2, 24, 0, Math.PI*2);
    ctx.fill();
    
    ctx.strokeStyle = "#FFE44D";
    ctx.lineWidth = 2;
    ctx.shadowBlur = 25;
    ctx.stroke();
    
    ctx.fillStyle = "#000000";
    ctx.font = "bold 30px Arial";
    ctx.textAlign = "center";
    ctx.shadowBlur = 0;
    ctx.fillText("$", x + 52, y + h/2 + 11);
  } else if (label === "XP") {
    // XP دائري محسّن
    const xpGrad = ctx.createRadialGradient(x + 52, y + h/2, 0, x + 52, y + h/2, 22);
    xpGrad.addColorStop(0, `${theme.primary}44`);
    xpGrad.addColorStop(1, `${theme.primary}00`);
    ctx.fillStyle = xpGrad;
    ctx.beginPath();
    ctx.arc(x + 52, y + h/2, 22, 0, Math.PI*2);
    ctx.fill();
    
    ctx.strokeStyle = theme.primary;
    ctx.lineWidth = 4;
    ctx.shadowColor = theme.primary;
    ctx.shadowBlur = 28;
    ctx.beginPath();
    ctx.arc(x + 52, y + h/2, 21, 0, Math.PI*2);
    ctx.stroke();
    
    ctx.font = "bold 19px Arial";
    ctx.fillStyle = theme.primary;
    ctx.textAlign = "center";
    ctx.shadowBlur = 25;
    ctx.fillText("XP", x + 52, y + h/2 + 7);
    ctx.shadowBlur = 0;
  } else {
    // شات محسّن
    ctx.fillStyle = theme.primary;
    ctx.shadowColor = theme.primary;
    ctx.shadowBlur = 25;
    ctx.fillRect(x + 34, y + h/2 - 16, 38, 30);
    ctx.fillRect(x + 34, y + h/2 + 14, 14, 11);
    
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 18;
    ctx.strokeRect(x + 34, y + h/2 - 16, 38, 30);
    ctx.shadowBlur = 0;
  }

  // النص
  ctx.font = "bold 26px Arial";
  ctx.fillStyle = theme.accent;
  ctx.textAlign = "right";
  ctx.shadowColor = theme.accent;
  ctx.shadowBlur = 20;
  ctx.fillText(label, x + w - 22, y + 34);
  ctx.shadowBlur = 0;

  // شريط التقدم المحسّن
  const barX = x + 105;
  const barY = y + h/2 - 11;
  const barW = w - 150;
  const barH = 22;
  const progress = Math.min((current / max) * 100, 100);
  const fillW = (barW * progress) / 100;

  // خلفية الشريط
  ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
  ctx.fillRect(barX, barY, barW, barH);
  
  ctx.strokeStyle = theme.primary;
  ctx.lineWidth = 1.5;
  ctx.shadowColor = theme.primary;
  ctx.shadowBlur = 12;
  ctx.strokeRect(barX, barY, barW, barH);
  ctx.shadowBlur = 0;

  // الجزء الممتلئ
  if (fillW > 0) {
    const fillGrad = ctx.createLinearGradient(barX, barY, barX + fillW, barY);
    fillGrad.addColorStop(0, theme.primary);
    fillGrad.addColorStop(0.3, theme.accent);
    fillGrad.addColorStop(0.7, theme.secondary);
    fillGrad.addColorStop(1, theme.glow);
    
    ctx.fillStyle = fillGrad;
    ctx.shadowColor = theme.glow;
    ctx.shadowBlur = 35;
    ctx.fillRect(barX, barY, fillW, barH);
    
    // لمعة متحركة
    const shineGrad = ctx.createLinearGradient(barX, barY, barX + fillW, barY);
    shineGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
    shineGrad.addColorStop(0.4, "rgba(255, 255, 255, 0.5)");
    shineGrad.addColorStop(0.6, "rgba(255, 255, 255, 0.5)");
    shineGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = shineGrad;
    ctx.fillRect(barX, barY, fillW, barH / 2);
    
    // سهم للـ XP
    if (label === "XP" && fillW > 25) {
      ctx.fillStyle = fillGrad;
      ctx.shadowBlur = 30;
      ctx.beginPath();
      ctx.moveTo(barX + fillW, barY);
      ctx.lineTo(barX + fillW + 18, barY + barH/2);
      ctx.lineTo(barX + fillW, barY + barH);
      ctx.fill();
    }
    
    ctx.shadowBlur = 0;
  }

  // القيمة
  ctx.font = "bold 30px Arial";
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "right";
  ctx.shadowColor = "#FFFFFF";
  ctx.shadowBlur = 25;
  ctx.fillText(value, x + w - 22, y + h - 16);
  
  ctx.fillStyle = theme.primary;
  ctx.shadowColor = theme.primary;
  ctx.shadowBlur = 35;
  ctx.fillText(value, x + w - 21, y + h - 17);
  ctx.shadowBlur = 0;
}

// ══════════════════════════════════════════════════════════
// 🎨 خطوط الزوايا المحسّنة
// ══════════════════════════════════════════════════════════
function drawEnhancedTopLines(ctx, theme) {
  ctx.strokeStyle = theme.primary;
  ctx.lineWidth = 5;
  ctx.shadowColor = theme.primary;
  ctx.shadowBlur = 30;

  // خط يسار
  ctx.beginPath();
  ctx.moveTo(22, 38);
  ctx.lineTo(210, 38);
  ctx.stroke();
  
  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = 3;
  ctx.shadowBlur = 22;
  ctx.beginPath();
  ctx.moveTo(22, 46);
  ctx.lineTo(188, 46);
  ctx.lineTo(220, 68);
  ctx.stroke();

  // خط يمين
  ctx.strokeStyle = theme.primary;
  ctx.lineWidth = 5;
  ctx.shadowBlur = 30;
  ctx.beginPath();
  ctx.moveTo(1226, 38);
  ctx.lineTo(1038, 38);
  ctx.stroke();
  
  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = 3;
  ctx.shadowBlur = 22;
  ctx.beginPath();
  ctx.moveTo(1226, 46);
  ctx.lineTo(1060, 46);
  ctx.lineTo(1028, 68);
  ctx.stroke();

  ctx.shadowBlur = 0;
}

function drawEnhancedBottomLines(ctx, theme) {
  const y = 789;
  
  ctx.strokeStyle = theme.primary;
  ctx.lineWidth = 5;
  ctx.shadowColor = theme.primary;
  ctx.shadowBlur = 30;

  // خط يسار
  ctx.beginPath();
  ctx.moveTo(22, y);
  ctx.lineTo(210, y);
  ctx.stroke();
  
  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = 3;
  ctx.shadowBlur = 22;
  ctx.beginPath();
  ctx.moveTo(22, y - 8);
  ctx.lineTo(188, y - 8);
  ctx.lineTo(220, y - 30);
  ctx.stroke();

  // خط يمين
  ctx.strokeStyle = theme.primary;
  ctx.lineWidth = 5;
  ctx.shadowBlur = 30;
  ctx.beginPath();
  ctx.moveTo(1226, y);
  ctx.lineTo(1038, y);
  ctx.stroke();
  
  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = 3;
  ctx.shadowBlur = 22;
  ctx.beginPath();
  ctx.moveTo(1226, y - 8);
  ctx.lineTo(1060, y - 8);
  ctx.lineTo(1028, y - 30);
  ctx.stroke();

  // نجمة فخمة
  ctx.font = "38px Arial";
  ctx.fillStyle = theme.primary;
  ctx.textAlign = "right";
  ctx.shadowColor = theme.primary;
  ctx.shadowBlur = 35;
  ctx.fillText("✦", 1208, 807);
  
  ctx.fillStyle = theme.accent;
  ctx.shadowBlur = 25;
  ctx.fillText("✦", 1209, 806);
  ctx.shadowBlur = 0;
}

// ══════════════════════════════════════════════════════════
// 🎨 دوال مساعدة
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
