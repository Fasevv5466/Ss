const { createCanvas, loadImage } = require("@napi-rs/canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const mongodb = require(path.join(process.cwd(), "includes", "mongodb.js"));

module.exports.config = {
  name: "بنك",
  version: "3.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "بطاقة بنك كونية",
  commandCategory: "games",
  usages: "بنك [@منشن/رد]",
  cooldowns: 5
};

// ══════════════════════════════════════════
// دالة مستطيل مدور
// ══════════════════════════════════════════
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

// ══════════════════════════════════════════
// ألوان الرتب الكونية
// ══════════════════════════════════════════
function getTheme(rank, isDev) {
  if (isDev) return {
    star: "#fff7ae", nebula1: "#7c3aed", nebula2: "#db2777",
    accent: "#f0abfc", glow: "#e879f9", text: "#fdf4ff"
  };
  const map = {
    "مبتدئ":    { star: "#bbf7d0", nebula1: "#065f46", nebula2: "#064e3b", accent: "#34d399", glow: "#6ee7b7", text: "#f0fdf4" },
    "محارب":    { star: "#fef9c3", nebula1: "#92400e", nebula2: "#78350f", accent: "#fbbf24", glow: "#fde68a", text: "#fffbeb" },
    "فارس":     { star: "#e0f2fe", nebula1: "#0c4a6e", nebula2: "#083344", accent: "#38bdf8", glow: "#7dd3fc", text: "#f0f9ff" },
    "نخبة":     { star: "#ffedd5", nebula1: "#7c2d12", nebula2: "#6b1a0a", accent: "#fb923c", glow: "#fdba74", text: "#fff7ed" },
    "بطل":      { star: "#ffe4e6", nebula1: "#881337", nebula2: "#4c0519", accent: "#fb7185", glow: "#fda4af", text: "#fff1f2" },
    "أسطورة":   { star: "#ede9fe", nebula1: "#4c1d95", nebula2: "#2e1065", accent: "#a78bfa", glow: "#c4b5fd", text: "#f5f3ff" },
    "ملك":      { star: "#cffafe", nebula1: "#164e63", nebula2: "#0c3547", accent: "#22d3ee", glow: "#67e8f9", text: "#ecfeff" },
    "إمبراطور": { star: "#fef3c7", nebula1: "#78350f", nebula2: "#5c2a0a", accent: "#f59e0b", glow: "#fcd34d", text: "#fffbeb" },
    "إله":      { star: "#fce7f3", nebula1: "#831843", nebula2: "#500724", accent: "#ec4899", glow: "#f9a8d4", text: "#fdf2f8" },
    "خالد":     { star: "#fee2e2", nebula1: "#7f1d1d", nebula2: "#450a0a", accent: "#ef4444", glow: "#fca5a5", text: "#fff5f5" },
  };
  return map[rank] || map["مبتدئ"];
}

function getRankInfo(rank, isDev) {
  if (isDev) return { emoji: "👑", label: "SYSTEM LORD" };
  const map = {
    "مبتدئ": { emoji: "🔰", label: "BEGINNER" },
    "محارب": { emoji: "⚔️", label: "WARRIOR" },
    "فارس":  { emoji: "🛡️", label: "KNIGHT" },
    "نخبة":  { emoji: "💎", label: "ELITE" },
    "بطل":   { emoji: "🏆", label: "HERO" },
    "أسطورة":{ emoji: "⚡", label: "LEGEND" },
    "ملك":   { emoji: "🔱", label: "KING" },
    "إمبراطور":{ emoji: "🌟", label: "EMPEROR" },
    "إله":   { emoji: "🔥", label: "GOD" },
    "خالد":  { emoji: "😈", label: "IMMORTAL" },
  };
  return map[rank] || map["مبتدئ"];
}

// ══════════════════════════════════════════
// رسم النجوم الكونية
// ══════════════════════════════════════════
function drawStars(ctx, W, H, T) {
  const seed = 42;
  let s = seed;
  const rand = () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };

  for (let i = 0; i < 220; i++) {
    const x = rand() * W;
    const y = rand() * H;
    const r = rand() * 1.8 + 0.3;
    const alpha = rand() * 0.7 + 0.2;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = T.star;
    ctx.shadowColor = T.star;
    ctx.shadowBlur = r * 4;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // نجوم كبيرة متوهجة
  for (let i = 0; i < 12; i++) {
    const x = (i * 137.5) % W;
    const y = (i * 89.3) % H;
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = T.glow;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(x, y, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// ══════════════════════════════════════════
// رسم السديم
// ══════════════════════════════════════════
function drawNebula(ctx, W, H, T) {
  // سديم يسار
  const n1 = ctx.createRadialGradient(W * 0.15, H * 0.5, 0, W * 0.15, H * 0.5, W * 0.4);
  n1.addColorStop(0, T.nebula1 + "55");
  n1.addColorStop(0.5, T.nebula1 + "22");
  n1.addColorStop(1, "transparent");
  ctx.fillStyle = n1;
  ctx.fillRect(0, 0, W, H);

  // سديم يمين
  const n2 = ctx.createRadialGradient(W * 0.85, H * 0.4, 0, W * 0.85, H * 0.4, W * 0.35);
  n2.addColorStop(0, T.nebula2 + "44");
  n2.addColorStop(0.5, T.nebula2 + "18");
  n2.addColorStop(1, "transparent");
  ctx.fillStyle = n2;
  ctx.fillRect(0, 0, W, H);

  // سديم وسط خفيف
  const n3 = ctx.createRadialGradient(W * 0.5, H * 0.8, 0, W * 0.5, H * 0.8, W * 0.3);
  n3.addColorStop(0, T.accent + "18");
  n3.addColorStop(1, "transparent");
  ctx.fillStyle = n3;
  ctx.fillRect(0, 0, W, H);
}

// ══════════════════════════════════════════
// رسم البطاقة الرئيسي
// ══════════════════════════════════════════
async function createCard(data) {
  const W = 1300, H = 580;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");
  const T = getTheme(data.rank, data.isDeveloper);
  const RI = getRankInfo(data.rank, data.isDeveloper);

  // ── الخلفية الكونية ──
  ctx.fillStyle = "#02030a";
  ctx.fillRect(0, 0, W, H);

  // السديم
  drawNebula(ctx, W, H, T);

  // النجوم
  drawStars(ctx, W, H, T);

  // ── الإطار الخارجي ──
  ctx.save();
  ctx.shadowColor = T.glow;
  ctx.shadowBlur = 40;
  ctx.strokeStyle = T.accent + "70";
  ctx.lineWidth = 2;
  rRect(ctx, 18, 18, W - 36, H - 36, 28);
  ctx.stroke();
  ctx.restore();

  // طبقة زجاجية داخلية
  ctx.save();
  ctx.fillStyle = "rgba(5, 8, 20, 0.55)";
  rRect(ctx, 18, 18, W - 36, H - 36, 28);
  ctx.fill();
  ctx.restore();

  // ── خط علوي متوهج ──
  ctx.save();
  ctx.shadowColor = T.glow;
  ctx.shadowBlur = 20;
  const topLine = ctx.createLinearGradient(0, 0, W, 0);
  topLine.addColorStop(0, "transparent");
  topLine.addColorStop(0.3, T.accent);
  topLine.addColorStop(0.7, T.glow);
  topLine.addColorStop(1, "transparent");
  ctx.strokeStyle = topLine;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(80, 19);
  ctx.lineTo(W - 80, 19);
  ctx.stroke();
  ctx.restore();

  // ── قسم الصورة (يسار) ──
  const AX = 175, AY = 240, AR = 130;

  // توهج خلف الصورة
  ctx.save();
  const aGlow = ctx.createRadialGradient(AX, AY, 0, AX, AY, AR * 2);
  aGlow.addColorStop(0, T.accent + "30");
  aGlow.addColorStop(1, "transparent");
  ctx.fillStyle = aGlow;
  ctx.fillRect(0, 0, W * 0.35, H);
  ctx.restore();

  // حلقة خارجية متقطعة
  ctx.save();
  ctx.shadowColor = T.glow;
  ctx.shadowBlur = 15;
  ctx.strokeStyle = T.accent + "55";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 8]);
  ctx.beginPath();
  ctx.arc(AX, AY, AR + 25, -Math.PI / 2, Math.PI * 1.5);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // حلقة وسطى
  ctx.save();
  ctx.shadowColor = T.glow;
  ctx.shadowBlur = 20;
  ctx.strokeStyle = T.accent + "80";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(AX, AY, AR + 12, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // تحميل صورة البروفايل
  try {
    const avatarURL = `https://graph.facebook.com/${data.userID}/picture?width=512&height=512&type=large`;
    const res = await axios.get(avatarURL, { responseType: "arraybuffer", timeout: 10000 });
    const avatar = await loadImage(Buffer.from(res.data));

    // قص دائري
    ctx.save();
    ctx.beginPath();
    ctx.arc(AX, AY, AR, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(avatar, AX - AR, AY - AR, AR * 2, AR * 2);
    ctx.restore();

    // تدرج علوي على الصورة
    ctx.save();
    ctx.beginPath();
    ctx.arc(AX, AY, AR, 0, Math.PI * 2);
    ctx.clip();
    const imgOverlay = ctx.createLinearGradient(AX - AR, AY - AR, AX + AR, AY + AR);
    imgOverlay.addColorStop(0, T.accent + "15");
    imgOverlay.addColorStop(1, "transparent");
    ctx.fillStyle = imgOverlay;
    ctx.fillRect(AX - AR, AY - AR, AR * 2, AR * 2);
    ctx.restore();

  } catch (_) {
    // placeholder كوني
    ctx.save();
    const pg = ctx.createRadialGradient(AX, AY, 10, AX, AY, AR);
    pg.addColorStop(0, T.nebula1 + "cc");
    pg.addColorStop(1, "#02030a");
    ctx.fillStyle = pg;
    ctx.beginPath();
    ctx.arc(AX, AY, AR, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.font = "90px 'Segoe UI Emoji'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("👤", AX, AY);
  }

  // حلقة داخلية فوق الصورة
  ctx.save();
  ctx.shadowColor = T.glow;
  ctx.shadowBlur = 35;
  ctx.strokeStyle = T.glow;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(AX, AY, AR + 2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // شارة الرتبة تحت الصورة
  const badgeY = AY + AR + 22;
  ctx.save();
  ctx.shadowColor = T.glow;
  ctx.shadowBlur = 25;
  const badgeGrad = ctx.createLinearGradient(AX - 80, badgeY, AX + 80, badgeY);
  badgeGrad.addColorStop(0, T.nebula1);
  badgeGrad.addColorStop(1, T.nebula2);
  ctx.fillStyle = badgeGrad;
  rRect(ctx, AX - 85, badgeY, 170, 42, 21);
  ctx.fill();
  ctx.strokeStyle = T.accent + "90";
  ctx.lineWidth = 1.5;
  rRect(ctx, AX - 85, badgeY, 170, 42, 21);
  ctx.stroke();
  ctx.restore();

  ctx.font = "bold 20px Arial";
  ctx.fillStyle = T.text;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(`${RI.emoji} ${data.rank}`, AX, badgeY + 10);

  // ── خط فاصل عمودي ──
  ctx.save();
  ctx.shadowColor = T.glow;
  ctx.shadowBlur = 15;
  const divLine = ctx.createLinearGradient(380, 50, 380, H - 50);
  divLine.addColorStop(0, "transparent");
  divLine.addColorStop(0.3, T.accent + "60");
  divLine.addColorStop(0.7, T.accent + "60");
  divLine.addColorStop(1, "transparent");
  ctx.strokeStyle = divLine;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(380, 50);
  ctx.lineTo(380, H - 50);
  ctx.stroke();
  ctx.restore();

  // ── قسم المعلومات (يمين) ──
  const IX = 420;

  // ── الاسم ──
  ctx.save();
  ctx.shadowColor = T.glow;
  ctx.shadowBlur = 30;
  ctx.font = "bold 58px Arial";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  // تقليص الاسم إذا كان طويل
  let displayName = data.username;
  while (ctx.measureText(displayName).width > 700 && displayName.length > 3) {
    displayName = displayName.slice(0, -1);
  }
  if (displayName !== data.username) displayName += "..";
  ctx.fillText(displayName, IX, 55);
  ctx.restore();

  // خط تحت الاسم متدرج
  ctx.save();
  ctx.shadowColor = T.glow;
  ctx.shadowBlur = 15;
  const nameUnderline = ctx.createLinearGradient(IX, 0, IX + 500, 0);
  nameUnderline.addColorStop(0, T.accent);
  nameUnderline.addColorStop(0.6, T.glow + "80");
  nameUnderline.addColorStop(1, "transparent");
  ctx.strokeStyle = nameUnderline;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(IX, 123);
  ctx.lineTo(IX + 600, 123);
  ctx.stroke();
  ctx.restore();

  // تسمية الرتبة الإنجليزية
  ctx.save();
  ctx.shadowColor = T.glow;
  ctx.shadowBlur = 10;
  ctx.font = "bold 22px Arial";
  ctx.fillStyle = T.accent + "cc";
  ctx.textAlign = "left";
  ctx.fillText(`✦ ${RI.label} ✦`, IX, 132);
  ctx.restore();

  // ── بطاقات الإحصائيات (4 بطاقات في صف) ──
  const stats = [
    { icon: "💰", label: "BALANCE", value: formatNum(data.money) + "$" },
    { icon: "⭐", label: "EXP", value: formatNum(data.exp) + " XP" },
    { icon: "📈", label: "LEVEL", value: `LV.${data.level}` },
    { icon: "💬", label: "MESSAGES", value: formatNum(data.msg) },
  ];

  const cW = 190, cH = 105, cGap = 16;
  const cStartX = IX, cStartY = 175;

  stats.forEach((s, i) => {
    const cx = cStartX + i * (cW + cGap);
    const cy = cStartY;

    // خلفية البطاقة
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    rRect(ctx, cx, cy, cW, cH, 16);
    ctx.fill();
    ctx.strokeStyle = T.accent + "30";
    ctx.lineWidth = 1.5;
    rRect(ctx, cx, cy, cW, cH, 16);
    ctx.stroke();
    ctx.restore();

    // شريط علوي ملون
    ctx.save();
    ctx.shadowColor = T.glow;
    ctx.shadowBlur = 10;
    const topStripe = ctx.createLinearGradient(cx + 16, cy, cx + cW - 16, cy);
    topStripe.addColorStop(0, T.accent);
    topStripe.addColorStop(1, T.glow + "00");
    ctx.fillStyle = topStripe;
    rRect(ctx, cx + 16, cy, cW - 32, 3, 2);
    ctx.fill();
    ctx.restore();

    // أيقونة
    ctx.font = "28px 'Segoe UI Emoji'";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(s.icon, cx + 12, cy + 14);

    // التسمية
    ctx.font = "bold 14px Arial";
    ctx.fillStyle = T.accent + "99";
    ctx.fillText(s.label, cx + 12, cy + 52);

    // القيمة — تصغير إذا كانت طويلة
    ctx.save();
    ctx.shadowColor = T.glow;
    ctx.shadowBlur = 8;
    let fontSize = 26;
    ctx.font = `bold ${fontSize}px Arial`;
    while (ctx.measureText(s.value).width > cW - 20 && fontSize > 14) {
      fontSize -= 2;
      ctx.font = `bold ${fontSize}px Arial`;
    }
    ctx.fillStyle = "#ffffff";
    ctx.fillText(s.value, cx + 12, cy + 68);
    ctx.restore();
  });

  // ── معلومات إضافية ──
  const infoY = 310;

  // USER ID
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.04)";
  ctx.strokeStyle = T.accent + "25";
  ctx.lineWidth = 1;
  rRect(ctx, IX, infoY, 430, 50, 12);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  ctx.font = "bold 13px Arial";
  ctx.fillStyle = T.accent + "88";
  ctx.textAlign = "left";
  ctx.fillText("🆔  USER ID", IX + 14, infoY + 8);
  ctx.font = "bold 19px Arial";
  ctx.fillStyle = T.text + "cc";
  ctx.fillText(data.userID, IX + 14, infoY + 26);

  // ── شريط الخبرة ──
  const BX = IX, BY = 395, BW = 840, BH = 24;

  // عنوان
  ctx.font = "bold 18px Arial";
  ctx.fillStyle = T.accent + "cc";
  ctx.textAlign = "left";
  ctx.fillText("✦ LEVEL PROGRESS", BX, BY - 24);
  ctx.font = "bold 18px Arial";
  ctx.fillStyle = T.glow;
  ctx.textAlign = "right";
  ctx.fillText(`${Math.round(data.progress)}%`, BX + BW, BY - 24);

  // خلفية الشريط
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.strokeStyle = T.accent + "30";
  ctx.lineWidth = 1;
  rRect(ctx, BX, BY, BW, BH, BH / 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // تعبئة الشريط
  const fillW = Math.max((data.progress / 100) * BW, BH);
  ctx.save();
  ctx.shadowColor = T.glow;
  ctx.shadowBlur = 30;
  const barGrad = ctx.createLinearGradient(BX, BY, BX + fillW, BY);
  barGrad.addColorStop(0, T.nebula1 + "ee");
  barGrad.addColorStop(0.5, T.accent);
  barGrad.addColorStop(1, T.glow);
  ctx.fillStyle = barGrad;
  rRect(ctx, BX, BY, fillW, BH, BH / 2);
  ctx.fill();
  ctx.restore();

  // نقطة نهاية متوهجة
  ctx.save();
  ctx.shadowColor = "#ffffff";
  ctx.shadowBlur = 25;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(BX + fillW, BY + BH / 2, BH / 2 + 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // علامات المستوى
  ctx.font = "14px Arial";
  ctx.fillStyle = T.accent + "66";
  ctx.textAlign = "center";
  ctx.fillText(`LV.${data.level}`, BX + 20, BY + BH + 20);
  ctx.fillText(`LV.${data.level + 1}`, BX + BW, BY + BH + 20);

  // ── وسام المطور ──
  if (data.isDeveloper) {
    ctx.save();
    ctx.shadowColor = T.glow;
    ctx.shadowBlur = 30;
    const devGrad = ctx.createLinearGradient(IX + 450, infoY, IX + 720, infoY);
    devGrad.addColorStop(0, T.nebula1);
    devGrad.addColorStop(1, T.nebula2);
    ctx.fillStyle = devGrad;
    rRect(ctx, IX + 450, infoY, 270, 50, 12);
    ctx.fill();
    ctx.strokeStyle = T.accent;
    ctx.lineWidth = 2;
    rRect(ctx, IX + 450, infoY, 270, 50, 12);
    ctx.stroke();
    ctx.font = "bold 22px Arial";
    ctx.fillStyle = T.text;
    ctx.textAlign = "center";
    ctx.fillText("👑 SYSTEM LORD", IX + 585, infoY + 13);
    ctx.restore();
  }

  // ── زوايا زخرفية ──
  ctx.save();
  ctx.strokeStyle = T.accent + "50";
  ctx.lineWidth = 2.5;
  // يمين علوي
  ctx.beginPath(); ctx.moveTo(W - 55, 25); ctx.lineTo(W - 25, 25); ctx.lineTo(W - 25, 55); ctx.stroke();
  // يسار سفلي
  ctx.beginPath(); ctx.moveTo(25, H - 55); ctx.lineTo(25, H - 25); ctx.lineTo(55, H - 25); ctx.stroke();
  // يسار علوي
  ctx.beginPath(); ctx.moveTo(25, 55); ctx.lineTo(25, 25); ctx.lineTo(55, 25); ctx.stroke();
  // يمين سفلي
  ctx.beginPath(); ctx.moveTo(W - 55, H - 25); ctx.lineTo(W - 25, H - 25); ctx.lineTo(W - 25, H - 55); ctx.stroke();
  ctx.restore();

  // ── التوقيع ──
  ctx.font = "15px Arial";
  ctx.fillStyle = T.accent + "40";
  ctx.textAlign = "right";
  ctx.fillText("✦ KIRA SYSTEM ✦", W - 35, H - 28);

  return canvas.toBuffer("image/png");
}

// تنسيق الأرقام الكبيرة
function formatNum(n) {
  n = Number(n) || 0;
  if (n >= 1e12) return (n / 1e12).toFixed(1) + "T";
  if (n >= 1e9)  return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6)  return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3)  return (n / 1e3).toFixed(1) + "K";
  return n.toString();
}

// ══════════════════════════════════════════
// تشغيل الأمر
// ══════════════════════════════════════════
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
