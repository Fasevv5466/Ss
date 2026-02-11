const Canvas = require("@napi-rs/canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const mongodb = require(path.join(process.cwd(), "includes", "mongodb.js"));

module.exports.config = {
  name: "بنك",
  version: "4.0.0",
  hasPermssion: 0,
  credits: "ايمن - Perfect Match Design",
  description: "بطاقة بروفايل مطابقة للمرجع",
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
    
    api.sendMessage("🎨 جاري إنشاء البطاقة...", threadID, messageID);
    
    const card = await createKiraBankCard({
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
    
    const cachePath = path.join(__dirname, "cache", `kira_bank_${targetID}.png`);
    await fs.ensureDir(path.join(__dirname, "cache"));
    await fs.writeFile(cachePath, card);
    
    return api.sendMessage({
      body: `╔═══════════════╗\n` +
            `║  𝗞𝗜𝗥𝗔 𝗕𝗔𝗡𝗞  ║\n` +
            `╚═══════════════╝\n\n` +
            `👤 ${username}\n` +
            `🆔 ${targetID}\n` +
            `${calculated.rank.emoji} ${calculated.rank.name} | ⭐ ${currency.level}\n` +
            `💰 ${formatNumber(currency.money)} $\n` +
            `✨ ${formatNumber(currency.exp)} XP\n` +
            `💬 ${formatNumber(currency.messageCount)} MSG`,
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
// 🎨 تحديد الألوان حسب الرتبة
// ══════════════════════════════════════════════════════════
function getTheme(exp, isDeveloper) {
  if (isDeveloper) {
    return {
      name: "DEVELOPER",
      primary: "#8B0000",      // أحمر داكن نيوني
      secondary: "#CD0000",     
      accent: "#FF0000",
      glow: "#FF1A1A"
    };
  }
  
  if (exp < 200) {
    return { name: "BEGINNER", primary: "#FFD700", secondary: "#FFA500", accent: "#FFFF00", glow: "#FFED00" };
  } else if (exp < 400) {
    return { name: "SOLDIER", primary: "#00FF00", secondary: "#00FF88", accent: "#00FFCC", glow: "#00FF44" };
  } else if (exp < 700) {
    return { name: "WARRIOR", primary: "#00D4FF", secondary: "#0088FF", accent: "#00FFFF", glow: "#00AAFF" };
  } else if (exp < 1000) {
    return { name: "OFFICER", primary: "#FF8800", secondary: "#FF6600", accent: "#FFAA00", glow: "#FF9900" };
  } else if (exp < 2500) {
    return { name: "LEADER", primary: "#C0C0C0", secondary: "#E0E0E0", accent: "#FFFFFF", glow: "#D0D0D0" };
  } else {
    return { name: "MINISTER", primary: "#FFD700", secondary: "#FFED00", accent: "#FFF700", glow: "#FFE700" };
  }
}

// ══════════════════════════════════════════════════════════
// 🎨 الدالة الرئيسية لإنشاء البطاقة
// ══════════════════════════════════════════════════════════
async function createKiraBankCard(data) {
  const W = 1248;
  const H = 827;
  const canvas = Canvas.createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  const theme = getTheme(data.exp, data.isDeveloper);

  // ══════════════ الخلفية ══════════════
  const bgGrad = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W, H)/2);
  bgGrad.addColorStop(0, "#120505");
  bgGrad.addColorStop(0.5, "#0a0202");
  bgGrad.addColorStop(1, "#000000");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // شبكة خلفية
  ctx.strokeStyle = `rgba(${hexToRgb(theme.primary)}, 0.08)`;
  ctx.lineWidth = 1;
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

  // جزيئات صغيرة
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const r = 0.5 + Math.random() * 1.5;
    ctx.fillStyle = `${theme.primary}33`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // ══════════════ خطوط الزوايا العلوية ══════════════
  drawTopCornerLines(ctx, theme);

  // ══════════════ الهيدر "KIRA BANK" ══════════════
  drawHeader(ctx, theme);

  // ══════════════ معلومات المستخدم (يسار) ══════════════
  await drawUserInfo(ctx, data, theme);

  // ══════════════ صورة البروفايل (يمين) ══════════════
  await drawAvatar(ctx, data.userID, theme);

  // ══════════════ الأشرطة الثلاثة ══════════════
  drawStatBars(ctx, data, theme);

  // ══════════════ خطوط الزوايا السفلية ══════════════
  drawBottomCornerLines(ctx, theme);

  return canvas.toBuffer("image/png");
}

// ══════════════════════════════════════════════════════════
// 🎨 رسم الهيدر
// ══════════════════════════════════════════════════════════
function drawHeader(ctx, theme) {
  const centerX = 624;
  const y = 65;
  
  // الشكل السداسي للخلفية
  ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
  ctx.beginPath();
  ctx.moveTo(centerX - 280, y);
  ctx.lineTo(centerX + 280, y);
  ctx.lineTo(centerX + 310, y + 28);
  ctx.lineTo(centerX + 280, y + 56);
  ctx.lineTo(centerX - 280, y + 56);
  ctx.lineTo(centerX - 310, y + 28);
  ctx.closePath();
  ctx.fill();

  // الإطار النيون
  ctx.strokeStyle = theme.primary;
  ctx.lineWidth = 3;
  ctx.shadowColor = theme.primary;
  ctx.shadowBlur = 30;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // النص
  ctx.font = "bold 36px Arial";
  ctx.fillStyle = theme.primary;
  ctx.textAlign = "center";
  ctx.shadowColor = theme.primary;
  ctx.shadowBlur = 35;
  ctx.fillText("KIRA BANK", centerX, y + 40);
  ctx.shadowBlur = 0;
}

// ══════════════════════════════════════════════════════════
// 🎨 رسم معلومات المستخدم
// ══════════════════════════════════════════════════════════
async function drawUserInfo(ctx, data, theme) {
  const x = 110;
  const y = 240;

  // أيقونة جانبية (القوس)
  ctx.strokeStyle = theme.primary;
  ctx.lineWidth = 5;
  ctx.shadowColor = theme.primary;
  ctx.shadowBlur = 25;
  ctx.beginPath();
  ctx.arc(x, y, 35, Math.PI * 0.75, Math.PI * 1.25);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // الاسم
  ctx.font = "bold 65px Arial";
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "left";
  ctx.shadowColor = "#FFFFFF";
  ctx.shadowBlur = 30;
  ctx.fillText(data.username, x + 50, y + 15);
  ctx.shadowBlur = 0;

  // صندوق ID
  const idY = y + 60;
  const idW = 380;
  const idH = 55;
  
  ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
  ctx.beginPath();
  ctx.moveTo(x - 10, idY);
  ctx.lineTo(x + idW - 20, idY);
  ctx.lineTo(x + idW, idY + idH);
  ctx.lineTo(x + 10, idY + idH);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = theme.primary;
  ctx.lineWidth = 2.5;
  ctx.shadowColor = theme.primary;
  ctx.shadowBlur = 18;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // نص ID
  ctx.font = "bold 22px 'Courier New'";
  ctx.fillStyle = theme.accent;
  ctx.shadowColor = theme.accent;
  ctx.shadowBlur = 15;
  ctx.fillText("ID", x + 15, idY + 35);
  
  ctx.fillStyle = theme.primary;
  ctx.shadowColor = theme.primary;
  ctx.shadowBlur = 18;
  ctx.fillText(`#${data.userID}`, x + 75, idY + 35);
  ctx.shadowBlur = 0;
}

// ══════════════════════════════════════════════════════════
// 🎨 رسم صورة البروفايل
// ══════════════════════════════════════════════════════════
async function drawAvatar(ctx, userID, theme) {
  const x = 968;
  const y = 300;
  const size = 290;

  try {
    const avatarUrl = `https://graph.facebook.com/${userID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const response = await axios.get(avatarUrl, { responseType: "arraybuffer" });
    const avatarImg = await Canvas.loadImage(Buffer.from(response.data));

    // توهج خلفي
    for (let i = 6; i >= 0; i--) {
      const r = size/2 + (i * 18);
      const alpha = 0.35 - (i * 0.05);
      ctx.fillStyle = `${theme.primary}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
      ctx.shadowColor = theme.primary;
      ctx.shadowBlur = 45;
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

    // الإطارات الثلاثة
    // إطار 1 (الداخلي)
    ctx.strokeStyle = theme.primary;
    ctx.lineWidth = 6;
    ctx.shadowColor = theme.primary;
    ctx.shadowBlur = 40;
    ctx.beginPath();
    ctx.arc(x, y, size/2, 0, Math.PI*2);
    ctx.stroke();

    // إطار 2 (الأوسط)
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 4;
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(x, y, size/2 + 12, 0, Math.PI*2);
    ctx.stroke();

    // إطار 3 (الخارجي)
    ctx.strokeStyle = theme.secondary;
    ctx.lineWidth = 3;
    ctx.shadowBlur = 25;
    ctx.beginPath();
    ctx.arc(x, y, size/2 + 22, 0, Math.PI*2);
    ctx.stroke();
    
    ctx.shadowBlur = 0;

  } catch (error) {
    console.error("Error loading avatar:", error);
  }
}

// ══════════════════════════════════════════════════════════
// 🎨 رسم الأشرطة الثلاثة
// ══════════════════════════════════════════════════════════
function drawStatBars(ctx, data, theme) {
  const startX = 60;
  const startY = 425;
  const barW = 650;
  const barH = 95;
  const spacing = 8;

  // BALANCE
  drawSingleBar(ctx, startX, startY, barW, barH, "💰", "BALANCE", 
    formatNumberShort(data.money), theme, data.money, Math.max(data.money + 1000, 10000), true);

  // XP
  drawSingleBar(ctx, startX, startY + barH + spacing, barW, barH, "⚡", "XP", 
    formatNumberShort(data.exp), theme, data.exp, data.exp + data.expNeeded, false);

  // MSG
  drawSingleBar(ctx, startX, startY + (barH + spacing) * 2, barW, barH, "💬", "MSG", 
    formatNumberShort(data.msgCount), theme, data.msgCount, Math.max(data.msgCount + 100, 1000), false);
}

// ══════════════════════════════════════════════════════════
// 🎨 رسم شريط واحد
// ══════════════════════════════════════════════════════════
function drawSingleBar(ctx, x, y, w, h, icon, label, value, theme, current, max, isGold) {
  // الخلفية
  ctx.fillStyle = "rgba(0, 0, 0, 0.88)";
  ctx.beginPath();
  ctx.moveTo(x + 15, y);
  ctx.lineTo(x + w - 15, y);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.closePath();
  ctx.fill();

  // الإطار الرئيسي
  ctx.strokeStyle = theme.primary;
  ctx.lineWidth = 4;
  ctx.shadowColor = theme.primary;
  ctx.shadowBlur = 28;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // زوايا الزينة
  const cornerSize = 30;
  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = 2.5;
  ctx.shadowColor = theme.accent;
  ctx.shadowBlur = 15;
  
  // زاوية علوية يسرى
  ctx.beginPath();
  ctx.moveTo(x + cornerSize + 15, y + 12);
  ctx.lineTo(x + 15, y + 12);
  ctx.lineTo(x + 15, y + cornerSize);
  ctx.stroke();
  
  // زاوية سفلية يمنى
  ctx.beginPath();
  ctx.moveTo(x + w - cornerSize, y + h - 12);
  ctx.lineTo(x + w, y + h - 12);
  ctx.lineTo(x + w, y + h - cornerSize);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // الأيقونة
  if (isGold) {
    // أيقونة دولار ذهبي خاص
    ctx.fillStyle = "#FFD700";
    ctx.shadowColor = "#FFD700";
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(x + 50, y + h/2, 22, 0, Math.PI*2);
    ctx.fill();
    
    ctx.fillStyle = "#000000";
    ctx.font = "bold 28px Arial";
    ctx.textAlign = "center";
    ctx.shadowBlur = 0;
    ctx.fillText("$", x + 50, y + h/2 + 10);
  } else if (label === "XP") {
    // أيقونة XP دائرية
    ctx.strokeStyle = theme.primary;
    ctx.lineWidth = 4;
    ctx.shadowColor = theme.primary;
    ctx.shadowBlur = 25;
    ctx.beginPath();
    ctx.arc(x + 50, y + h/2, 20, 0, Math.PI*2);
    ctx.stroke();
    
    ctx.font = "bold 18px Arial";
    ctx.fillStyle = theme.primary;
    ctx.textAlign = "center";
    ctx.shadowBlur = 22;
    ctx.fillText("XP", x + 50, y + h/2 + 6);
    ctx.shadowBlur = 0;
  } else {
    // أيقونة شات
    ctx.fillStyle = theme.primary;
    ctx.shadowColor = theme.primary;
    ctx.shadowBlur = 20;
    ctx.fillRect(x + 32, y + h/2 - 15, 36, 28);
    ctx.fillRect(x + 32, y + h/2 + 13, 12, 10);
    ctx.shadowBlur = 0;
  }

  // النص (BALANCE / XP / MSG)
  ctx.font = "bold 24px Arial";
  ctx.fillStyle = theme.accent;
  ctx.textAlign = "right";
  ctx.shadowColor = theme.accent;
  ctx.shadowBlur = 18;
  ctx.fillText(label, x + w - 20, y + 32);
  ctx.shadowBlur = 0;

  // شريط التقدم
  const barX = x + 100;
  const barY = y + h/2 - 10;
  const barW = w - 140;
  const barH = 20;
  const progress = Math.min((current / max) * 100, 100);
  const fillW = (barW * progress) / 100;

  // خلفية الشريط
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(barX, barY, barW, barH);

  // الجزء الممتلئ
  if (fillW > 0) {
    const grad = ctx.createLinearGradient(barX, barY, barX + fillW, barY);
    grad.addColorStop(0, theme.primary);
    grad.addColorStop(0.5, theme.accent);
    grad.addColorStop(1, theme.secondary);
    
    ctx.fillStyle = grad;
    ctx.shadowColor = theme.glow;
    ctx.shadowBlur = 30;
    ctx.fillRect(barX, barY, fillW, barH);
    
    // سهم في النهاية (للـ XP فقط)
    if (label === "XP" && fillW > 20) {
      ctx.beginPath();
      ctx.moveTo(barX + fillW, barY);
      ctx.lineTo(barX + fillW + 15, barY + barH/2);
      ctx.lineTo(barX + fillW, barY + barH);
      ctx.fill();
    }
    
    ctx.shadowBlur = 0;
  }

  // القيمة
  ctx.font = "bold 28px Arial";
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "right";
  ctx.shadowColor = "#FFFFFF";
  ctx.shadowBlur = 20;
  ctx.fillText(value, x + w - 20, y + h - 18);
  ctx.shadowBlur = 0;
}

// ══════════════════════════════════════════════════════════
// 🎨 خطوط الزوايا العلوية
// ══════════════════════════════════════════════════════════
function drawTopCornerLines(ctx, theme) {
  ctx.strokeStyle = theme.primary;
  ctx.lineWidth = 4;
  ctx.shadowColor = theme.primary;
  ctx.shadowBlur = 25;

  // خط يسار علوي
  ctx.beginPath();
  ctx.moveTo(25, 40);
  ctx.lineTo(200, 40);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(25, 48);
  ctx.lineTo(180, 48);
  ctx.lineTo(210, 68);
  ctx.stroke();

  // خط يمين علوي
  ctx.beginPath();
  ctx.moveTo(1223, 40);
  ctx.lineTo(1048, 40);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(1223, 48);
  ctx.lineTo(1068, 48);
  ctx.lineTo(1038, 68);
  ctx.stroke();

  ctx.shadowBlur = 0;
}

// ══════════════════════════════════════════════════════════
// 🎨 خطوط الزوايا السفلية
// ══════════════════════════════════════════════════════════
function drawBottomCornerLines(ctx, theme) {
  const y = 787;
  
  ctx.strokeStyle = theme.primary;
  ctx.lineWidth = 4;
  ctx.shadowColor = theme.primary;
  ctx.shadowBlur = 25;

  // خط يسار سفلي
  ctx.beginPath();
  ctx.moveTo(25, y);
  ctx.lineTo(200, y);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(25, y - 8);
  ctx.lineTo(180, y - 8);
  ctx.lineTo(210, y - 28);
  ctx.stroke();

  // خط يمين سفلي
  ctx.beginPath();
  ctx.moveTo(1223, y);
  ctx.lineTo(1048, y);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(1223, y - 8);
  ctx.lineTo(1068, y - 8);
  ctx.lineTo(1038, y - 28);
  ctx.stroke();

  // نجمة في الزاوية
  ctx.font = "35px Arial";
  ctx.fillStyle = theme.primary;
  ctx.textAlign = "right";
  ctx.shadowBlur = 30;
  ctx.fillText("✦", 1210, 805);
  ctx.shadowBlur = 0;
}

// ══════════════════════════════════════════════════════════
// 🎨 دوال مساعدة
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
