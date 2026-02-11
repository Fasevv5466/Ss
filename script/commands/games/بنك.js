const Canvas = require("@napi-rs/canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const mongodb = require(path.join(process.cwd(), "includes", "mongodb.js"));

module.exports.config = {
  name: "بنك",
  version: "7.0.0",
  hasPermssion: 0,
  credits: "ايمن - Masterpiece Edition",
  description: "تحفة فنية - مستوى AAA",
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
    
    api.sendMessage("✨ جاري إنشاء تحفة فنية...", threadID, messageID);
    
    const card = await createMasterpiece({
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
    
    const cachePath = path.join(__dirname, "cache", `masterpiece_${targetID}.png`);
    await fs.ensureDir(path.join(__dirname, "cache"));
    await fs.writeFile(cachePath, card);
    
    return api.sendMessage({
      body: `╔═══════════════════╗\n` +
            `║ 𝗠𝗔𝗦𝗧𝗘𝗥𝗣𝗜𝗘𝗖𝗘 𝗖𝗔𝗥𝗗 ║\n` +
            `╚═══════════════════╝\n\n` +
            `👤 ${username}\n` +
            `${calculated.rank.emoji} ${calculated.rank.name} • LVL ${currency.level}\n` +
            `💰 ${formatNumber(currency.money)} $\n` +
            `⚡ ${formatNumber(currency.exp)} XP\n` +
            `💬 ${formatNumber(currency.messageCount)} MSG\n` +
            `🔥 ${currency.streak} Day Streak`,
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
// 🎨 Advanced Color Palette System
// ══════════════════════════════════════════════════════════
function getAdvancedTheme(exp, isDeveloper) {
  if (isDeveloper) {
    return {
      name: "DEVELOPER",
      primary: "#b91c1c",      // Crimson
      secondary: "#dc2626",     // Red
      accent: "#ef4444",        // Light Red
      dark: "#7f1d1d",         // Dark Red
      light: "#fca5a5",        // Pale Red
      glow: "#fee2e2",
      bg1: "#0a0000",
      bg2: "#1a0303",
      bg3: "#2d0505"
    };
  }
  
  if (exp < 200) {
    return { 
      name: "BEGINNER",
      primary: "#eab308", secondary: "#facc15", accent: "#fde047",
      dark: "#a16207", light: "#fef08a", glow: "#fefce8",
      bg1: "#0f0c00", bg2: "#1a1505", bg3: "#2d2410"
    };
  } else if (exp < 400) {
    return { 
      name: "SOLDIER",
      primary: "#16a34a", secondary: "#22c55e", accent: "#4ade80",
      dark: "#14532d", light: "#bbf7d0", glow: "#f0fdf4",
      bg1: "#000f05", bg2: "#051a0a", bg3: "#0f2d15"
    };
  } else if (exp < 700) {
    return { 
      name: "WARRIOR",
      primary: "#0ea5e9", secondary: "#38bdf8", accent: "#7dd3fc",
      dark: "#0c4a6e", light: "#bae6fd", glow: "#f0f9ff",
      bg1: "#00050f", bg2: "#030a1a", bg3: "#05152d"
    };
  } else if (exp < 1000) {
    return { 
      name: "OFFICER",
      primary: "#ea580c", secondary: "#f97316", accent: "#fb923c",
      dark: "#7c2d12", light: "#fed7aa", glow: "#fff7ed",
      bg1: "#0f0500", bg2: "#1a0a03", bg3: "#2d1505"
    };
  } else if (exp < 2500) {
    return { 
      name: "LEADER",
      primary: "#64748b", secondary: "#94a3b8", accent: "#cbd5e1",
      dark: "#1e293b", light: "#e2e8f0", glow: "#f8fafc",
      bg1: "#050505", bg2: "#0f0f0f", bg3: "#1a1a1a"
    };
  } else {
    return { 
      name: "MINISTER",
      primary: "#d97706", secondary: "#f59e0b", accent: "#fbbf24",
      dark: "#78350f", light: "#fde68a", glow: "#fffbeb",
      bg1: "#0f0a00", bg2: "#1a1505", bg3: "#2d2410"
    };
  }
}

// ══════════════════════════════════════════════════════════
// 🎨 Dynamic Font Sizing with Perfect Scale
// ══════════════════════════════════════════════════════════
function getOptimalFontSize(number) {
  const str = number.toString();
  const len = str.length;
  
  if (len <= 2) return 34;
  if (len === 3) return 32;
  if (len === 4) return 30;
  if (len === 5) return 28;
  if (len === 6) return 26;
  if (len === 7) return 24;
  return 22;
}

// ══════════════════════════════════════════════════════════
// 🎨 Main Masterpiece Creation Function
// ══════════════════════════════════════════════════════════
async function createMasterpiece(data) {
  const W = 1248;
  const H = 827;
  const canvas = Canvas.createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  const theme = getAdvancedTheme(data.exp, data.isDeveloper);

  // ══════════════ Advanced Background System ══════════════
  createAdvancedBackground(ctx, W, H, theme);
  
  // ══════════════ Particle System ══════════════
  createParticleSystem(ctx, W, H, theme);
  
  // ══════════════ Lighting Effects ══════════════
  createDynamicLighting(ctx, W, H, theme);
  
  // ══════════════ Top Decorative Elements ══════════════
  drawTopDecorations(ctx, theme);
  
  // ══════════════ Premium Header ══════════════
  drawPremiumHeader(ctx, W, theme);
  
  // ══════════════ User Info Section ══════════════
  await drawUserSection(ctx, data, theme);
  
  // ══════════════ Avatar with Advanced Effects ══════════════
  await drawPremiumAvatar(ctx, data.userID, theme);
  
  // ══════════════ Level Badge ══════════════
  drawLevelBadge(ctx, data.level, theme);
  
  // ══════════════ Stats Display ══════════════
  drawPremiumStats(ctx, data, theme);
  
  // ══════════════ Bottom Decorations ══════════════
  drawBottomDecorations(ctx, theme);
  
  // ══════════════ Signature ══════════════
  ctx.font = "12px 'Courier New'";
  ctx.fillStyle = theme.light + "99";
  ctx.textAlign = "center";
  ctx.fillText("✦ KIRA BANK • MASTERPIECE EDITION • AYMAN ✦", W/2, H - 20);

  return canvas.toBuffer("image/png");
}

// ══════════════════════════════════════════════════════════
// 🎨 Advanced Background with Depth
// ══════════════════════════════════════════════════════════
function createAdvancedBackground(ctx, W, H, theme) {
  // Deep gradient background
  const bg = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W, H) * 0.7);
  bg.addColorStop(0, theme.bg3);
  bg.addColorStop(0.4, theme.bg2);
  bg.addColorStop(0.8, theme.bg1);
  bg.addColorStop(1, "#000000");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  
  // Noise texture simulation
  for (let i = 0; i < 2000; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const alpha = Math.random() * 0.08;
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.fillRect(x, y, 1, 1);
  }
  
  // Grid system
  ctx.strokeStyle = `rgba(255, 255, 255, 0.015)`;
  ctx.lineWidth = 1;
  for (let i = 0; i < W; i += 40) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, H);
    ctx.stroke();
  }
  for (let j = 0; j < H; j += 40) {
    ctx.beginPath();
    ctx.moveTo(0, j);
    ctx.lineTo(W, j);
    ctx.stroke();
  }
  
  // Hexagonal pattern overlay
  ctx.strokeStyle = `${theme.primary}08`;
  ctx.lineWidth = 0.5;
  const hexSize = 35;
  for (let row = 0; row < 25; row++) {
    for (let col = 0; col < 36; col++) {
      if (Math.random() > 0.85) {
        const x = col * hexSize * 1.5 + (row % 2) * hexSize * 0.75;
        const y = row * hexSize * 0.866;
        drawHex(ctx, x, y, hexSize * 0.4);
        ctx.stroke();
      }
    }
  }
}

// ══════════════════════════════════════════════════════════
// 🎨 Advanced Particle System
// ══════════════════════════════════════════════════════════
function createParticleSystem(ctx, W, H, theme) {
  const particles = [];
  const count = 100;
  
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * W,
      y: Math.random() * H,
      size: 0.5 + Math.random() * 2,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.6 + 0.2,
      color: Math.random() > 0.5 ? theme.primary : theme.accent
    });
  }
  
  particles.forEach(p => {
    const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
    gradient.addColorStop(0, p.color + Math.floor(p.opacity * 255).toString(16).padStart(2, '0'));
    gradient.addColorStop(0.5, p.color + Math.floor(p.opacity * 0.4 * 255).toString(16).padStart(2, '0'));
    gradient.addColorStop(1, p.color + '00');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
    ctx.fill();
  });
  
  // Connection lines between nearby particles
  ctx.strokeStyle = theme.primary + '11';
  ctx.lineWidth = 0.5;
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 120) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }
}

// ══════════════════════════════════════════════════════════
// 🎨 Dynamic Lighting System
// ══════════════════════════════════════════════════════════
function createDynamicLighting(ctx, W, H, theme) {
  // Spotlight effect
  const spotlights = [
    { x: W * 0.25, y: H * 0.3, radius: 400, intensity: 0.15 },
    { x: W * 0.75, y: H * 0.35, radius: 450, intensity: 0.12 },
    { x: W * 0.5, y: H * 0.7, radius: 350, intensity: 0.1 }
  ];
  
  spotlights.forEach(light => {
    const gradient = ctx.createRadialGradient(
      light.x, light.y, 0,
      light.x, light.y, light.radius
    );
    gradient.addColorStop(0, theme.primary + Math.floor(light.intensity * 255).toString(16).padStart(2, '0'));
    gradient.addColorStop(0.5, theme.accent + Math.floor(light.intensity * 0.5 * 255).toString(16).padStart(2, '0'));
    gradient.addColorStop(1, theme.primary + '00');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);
  });
}

// ══════════════════════════════════════════════════════════
// 🎨 Premium Header Design
// ══════════════════════════════════════════════════════════
function drawPremiumHeader(ctx, W, theme) {
  const centerX = W / 2;
  const y = 55;
  const width = 620;
  const height = 68;
  
  // Glass morphism background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.filter = 'blur(10px)';
  roundRect(ctx, centerX - width/2, y, width, height, 15);
  ctx.fill();
  ctx.filter = 'none';
  
  // Main background
  const headerGrad = ctx.createLinearGradient(centerX - width/2, y, centerX + width/2, y + height);
  headerGrad.addColorStop(0, theme.dark + '99');
  headerGrad.addColorStop(0.5, theme.primary + '88');
  headerGrad.addColorStop(1, theme.dark + '99');
  ctx.fillStyle = headerGrad;
  roundRect(ctx, centerX - width/2, y, width, height, 15);
  ctx.fill();
  
  // Border with gradient
  const borderGrad = ctx.createLinearGradient(centerX - width/2, y, centerX + width/2, y);
  borderGrad.addColorStop(0, theme.accent + '44');
  borderGrad.addColorStop(0.5, theme.primary);
  borderGrad.addColorStop(1, theme.accent + '44');
  ctx.strokeStyle = borderGrad;
  ctx.lineWidth = 2.5;
  ctx.shadowColor = theme.primary;
  ctx.shadowBlur = 20;
  roundRect(ctx, centerX - width/2, y, width, height, 15);
  ctx.stroke();
  ctx.shadowBlur = 0;
  
  // Inner glow
  ctx.strokeStyle = theme.light + '33';
  ctx.lineWidth = 1;
  roundRect(ctx, centerX - width/2 + 3, y + 3, width - 6, height - 6, 13);
  ctx.stroke();
  
  // Text with professional typography
  ctx.font = "bold 42px 'Arial'";
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  
  // Text shadow for depth
  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;
  ctx.fillText("KIRA BANK", centerX, y + height/2);
  
  // Highlight overlay
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.fillStyle = theme.glow + '44';
  ctx.fillText("KIRA BANK", centerX, y + height/2 - 1);
  
  // Accent line at bottom
  const lineGrad = ctx.createLinearGradient(centerX - width/2, 0, centerX + width/2, 0);
  lineGrad.addColorStop(0, theme.primary + '00');
  lineGrad.addColorStop(0.5, theme.accent);
  lineGrad.addColorStop(1, theme.primary + '00');
  ctx.strokeStyle = lineGrad;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(centerX - width/2 + 30, y + height - 5);
  ctx.lineTo(centerX + width/2 - 30, y + height - 5);
  ctx.stroke();
}

// ══════════════════════════════════════════════════════════
// 🎨 User Section with Advanced Layout
// ══════════════════════════════════════════════════════════
async function drawUserSection(ctx, data, theme) {
  const x = 90;
  const y = 215;
  
  // Decorative arc
  for (let i = 3; i >= 0; i--) {
    ctx.strokeStyle = theme.primary + Math.floor((60 - i * 15)).toString(16).padStart(2, '0');
    ctx.lineWidth = 4 - i * 0.8;
    ctx.shadowColor = theme.primary;
    ctx.shadowBlur = 15 - i * 3;
    ctx.beginPath();
    ctx.arc(x, y + 20, 40 + i * 6, Math.PI * 0.7, Math.PI * 1.3);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
  
  // Username with professional styling
  ctx.font = "bold 72px 'Arial'";
  
  // Shadow for depth
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;
  ctx.textAlign = "left";
  ctx.fillText(data.username, x + 60, y + 30);
  
  // Main text
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  const textGrad = ctx.createLinearGradient(x + 60, y, x + 60, y + 40);
  textGrad.addColorStop(0, '#ffffff');
  textGrad.addColorStop(1, theme.light);
  ctx.fillStyle = textGrad;
  ctx.fillText(data.username, x + 60, y + 30);
  
  // Highlight
  ctx.fillStyle = theme.glow + '55';
  ctx.fillText(data.username, x + 60, y + 28);
  
  // ID Container with glass morphism
  const idY = y + 75;
  const idW = 400;
  const idH = 62;
  
  // Glass background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.filter = 'blur(8px)';
  roundRect(ctx, x - 5, idY, idW, idH, 10);
  ctx.fill();
  ctx.filter = 'none';
  
  // Main container
  const idGrad = ctx.createLinearGradient(x, idY, x + idW, idY);
  idGrad.addColorStop(0, theme.dark + 'cc');
  idGrad.addColorStop(0.5, theme.primary + '99');
  idGrad.addColorStop(1, theme.dark + 'aa');
  ctx.fillStyle = idGrad;
  roundRect(ctx, x - 5, idY, idW, idH, 10);
  ctx.fill();
  
  // Border
  ctx.strokeStyle = theme.primary;
  ctx.lineWidth = 2;
  ctx.shadowColor = theme.primary;
  ctx.shadowBlur = 15;
  roundRect(ctx, x - 5, idY, idW, idH, 10);
  ctx.stroke();
  ctx.shadowBlur = 0;
  
  // Inner highlight
  ctx.strokeStyle = theme.light + '44';
  ctx.lineWidth = 1;
  roundRect(ctx, x - 2, idY + 3, idW - 6, idH - 6, 8);
  ctx.stroke();
  
  // ID Text
  ctx.font = "bold 24px 'Courier New'";
  ctx.fillStyle = theme.light;
  ctx.shadowColor = theme.accent;
  ctx.shadowBlur = 10;
  ctx.fillText("ID", x + 20, idY + 39);
  
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = theme.primary;
  ctx.shadowBlur = 12;
  ctx.fillText(`#${data.userID}`, x + 80, idY + 39);
  ctx.shadowBlur = 0;
}

// ══════════════════════════════════════════════════════════
// 🎨 Premium Avatar with Advanced Effects
// ══════════════════════════════════════════════════════════
async function drawPremiumAvatar(ctx, userID, theme) {
  const x = 968;
  const y = 300;
  const size = 300;
  
  try {
    const avatarUrl = `https://graph.facebook.com/${userID}/picture?width=1024&height=1024&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const response = await axios.get(avatarUrl, { responseType: "arraybuffer" });
    const avatarImg = await Canvas.loadImage(Buffer.from(response.data));
    
    // Outer glow rings
    for (let i = 8; i >= 0; i--) {
      const radius = size/2 + 30 + i * 12;
      const alpha = (0.25 - i * 0.025);
      
      const glowGrad = ctx.createRadialGradient(x, y, size/2, x, y, radius);
      glowGrad.addColorStop(0, theme.primary + '00');
      glowGrad.addColorStop(0.7, theme.primary + Math.floor(alpha * 255).toString(16).padStart(2, '0'));
      glowGrad.addColorStop(1, theme.primary + '00');
      
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Shadow for depth
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 15;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(x, y, size/2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    
    // Avatar image
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, size/2, 0, Math.PI * 2);
    ctx.clip();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(avatarImg, x - size/2, y - size/2, size, size);
    ctx.restore();
    
    // Glass overlay effect
    const overlayGrad = ctx.createLinearGradient(x - size/2, y - size/2, x + size/2, y + size/2);
    overlayGrad.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
    overlayGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
    overlayGrad.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
    ctx.fillStyle = overlayGrad;
    ctx.beginPath();
    ctx.arc(x, y, size/2, 0, Math.PI * 2);
    ctx.fill();
    
    // Triple ring system
    // Ring 1 - Main
    const ring1Grad = ctx.createLinearGradient(x - size/2, y, x + size/2, y);
    ring1Grad.addColorStop(0, theme.accent);
    ring1Grad.addColorStop(0.5, theme.primary);
    ring1Grad.addColorStop(1, theme.accent);
    ctx.strokeStyle = ring1Grad;
    ctx.lineWidth = 5;
    ctx.shadowColor = theme.primary;
    ctx.shadowBlur = 25;
    ctx.beginPath();
    ctx.arc(x, y, size/2, 0, Math.PI * 2);
    ctx.stroke();
    
    // Ring 2 - Middle
    ctx.strokeStyle = theme.light;
    ctx.lineWidth = 3;
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(x, y, size/2 + 12, 0, Math.PI * 2);
    ctx.stroke();
    
    // Ring 3 - Outer
    ctx.strokeStyle = theme.accent + 'aa';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(x, y, size/2 + 22, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.shadowBlur = 0;
    
  } catch (error) {
    console.error("Avatar error:", error);
  }
}

// ══════════════════════════════════════════════════════════
// 🎨 Level Badge with Premium Design
// ══════════════════════════════════════════════════════════
function drawLevelBadge(ctx, level, theme) {
  const x = 968;
  const y = 490;
  const size = 100;
  
  // Outer glow
  for (let i = 5; i >= 0; i--) {
    const radius = size/2 + i * 10;
    const alpha = 0.4 - i * 0.06;
    
    const glowGrad = ctx.createRadialGradient(x, y, 0, x, y, radius);
    glowGrad.addColorStop(0, theme.primary + Math.floor(alpha * 255).toString(16).padStart(2, '0'));
    glowGrad.addColorStop(1, theme.primary + '00');
    
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 8;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(x, y, size/2, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  
  // Main circle with gradient
  const bgGrad = ctx.createRadialGradient(x, y - size/4, 0, x, y, size/2);
  bgGrad.addColorStop(0, theme.primary + 'dd');
  bgGrad.addColorStop(0.5, theme.dark + 'ff');
  bgGrad.addColorStop(1, '#000000');
  ctx.fillStyle = bgGrad;
  ctx.beginPath();
  ctx.arc(x, y, size/2, 0, Math.PI * 2);
  ctx.fill();
  
  // Multiple borders
  ctx.strokeStyle = theme.primary;
  ctx.lineWidth = 4;
  ctx.shadowColor = theme.primary;
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.arc(x, y, size/2, 0, Math.PI * 2);
  ctx.stroke();
  
  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = 2.5;
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.arc(x, y, size/2 - 7, 0, Math.PI * 2);
  ctx.stroke();
  
  ctx.strokeStyle = theme.light + 'aa';
  ctx.lineWidth = 1.5;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(x, y, size/2 - 13, 0, Math.PI * 2);
  ctx.stroke();
  
  ctx.shadowBlur = 0;
  
  // Level text
  ctx.font = "bold 44px 'Arial'";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  
  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 2;
  ctx.fillText(level, x, y);
  
  // Main text
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  const textGrad = ctx.createLinearGradient(x, y - 20, x, y + 20);
  textGrad.addColorStop(0, '#ffffff');
  textGrad.addColorStop(1, theme.light);
  ctx.fillStyle = textGrad;
  ctx.fillText(level, x, y);
  
  // Highlight
  ctx.fillStyle = theme.glow + '77';
  ctx.fillText(level, x, y - 1);
}

// ══════════════════════════════════════════════════════════
// 🎨 Premium Stats Display
// ══════════════════════════════════════════════════════════
function drawPremiumStats(ctx, data, theme) {
  const startX = 50;
  const startY = 425;
  const barW = 680;
  const barH = 102;
  const spacing = 6;
  
  // BALANCE
  drawPremiumBar(ctx, startX, startY, barW, barH, "💰", "BALANCE", 
    data.money, theme, data.money, Math.max(data.money + 1000, 10000), true);
  
  // XP
  drawPremiumBar(ctx, startX, startY + barH + spacing, barW, barH, "⚡", "XP", 
    data.exp, theme, data.exp, data.exp + data.expNeeded, false);
  
  // MSG
  drawPremiumBar(ctx, startX, startY + (barH + spacing) * 2, barW, barH, "💬", "MSG", 
    data.msgCount, theme, data.msgCount, Math.max(data.msgCount + 100, 1000), false);
}

// ══════════════════════════════════════════════════════════
// 🎨 Single Premium Bar
// ══════════════════════════════════════════════════════════
function drawPremiumBar(ctx, x, y, w, h, icon, label, value, theme, current, max, isGold) {
  // Glass morphism background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.filter = 'blur(12px)';
  roundRect(ctx, x, y, w, h, 12);
  ctx.fill();
  ctx.filter = 'none';
  
  // Main background with gradient
  const bgGrad = ctx.createLinearGradient(x, y, x + w, y + h);
  bgGrad.addColorStop(0, theme.dark + 'dd');
  bgGrad.addColorStop(0.5, theme.primary + '66');
  bgGrad.addColorStop(1, theme.dark + 'cc');
  ctx.fillStyle = bgGrad;
  roundRect(ctx, x, y, w, h, 12);
  ctx.fill();
  
  // Border with gradient
  const borderGrad = ctx.createLinearGradient(x, y, x + w, y);
  borderGrad.addColorStop(0, theme.accent + '66');
  borderGrad.addColorStop(0.5, theme.primary);
  borderGrad.addColorStop(1, theme.accent + '66');
  ctx.strokeStyle = borderGrad;
  ctx.lineWidth = 2.5;
  ctx.shadowColor = theme.primary;
  ctx.shadowBlur = 18;
  roundRect(ctx, x, y, w, h, 12);
  ctx.stroke();
  ctx.shadowBlur = 0;
  
  // Inner glow
  ctx.strokeStyle = theme.light + '33';
  ctx.lineWidth = 1;
  roundRect(ctx, x + 3, y + 3, w - 6, h - 6, 10);
  ctx.stroke();
  
  // Corner accents
  const cornerSize = 30;
  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = 2;
  ctx.shadowColor = theme.accent;
  ctx.shadowBlur = 12;
  
  // Top left
  ctx.beginPath();
  ctx.moveTo(x + cornerSize + 15, y + 14);
  ctx.lineTo(x + 15, y + 14);
  ctx.lineTo(x + 15, y + cornerSize);
  ctx.stroke();
  
  // Bottom right
  ctx.beginPath();
  ctx.moveTo(x + w - cornerSize, y + h - 14);
  ctx.lineTo(x + w - 10, y + h - 14);
  ctx.lineTo(x + w - 10, y + h - cornerSize);
  ctx.stroke();
  ctx.shadowBlur = 0;
  
  // Icon with special treatment
  if (isGold) {
    // Premium gold coin
    const iconGrad = ctx.createRadialGradient(x + 56, y + h/2, 0, x + 56, y + h/2, 26);
    iconGrad.addColorStop(0, "#ffd700");
    iconGrad.addColorStop(0.4, "#ffed4e");
    iconGrad.addColorStop(0.7, "#d4af37");
    iconGrad.addColorStop(1, "#aa8c2a");
    
    ctx.fillStyle = iconGrad;
    ctx.shadowColor = "#ffd700";
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(x + 56, y + h/2, 26, 0, Math.PI * 2);
    ctx.fill();
    
    // Ring
    ctx.strokeStyle = "#ffed4e";
    ctx.lineWidth = 2;
    ctx.shadowBlur = 15;
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // Dollar sign
    ctx.fillStyle = "#1a1a1a";
    ctx.font = "bold 32px 'Arial'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("$", x + 56, y + h/2);
    
  } else if (label === "XP") {
    // XP Badge
    const xpGrad = ctx.createRadialGradient(x + 56, y + h/2, 0, x + 56, y + h/2, 24);
    xpGrad.addColorStop(0, theme.accent + '66');
    xpGrad.addColorStop(1, theme.primary + '33');
    ctx.fillStyle = xpGrad;
    ctx.beginPath();
    ctx.arc(x + 56, y + h/2, 24, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = theme.primary;
    ctx.lineWidth = 3;
    ctx.shadowColor = theme.primary;
    ctx.shadowBlur = 15;
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    ctx.font = "bold 20px 'Arial'";
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = theme.accent;
    ctx.shadowBlur = 10;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("XP", x + 56, y + h/2);
    ctx.shadowBlur = 0;
    
  } else {
    // Message icon
    ctx.fillStyle = theme.primary;
    ctx.shadowColor = theme.primary;
    ctx.shadowBlur = 15;
    roundRect(ctx, x + 36, y + h/2 - 18, 40, 32, 4);
    ctx.fill();
    roundRect(ctx, x + 36, y + h/2 + 14, 14, 12, 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Inner details
    ctx.fillStyle = theme.dark;
    ctx.fillRect(x + 42, y + h/2 - 12, 28, 3);
    ctx.fillRect(x + 42, y + h/2 - 5, 20, 3);
  }
  
  // Label
  ctx.font = "bold 26px 'Arial'";
  ctx.fillStyle = theme.light;
  ctx.textAlign = "right";
  ctx.shadowColor = theme.accent;
  ctx.shadowBlur = 12;
  ctx.fillText(label, x + w - 24, y + 36);
  ctx.shadowBlur = 0;
  
  // Progress bar
  const barX = x + 110;
  const barY = y + h/2 - 12;
  const barWidth = w - 160;
  const barHeight = 24;
  const progress = Math.min((current / max) * 100, 100);
  const fillWidth = (barWidth * progress) / 100;
  
  // Bar background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  roundRect(ctx, barX, barY, barWidth, barHeight, barHeight/2);
  ctx.fill();
  
  ctx.strokeStyle = theme.dark;
  ctx.lineWidth = 1.5;
  roundRect(ctx, barX, barY, barWidth, barHeight, barHeight/2);
  ctx.stroke();
  
  // Fill
  if (fillWidth > 0) {
    const fillGrad = ctx.createLinearGradient(barX, barY, barX + fillWidth, barY);
    fillGrad.addColorStop(0, theme.primary);
    fillGrad.addColorStop(0.3, theme.accent);
    fillGrad.addColorStop(0.7, theme.secondary);
    fillGrad.addColorStop(1, theme.primary);
    
    ctx.fillStyle = fillGrad;
    ctx.shadowColor = theme.accent;
    ctx.shadowBlur = 18;
    roundRect(ctx, barX, barY, fillWidth, barHeight, barHeight/2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Shine effect
    const shineGrad = ctx.createLinearGradient(barX, barY, barX + fillWidth, barY);
    shineGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    shineGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.4)');
    shineGrad.addColorStop(0.6, 'rgba(255, 255, 255, 0.4)');
    shineGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = shineGrad;
    roundRect(ctx, barX, barY, fillWidth, barHeight/2.5, barHeight/2);
    ctx.fill();
    
    // Arrow for XP
    if (label === "XP" && fillWidth > 25) {
      ctx.fillStyle = fillGrad;
      ctx.shadowColor = theme.accent;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.moveTo(barX + fillWidth, barY);
      ctx.lineTo(barX + fillWidth + 18, barY + barHeight/2);
      ctx.lineTo(barX + fillWidth, barY + barHeight);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }
  
  // Value with dynamic sizing
  const fontSize = getOptimalFontSize(value);
  ctx.font = `bold ${fontSize}px 'Arial'`;
  
  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 2;
  ctx.textAlign = "right";
  ctx.fillText(formatNumberShort(value), x + w - 24, y + h - 20);
  
  // Main text
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = 10;
  ctx.fillText(formatNumberShort(value), x + w - 24, y + h - 20);
  
  // Highlight
  ctx.fillStyle = theme.glow + '66';
  ctx.fillText(formatNumberShort(value), x + w - 24, y + h - 21);
  ctx.shadowBlur = 0;
}

// ══════════════════════════════════════════════════════════
// 🎨 Top & Bottom Decorations
// ══════════════════════════════════════════════════════════
function drawTopDecorations(ctx, theme) {
  const designs = [
    { x: 20, y: 35, width: 220, isLeft: true },
    { x: 1228, y: 35, width: 220, isLeft: false }
  ];
  
  designs.forEach(d => {
    const startX = d.isLeft ? d.x : d.x - d.width;
    
    // Main line
    const lineGrad = ctx.createLinearGradient(
      d.isLeft ? startX : startX + d.width,
      d.y,
      d.isLeft ? startX + d.width : startX,
      d.y
    );
    lineGrad.addColorStop(0, theme.primary + '00');
    lineGrad.addColorStop(0.3, theme.primary);
    lineGrad.addColorStop(0.7, theme.accent);
    lineGrad.addColorStop(1, theme.primary + '00');
    
    ctx.strokeStyle = lineGrad;
    ctx.lineWidth = 3;
    ctx.shadowColor = theme.primary;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.moveTo(startX, d.y);
    ctx.lineTo(startX + d.width, d.y);
    ctx.stroke();
    
    // Secondary line
    ctx.strokeStyle = theme.light + '66';
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(startX + 20, d.y + 8);
    ctx.lineTo(startX + d.width - 20, d.y + 8);
    ctx.stroke();
    
    // Angled accent
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    if (d.isLeft) {
      ctx.moveTo(startX + d.width - 30, d.y + 8);
      ctx.lineTo(startX + d.width - 10, d.y + 28);
    } else {
      ctx.moveTo(startX + 30, d.y + 8);
      ctx.lineTo(startX + 10, d.y + 28);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  });
}

function drawBottomDecorations(ctx, theme) {
  const y = 792;
  const designs = [
    { x: 20, width: 220, isLeft: true },
    { x: 1228, width: 220, isLeft: false }
  ];
  
  designs.forEach(d => {
    const startX = d.isLeft ? d.x : d.x - d.width;
    
    // Main line
    const lineGrad = ctx.createLinearGradient(
      d.isLeft ? startX : startX + d.width,
      y,
      d.isLeft ? startX + d.width : startX,
      y
    );
    lineGrad.addColorStop(0, theme.primary + '00');
    lineGrad.addColorStop(0.3, theme.primary);
    lineGrad.addColorStop(0.7, theme.accent);
    lineGrad.addColorStop(1, theme.primary + '00');
    
    ctx.strokeStyle = lineGrad;
    ctx.lineWidth = 3;
    ctx.shadowColor = theme.primary;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.moveTo(startX, y);
    ctx.lineTo(startX + d.width, y);
    ctx.stroke();
    
    // Secondary line
    ctx.strokeStyle = theme.light + '66';
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(startX + 20, y - 8);
    ctx.lineTo(startX + d.width - 20, y - 8);
    ctx.stroke();
    
    // Angled accent
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    if (d.isLeft) {
      ctx.moveTo(startX + d.width - 30, y - 8);
      ctx.lineTo(startX + d.width - 10, y - 28);
    } else {
      ctx.moveTo(startX + 30, y - 8);
      ctx.lineTo(startX + 10, y - 28);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  });
  
  // Star accent
  ctx.font = "36px 'Arial'";
  ctx.fillStyle = theme.primary;
  ctx.textAlign = "right";
  ctx.shadowColor = theme.primary;
  ctx.shadowBlur = 20;
  ctx.fillText("✦", 1210, 808);
  
  ctx.fillStyle = theme.glow + '88';
  ctx.shadowBlur = 15;
  ctx.fillText("✦", 1211, 807);
  ctx.shadowBlur = 0;
}

// ══════════════════════════════════════════════════════════
// 🎨 Helper Functions
// ══════════════════════════════════════════════════════════
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function drawHex(ctx, x, y, r) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const px = x + r * Math.cos(angle);
    const py = y + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function formatNumberShort(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}
