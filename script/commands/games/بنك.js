const Canvas = require("@napi-rs/canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const mongodb = require(path.join(process.cwd(), "includes", "mongodb.js"));

module.exports.config = {
  name: "بنك",
  version: "14.0.0",
  hasPermssion: 0,
  credits: "ايمن - VOID EMPEROR",
  description: "نظام الإمبراطور الفراغي - زعيم أنمي نهائي 👑",
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

    // جلب البيانات من MongoDB
    const data = await mongodb.getUserData(targetID);
    
    if (!data || !data.currency) {
      return api.sendMessage("❌ لم يتم العثور على بيانات المستخدم!", threadID, messageID);
    }
    
    const { currency, calculated, user } = data;
    const userInfo = await api.getUserInfo(targetID);
    const username = user.name || userInfo[targetID].name || "مستخدم";
    
    const isDeveloper = global.config.ADMINBOT && global.config.ADMINBOT.includes(targetID);
    
    api.sendMessage("⚡ جاري تنشيط نظام الإمبراطور الفراغي...", threadID, messageID);
    
    const card = await createVoidEmperorCard({
      userID: targetID,
      username: username.toUpperCase(),
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
    
    const cacheFolderPath = path.join(__dirname, "cache");
    await fs.ensureDir(cacheFolderPath);
    const cachePath = path.join(cacheFolderPath, `void_emperor_${targetID}.png`);
    await fs.writeFile(cachePath, card);
    
    return api.sendMessage({
      body: `╔═══════════════════════════════╗\n` +
            `║   🌌 VOID EMPEROR SYSTEM 🌌   ║\n` +
            `╚═══════════════════════════════╝\n\n` +
            `👤 ${username}\n` +
            `⚡ RANK: ${calculated.rank.name} ${calculated.rank.emoji}\n` +
            `🔱 LEVEL: ${currency.level}\n` +
            `💰 BANK: ${formatNumber(currency.money)}$\n` +
            `⚡ XP: ${formatNumber(currency.exp)}\n` +
            `💬 MSG: ${formatNumber(currency.messageCount)}\n` +
            `${isDeveloper ? '👑 STATUS: SYSTEM OWNER\n' : ''}\n` +
            `✨ نظام زعيم أنمي نهائي ✨`,
      attachment: fs.createReadStream(cachePath)
    }, threadID, () => {
        if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
    }, messageID);
    
  } catch (error) {
    console.error("❌ خطأ في VOID EMPEROR:", error);
    return api.sendMessage(`❌ حدث خطأ في النظام!\n${error.message}`, threadID, messageID);
  }
};

function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// ══════════════════════════════════════════════════════════
// 🌌 VOID EMPEROR COLOR SYSTEM
// ══════════════════════════════════════════════════════════
function getVoidTheme(rank, isDeveloper) {
  if (isDeveloper) {
    return {
      name: "SYSTEM OWNER",
      primary: "#8b5cf6",
      secondary: "#a78bfa",
      accent: "#c4b5fd",
      neon: "#d8b4fe",
      dark: "#4c1d95",
      glow: "#f3e8ff",
      bg1: "#050507",
      bg2: "#0d0f18",
      bg3: "#1a1b2e"
    };
  }
  
  // استخدام اسم الرتبة من MongoDB
  const rankName = rank.name || "مبتدئ";
  
  if (rankName === "مبتدئ") {
    return { 
      name: "ROOKIE",
      primary: "#22c55e", secondary: "#4ade80", accent: "#86efac",
      neon: "#bbf7d0", dark: "#166534", glow: "#dcfce7",
      bg1: "#050507", bg2: "#0d0f18", bg3: "#1a1b2e"
    };
  } else if (rankName === "محارب") {
    return { 
      name: "SOLDIER",
      primary: "#eab308", secondary: "#facc15", accent: "#fde047",
      neon: "#fef08a", dark: "#854d0e", glow: "#fef9c3",
      bg1: "#050507", bg2: "#0d0f18", bg3: "#1a1b2e"
    };
  } else if (rankName === "فارس") {
    return { 
      name: "WARRIOR",
      primary: "#06b6d4", secondary: "#22d3ee", accent: "#67e8f9",
      neon: "#a5f3fc", dark: "#164e63", glow: "#cffafe",
      bg1: "#050507", bg2: "#0d0f18", bg3: "#1a1b2e"
    };
  } else if (rankName === "نخبة") {
    return { 
      name: "ELITE",
      primary: "#d97706", secondary: "#f59e0b", accent: "#fbbf24",
      neon: "#fde68a", dark: "#92400e", glow: "#fef3c7",
      bg1: "#050507", bg2: "#0d0f18", bg3: "#1a1b2e"
    };
  } else if (rankName === "بطل") {
    return { 
      name: "HERO",
      primary: "#f97316", secondary: "#fb923c", accent: "#fdba74",
      neon: "#fed7aa", dark: "#9a3412", glow: "#ffedd5",
      bg1: "#050507", bg2: "#0d0f18", bg3: "#1a1b2e"
    };
  } else if (rankName === "أسطورة") {
    return { 
      name: "LEGEND",
      primary: "#ef4444", secondary: "#f87171", accent: "#fca5a5",
      neon: "#fecaca", dark: "#991b1b", glow: "#fee2e2",
      bg1: "#050507", bg2: "#0d0f18", bg3: "#1a1b2e"
    };
  } else if (rankName === "ملك" || rankName === "إمبراطور") {
    return { 
      name: "VOID EMPEROR",
      primary: "#dc2626", secondary: "#ef4444", accent: "#f87171",
      neon: "#fca5a5", dark: "#7f1d1d", glow: "#fee2e2",
      bg1: "#050507", bg2: "#0d0f18", bg3: "#1a1b2e"
    };
  } else {
    return { 
      name: "IMMORTAL",
      primary: "#7c3aed", secondary: "#8b5cf6", accent: "#a78bfa",
      neon: "#c4b5fd", dark: "#5b21b6", glow: "#ede9fe",
      bg1: "#050507", bg2: "#0d0f18", bg3: "#1a1b2e"
    };
  }
}

// ══════════════════════════════════════════════════════════
// 🌌 MAIN VOID EMPEROR CARD CREATION
// ══════════════════════════════════════════════════════════
async function createVoidEmperorCard(data) {
  const W = 1400;
  const H = 550;
  const canvas = Canvas.createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  const theme = getVoidTheme(data.rank, data.isDeveloper);

  // ══════════════ COSMIC VOID BACKGROUND ══════════════
  createCosmicVoidBackground(ctx, W, H, theme);
  
  // ══════════════ DIGITAL GRID SYSTEM ══════════════
  createDigitalGrid(ctx, W, H, theme);
  
  // ══════════════ ENERGY LINES ══════════════
  createEnergyLines(ctx, W, H, theme);
  
  // ══════════════ DUST PARTICLES ══════════════
  createDustParticles(ctx, W, H, theme);
  
  // ══════════════ DEVELOPER WATERMARK ══════════════
  if (data.isDeveloper) {
    drawSystemOwnerWatermark(ctx, W, H, theme);
  }
  
  // ══════════════ MAIN FRAME ══════════════
  drawBrokenFrame(ctx, W, H, theme);
  
  // ══════════════ OCTAGONAL AVATAR ══════════════
  await drawOctagonalAvatar(ctx, data.userID, theme, data.isDeveloper);
  
  // ══════════════ USERNAME SECTION ══════════════
  drawUsernameSection(ctx, data, theme);
  
  // ══════════════ HUD SYSTEM ══════════════
  drawHUDSystem(ctx, data, theme);
  
  // ══════════════ SEGMENTED XP BAR ══════════════
  drawSegmentedXPBar(ctx, data, theme);
  
  // ══════════════ DEVELOPER EFFECTS ══════════════
  if (data.isDeveloper) {
    drawDeveloperEffects(ctx, W, H, theme);
  }
  
  // ══════════════ GRAIN EFFECT ══════════════
  addGrainEffect(ctx, W, H);

  return canvas.toBuffer("image/png");
}

// ══════════════════════════════════════════════════════════
// 🌌 COSMIC VOID BACKGROUND
// ══════════════════════════════════════════════════════════
function createCosmicVoidBackground(ctx, W, H, theme) {
  const bg = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W, H) * 0.7);
  bg.addColorStop(0, theme.bg2);
  bg.addColorStop(0.6, theme.bg1);
  bg.addColorStop(1, "#000000");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  
  const vignette = ctx.createRadialGradient(W/2, H/2, W * 0.3, W/2, H/2, W * 0.8);
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);
}

function createDigitalGrid(ctx, W, H, theme) {
  ctx.strokeStyle = `rgba(255, 255, 255, 0.04)`;
  ctx.lineWidth = 0.5;
  const gridSize = 30;
  
  for (let x = 0; x <= W; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  
  for (let y = 0; y <= H; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
}

function createEnergyLines(ctx, W, H, theme) {
  ctx.strokeStyle = theme.primary + '15';
  ctx.lineWidth = 1;
  
  for (let i = 0; i < 8; i++) {
    const startX = Math.random() * W;
    const startY = Math.random() * H;
    const length = 100 + Math.random() * 200;
    const angle = Math.random() * Math.PI * 2;
    
    const endX = startX + Math.cos(angle) * length;
    const endY = startY + Math.sin(angle) * length;
    
    const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
    gradient.addColorStop(0, theme.primary + '00');
    gradient.addColorStop(0.5, theme.primary + '40');
    gradient.addColorStop(1, theme.primary + '00');
    
    ctx.strokeStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }
}

function createDustParticles(ctx, W, H, theme) {
  for (let i = 0; i < 100; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const size = Math.random() * 1.5;
    const alpha = Math.random() * 0.3;
    
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawSystemOwnerWatermark(ctx, W, H, theme) {
  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.font = "bold 120px 'Arial'";
  ctx.fillStyle = theme.primary;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("SYSTEM OWNER", W/2, H/2);
  ctx.restore();
}

function drawBrokenFrame(ctx, W, H, theme) {
  const margin = 20;
  const innerMargin = 25;
  
  ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 20;
  ctx.fillStyle = '#000000';
  drawAngularRect(ctx, margin, margin, W - margin * 2, H - margin * 2, 12);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  
  ctx.fillStyle = theme.bg2 + 'ee';
  drawAngularRect(ctx, margin, margin, W - margin * 2, H - margin * 2, 12);
  ctx.fill();
  
  const outerGrad = ctx.createLinearGradient(margin, margin, W - margin, H - margin);
  outerGrad.addColorStop(0, theme.primary + 'aa');
  outerGrad.addColorStop(0.5, theme.accent);
  outerGrad.addColorStop(1, theme.primary + 'aa');
  
  ctx.strokeStyle = outerGrad;
  ctx.lineWidth = 3;
  ctx.shadowColor = theme.glow;
  ctx.shadowBlur = 20;
  drawAngularRect(ctx, margin, margin, W - margin * 2, H - margin * 2, 12);
  ctx.stroke();
  
  ctx.strokeStyle = theme.neon + 'dd';
  ctx.lineWidth = 2;
  ctx.shadowBlur = 15;
  drawAngularRect(ctx, innerMargin, innerMargin, W - innerMargin * 2, H - innerMargin * 2, 10);
  ctx.stroke();
  
  ctx.shadowBlur = 0;
  drawLightCracks(ctx, W, H, theme);
}

function drawAngularRect(ctx, x, y, w, h, cut) {
  ctx.beginPath();
  ctx.moveTo(x + cut, y);
  ctx.lineTo(x + w - cut, y);
  ctx.lineTo(x + w, y + cut);
  ctx.lineTo(x + w, y + h - cut);
  ctx.lineTo(x + w - cut, y + h);
  ctx.lineTo(x + cut, y + h);
  ctx.lineTo(x, y + h - cut);
  ctx.lineTo(x, y + cut);
  ctx.closePath();
}

function drawLightCracks(ctx, W, H, theme) {
  const cracks = [
    { x: 100, y: 50, length: 80, angle: 0.3 },
    { x: W - 150, y: 80, length: 100, angle: -0.4 },
    { x: 120, y: H - 70, length: 90, angle: -0.2 },
    { x: W - 130, y: H - 60, length: 85, angle: 0.5 }
  ];
  
  cracks.forEach(crack => {
    ctx.strokeStyle = theme.primary + '30';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = theme.primary;
    ctx.shadowBlur = 10;
    
    ctx.beginPath();
    ctx.moveTo(crack.x, crack.y);
    
    let currentX = crack.x;
    let currentY = crack.y;
    const segments = 5;
    
    for (let i = 0; i < segments; i++) {
      const segmentLength = crack.length / segments;
      const randomAngle = crack.angle + (Math.random() - 0.5) * 0.3;
      currentX += Math.cos(randomAngle) * segmentLength;
      currentY += Math.sin(randomAngle) * segmentLength;
      ctx.lineTo(currentX, currentY);
    }
    
    ctx.stroke();
  });
  
  ctx.shadowBlur = 0;
}

async function drawOctagonalAvatar(ctx, userID, theme, isDeveloper) {
  const centerX = 200;
  const centerY = 275;
  const size = 200;
  const radius = size / 2;
  
  try {
    const avatarUrl = `https://graph.facebook.com/${userID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const response = await axios.get(avatarUrl, { responseType: "arraybuffer", timeout: 10000 });
    const avatarImg = await Canvas.loadImage(Buffer.from(response.data));
    
    if (isDeveloper) {
      drawEnergyHalo(ctx, centerX, centerY, radius + 60, theme);
    }
    
    for (let i = 6; i >= 0; i--) {
      const glowRadius = radius + 40 + i * 10;
      const alpha = 0.25 - i * 0.035;
      
      const glowGrad = ctx.createRadialGradient(centerX, centerY, radius, centerX, centerY, glowRadius);
      glowGrad.addColorStop(0, theme.primary + '00');
      glowGrad.addColorStop(0.7, theme.primary + Math.floor(alpha * 255).toString(16).padStart(2, '0'));
      glowGrad.addColorStop(1, theme.primary + '00');
      
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 15;
    ctx.fillStyle = '#000';
    drawOctagon(ctx, centerX, centerY, radius);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    
    ctx.save();
    drawOctagon(ctx, centerX, centerY, radius);
    ctx.clip();
    ctx.drawImage(avatarImg, centerX - radius, centerY - radius, size, size);
    ctx.restore();
    
    const overlayGrad = ctx.createRadialGradient(
      centerX - radius/3, centerY - radius/3, 0,
      centerX, centerY, radius
    );
    overlayGrad.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
    overlayGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
    overlayGrad.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
    
    ctx.save();
    drawOctagon(ctx, centerX, centerY, radius);
    ctx.clip();
    ctx.fillStyle = overlayGrad;
    ctx.fillRect(centerX - radius, centerY - radius, size, size);
    ctx.restore();
    
    const borderGrad = ctx.createLinearGradient(centerX - radius, centerY - radius, centerX + radius, centerY + radius);
    borderGrad.addColorStop(0, theme.neon);
    borderGrad.addColorStop(0.5, theme.primary);
    borderGrad.addColorStop(1, theme.neon);
    
    ctx.strokeStyle = borderGrad;
    ctx.lineWidth = 5;
    ctx.shadowColor = theme.glow;
    ctx.shadowBlur = 20;
    drawOctagon(ctx, centerX, centerY, radius);
    ctx.stroke();
    
    ctx.strokeStyle = theme.accent + 'dd';
    ctx.lineWidth = 3;
    ctx.shadowBlur = 15;
    drawOctagon(ctx, centerX, centerY, radius - 8);
    ctx.stroke();
    
    drawRotatingEnergyLine(ctx, centerX, centerY, radius + 15, theme);
    
    if (isDeveloper) {
      ctx.strokeStyle = theme.primary;
      ctx.lineWidth = 2;
      ctx.shadowBlur = 20;
      drawOctagon(ctx, centerX, centerY, radius + 25);
      ctx.stroke();
      
      drawElectricSparks(ctx, centerX, centerY, radius + 30, theme);
    }
    
    ctx.shadowBlur = 0;
    
  } catch (error) {
    console.error("Avatar error:", error);
    
    ctx.fillStyle = theme.bg3;
    drawOctagon(ctx, centerX, centerY, radius);
    ctx.fill();
    
    ctx.strokeStyle = theme.primary;
    ctx.lineWidth = 5;
    drawOctagon(ctx, centerX, centerY, radius);
    ctx.stroke();
  }
}

function drawOctagon(ctx, x, y, radius) {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI / 4) * i - Math.PI / 8;
    const px = x + radius * Math.cos(angle);
    const py = y + radius * Math.sin(angle);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function drawEnergyHalo(ctx, x, y, radius, theme) {
  for (let i = 0; i < 3; i++) {
    const haloRadius = radius + i * 15;
    const alpha = 0.15 - i * 0.04;
    
    ctx.strokeStyle = theme.primary + Math.floor(alpha * 255).toString(16).padStart(2, '0');
    ctx.lineWidth = 2;
    ctx.shadowColor = theme.primary;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(x, y, haloRadius, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
}

function drawRotatingEnergyLine(ctx, x, y, radius, theme) {
  const segments = 60;
  
  for (let i = 0; i < segments; i++) {
    const angle = (Math.PI * 2 / segments) * i;
    const nextAngle = (Math.PI * 2 / segments) * (i + 1);
    
    const isActive = i % 4 === 0;
    const alpha = isActive ? 0.6 : 0.15;
    
    ctx.strokeStyle = theme.primary + Math.floor(alpha * 255).toString(16).padStart(2, '0');
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, radius, angle, nextAngle);
    ctx.stroke();
  }
}

function drawElectricSparks(ctx, x, y, radius, theme) {
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI * 2 / 8) * i;
    const sparkX = x + radius * Math.cos(angle);
    const sparkY = y + radius * Math.sin(angle);
    
    ctx.strokeStyle = theme.neon + 'cc';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = theme.neon;
    ctx.shadowBlur = 10;
    
    ctx.beginPath();
    ctx.moveTo(sparkX, sparkY);
    
    for (let j = 0; j < 3; j++) {
      const sparkLength = 5 + Math.random() * 10;
      const sparkAngle = angle + (Math.random() - 0.5) * 0.5;
      const endX = sparkX + Math.cos(sparkAngle) * sparkLength;
      const endY = sparkY + Math.sin(sparkAngle) * sparkLength;
      ctx.lineTo(endX, endY);
    }
    
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
}

function drawUsernameSection(ctx, data, theme) {
  const x = 430;
  const y = 140;
  
  ctx.font = "bold 56px 'Arial'";
  ctx.textAlign = "left";
  
  ctx.fillStyle = theme.primary + '30';
  ctx.fillText(data.username, x - 2, y - 2);
  
  ctx.fillStyle = theme.accent + '30';
  ctx.fillText(data.username, x + 2, y + 2);
  
  const textGrad = ctx.createLinearGradient(x, y - 30, x, y + 30);
  textGrad.addColorStop(0, '#ffffff');
  textGrad.addColorStop(1, theme.neon);
  ctx.fillStyle = textGrad;
  ctx.shadowColor = theme.glow;
  ctx.shadowBlur = 20;
  ctx.fillText(data.username, x, y);
  
  ctx.shadowBlur = 30;
  ctx.fillStyle = theme.primary + '44';
  ctx.fillText(data.username, x, y);
  ctx.shadowBlur = 0;
  
  const rankY = y + 55;
  ctx.font = "bold 20px 'Courier New'";
  ctx.fillStyle = theme.accent + 'aa';
  ctx.fillText("SYSTEM RANK:", x, rankY);
  
  ctx.fillStyle = theme.primary;
  ctx.shadowColor = theme.primary;
  ctx.shadowBlur = 15;
  ctx.fillText(theme.name, x + 170, rankY);
  ctx.shadowBlur = 0;
  
  const idY = rankY + 35;
  ctx.fillStyle = theme.accent + '66';
  ctx.fillText("ID:", x, idY);
  
  ctx.fillStyle = theme.neon + 'dd';
  ctx.fillText(`#${data.userID}`, x + 45, idY);
}

function drawHUDSystem(ctx, data, theme) {
  const startX = 780;
  const startY = 120;
  const lineHeight = 65;
  
  const hudData = [
    { label: "XP", value: formatNumberCompact(data.exp), glow: theme.primary },
    { label: "LEVEL", value: data.level.toString(), glow: theme.accent },
    { label: "MSG", value: formatNumberCompact(data.msgCount), glow: theme.primary },
    { label: "BANK", value: formatNumberCompact(data.money) + "$", glow: theme.neon },
    { label: "ROLE", value: theme.name, glow: theme.primary }
  ];
  
  hudData.forEach((item, i) => {
    const y = startY + i * lineHeight;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(startX - 10, y - 30, 580, 50);
    
    ctx.strokeStyle = theme.primary + '30';
    ctx.lineWidth = 1;
    ctx.strokeRect(startX - 10, y - 30, 580, 50);
    
    ctx.font = "bold 22px 'Courier New'";
    ctx.fillStyle = theme.accent + '99';
    ctx.textAlign = "left";
    ctx.fillText(item.label, startX, y);
    
    ctx.font = "bold 28px 'Arial'";
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = item.glow;
    ctx.shadowBlur = 15;
    ctx.textAlign = "right";
    ctx.fillText(item.value, startX + 560, y);
    ctx.shadowBlur = 0;
    
    const lineGrad = ctx.createLinearGradient(startX, y + 18, startX + 560, y + 18);
    lineGrad.addColorStop(0, theme.primary + '00');
    lineGrad.addColorStop(0.5, theme.primary + 'aa');
    lineGrad.addColorStop(1, theme.primary + '00');
    
    ctx.strokeStyle = lineGrad;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = theme.primary;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(startX, y + 18);
    ctx.lineTo(startX + 560, y + 18);
    ctx.stroke();
    ctx.shadowBlur = 0;
  });
}

function drawSegmentedXPBar(ctx, data, theme) {
  const x = 430;
  const y = 460;
  const w = 910;
  const h = 40;
  const segments = 20;
  const segmentWidth = (w - (segments - 1) * 3) / segments;
  const progress = Math.min((data.exp / (data.exp + data.expNeeded)) * 100, 100);
  const filledSegments = Math.floor((progress / 100) * segments);
  
  ctx.font = "bold 18px 'Courier New'";
  ctx.fillStyle = theme.accent;
  ctx.textAlign = "left";
  ctx.fillText("EXPERIENCE PROGRESS", x, y - 15);
  
  for (let i = 0; i < segments; i++) {
    const segX = x + i * (segmentWidth + 3);
    const isFilled = i < filledSegments;
    const isPartial = i === filledSegments && progress % (100 / segments) > 0;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(segX, y, segmentWidth, h);
    
    ctx.strokeStyle = theme.dark;
    ctx.lineWidth = 1;
    ctx.strokeRect(segX, y, segmentWidth, h);
    
    if (isFilled || isPartial) {
      const fillGrad = ctx.createLinearGradient(segX, y, segX, y + h);
      fillGrad.addColorStop(0, theme.neon);
      fillGrad.addColorStop(0.5, theme.primary);
      fillGrad.addColorStop(1, theme.accent);
      
      ctx.fillStyle = fillGrad;
      ctx.shadowColor = theme.glow;
      ctx.shadowBlur = 15;
      ctx.fillRect(segX, y, segmentWidth, h);
      ctx.shadowBlur = 0;
      
      ctx.strokeStyle = theme.neon + 'aa';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(segX, y, segmentWidth, h);
      
      const shineGrad = ctx.createLinearGradient(segX, y, segX, y + h/3);
      shineGrad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
      shineGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = shineGrad;
      ctx.fillRect(segX, y, segmentWidth, h/3);
    }
  }
  
  if (filledSegments < segments) {
    const pulseX = x + filledSegments * (segmentWidth + 3) + segmentWidth;
    const pulseGrad = ctx.createRadialGradient(pulseX, y + h/2, 0, pulseX, y + h/2, 15);
    pulseGrad.addColorStop(0, theme.primary + 'cc');
    pulseGrad.addColorStop(1, theme.primary + '00');
    
    ctx.fillStyle = pulseGrad;
    ctx.beginPath();
    ctx.arc(pulseX, y + h/2, 15, 0, Math.PI * 2);
    ctx.fill();
  }
  
  ctx.font = "bold 20px 'Arial'";
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = theme.glow;
  ctx.shadowBlur = 15;
  ctx.textAlign = "right";
  ctx.fillText(`${Math.floor(progress)}%`, x + w + 50, y + 27);
  ctx.shadowBlur = 0;
}

function drawDeveloperEffects(ctx, W, H, theme) {
  const scanY = (Date.now() % 3000) / 3000 * H;
  const scanGrad = ctx.createLinearGradient(0, scanY - 50, 0, scanY + 50);
  scanGrad.addColorStop(0, theme.primary + '00');
  scanGrad.addColorStop(0.5, theme.primary + '40');
  scanGrad.addColorStop(1, theme.primary + '00');
  
  ctx.fillStyle = scanGrad;
  ctx.fillRect(0, scanY - 50, W, 100);
  
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const size = 1 + Math.random() * 2;
    
    ctx.fillStyle = theme.neon + 'aa';
    ctx.shadowColor = theme.neon;
    ctx.shadowBlur = 8;
    ctx.fillRect(x, y, size, size);
  }
  ctx.shadowBlur = 0;
}

function addGrainEffect(ctx, W, H) {
  ctx.globalAlpha = 0.02;
  for (let i = 0; i < 1000; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    ctx.fillStyle = Math.random() > 0.5 ? '#ffffff' : '#000000';
    ctx.fillRect(x, y, 1, 1);
  }
  ctx.globalAlpha = 1;
}

function formatNumberCompact(num) {
  if (num >= 1000000000) return (num / 1000000000).toFixed(1) + "B";
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}
