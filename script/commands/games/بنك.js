const Canvas = require("@napi-rs/canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const mongodb = require(path.join(process.cwd(), "includes", "mongodb.js"));

module.exports.config = {
  name: "بنك",
  version: "6.0.0",
  hasPermssion: 0,
  credits: "ايمن - Clean Professional",
  description: "بطاقة بروفايل احترافية نظيفة",
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
    
    const card = await createCleanCard({
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
    
    const cachePath = path.join(__dirname, "cache", `clean_bank_${targetID}.png`);
    await fs.ensureDir(path.join(__dirname, "cache"));
    await fs.writeFile(cachePath, card);
    
    return api.sendMessage({
      body: `╔═══════════════╗\n` +
            `║  𝗞𝗜𝗥𝗔 𝗕𝗔𝗡𝗞  ║\n` +
            `╚═══════════════╝\n\n` +
            `👤 ${username}\n` +
            `🆔 ${targetID}\n` +
            `${calculated.rank.emoji} ${calculated.rank.name}\n` +
            `⭐ Level ${currency.level}\n` +
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
// 🎨 تحديد اللون حسب الرتبة (بدون نيون مبالغ)
// ══════════════════════════════════════════════════════════
function getRankColor(exp, isDeveloper) {
  if (isDeveloper) {
    return {
      name: "DEVELOPER",
      primary: "#8B0000",     // أحمر داكن
      secondary: "#B22222",
      accent: "#DC143C"
    };
  }
  
  if (exp < 200) {
    return { name: "BEGINNER", primary: "#FFD700", secondary: "#FFA500", accent: "#FFEA00" };
  } else if (exp < 400) {
    return { name: "SOLDIER", primary: "#32CD32", secondary: "#00FA9A", accent: "#7FFF00" };
  } else if (exp < 700) {
    return { name: "WARRIOR", primary: "#1E90FF", secondary: "#00BFFF", accent: "#87CEEB" };
  } else if (exp < 1000) {
    return { name: "OFFICER", primary: "#FF8C00", secondary: "#FF6347", accent: "#FFA07A" };
  } else if (exp < 2500) {
    return { name: "LEADER", primary: "#C0C0C0", secondary: "#D3D3D3", accent: "#E8E8E8" };
  } else {
    return { name: "MINISTER", primary: "#FFD700", secondary: "#DAA520", accent: "#F0E68C" };
  }
}

// ══════════════════════════════════════════════════════════
// 🎨 حساب حجم الخط حسب العدد
// ══════════════════════════════════════════════════════════
function getFontSize(number) {
  const digits = number.toString().length;
  if (digits <= 3) return 30;
  if (digits <= 5) return 28;
  if (digits <= 7) return 26;
  return 24;
}

// ══════════════════════════════════════════════════════════
// 🎨 الدالة الرئيسية
// ══════════════════════════════════════════════════════════
async function createCleanCard(data) {
  const W = 1248;
  const H = 827;
  const canvas = Canvas.createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  const color = getRankColor(data.exp, data.isDeveloper);

  // ══════════════ خلفية نظيفة ══════════════
  const bgGrad = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W, H)/2);
  bgGrad.addColorStop(0, "#0f0f0f");
  bgGrad.addColorStop(0.7, "#0a0a0a");
  bgGrad.addColorStop(1, "#000000");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // شبكة خفيفة جداً
  ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
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

  // ══════════════ خطوط الزوايا العلوية ══════════════
  drawCornerLines(ctx, color, true);

  // ══════════════ الهيدر ══════════════
  drawHeader(ctx, color);

  // ══════════════ معلومات المستخدم ══════════════
  drawUserInfo(ctx, data, color);

  // ══════════════ صورة البروفايل بجودة عالية ══════════════
  await drawHighQualityAvatar(ctx, data.userID, color);

  // ══════════════ الأشرطة الثلاثة ══════════════
  drawStatBars(ctx, data, color);

  // ══════════════ خطوط الزوايا السفلية ══════════════
  drawCornerLines(ctx, color, false);

  return canvas.toBuffer("image/png");
}

// ══════════════════════════════════════════════════════════
// 🎨 رسم الهيدر
// ══════════════════════════════════════════════════════════
function drawHeader(ctx, color) {
  const centerX = 624;
  const y = 65;
  
  // الخلفية
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

  // الإطار بسيط
  ctx.strokeStyle = color.primary;
  ctx.lineWidth = 2.5;
  ctx.shadowColor = color.primary;
  ctx.shadowBlur = 15;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // النص
  ctx.font = "bold 36px Arial";
  ctx.fillStyle = color.primary;
  ctx.textAlign = "center";
  ctx.shadowColor = color.primary;
  ctx.shadowBlur = 20;
  ctx.fillText("KIRA BANK", centerX, y + 40);
  ctx.shadowBlur = 0;
}

// ══════════════════════════════════════════════════════════
// 🎨 رسم معلومات المستخدم
// ══════════════════════════════════════════════════════════
function drawUserInfo(ctx, data, color) {
  const x = 110;
  const y = 240;

  // أيقونة بسيطة
  ctx.strokeStyle = color.primary;
  ctx.lineWidth = 4;
  ctx.shadowColor = color.primary;
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.arc(x, y, 32, Math.PI * 0.75, Math.PI * 1.25);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // الاسم
  ctx.font = "bold 65px Arial";
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "left";
  ctx.shadowColor = "#FFFFFF";
  ctx.shadowBlur = 15;
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

  ctx.strokeStyle = color.primary;
  ctx.lineWidth = 2;
  ctx.shadowColor = color.primary;
  ctx.shadowBlur = 12;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // نص ID
  ctx.font = "bold 22px 'Courier New'";
  ctx.fillStyle = color.secondary;
  ctx.shadowColor = color.secondary;
  ctx.shadowBlur = 10;
  ctx.fillText("ID", x + 15, idY + 35);
  
  ctx.fillStyle = color.primary;
  ctx.shadowBlur = 12;
  ctx.fillText(`#${data.userID}`, x + 75, idY + 35);
  ctx.shadowBlur = 0;
}

// ══════════════════════════════════════════════════════════
// 🎨 رسم صورة البروفايل بجودة عالية
// ══════════════════════════════════════════════════════════
async function drawHighQualityAvatar(ctx, userID, color) {
  const x = 968;
  const y = 300;
  const size = 290;

  try {
    // استخدام حجم أكبر للصورة للحصول على جودة أفضل
    const avatarUrl = `https://graph.facebook.com/${userID}/picture?width=1024&height=1024&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const response = await axios.get(avatarUrl, { responseType: "arraybuffer" });
    const avatarImg = await Canvas.loadImage(Buffer.from(response.data));

    // توهج خلفي خفيف
    const glowGrad = ctx.createRadialGradient(x, y, size/2, x, y, size/2 + 50);
    glowGrad.addColorStop(0, `${color.primary}00`);
    glowGrad.addColorStop(0.7, `${color.primary}33`);
    glowGrad.addColorStop(1, `${color.primary}00`);
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(x, y, size/2 + 50, 0, Math.PI*2);
    ctx.fill();

    // رسم الصورة بجودة عالية
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, size/2, 0, Math.PI*2);
    ctx.clip();
    
    // استخدام smoothing للحصول على جودة أفضل
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(avatarImg, x - size/2, y - size/2, size, size);
    ctx.restore();

    // إطارات بسيطة وجميلة (3 إطارات)
    // إطار 1
    ctx.strokeStyle = color.primary;
    ctx.lineWidth = 5;
    ctx.shadowColor = color.primary;
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(x, y, size/2, 0, Math.PI*2);
    ctx.stroke();

    // إطار 2
    ctx.strokeStyle = color.secondary;
    ctx.lineWidth = 3;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(x, y, size/2 + 10, 0, Math.PI*2);
    ctx.stroke();

    // إطار 3
    ctx.strokeStyle = color.accent;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(x, y, size/2 + 18, 0, Math.PI*2);
    ctx.stroke();
    
    ctx.shadowBlur = 0;

  } catch (error) {
    console.error("Error loading avatar:", error);
  }
}

// ══════════════════════════════════════════════════════════
// 🎨 رسم الأشرطة
// ══════════════════════════════════════════════════════════
function drawStatBars(ctx, data, color) {
  const startX = 60;
  const startY = 425;
  const barW = 650;
  const barH = 95;
  const spacing = 8;

  // BALANCE
  drawBar(ctx, startX, startY, barW, barH, "💰", "BALANCE", 
    data.money, color, data.money, Math.max(data.money + 1000, 10000), true);

  // XP
  drawBar(ctx, startX, startY + barH + spacing, barW, barH, "⚡", "XP", 
    data.exp, color, data.exp, data.exp + data.expNeeded, false);

  // MSG
  drawBar(ctx, startX, startY + (barH + spacing) * 2, barW, barH, "💬", "MSG", 
    data.msgCount, color, data.msgCount, Math.max(data.msgCount + 100, 1000), false);
}

// ══════════════════════════════════════════════════════════
// 🎨 رسم شريط واحد مع خط يتغير حسب العدد
// ══════════════════════════════════════════════════════════
function drawBar(ctx, x, y, w, h, icon, label, value, color, current, max, isGold) {
  // الخلفية
  ctx.fillStyle = "rgba(0, 0, 0, 0.88)";
  ctx.beginPath();
  ctx.moveTo(x + 15, y);
  ctx.lineTo(x + w - 15, y);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.closePath();
  ctx.fill();

  // الإطار
  ctx.strokeStyle = color.primary;
  ctx.lineWidth = 3;
  ctx.shadowColor = color.primary;
  ctx.shadowBlur = 15;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // زوايا
  const cornerSize = 28;
  ctx.strokeStyle = color.secondary;
  ctx.lineWidth = 2;
  ctx.shadowColor = color.secondary;
  ctx.shadowBlur = 10;
  
  ctx.beginPath();
  ctx.moveTo(x + cornerSize + 15, y + 12);
  ctx.lineTo(x + 15, y + 12);
  ctx.lineTo(x + 15, y + cornerSize);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(x + w - cornerSize, y + h - 12);
  ctx.lineTo(x + w, y + h - 12);
  ctx.lineTo(x + w, y + h - cornerSize);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // الأيقونة
  if (isGold) {
    // دولار ذهبي
    const goldGrad = ctx.createRadialGradient(x + 50, y + h/2, 0, x + 50, y + h/2, 22);
    goldGrad.addColorStop(0, "#FFD700");
    goldGrad.addColorStop(1, "#DAA520");
    
    ctx.fillStyle = goldGrad;
    ctx.shadowColor = "#FFD700";
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(x + 50, y + h/2, 22, 0, Math.PI*2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    ctx.fillStyle = "#000000";
    ctx.font = "bold 28px Arial";
    ctx.textAlign = "center";
    ctx.fillText("$", x + 50, y + h/2 + 10);
  } else if (label === "XP") {
    // XP
    ctx.strokeStyle = color.primary;
    ctx.lineWidth = 3;
    ctx.shadowColor = color.primary;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(x + 50, y + h/2, 20, 0, Math.PI*2);
    ctx.stroke();
    
    ctx.font = "bold 18px Arial";
    ctx.fillStyle = color.primary;
    ctx.textAlign = "center";
    ctx.shadowBlur = 12;
    ctx.fillText("XP", x + 50, y + h/2 + 6);
    ctx.shadowBlur = 0;
  } else {
    // شات
    ctx.fillStyle = color.primary;
    ctx.shadowColor = color.primary;
    ctx.shadowBlur = 12;
    ctx.fillRect(x + 33, y + h/2 - 15, 34, 28);
    ctx.fillRect(x + 33, y + h/2 + 13, 12, 10);
    ctx.shadowBlur = 0;
  }

  // النص
  ctx.font = "bold 24px Arial";
  ctx.fillStyle = color.secondary;
  ctx.textAlign = "right";
  ctx.shadowColor = color.secondary;
  ctx.shadowBlur = 12;
  ctx.fillText(label, x + w - 20, y + 32);
  ctx.shadowBlur = 0;

  // شريط التقدم
  const barX = x + 100;
  const barY = y + h/2 - 10;
  const barW = w - 140;
  const barH = 20;
  const progress = Math.min((current / max) * 100, 100);
  const fillW = (barW * progress) / 100;

  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(barX, barY, barW, barH);

  if (fillW > 0) {
    const fillGrad = ctx.createLinearGradient(barX, barY, barX + fillW, barY);
    fillGrad.addColorStop(0, color.primary);
    fillGrad.addColorStop(0.5, color.secondary);
    fillGrad.addColorStop(1, color.accent);
    
    ctx.fillStyle = fillGrad;
    ctx.shadowColor = color.primary;
    ctx.shadowBlur = 15;
    ctx.fillRect(barX, barY, fillW, barH);
    
    // سهم للـ XP
    if (label === "XP" && fillW > 20) {
      ctx.beginPath();
      ctx.moveTo(barX + fillW, barY);
      ctx.lineTo(barX + fillW + 15, barY + barH/2);
      ctx.lineTo(barX + fillW, barY + barH);
      ctx.fill();
    }
    
    ctx.shadowBlur = 0;
  }

  // القيمة مع خط يتغير حسب الرقم
  const fontSize = getFontSize(value);
  ctx.font = `bold ${fontSize}px Arial`;
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "right";
  ctx.shadowColor = "#FFFFFF";
  ctx.shadowBlur = 12;
  ctx.fillText(formatNumberShort(value), x + w - 20, y + h - 18);
  ctx.shadowBlur = 0;
}

// ══════════════════════════════════════════════════════════
// 🎨 خطوط الزوايا
// ══════════════════════════════════════════════════════════
function drawCornerLines(ctx, color, isTop) {
  const y = isTop ? 40 : 787;
  
  ctx.strokeStyle = color.primary;
  ctx.lineWidth = 4;
  ctx.shadowColor = color.primary;
  ctx.shadowBlur = 15;

  // خط يسار
  ctx.beginPath();
  ctx.moveTo(25, y);
  ctx.lineTo(200, y);
  ctx.stroke();
  
  ctx.strokeStyle = color.secondary;
  ctx.lineWidth = 2.5;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  if (isTop) {
    ctx.moveTo(25, y + 8);
    ctx.lineTo(180, y + 8);
    ctx.lineTo(210, y + 28);
  } else {
    ctx.moveTo(25, y - 8);
    ctx.lineTo(180, y - 8);
    ctx.lineTo(210, y - 28);
  }
  ctx.stroke();

  // خط يمين
  ctx.strokeStyle = color.primary;
  ctx.lineWidth = 4;
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.moveTo(1223, y);
  ctx.lineTo(1048, y);
  ctx.stroke();
  
  ctx.strokeStyle = color.secondary;
  ctx.lineWidth = 2.5;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  if (isTop) {
    ctx.moveTo(1223, y + 8);
    ctx.lineTo(1068, y + 8);
    ctx.lineTo(1038, y + 28);
  } else {
    ctx.moveTo(1223, y - 8);
    ctx.lineTo(1068, y - 8);
    ctx.lineTo(1038, y - 28);
  }
  ctx.stroke();

  // نجمة
  if (!isTop) {
    ctx.font = "32px Arial";
    ctx.fillStyle = color.primary;
    ctx.textAlign = "right";
    ctx.shadowColor = color.primary;
    ctx.shadowBlur = 15;
    ctx.fillText("✦", 1210, 805);
  }
  
  ctx.shadowBlur = 0;
}

// ══════════════════════════════════════════════════════════
// 🎨 دوال مساعدة
// ══════════════════════════════════════════════════════════
function formatNumberShort(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}
