const { createCanvas, loadImage } = require("@napi-rs/canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const mongodb = require(path.join(process.cwd(), "includes", "mongodb.js"));

module.exports.config = {
  name: "بنك",
  version: "6.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "بطاقة بنك كونية",
  commandCategory: "games",
  usages: "بنك [@منشن/رد]",
  cooldowns: 5
};

function rRect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function getTheme(rank, isDev) {
  if (isDev) return { c1: "#f0abfc", c2: "#c084fc", c3: "#3b0764", glow: "#e879f9", accent: "#a855f7" };
  const map = {
    "مبتدئ":    { c1: "#6ee7b7", c2: "#34d399", c3: "#064e3b", glow: "#6ee7b7", accent: "#10b981" },
    "محارب":    { c1: "#fde68a", c2: "#fbbf24", c3: "#78350f", glow: "#fde68a", accent: "#f59e0b" },
    "فارس":     { c1: "#7dd3fc", c2: "#38bdf8", c3: "#0c4a6e", glow: "#7dd3fc", accent: "#0ea5e9" },
    "نخبة":     { c1: "#fdba74", c2: "#fb923c", c3: "#7c2d12", glow: "#fdba74", accent: "#f97316" },
    "بطل":      { c1: "#fda4af", c2: "#fb7185", c3: "#881337", glow: "#fda4af", accent: "#f43f5e" },
    "أسطورة":   { c1: "#c4b5fd", c2: "#a78bfa", c3: "#4c1d95", glow: "#c4b5fd", accent: "#8b5cf6" },
    "ملك":      { c1: "#67e8f9", c2: "#22d3ee", c3: "#164e63", glow: "#67e8f9", accent: "#06b6d4" },
    "إمبراطور": { c1: "#fcd34d", c2: "#f59e0b", c3: "#78350f", glow: "#fcd34d", accent: "#d97706" },
    "إله":      { c1: "#f9a8d4", c2: "#ec4899", c3: "#831843", glow: "#f9a8d4", accent: "#db2777" },
    "خالد":     { c1: "#fca5a5", c2: "#ef4444", c3: "#7f1d1d", glow: "#fca5a5", accent: "#dc2626" },
  };
  return map[rank] || map["مبتدئ"];
}

function getRankInfo(rank, isDev) {
  if (isDev) return { label: "SYSTEM LORD", tier: "DEV" };
  const map = {
    "مبتدئ": "BEGINNER", "محارب": "WARRIOR", "فارس": "KNIGHT",
    "نخبة": "ELITE", "بطل": "HERO", "أسطورة": "LEGEND",
    "ملك": "KING", "إمبراطور": "EMPEROR", "إله": "GOD", "خالد": "IMMORTAL"
  };
  return { label: map[rank] || "BEGINNER" };
}

function formatNum(n) {
  n = Math.floor(Number(n) || 0);
  if (n >= 1e18) return (n / 1e18).toFixed(1) + "QT";
  if (n >= 1e15) return (n / 1e15).toFixed(1) + "Q";
  if (n >= 1e12) return (n / 1e12).toFixed(1) + "T";
  if (n >= 1e9)  return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6)  return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3)  return (n / 1e3).toFixed(1) + "K";
  return n.toString();
}

// رسم نجوم الخلفية
function drawStars(ctx, W, H) {
  let s = 99991;
  const rand = () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
  for (let i = 0; i < 250; i++) {
    const size = rand() * 1.8 + 0.2;
    const alpha = rand() * 0.7 + 0.2;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "#ffffff";
    ctx.shadowBlur = size * 3;
    ctx.beginPath();
    ctx.arc(rand() * W, rand() * H, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// رسم scan lines
function drawScanLines(ctx, W, H) {
  ctx.save();
  ctx.globalAlpha = 0.025;
  ctx.fillStyle = "#000000";
  for (let y = 0; y < H; y += 3) {
    ctx.fillRect(0, y, W, 1);
  }
  ctx.restore();
}

// رسم grid pattern
function drawGrid(ctx, W, H, T) {
  ctx.save();
  ctx.globalAlpha = 0.07;
  ctx.strokeStyle = T.c2;
  ctx.lineWidth = 0.5;
  const gs = 40;
  for (let x = 0; x < W; x += gs) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y < H; y += gs) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
  ctx.restore();
}

// رسم أيقونة دائرية بدل إيموجي
function drawIcon(ctx, x, y, type, color, size = 14) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.5;
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;

  if (type === "money") {
    // $ دائرة مع خطوط
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.font = `bold ${size - 2}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("$", x, y);
  } else if (type === "exp") {
    // نجمة 6 أضلاع
    const r = size / 2;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3 - Math.PI / 2;
      const px = x + r * Math.cos(angle);
      const py = y + r * Math.sin(angle);
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.globalAlpha = 0.4;
    ctx.fill();
  } else if (type === "level") {
    // مثلث صاعد
    ctx.beginPath();
    ctx.moveTo(x, y - size / 2);
    ctx.lineTo(x + size / 2, y + size / 2);
    ctx.lineTo(x - size / 2, y + size / 2);
    ctx.closePath();
    ctx.stroke();
    ctx.globalAlpha = 0.35;
    ctx.fill();
  } else if (type === "msg") {
    // مربع كلام
    ctx.beginPath();
    rRect(ctx, x - size / 2, y - size / 2 + 2, size, size - 4, 3);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - 4, y + size / 2 - 2);
    ctx.lineTo(x - size / 2, y + size / 2 + 3);
    ctx.lineTo(x + 2, y + size / 2 - 2);
    ctx.stroke();
  } else if (type === "id") {
    // بطاقة هوية
    rRect(ctx, x - size / 2, y - size / 3, size, size * 0.66, 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x - size / 5, y, size / 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x + 1, y - 2, size / 3, 1.5);
    ctx.fillRect(x + 1, y + 1, size / 4, 1.5);
  }
  ctx.restore();
}

// رسم progress bar دائري
function drawCircularProgress(ctx, cx, cy, radius, progress, T) {
  const startAngle = -Math.PI / 2;
  const endAngle = startAngle + (progress / 100) * Math.PI * 2;

  // خلفية
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // التقدم
  ctx.save();
  ctx.shadowColor = T.glow;
  ctx.shadowBlur = 20;
  ctx.lineWidth = 8;
  ctx.lineCap = "round";

  const grad = ctx.createLinearGradient(
    cx - radius, cy, cx + radius, cy
  );
  grad.addColorStop(0, T.c3 + "cc");
  grad.addColorStop(0.5, T.c2);
  grad.addColorStop(1, T.c1);
  ctx.strokeStyle = grad;

  ctx.beginPath();
  ctx.arc(cx, cy, radius, startAngle, endAngle);
  ctx.stroke();
  ctx.restore();

  // نقطة نهاية متوهجة
  const ex = cx + radius * Math.cos(endAngle);
  const ey = cy + radius * Math.sin(endAngle);
  ctx.save();
  ctx.shadowColor = "#ffffff";
  ctx.shadowBlur = 20;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(ex, ey, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ───────────── createCard ─────────────
async function createCard(data) {
  const W = 960, H = 480;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");
  const T = getTheme(data.rank, data.isDeveloper);
  const RI = getRankInfo(data.rank, data.isDeveloper);

  // ── الخلفية الأساسية ──
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, "#020008");
  bgGrad.addColorStop(0.5, "#04020e");
  bgGrad.addColorStop(1, "#000510");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // سديم الرتبة
  const neb = ctx.createRadialGradient(W * 0.65, H * 0.3, 0, W * 0.65, H * 0.3, 380);
  neb.addColorStop(0, T.c3 + "40");
  neb.addColorStop(0.6, T.c3 + "15");
  neb.addColorStop(1, "transparent");
  ctx.fillStyle = neb;
  ctx.fillRect(0, 0, W, H);

  // سديم ثانوي
  const neb2 = ctx.createRadialGradient(100, H - 50, 0, 100, H - 50, 250);
  neb2.addColorStop(0, T.c2 + "20");
  neb2.addColorStop(1, "transparent");
  ctx.fillStyle = neb2;
  ctx.fillRect(0, 0, W, H);

  drawGrid(ctx, W, H, T);
  drawStars(ctx, W, H);
  drawScanLines(ctx, W, H);

  // ── الإطار الرئيسي ──
  ctx.save();
  ctx.shadowColor = T.glow;
  ctx.shadowBlur = 40;
  ctx.strokeStyle = T.c2 + "80";
  ctx.lineWidth = 2;
  rRect(ctx, 12, 12, W - 24, H - 24, 18);
  ctx.stroke();
  ctx.restore();

  // طبقة زجاجية
  ctx.save();
  const glass = ctx.createLinearGradient(0, 0, 0, H);
  glass.addColorStop(0, "rgba(255,255,255,0.04)");
  glass.addColorStop(1, "rgba(0,0,0,0.2)");
  ctx.fillStyle = glass;
  rRect(ctx, 12, 12, W - 24, H - 24, 18);
  ctx.fill();
  ctx.restore();

  // خط علوي متوهج
  ctx.save();
  ctx.shadowColor = T.glow;
  ctx.shadowBlur = 20;
  const topLine = ctx.createLinearGradient(0, 0, W, 0);
  topLine.addColorStop(0, "transparent");
  topLine.addColorStop(0.3, T.c1);
  topLine.addColorStop(0.7, T.c1);
  topLine.addColorStop(1, "transparent");
  ctx.strokeStyle = topLine;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(60, 13); ctx.lineTo(W - 60, 13);
  ctx.stroke();
  ctx.restore();

  // ── KIRA BANK لوجو (أعلى يسار) ──
  ctx.save();
  // خلفية صغيرة للشعار
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  rRect(ctx, 22, 22, 155, 34, 6);
  ctx.fill();
  ctx.strokeStyle = T.c2 + "60";
  ctx.lineWidth = 1;
  rRect(ctx, 22, 22, 155, 34, 6);
  ctx.stroke();

  // مربعات صغيرة زخرفية
  ctx.fillStyle = T.c1;
  ctx.shadowColor = T.glow;
  ctx.shadowBlur = 10;
  ctx.fillRect(30, 32, 6, 6);
  ctx.fillStyle = T.c2;
  ctx.fillRect(38, 32, 4, 4);
  ctx.fillStyle = T.c1 + "80";
  ctx.fillRect(44, 34, 3, 3);

  ctx.font = "bold 16px monospace";
  ctx.fillStyle = T.c1;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.shadowColor = T.glow;
  ctx.shadowBlur = 12;
  ctx.fillText("KIRA", 52, 39);
  ctx.fillStyle = "#ffffff";
  ctx.shadowBlur = 0;
  ctx.fillText("BANK", 93, 39);
  ctx.restore();

  // ── الرتبة (أعلى يمين) ──
  ctx.save();
  const rankW = 130, rankH = 34;
  const rankX = W - rankW - 22;
  // خلفية متوهجة
  ctx.fillStyle = T.c3 + "aa";
  rRect(ctx, rankX, 22, rankW, rankH, 6);
  ctx.fill();
  ctx.shadowColor = T.glow;
  ctx.shadowBlur = 20;
  ctx.strokeStyle = T.c1 + "cc";
  ctx.lineWidth = 1.5;
  rRect(ctx, rankX, 22, rankW, rankH, 6);
  ctx.stroke();

  ctx.font = "bold 13px monospace";
  ctx.fillStyle = T.c1;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(RI.label, rankX + rankW / 2, 39);
  ctx.restore();

  // ── صورة البروفايل (يسار) ──
  const AX = 90, AY = H / 2, AR = 120;

  try {
    const avatarURL = `https://graph.facebook.com/${data.userID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const res = await axios.get(avatarURL, { responseType: "arraybuffer", timeout: 10000 });
    const avatar = await loadImage(Buffer.from(res.data));

    // توهج خارجي
    const ag = ctx.createRadialGradient(AX, AY, 0, AX, AY, AR * 2.5);
    ag.addColorStop(0, T.c2 + "30");
    ag.addColorStop(0.5, T.c3 + "15");
    ag.addColorStop(1, "transparent");
    ctx.fillStyle = ag;
    ctx.fillRect(AX - AR * 2.5, AY - AR * 2.5, AR * 5, AR * 5);

    // حلقات دائرية
    for (let i = 3; i >= 1; i--) {
      ctx.save();
      ctx.globalAlpha = 0.1 / i;
      ctx.strokeStyle = T.c1;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 8]);
      ctx.beginPath();
      ctx.arc(AX, AY, AR + i * 14, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // clip الصورة
    ctx.save();
    ctx.beginPath();
    ctx.arc(AX, AY, AR, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(avatar, AX - AR, AY - AR, AR * 2, AR * 2);
    ctx.restore();

    // حلقة داخلية متوهجة
    ctx.save();
    ctx.shadowColor = T.glow;
    ctx.shadowBlur = 35;
    ctx.strokeStyle = T.c1;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(AX, AY, AR + 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // حلقة ثانية أرق
    ctx.save();
    ctx.strokeStyle = T.c2 + "55";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(AX, AY, AR + 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

  } catch (_) {
    ctx.save();
    const pg = ctx.createRadialGradient(AX, AY, 5, AX, AY, AR);
    pg.addColorStop(0, T.c3 + "dd");
    pg.addColorStop(1, "#04020e");
    ctx.fillStyle = pg;
    ctx.shadowColor = T.glow;
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(AX, AY, AR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = T.c1;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();
  }

  // ── رتبة بادج تحت الصورة ──
  ctx.save();
  const bw = 110, bh = 26;
  const bx = AX - bw / 2, by = AY + AR + 14;
  ctx.fillStyle = T.c3 + "cc";
  rRect(ctx, bx, by, bw, bh, 13);
  ctx.fill();
  ctx.shadowColor = T.glow;
  ctx.shadowBlur = 20;
  ctx.strokeStyle = T.c1;
  ctx.lineWidth = 1.5;
  rRect(ctx, bx, by, bw, bh, 13);
  ctx.stroke();
  ctx.font = "bold 13px sans-serif";
  ctx.fillStyle = T.c1;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(data.rank, AX, by + bh / 2);
  ctx.restore();

  // ── الاسم (يمين الصورة، في المنتصف أفقياً) ──
  const infoX = AX + AR + 38;
  const infoW = W - infoX - 30;

  // الاسم
  ctx.save();
  ctx.shadowColor = T.glow;
  ctx.shadowBlur = 25;
  let nameFontSize = 46;
  ctx.font = `bold ${nameFontSize}px sans-serif`;
  while (ctx.measureText(data.username).width > infoW && nameFontSize > 26) {
    nameFontSize -= 1;
    ctx.font = `bold ${nameFontSize}px sans-serif`;
  }
  // gradient للاسم
  const nameGrad = ctx.createLinearGradient(infoX, 0, infoX + infoW, 0);
  nameGrad.addColorStop(0, "#ffffff");
  nameGrad.addColorStop(0.5, T.c1);
  nameGrad.addColorStop(1, T.c2);
  ctx.fillStyle = nameGrad;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(data.username, infoX, 72);
  ctx.restore();

  // خط تحت الاسم
  ctx.save();
  ctx.shadowColor = T.glow;
  ctx.shadowBlur = 12;
  const nameUnderline = ctx.createLinearGradient(infoX, 0, infoX + 300, 0);
  nameUnderline.addColorStop(0, T.c1);
  nameUnderline.addColorStop(0.7, T.c2 + "55");
  nameUnderline.addColorStop(1, "transparent");
  ctx.strokeStyle = nameUnderline;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(infoX, 128); ctx.lineTo(infoX + infoW, 128);
  ctx.stroke();
  ctx.restore();

  // معرف المستخدم صغير
  ctx.save();
  ctx.font = "11px monospace";
  ctx.fillStyle = T.c2 + "77";
  ctx.textAlign = "left";
  ctx.fillText("ID: " + data.userID, infoX, 134);
  ctx.restore();

  // ── صفوف المعلومات ──
  const rowData = [
    { label: "الرصيد",   value: formatNum(data.money) + " $", icon: "money", c: T.c1 },
    { label: "الخبرة",   value: formatNum(data.exp) + " XP",  icon: "exp",   c: T.c2 },
    { label: "المستوى",  value: `LV. ${data.level}`,           icon: "level", c: T.c1 },
    { label: "الرسائل", value: formatNum(data.msg),            icon: "msg",   c: T.c2 },
  ];

  const rowStartY = 158;
  const rowH = 52;
  const rW = infoW;

  rowData.forEach((row, i) => {
    const ry = rowStartY + i * rowH;

    // خلفية
    ctx.save();
    ctx.fillStyle = i % 2 === 0 ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)";
    rRect(ctx, infoX, ry, rW, rowH - 6, 10);
    ctx.fill();
    ctx.restore();

    // شريط جانبي
    ctx.save();
    ctx.shadowColor = row.c;
    ctx.shadowBlur = 15;
    ctx.fillStyle = row.c;
    rRect(ctx, infoX, ry, 3, rowH - 6, 2);
    ctx.fill();
    ctx.restore();

    // أيقونة
    drawIcon(ctx, infoX + 18, ry + (rowH - 6) / 2, row.icon, row.c, 16);

    // التسمية
    ctx.save();
    ctx.font = "bold 18px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = row.c + "cc";
    ctx.shadowColor = row.c;
    ctx.shadowBlur = 8;
    ctx.fillText(row.label, infoX + 34, ry + (rowH - 6) / 2);
    ctx.restore();

    // القيمة
    ctx.save();
    let fs2 = 22;
    ctx.font = `bold ${fs2}px monospace`;
    while (ctx.measureText(row.value).width > rW * 0.48 && fs2 > 13) {
      fs2--; ctx.font = `bold ${fs2}px monospace`;
    }
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.shadowColor = row.c;
    ctx.shadowBlur = 15;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(row.value, infoX + rW - 14, ry + (rowH - 6) / 2);
    ctx.restore();
  });

  // ── شريط Progress دائري + XP ──
  const progY = rowStartY + rowData.length * rowH + 8;
  const circR = 34;
  const circX = infoX + circR + 4;
  const circY = progY + circR + 4;

  drawCircularProgress(ctx, circX, circY, circR, data.progress, T);

  // نسبة في المنتصف
  ctx.save();
  ctx.font = "bold 16px monospace";
  ctx.fillStyle = T.c1;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = T.glow;
  ctx.shadowBlur = 10;
  ctx.fillText(`${Math.round(data.progress)}%`, circX, circY);
  ctx.restore();

  // XP نص جانب الدائرة
  ctx.save();
  ctx.font = "bold 13px monospace";
  ctx.fillStyle = T.c2 + "cc";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("LEVEL PROGRESS", circX + circR + 14, progY + 8);
  ctx.font = "bold 20px monospace";
  ctx.fillStyle = T.c1;
  ctx.fillText(formatNum(data.exp) + " XP", circX + circR + 14, progY + 28);
  ctx.restore();

  // ── فاصل عمودي بين الصورة والمحتوى ──
  ctx.save();
  ctx.shadowColor = T.glow;
  ctx.shadowBlur = 10;
  const divGrad = ctx.createLinearGradient(0, 60, 0, H - 40);
  divGrad.addColorStop(0, "transparent");
  divGrad.addColorStop(0.3, T.c2 + "55");
  divGrad.addColorStop(0.7, T.c2 + "55");
  divGrad.addColorStop(1, "transparent");
  ctx.strokeStyle = divGrad;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(infoX - 18, 60); ctx.lineTo(infoX - 18, H - 40);
  ctx.stroke();
  ctx.restore();

  // ── زوايا زخرفية ──
  ctx.save();
  ctx.strokeStyle = T.c2 + "66";
  ctx.lineWidth = 2.5;
  ctx.shadowColor = T.c2;
  ctx.shadowBlur = 8;
  [
    [W - 52, 18, W - 18, 18, W - 18, 52],
    [18, H - 52, 18, H - 18, 52, H - 18],
    [18, 52, 18, 18, 52, 18],
    [W - 52, H - 18, W - 18, H - 18, W - 18, H - 52]
  ].forEach(([x1, y1, x2, y2, x3, y3]) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3);
    ctx.stroke();
  });
  ctx.restore();

  // نقاط عند الزوايا
  [[18, 18], [W - 18, 18], [18, H - 18], [W - 18, H - 18]].forEach(([px, py]) => {
    ctx.save();
    ctx.fillStyle = T.c1;
    ctx.shadowColor = T.glow;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(px, py, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // ── التوقيع ──
  ctx.save();
  ctx.font = "11px monospace";
  ctx.fillStyle = T.c2 + "40";
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  ctx.fillText("KIRA SYSTEM v6.0", W - 28, H - 20);
  ctx.restore();

  return canvas.toBuffer("image/png");
}

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID, senderID, type, messageReply, mentions } = event;

  try {
    let targetID = senderID;
    if (type === "message_reply") targetID = messageReply.senderID;
    else if (Object.keys(mentions).length > 0) targetID = Object.keys(mentions)[0];

    const data = await mongodb.getUserData(targetID);
    if (!data || !data.currency)
      return api.sendMessage("❌ لا توجد بيانات لهذا المستخدم.", threadID, messageID);

    const { currency, calculated } = data;
    const userInfo = await api.getUserInfo(targetID);
    const username = (data.user?.name || userInfo[targetID]?.name || "USER").toUpperCase();
    const isDeveloper = global.config?.ADMINBOT?.includes(targetID) || false;

    if (api.setMessageReaction) api.setMessageReaction("⌛", messageID, () => {}, true);

    const card = await createCard({
      userID: targetID,
      username,
      money: currency.money || 0,
      exp: currency.exp || 0,
      level: currency.level || 1,
      msg: currency.messageCount || 0,
      rank: currency.rank || "مبتدئ",
      progress: calculated?.progress || 0,
      isDeveloper
    });

    const cacheDir = path.join(process.cwd(), "cache");
    fs.ensureDirSync(cacheDir);
    const cachePath = path.join(cacheDir, `bank_${targetID}.png`);
    await fs.writeFile(cachePath, card);

    return api.sendMessage(
      { attachment: fs.createReadStream(cachePath) },
      threadID,
      () => {
        if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
        if (api.setMessageReaction) api.setMessageReaction("✅", messageID, () => {}, true);
      },
      messageID
    );

  } catch (e) {
    console.error("❌ خطأ في البنك:", e);
    return api.sendMessage("❌ خطأ: " + e.message, threadID, messageID);
  }
};
