const Canvas = require("@napi-rs/canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const mongodb = require(path.join(process.cwd(), "includes", "mongodb.js"));

module.exports.config = {
  name: "بنك",
  version: "8.0.0",
  hasPermssion: 0,
  credits: "ايمن - ULTRA MASTERPIECE",
  description: "تحفة فنية خيالية - مستوى AAA+",
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
    
    api.sendMessage("✨ جاري إنشاء تحفة فنية خيالية...", threadID, messageID);
    
    const card = await createUltraMasterpiece({
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
    
    const cachePath = path.join(__dirname, "cache", `ultra_masterpiece_${targetID}.png`);
    await fs.ensureDir(path.join(__dirname, "cache"));
    await fs.writeFile(cachePath, card);
    
    return api.sendMessage({
      body: `╔═══════════════════════════╗\n` +
            `║ 🌟 ULTRA MASTERPIECE 🌟 ║\n` +
            `╚═══════════════════════════╝\n\n` +
            `👤 ${username}\n` +
            `${calculated.rank.emoji} ${calculated.rank.name} • LVL ${currency.level}\n` +
            `💰 ${formatNumber(currency.money)} $\n` +
            `⚡ ${formatNumber(currency.exp)} XP\n` +
            `💬 ${formatNumber(currency.messageCount)} MSG\n` +
            `🔥 ${currency.streak} Day Streak\n\n` +
            `✨ تصميم خيالي من المستقبل ✨`,
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
// 🌟 ULTRA ADVANCED COLOR SYSTEM
// ══════════════════════════════════════════════════════════
function getUltraTheme(exp, isDeveloper) {
  if (isDeveloper) {
    return {
      name: "DEVELOPER",
      primary: "#ff0000",
      secondary: "#ff3333", 
      accent: "#ff6666",
      dark: "#990000",
      light: "#ffcccc",
      glow: "#ffffff",
      bg1: "#000000",
      bg2: "#1a0000",
      bg3: "#330000",
      particle: "#ff4444",
      shimmer: "#ffaaaa"
    };
  }
  
  if (exp < 200) {
    return { 
      name: "BEGINNER",
      primary: "#ffd700", secondary: "#ffed4e", accent: "#fff9c4",
      dark: "#b8860b", light: "#fffacd", glow: "#ffffee",
      bg1: "#0a0800", bg2: "#1a1400", bg3: "#2d2200",
      particle: "#ffe066", shimmer: "#fff5aa"
    };
  } else if (exp < 400) {
    return { 
      name: "SOLDIER",
      primary: "#00ff88", secondary: "#33ffaa", accent: "#66ffcc",
      dark: "#008844", light: "#ccffee", glow: "#eeffff",
      bg1: "#000a05", bg2: "#001a10", bg3: "#002d1a",
      particle: "#44ffaa", shimmer: "#aaffdd"
    };
  } else if (exp < 700) {
    return { 
      name: "WARRIOR",
      primary: "#00d4ff", secondary: "#33ddff", accent: "#66e6ff",
      dark: "#0088aa", light: "#ccf5ff", glow: "#eeffff",
      bg1: "#00080a", bg2: "#001419", bg3: "#00222d",
      particle: "#44ddff", shimmer: "#aaeeff"
    };
  } else if (exp < 1000) {
    return { 
      name: "OFFICER",
      primary: "#ff6600", secondary: "#ff8833", accent: "#ffaa66",
      dark: "#cc4400", light: "#ffdccc", glow: "#ffeeee",
      bg1: "#0a0400", bg2: "#190800", bg3: "#2d1100",
      particle: "#ff8844", shimmer: "#ffccaa"
    };
  } else if (exp < 2500) {
    return { 
      name: "LEADER",
      primary: "#9966ff", secondary: "#aa88ff", accent: "#ccaaff",
      dark: "#6633cc", light: "#eeddff", glow: "#f5f0ff",
      bg1: "#050208", bg2: "#0a0419", bg3: "#14082d",
      particle: "#aa88ff", shimmer: "#ddccff"
    };
  } else {
    return { 
      name: "MINISTER",
      primary: "#ff00ff", secondary: "#ff33ff", accent: "#ff66ff",
      dark: "#cc00cc", light: "#ffccff", glow: "#ffeeff",
      bg1: "#0a0008", bg2: "#190014", bg3: "#2d0022",
      particle: "#ff44ff", shimmer: "#ffaaff"
    };
  }
}

// ══════════════════════════════════════════════════════════
// 🎨 DYNAMIC FONT SIZING
// ══════════════════════════════════════════════════════════
function getOptimalFontSize(number) {
  const str = number.toString();
  const len = str.length;
  
  if (len <= 2) return 38;
  if (len === 3) return 36;
  if (len === 4) return 34;
  if (len === 5) return 32;
  if (len === 6) return 30;
  if (len === 7) return 28;
  if (len === 8) return 26;
  return 24;
}

// ══════════════════════════════════════════════════════════
// 🌟 MAIN ULTRA MASTERPIECE CREATION
// ══════════════════════════════════════════════════════════
async function createUltraMasterpiece(data) {
  const W = 1400;
  const H = 900;
  const canvas = Canvas.createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  const theme = getUltraTheme(data.exp, data.isDeveloper);

  // ══════════════ ULTRA BACKGROUND SYSTEM ══════════════
  createUltraBackground(ctx, W, H, theme);
  
  // ══════════════ ADVANCED PARTICLE FIELD ══════════════
  createAdvancedParticleField(ctx, W, H, theme);
  
  // ══════════════ 3D LIGHTING SYSTEM ══════════════
  create3DLighting(ctx, W, H, theme);
  
  // ══════════════ ANIMATED WAVES ══════════════
  createAnimatedWaves(ctx, W, H, theme);
  
  // ══════════════ HOLOGRAPHIC OVERLAY ══════════════
  createHolographicOverlay(ctx, W, H, theme);
  
  // ══════════════ ULTRA PREMIUM HEADER ══════════════
  drawUltraPremiumHeader(ctx, W, theme);
  
  // ══════════════ 3D USER SECTION ══════════════
  await draw3DUserSection(ctx, data, theme);
  
  // ══════════════ ULTRA AVATAR WITH EFFECTS ══════════════
  await drawUltraAvatar(ctx, data.userID, theme);
  
  // ══════════════ 3D LEVEL BADGE ══════════════
  draw3DLevelBadge(ctx, data.level, theme);
  
  // ══════════════ ULTRA STATS DISPLAY ══════════════
  drawUltraStats(ctx, data, theme);
  
  // ══════════════ RANK BADGE ══════════════
  drawRankBadge(ctx, data.rank, theme);
  
  // ══════════════ BOTTOM EFFECTS ══════════════
  drawBottomEffects(ctx, W, H, theme);
  
  // ══════════════ SIGNATURE ══════════════
  ctx.font = "bold 14px 'Courier New'";
  const sigGrad = ctx.createLinearGradient(0, H - 25, W, H - 25);
  sigGrad.addColorStop(0, theme.primary + '00');
  sigGrad.addColorStop(0.5, theme.accent);
  sigGrad.addColorStop(1, theme.primary + '00');
  ctx.fillStyle = sigGrad;
  ctx.textAlign = "center";
  ctx.shadowColor = theme.glow;
  ctx.shadowBlur = 20;
  ctx.fillText("✦ KIRA BANK • ULTRA MASTERPIECE EDITION • AYMAN ✦", W/2, H - 25);
  ctx.shadowBlur = 0;

  return canvas.toBuffer("image/png");
}

// ══════════════════════════════════════════════════════════
// 🌟 ULTRA BACKGROUND WITH DEPTH LAYERS
// ══════════════════════════════════════════════════════════
function createUltraBackground(ctx, W, H, theme) {
  // Deep space gradient
  const bg = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W, H) * 0.8);
  bg.addColorStop(0, theme.bg3);
  bg.addColorStop(0.3, theme.bg2);
  bg.addColorStop(0.6, theme.bg1);
  bg.addColorStop(1, "#000000");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  
  // Noise texture (enhanced)
  for (let i = 0; i < 3000; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const alpha = Math.random() * 0.12;
    const size = Math.random() > 0.95 ? 2 : 1;
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.fillRect(x, y, size, size);
  }
  
  // Advanced grid system
  ctx.strokeStyle = `rgba(255, 255, 255, 0.02)`;
  ctx.lineWidth = 1;
  for (let i = 0; i < W; i += 35) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, H);
    ctx.stroke();
  }
  for (let j = 0; j < H; j += 35) {
    ctx.beginPath();
    ctx.moveTo(0, j);
    ctx.lineTo(W, j);
    ctx.stroke();
  }
  
  // Hexagonal pattern (enhanced)
  ctx.strokeStyle = `${theme.primary}10`;
  ctx.lineWidth = 0.8;
  const hexSize = 40;
  for (let row = 0; row < 30; row++) {
    for (let col = 0; col < 40; col++) {
      if (Math.random() > 0.80) {
        const x = col * hexSize * 1.5 + (row % 2) * hexSize * 0.75;
        const y = row * hexSize * 0.866;
        drawHex(ctx, x, y, hexSize * 0.45);
        ctx.stroke();
      }
    }
  }
  
  // Circuit board pattern
  ctx.strokeStyle = theme.primary + '08';
  ctx.lineWidth = 1;
  for (let i = 0; i < 50; i++) {
    const x1 = Math.random() * W;
    const y1 = Math.random() * H;
    const x2 = x1 + (Math.random() - 0.5) * 200;
    const y2 = y1 + (Math.random() - 0.5) * 200;
    
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    
    ctx.fillStyle = theme.particle + '30';
    ctx.beginPath();
    ctx.arc(x1, y1, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ══════════════════════════════════════════════════════════
// 🌟 ADVANCED PARTICLE FIELD
// ══════════════════════════════════════════════════════════
function createAdvancedParticleField(ctx, W, H, theme) {
  const particles = [];
  const count = 150;
  
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * W,
      y: Math.random() * H,
      size: 0.5 + Math.random() * 3,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.8 + 0.2,
      color: Math.random() > 0.6 ? theme.primary : (Math.random() > 0.5 ? theme.accent : theme.shimmer),
      pulse: Math.random() * Math.PI * 2
    });
  }
  
  particles.forEach((p, i) => {
    // Pulsing effect
    const pulseAlpha = 0.5 + Math.sin(p.pulse + i * 0.1) * 0.5;
    
    const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
    gradient.addColorStop(0, p.color + Math.floor(p.opacity * pulseAlpha * 255).toString(16).padStart(2, '0'));
    gradient.addColorStop(0.4, p.color + Math.floor(p.opacity * pulseAlpha * 0.6 * 255).toString(16).padStart(2, '0'));
    gradient.addColorStop(1, p.color + '00');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
    ctx.fill();
  });
  
  // Enhanced connection lines
  ctx.strokeStyle = theme.primary + '15';
  ctx.lineWidth = 0.8;
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 140) {
        const alpha = (1 - dist / 140) * 0.3;
        ctx.strokeStyle = theme.accent + Math.floor(alpha * 255).toString(16).padStart(2, '0');
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }
}

// ══════════════════════════════════════════════════════════
// 🌟 3D LIGHTING SYSTEM
// ══════════════════════════════════════════════════════════
function create3DLighting(ctx, W, H, theme) {
  const lights = [
    { x: W * 0.2, y: H * 0.25, radius: 500, intensity: 0.18, color: theme.primary },
    { x: W * 0.8, y: H * 0.3, radius: 550, intensity: 0.15, color: theme.accent },
    { x: W * 0.5, y: H * 0.75, radius: 450, intensity: 0.12, color: theme.shimmer },
    { x: W * 0.1, y: H * 0.6, radius: 400, intensity: 0.1, color: theme.particle }
  ];
  
  lights.forEach(light => {
    const gradient = ctx.createRadialGradient(
      light.x, light.y, 0,
      light.x, light.y, light.radius
    );
    gradient.addColorStop(0, light.color + Math.floor(light.intensity * 255).toString(16).padStart(2, '0'));
    gradient.addColorStop(0.4, light.color + Math.floor(light.intensity * 0.6 * 255).toString(16).padStart(2, '0'));
    gradient.addColorStop(1, light.color + '00');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);
  });
}

// ══════════════════════════════════════════════════════════
// 🌟 ANIMATED WAVES
// ══════════════════════════════════════════════════════════
function createAnimatedWaves(ctx, W, H, theme) {
  const waves = [
    { y: H * 0.3, amplitude: 60, frequency: 0.01, phase: 0, alpha: 0.08 },
    { y: H * 0.5, amplitude: 80, frequency: 0.008, phase: Math.PI / 3, alpha: 0.06 },
    { y: H * 0.7, amplitude: 100, frequency: 0.012, phase: Math.PI / 2, alpha: 0.05 }
  ];
  
  waves.forEach(wave => {
    ctx.strokeStyle = theme.accent + Math.floor(wave.alpha * 255).toString(16).padStart(2, '0');
    ctx.lineWidth = 2;
    ctx.shadowColor = theme.glow;
    ctx.shadowBlur = 15;
    
    ctx.beginPath();
    for (let x = 0; x <= W; x += 2) {
      const y = wave.y + Math.sin(x * wave.frequency + wave.phase) * wave.amplitude;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  });
  ctx.shadowBlur = 0;
}

// ══════════════════════════════════════════════════════════
// 🌟 HOLOGRAPHIC OVERLAY
// ══════════════════════════════════════════════════════════
function createHolographicOverlay(ctx, W, H, theme) {
  // Diagonal scan lines
  ctx.strokeStyle = theme.glow + '08';
  ctx.lineWidth = 1;
  for (let i = -H; i < W + H; i += 4) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i - H, H);
    ctx.stroke();
  }
  
  // Holographic shimmer
  const shimmerGrad = ctx.createLinearGradient(0, 0, W, H);
  shimmerGrad.addColorStop(0, theme.shimmer + '00');
  shimmerGrad.addColorStop(0.25, theme.shimmer + '15');
  shimmerGrad.addColorStop(0.5, theme.shimmer + '00');
  shimmerGrad.addColorStop(0.75, theme.shimmer + '15');
  shimmerGrad.addColorStop(1, theme.shimmer + '00');
  
  ctx.fillStyle = shimmerGrad;
  ctx.fillRect(0, 0, W, H);
}

// ══════════════════════════════════════════════════════════
// 🌟 ULTRA PREMIUM HEADER
// ══════════════════════════════════════════════════════════
function drawUltraPremiumHeader(ctx, W, theme) {
  const centerX = W / 2;
  const y = 50;
  const width = 700;
  const height = 80;
  
  // Outer glow
  for (let i = 0; i < 5; i++) {
    const offset = i * 8;
    const alpha = (0.15 - i * 0.03);
    ctx.fillStyle = theme.primary + Math.floor(alpha * 255).toString(16).padStart(2, '0');
    ctx.filter = `blur(${8 + i * 4}px)`;
    roundRect(ctx, centerX - width/2 - offset, y - offset, width + offset * 2, height + offset * 2, 20);
    ctx.fill();
  }
  ctx.filter = 'none';
  
  // Glass morphism background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.filter = 'blur(12px)';
  roundRect(ctx, centerX - width/2, y, width, height, 18);
  ctx.fill();
  ctx.filter = 'none';
  
  // Main background with multi-color gradient
  const headerGrad = ctx.createLinearGradient(centerX - width/2, y, centerX + width/2, y + height);
  headerGrad.addColorStop(0, theme.dark + 'bb');
  headerGrad.addColorStop(0.25, theme.primary + 'aa');
  headerGrad.addColorStop(0.5, theme.accent + '99');
  headerGrad.addColorStop(0.75, theme.primary + 'aa');
  headerGrad.addColorStop(1, theme.dark + 'bb');
  ctx.fillStyle = headerGrad;
  roundRect(ctx, centerX - width/2, y, width, height, 18);
  ctx.fill();
  
  // Animated border
  const borderGrad = ctx.createLinearGradient(centerX - width/2, y, centerX + width/2, y);
  borderGrad.addColorStop(0, theme.shimmer + '66');
  borderGrad.addColorStop(0.25, theme.accent);
  borderGrad.addColorStop(0.5, theme.primary);
  borderGrad.addColorStop(0.75, theme.accent);
  borderGrad.addColorStop(1, theme.shimmer + '66');
  ctx.strokeStyle = borderGrad;
  ctx.lineWidth = 3;
  ctx.shadowColor = theme.glow;
  ctx.shadowBlur = 25;
  roundRect(ctx, centerX - width/2, y, width, height, 18);
  ctx.stroke();
  ctx.shadowBlur = 0;
  
  // Triple inner glow
  for (let i = 0; i < 3; i++) {
    ctx.strokeStyle = theme.light + Math.floor((50 - i * 15)).toString(16).padStart(2, '0');
    ctx.lineWidth = 2 - i * 0.5;
    roundRect(ctx, centerX - width/2 + 4 + i * 2, y + 4 + i * 2, width - 8 - i * 4, height - 8 - i * 4, 16 - i);
    ctx.stroke();
  }
  
  // Corner accents
  const cornerSize = 40;
  ctx.strokeStyle = theme.shimmer;
  ctx.lineWidth = 3;
  ctx.shadowColor = theme.shimmer;
  ctx.shadowBlur = 20;
  
  // All four corners
  const corners = [
    { x: centerX - width/2 + 18, y: y + 18, angle: [Math.PI, Math.PI * 1.5] },
    { x: centerX + width/2 - 18, y: y + 18, angle: [Math.PI * 1.5, 0] },
    { x: centerX - width/2 + 18, y: y + height - 18, angle: [Math.PI * 0.5, Math.PI] },
    { x: centerX + width/2 - 18, y: y + height - 18, angle: [0, Math.PI * 0.5] }
  ];
  
  corners.forEach(corner => {
    ctx.beginPath();
    ctx.arc(corner.x, corner.y, cornerSize, corner.angle[0], corner.angle[1]);
    ctx.stroke();
  });
  ctx.shadowBlur = 0;
  
  // Main text with 3D effect
  ctx.font = "bold 50px 'Arial'";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  
  // 3D depth layers
  for (let i = 5; i > 0; i--) {
    ctx.fillStyle = `rgba(0, 0, 0, ${0.15})`;
    ctx.fillText("✦ KIRA BANK ✦", centerX, y + height/2 + i);
  }
  
  // Main text
  const textGrad = ctx.createLinearGradient(centerX, y, centerX, y + height);
  textGrad.addColorStop(0, '#ffffff');
  textGrad.addColorStop(0.5, theme.glow);
  textGrad.addColorStop(1, theme.light);
  ctx.fillStyle = textGrad;
  ctx.shadowColor = theme.glow;
  ctx.shadowBlur = 30;
  ctx.fillText("✦ KIRA BANK ✦", centerX, y + height/2);
  
  // Highlight overlay
  ctx.shadowBlur = 0;
  ctx.fillStyle = theme.shimmer + '66';
  ctx.fillText("✦ KIRA BANK ✦", centerX, y + height/2 - 2);
  
  // Bottom accent line
  const lineGrad = ctx.createLinearGradient(centerX - width/2, 0, centerX + width/2, 0);
  lineGrad.addColorStop(0, theme.primary + '00');
  lineGrad.addColorStop(0.2, theme.accent);
  lineGrad.addColorStop(0.5, theme.shimmer);
  lineGrad.addColorStop(0.8, theme.accent);
  lineGrad.addColorStop(1, theme.primary + '00');
  ctx.strokeStyle = lineGrad;
  ctx.lineWidth = 3;
  ctx.shadowColor = theme.glow;
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.moveTo(centerX - width/2 + 40, y + height - 8);
  ctx.lineTo(centerX + width/2 - 40, y + height - 8);
  ctx.stroke();
  ctx.shadowBlur = 0;
}

// ══════════════════════════════════════════════════════════
// 🌟 3D USER SECTION
// ══════════════════════════════════════════════════════════
async function draw3DUserSection(ctx, data, theme) {
  const x = 100;
  const y = 210;
  
  // Decorative arc system
  for (let i = 5; i >= 0; i--) {
    ctx.strokeStyle = theme.primary + Math.floor((80 - i * 13)).toString(16).padStart(2, '0');
    ctx.lineWidth = 5 - i * 0.7;
    ctx.shadowColor = theme.glow;
    ctx.shadowBlur = 20 - i * 3;
    ctx.beginPath();
    ctx.arc(x, y + 25, 50 + i * 8, Math.PI * 0.65, Math.PI * 1.35);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
  
  // Username with 3D effect
  ctx.font = "bold 80px 'Arial'";
  
  // 3D depth
  for (let i = 8; i > 0; i--) {
    ctx.fillStyle = `rgba(0, 0, 0, ${0.12})`;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.textAlign = "left";
    ctx.fillText(data.username, x + 70 + i, y + 35 + i);
  }
  
  // Main text
  ctx.shadowBlur = 0;
  const textGrad = ctx.createLinearGradient(x + 70, y, x + 70, y + 70);
  textGrad.addColorStop(0, '#ffffff');
  textGrad.addColorStop(0.5, theme.shimmer);
  textGrad.addColorStop(1, theme.light);
  ctx.fillStyle = textGrad;
  ctx.shadowColor = theme.glow;
  ctx.shadowBlur = 25;
  ctx.fillText(data.username, x + 70, y + 35);
  
  // Highlight
  ctx.shadowBlur = 0;
  ctx.fillStyle = theme.glow + '77';
  ctx.fillText(data.username, x + 70, y + 32);
  
  // Ultra premium ID container
  const idY = y + 90;
  const idW = 450;
  const idH = 70;
  
  // Outer glow
  for (let i = 0; i < 4; i++) {
    const offset = i * 6;
    ctx.fillStyle = theme.primary + Math.floor((30 - i * 7)).toString(16).padStart(2, '0');
    ctx.filter = `blur(${6 + i * 3}px)`;
    roundRect(ctx, x - 10 - offset, idY - offset, idW + offset * 2, idH + offset * 2, 12);
    ctx.fill();
  }
  ctx.filter = 'none';
  
  // Glass background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.filter = 'blur(10px)';
  roundRect(ctx, x - 10, idY, idW, idH, 12);
  ctx.fill();
  ctx.filter = 'none';
  
  // Main container with multi-gradient
  const idGrad = ctx.createLinearGradient(x, idY, x + idW, idY + idH);
  idGrad.addColorStop(0, theme.dark + 'ee');
  idGrad.addColorStop(0.3, theme.primary + 'bb');
  idGrad.addColorStop(0.5, theme.accent + 'aa');
  idGrad.addColorStop(0.7, theme.primary + 'bb');
  idGrad.addColorStop(1, theme.dark + 'dd');
  ctx.fillStyle = idGrad;
  roundRect(ctx, x - 10, idY, idW, idH, 12);
  ctx.fill();
  
  // Animated border
  const idBorderGrad = ctx.createLinearGradient(x - 10, idY, x + idW - 10, idY);
  idBorderGrad.addColorStop(0, theme.shimmer + '88');
  idBorderGrad.addColorStop(0.5, theme.primary);
  idBorderGrad.addColorStop(1, theme.shimmer + '88');
  ctx.strokeStyle = idBorderGrad;
  ctx.lineWidth = 2.5;
  ctx.shadowColor = theme.glow;
  ctx.shadowBlur = 20;
  roundRect(ctx, x - 10, idY, idW, idH, 12);
  ctx.stroke();
  ctx.shadowBlur = 0;
  
  // Multi-layer inner highlight
  for (let i = 0; i < 2; i++) {
    ctx.strokeStyle = theme.light + Math.floor((60 - i * 25)).toString(16).padStart(2, '0');
    ctx.lineWidth = 1.5 - i * 0.5;
    roundRect(ctx, x - 7 + i * 2, idY + 3 + i * 2, idW - 6 - i * 4, idH - 6 - i * 4, 10 - i);
    ctx.stroke();
  }
  
  // ID Text with glow
  ctx.font = "bold 28px 'Courier New'";
  ctx.fillStyle = theme.shimmer;
  ctx.shadowColor = theme.glow;
  ctx.shadowBlur = 15;
  ctx.textAlign = "left";
  ctx.fillText("ID", x + 15, idY + 44);
  
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = theme.glow;
  ctx.shadowBlur = 20;
  ctx.fillText(`#${data.userID}`, x + 90, idY + 44);
  ctx.shadowBlur = 0;
}

// ══════════════════════════════════════════════════════════
// 🌟 ULTRA AVATAR WITH ADVANCED EFFECTS
// ══════════════════════════════════════════════════════════
async function drawUltraAvatar(ctx, userID, theme) {
  const x = 1070;
  const y = 320;
  const size = 320;
  
  try {
    const avatarUrl = `https://graph.facebook.com/${userID}/picture?width=1024&height=1024&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const response = await axios.get(avatarUrl, { responseType: "arraybuffer" });
    const avatarImg = await Canvas.loadImage(Buffer.from(response.data));
    
    // Massive outer glow system
    for (let i = 12; i >= 0; i--) {
      const radius = size/2 + 40 + i * 15;
      const alpha = (0.3 - i * 0.022);
      
      const glowGrad = ctx.createRadialGradient(x, y, size/2, x, y, radius);
      glowGrad.addColorStop(0, theme.primary + '00');
      glowGrad.addColorStop(0.6, theme.primary + Math.floor(alpha * 255).toString(16).padStart(2, '0'));
      glowGrad.addColorStop(1, theme.primary + '00');
      
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Pulsing rings
    for (let i = 0; i < 3; i++) {
      const ringRadius = size/2 + 50 + i * 30;
      ctx.strokeStyle = theme.particle + Math.floor((80 - i * 25)).toString(16).padStart(2, '0');
      ctx.lineWidth = 2;
      ctx.shadowColor = theme.particle;
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(x, y, ringRadius, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
    
    // 3D shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 20;
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
    
    // Advanced glass overlay
    const overlayGrad = ctx.createRadialGradient(
      x - size/3, y - size/3, 0,
      x, y, size/2
    );
    overlayGrad.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
    overlayGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.05)');
    overlayGrad.addColorStop(0.7, 'rgba(255, 255, 255, 0)');
    overlayGrad.addColorStop(1, 'rgba(0, 0, 0, 0.25)');
    ctx.fillStyle = overlayGrad;
    ctx.beginPath();
    ctx.arc(x, y, size/2, 0, Math.PI * 2);
    ctx.fill();
    
    // Multi-ring system (5 rings)
    const rings = [
      { offset: 0, width: 6, alpha: 'ff', blur: 30 },
      { offset: 14, width: 4, alpha: 'dd', blur: 25 },
      { offset: 26, width: 3, alpha: 'bb', blur: 20 },
      { offset: 36, width: 2, alpha: 'aa', blur: 15 },
      { offset: 44, width: 1.5, alpha: '88', blur: 10 }
    ];
    
    rings.forEach((ring, i) => {
      const ringGrad = ctx.createLinearGradient(x - size/2, y, x + size/2, y);
      ringGrad.addColorStop(0, theme.shimmer + ring.alpha);
      ringGrad.addColorStop(0.25, theme.accent + ring.alpha);
      ringGrad.addColorStop(0.5, theme.primary + ring.alpha);
      ringGrad.addColorStop(0.75, theme.accent + ring.alpha);
      ringGrad.addColorStop(1, theme.shimmer + ring.alpha);
      
      ctx.strokeStyle = ringGrad;
      ctx.lineWidth = ring.width;
      ctx.shadowColor = theme.glow;
      ctx.shadowBlur = ring.blur;
      ctx.beginPath();
      ctx.arc(x, y, size/2 + ring.offset, 0, Math.PI * 2);
      ctx.stroke();
    });
    
    ctx.shadowBlur = 0;
    
  } catch (error) {
    console.error("Avatar error:", error);
  }
}

// ══════════════════════════════════════════════════════════
// 🌟 3D LEVEL BADGE
// ══════════════════════════════════════════════════════════
function draw3DLevelBadge(ctx, level, theme) {
  const x = 1070;
  const y = 530;
  const size = 110;
  
  // Massive outer glow
  for (let i = 8; i >= 0; i--) {
    const radius = size/2 + i * 12;
    const alpha = 0.5 - i * 0.055;
    
    const glowGrad = ctx.createRadialGradient(x, y, 0, x, y, radius);
    glowGrad.addColorStop(0, theme.primary + Math.floor(alpha * 255).toString(16).padStart(2, '0'));
    glowGrad.addColorStop(1, theme.primary + '00');
    
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // 3D shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
  ctx.shadowBlur = 25;
  ctx.shadowOffsetY = 12;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(x, y, size/2, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  
  // Main circle with advanced gradient
  const bgGrad = ctx.createRadialGradient(x, y - size/3, 0, x, y, size/2);
  bgGrad.addColorStop(0, theme.shimmer + 'ff');
  bgGrad.addColorStop(0.3, theme.primary + 'ee');
  bgGrad.addColorStop(0.6, theme.dark + 'ff');
  bgGrad.addColorStop(1, '#000000');
  ctx.fillStyle = bgGrad;
  ctx.beginPath();
  ctx.arc(x, y, size/2, 0, Math.PI * 2);
  ctx.fill();
  
  // Multiple borders
  const borders = [
    { offset: 0, width: 5, color: theme.primary, blur: 25 },
    { offset: -9, width: 3.5, color: theme.accent, blur: 20 },
    { offset: -17, width: 2.5, color: theme.shimmer, blur: 15 },
    { offset: -24, width: 1.5, color: theme.light, blur: 10 }
  ];
  
  borders.forEach(border => {
    ctx.strokeStyle = border.color;
    ctx.lineWidth = border.width;
    ctx.shadowColor = theme.glow;
    ctx.shadowBlur = border.blur;
    ctx.beginPath();
    ctx.arc(x, y, size/2 + border.offset, 0, Math.PI * 2);
    ctx.stroke();
  });
  
  ctx.shadowBlur = 0;
  
  // Level text with 3D effect
  ctx.font = "bold 52px 'Arial'";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  
  // 3D depth
  for (let i = 6; i > 0; i--) {
    ctx.fillStyle = `rgba(0, 0, 0, ${0.2})`;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 8;
    ctx.fillText(level, x + i, y + i);
  }
  
  // Main text
  ctx.shadowBlur = 0;
  const textGrad = ctx.createLinearGradient(x, y - 25, x, y + 25);
  textGrad.addColorStop(0, '#ffffff');
  textGrad.addColorStop(0.5, theme.shimmer);
  textGrad.addColorStop(1, theme.light);
  ctx.fillStyle = textGrad;
  ctx.shadowColor = theme.glow;
  ctx.shadowBlur = 25;
  ctx.fillText(level, x, y);
  
  // Highlight
  ctx.shadowBlur = 0;
  ctx.fillStyle = theme.glow + '99';
  ctx.fillText(level, x, y - 2);
}

// ══════════════════════════════════════════════════════════
// 🌟 ULTRA STATS DISPLAY
// ══════════════════════════════════════════════════════════
function drawUltraStats(ctx, data, theme) {
  const startX = 60;
  const startY = 470;
  const barW = 750;
  const barH = 110;
  const spacing = 8;
  
  // BALANCE
  drawUltraBar(ctx, startX, startY, barW, barH, "💰", "BALANCE", 
    data.money, theme, data.money, Math.max(data.money + 1000, 10000), true);
  
  // XP
  drawUltraBar(ctx, startX, startY + barH + spacing, barW, barH, "⚡", "XP", 
    data.exp, theme, data.exp, data.exp + data.expNeeded, false);
  
  // MSG
  drawUltraBar(ctx, startX, startY + (barH + spacing) * 2, barW, barH, "💬", "MSG", 
    data.msgCount, theme, data.msgCount, Math.max(data.msgCount + 100, 1000), false);
}

// ══════════════════════════════════════════════════════════
// 🌟 SINGLE ULTRA BAR
// ══════════════════════════════════════════════════════════
function drawUltraBar(ctx, x, y, w, h, icon, label, value, theme, current, max, isGold) {
  // Outer glow system
  for (let i = 0; i < 5; i++) {
    const offset = i * 5;
    ctx.fillStyle = theme.primary + Math.floor((40 - i * 8)).toString(16).padStart(2, '0');
    ctx.filter = `blur(${8 + i * 2}px)`;
    roundRect(ctx, x - offset, y - offset, w + offset * 2, h + offset * 2, 14);
    ctx.fill();
  }
  ctx.filter = 'none';
  
  // Glass morphism background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.filter = 'blur(15px)';
  roundRect(ctx, x, y, w, h, 14);
  ctx.fill();
  ctx.filter = 'none';
  
  // Main background with multi-gradient
  const bgGrad = ctx.createLinearGradient(x, y, x + w, y + h);
  bgGrad.addColorStop(0, theme.dark + 'ee');
  bgGrad.addColorStop(0.25, theme.primary + '88');
  bgGrad.addColorStop(0.5, theme.accent + '77');
  bgGrad.addColorStop(0.75, theme.primary + '88');
  bgGrad.addColorStop(1, theme.dark + 'dd');
  ctx.fillStyle = bgGrad;
  roundRect(ctx, x, y, w, h, 14);
  ctx.fill();
  
  // Animated border
  const borderGrad = ctx.createLinearGradient(x, y, x + w, y);
  borderGrad.addColorStop(0, theme.shimmer + '88');
  borderGrad.addColorStop(0.25, theme.accent);
  borderGrad.addColorStop(0.5, theme.primary);
  borderGrad.addColorStop(0.75, theme.accent);
  borderGrad.addColorStop(1, theme.shimmer + '88');
  ctx.strokeStyle = borderGrad;
  ctx.lineWidth = 3;
  ctx.shadowColor = theme.glow;
  ctx.shadowBlur = 22;
  roundRect(ctx, x, y, w, h, 14);
  ctx.stroke();
  ctx.shadowBlur = 0;
  
  // Multi-layer inner glow
  for (let i = 0; i < 3; i++) {
    ctx.strokeStyle = theme.light + Math.floor((70 - i * 20)).toString(16).padStart(2, '0');
    ctx.lineWidth = 2 - i * 0.5;
    roundRect(ctx, x + 4 + i * 2, y + 4 + i * 2, w - 8 - i * 4, h - 8 - i * 4, 12 - i);
    ctx.stroke();
  }
  
  // Enhanced corner accents
  const cornerSize = 35;
  ctx.strokeStyle = theme.shimmer;
  ctx.lineWidth = 3;
  ctx.shadowColor = theme.shimmer;
  ctx.shadowBlur = 18;
  
  // Top left
  ctx.beginPath();
  ctx.moveTo(x + cornerSize + 18, y + 16);
  ctx.lineTo(x + 18, y + 16);
  ctx.lineTo(x + 18, y + cornerSize + 18);
  ctx.stroke();
  
  // Top right
  ctx.beginPath();
  ctx.moveTo(x + w - cornerSize - 18, y + 16);
  ctx.lineTo(x + w - 18, y + 16);
  ctx.lineTo(x + w - 18, y + cornerSize + 18);
  ctx.stroke();
  
  // Bottom left
  ctx.beginPath();
  ctx.moveTo(x + cornerSize + 18, y + h - 16);
  ctx.lineTo(x + 18, y + h - 16);
  ctx.lineTo(x + 18, y + h - cornerSize - 18);
  ctx.stroke();
  
  // Bottom right
  ctx.beginPath();
  ctx.moveTo(x + w - cornerSize - 18, y + h - 16);
  ctx.lineTo(x + w - 18, y + h - 16);
  ctx.lineTo(x + w - 18, y + h - cornerSize - 18);
  ctx.stroke();
  
  ctx.shadowBlur = 0;
  
  // Icon with special treatment
  if (isGold) {
    // Ultra premium gold coin
    const iconGrad = ctx.createRadialGradient(x + 65, y + h/2, 0, x + 65, y + h/2, 30);
    iconGrad.addColorStop(0, "#fffacd");
    iconGrad.addColorStop(0.3, "#ffd700");
    iconGrad.addColorStop(0.6, "#ffed4e");
    iconGrad.addColorStop(0.8, "#d4af37");
    iconGrad.addColorStop(1, "#aa8c2a");
    
    ctx.fillStyle = iconGrad;
    ctx.shadowColor = "#ffd700";
    ctx.shadowBlur = 25;
    ctx.beginPath();
    ctx.arc(x + 65, y + h/2, 30, 0, Math.PI * 2);
    ctx.fill();
    
    // Ring
    ctx.strokeStyle = "#fffacd";
    ctx.lineWidth = 3;
    ctx.shadowBlur = 20;
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // Dollar sign
    ctx.fillStyle = "#1a1a1a";
    ctx.font = "bold 38px 'Arial'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 4;
    ctx.fillText("$", x + 65, y + h/2);
    ctx.shadowBlur = 0;
    
  } else if (label === "XP") {
    // Ultra XP Badge
    const xpGrad = ctx.createRadialGradient(x + 65, y + h/2, 0, x + 65, y + h/2, 28);
    xpGrad.addColorStop(0, theme.shimmer + '88');
    xpGrad.addColorStop(0.5, theme.accent + '66');
    xpGrad.addColorStop(1, theme.primary + '44');
    ctx.fillStyle = xpGrad;
    ctx.beginPath();
    ctx.arc(x + 65, y + h/2, 28, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = theme.primary;
    ctx.lineWidth = 4;
    ctx.shadowColor = theme.glow;
    ctx.shadowBlur = 20;
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    ctx.font = "bold 24px 'Arial'";
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = theme.glow;
    ctx.shadowBlur = 15;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("XP", x + 65, y + h/2);
    ctx.shadowBlur = 0;
    
  } else {
    // Ultra message icon
    ctx.fillStyle = theme.primary;
    ctx.shadowColor = theme.glow;
    ctx.shadowBlur = 20;
    roundRect(ctx, x + 42, y + h/2 - 20, 46, 36, 5);
    ctx.fill();
    roundRect(ctx, x + 42, y + h/2 + 16, 16, 14, 3);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Inner details
    ctx.fillStyle = theme.dark;
    ctx.fillRect(x + 50, y + h/2 - 13, 30, 4);
    ctx.fillRect(x + 50, y + h/2 - 5, 22, 4);
  }
  
  // Label with glow
  ctx.font = "bold 30px 'Arial'";
  ctx.fillStyle = theme.shimmer;
  ctx.textAlign = "right";
  ctx.shadowColor = theme.glow;
  ctx.shadowBlur = 18;
  ctx.fillText(label, x + w - 28, y + 42);
  ctx.shadowBlur = 0;
  
  // Progress bar
  const barX = x + 130;
  const barY = y + h/2 - 14;
  const barWidth = w - 180;
  const barHeight = 28;
  const progress = Math.min((current / max) * 100, 100);
  const fillWidth = (barWidth * progress) / 100;
  
  // Bar background with depth
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 8;
  roundRect(ctx, barX, barY, barWidth, barHeight, barHeight/2);
  ctx.fill();
  ctx.shadowBlur = 0;
  
  ctx.strokeStyle = theme.dark;
  ctx.lineWidth = 2;
  roundRect(ctx, barX, barY, barWidth, barHeight, barHeight/2);
  ctx.stroke();
  
  // Fill with animated gradient
  if (fillWidth > 0) {
    const fillGrad = ctx.createLinearGradient(barX, barY, barX + fillWidth, barY);
    fillGrad.addColorStop(0, theme.shimmer);
    fillGrad.addColorStop(0.2, theme.primary);
    fillGrad.addColorStop(0.4, theme.accent);
    fillGrad.addColorStop(0.6, theme.secondary);
    fillGrad.addColorStop(0.8, theme.primary);
    fillGrad.addColorStop(1, theme.shimmer);
    
    ctx.fillStyle = fillGrad;
    ctx.shadowColor = theme.glow;
    ctx.shadowBlur = 22;
    roundRect(ctx, barX, barY, fillWidth, barHeight, barHeight/2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Advanced shine effect
    const shineGrad = ctx.createLinearGradient(barX, barY, barX + fillWidth, barY);
    shineGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    shineGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.5)');
    shineGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.6)');
    shineGrad.addColorStop(0.7, 'rgba(255, 255, 255, 0.5)');
    shineGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = shineGrad;
    roundRect(ctx, barX, barY, fillWidth, barHeight/3, barHeight/2);
    ctx.fill();
    
    // Glow on edges
    ctx.strokeStyle = theme.glow + 'aa';
    ctx.lineWidth = 2;
    ctx.shadowColor = theme.glow;
    ctx.shadowBlur = 15;
    roundRect(ctx, barX, barY, fillWidth, barHeight, barHeight/2);
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // Arrow for XP
    if (label === "XP" && fillWidth > 30) {
      ctx.fillStyle = fillGrad;
      ctx.shadowColor = theme.glow;
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.moveTo(barX + fillWidth, barY);
      ctx.lineTo(barX + fillWidth + 22, barY + barHeight/2);
      ctx.lineTo(barX + fillWidth, barY + barHeight);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }
  
  // Value with 3D effect
  const fontSize = getOptimalFontSize(value);
  ctx.font = `bold ${fontSize}px 'Arial'`;
  
  // 3D depth
  for (let i = 4; i > 0; i--) {
    ctx.fillStyle = `rgba(0, 0, 0, ${0.15})`;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 6;
    ctx.textAlign = "right";
    ctx.fillText(formatNumberShort(value), x + w - 28 + i, y + h - 18 + i);
  }
  
  // Main text
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = theme.glow;
  ctx.shadowBlur = 20;
  ctx.fillText(formatNumberShort(value), x + w - 28, y + h - 18);
  
  // Highlight
  ctx.fillStyle = theme.shimmer + '88';
  ctx.fillText(formatNumberShort(value), x + w - 28, y + h - 20);
  ctx.shadowBlur = 0;
}

// ══════════════════════════════════════════════════════════
// 🌟 RANK BADGE
// ══════════════════════════════════════════════════════════
function drawRankBadge(ctx, rank, theme) {
  const x = 100;
  const y = 800;
  const w = 300;
  const h = 65;
  
  // Glow
  for (let i = 0; i < 4; i++) {
    const offset = i * 4;
    ctx.fillStyle = theme.primary + Math.floor((35 - i * 8)).toString(16).padStart(2, '0');
    ctx.filter = `blur(${6 + i * 2}px)`;
    roundRect(ctx, x - offset, y - offset, w + offset * 2, h + offset * 2, 12);
    ctx.fill();
  }
  ctx.filter = 'none';
  
  // Background
  const bgGrad = ctx.createLinearGradient(x, y, x + w, y + h);
  bgGrad.addColorStop(0, theme.dark + 'dd');
  bgGrad.addColorStop(0.5, theme.primary + '99');
  bgGrad.addColorStop(1, theme.dark + 'dd');
  ctx.fillStyle = bgGrad;
  roundRect(ctx, x, y, w, h, 12);
  ctx.fill();
  
  // Border
  ctx.strokeStyle = theme.primary;
  ctx.lineWidth = 2.5;
  ctx.shadowColor = theme.glow;
  ctx.shadowBlur = 18;
  roundRect(ctx, x, y, w, h, 12);
  ctx.stroke();
  ctx.shadowBlur = 0;
  
  // Text
  ctx.font = "bold 32px 'Arial'";
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = theme.glow;
  ctx.shadowBlur = 15;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${rank.emoji} ${rank.name}`, x + w/2, y + h/2);
  ctx.shadowBlur = 0;
}

// ══════════════════════════════════════════════════════════
// 🌟 BOTTOM EFFECTS
// ══════════════════════════════════════════════════════════
function drawBottomEffects(ctx, W, H, theme) {
  const y = H - 70;
  
  // Left decoration
  const leftGrad = ctx.createLinearGradient(50, y, 350, y);
  leftGrad.addColorStop(0, theme.primary + '00');
  leftGrad.addColorStop(0.3, theme.primary);
  leftGrad.addColorStop(0.7, theme.accent);
  leftGrad.addColorStop(1, theme.shimmer + '00');
  
  ctx.strokeStyle = leftGrad;
  ctx.lineWidth = 4;
  ctx.shadowColor = theme.glow;
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.moveTo(50, y);
  ctx.lineTo(350, y);
  ctx.stroke();
  
  // Right decoration
  const rightGrad = ctx.createLinearGradient(W - 350, y, W - 50, y);
  rightGrad.addColorStop(0, theme.shimmer + '00');
  rightGrad.addColorStop(0.3, theme.accent);
  rightGrad.addColorStop(0.7, theme.primary);
  rightGrad.addColorStop(1, theme.primary + '00');
  
  ctx.strokeStyle = rightGrad;
  ctx.lineWidth = 4;
  ctx.shadowColor = theme.glow;
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.moveTo(W - 350, y);
  ctx.lineTo(W - 50, y);
  ctx.stroke();
  
  ctx.shadowBlur = 0;
  
  // Stars
  ctx.font = "42px 'Arial'";
  ctx.fillStyle = theme.shimmer;
  ctx.textAlign = "left";
  ctx.shadowColor = theme.glow;
  ctx.shadowBlur = 25;
  ctx.fillText("✦", 40, y + 15);
  
  ctx.textAlign = "right";
  ctx.fillText("✦", W - 40, y + 15);
  ctx.shadowBlur = 0;
}

// ══════════════════════════════════════════════════════════
// 🎨 HELPER FUNCTIONS
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
  if (num >= 1000000000) return (num / 1000000000).toFixed(1) + "B";
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}
