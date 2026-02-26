const { createCanvas, loadImage } = require("@napi-rs/canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const mongodb = require(path.join(process.cwd(), "includes", "mongodb.js"));

module.exports.config = {
  name: "بنك",
  version: "4.0.0",
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
  if (isDev) return { c1: "#f0abfc", c2: "#c084fc", c3: "#7c3aed", glow: "#e879f9", bg: "#0a0010" };
  const map = {
    "مبتدئ":    { c1: "#6ee7b7", c2: "#34d399", c3: "#059669", glow: "#6ee7b7", bg: "#00100a" },
    "محارب":    { c1: "#fde68a", c2: "#fbbf24", c3: "#d97706", glow: "#fde68a", bg: "#100c00" },
    "فارس":     { c1: "#7dd3fc", c2: "#38bdf8", c3: "#0284c7", glow: "#7dd3fc", bg: "#00080f" },
    "نخبة":     { c1: "#fdba74", c2: "#fb923c", c3: "#ea580c", glow: "#fdba74", bg: "#0f0600" },
    "بطل":      { c1: "#fda4af", c2: "#fb7185", c3: "#e11d48", glow: "#fda4af", bg: "#100008" },
    "أسطورة":   { c1: "#c4b5fd", c2: "#a78bfa", c3: "#7c3aed", glow: "#c4b5fd", bg: "#06000f" },
    "ملك":      { c1: "#67e8f9", c2: "#22d3ee", c3: "#0891b2", glow: "#67e8f9", bg: "#000c0f" },
    "إمبراطور": { c1: "#fcd34d", c2: "#f59e0b", c3: "#b45309", glow: "#fcd34d", bg: "#0f0900" },
    "إله":      { c1: "#f9a8d4", c2: "#ec4899", c3: "#be185d", glow: "#f9a8d4", bg: "#0f0008" },
    "خالد":     { c1: "#fca5a5", c2: "#ef4444", c3: "#b91c1c", glow: "#fca5a5", bg: "#100000" },
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

function formatNum(n) {
  n = Number(n) || 0;
  if (n >= 1e12) return (n / 1e12).toFixed(1) + "T";
  if (n >= 1e9)  return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6)  return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3)  return (n / 1e3).toFixed(1) + "K";
  return n.toString();
}

function drawStars(ctx, W, H, T) {
  let s = 12345;
  const rand = () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
  for (let i = 0; i < 200; i++) {
    const x = rand() * W, y = rand() * H;
    const r = rand() * 1.5 + 0.3;
    ctx.save();
    ctx.globalAlpha = rand() * 0.6 + 0.2;
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = T.glow;
    ctx.shadowBlur = r * 5;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function neonText(ctx, text, x, y, color, blur = 20) {
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.shadowBlur = blur * 1.5;
  ctx.fillText(text, x, y);
  ctx.restore();
}

async function createCard(data) {
  const W = 900, H = 700;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");
  const T = getTheme(data.rank, data.isDeveloper);
  const RI = getRankInfo(data.rank, data.isDeveloper);

  // ── الخلفية ──
  ctx.fillStyle = T.bg;
  ctx.fillRect(0, 0, W, H);

  // سديم
  const neb = ctx.createRadialGradient(W * 0.5, H * 0.3, 0, W * 0.5, H * 0.3, W * 0.7);
  neb.addColorStop(0, T.c3 + "33");
  neb.addColorStop(0.5, T.c3 + "11");
  neb.addColorStop(1, "transparent");
  ctx.fillStyle = neb;
  ctx.fillRect(0, 0, W, H);

  drawStars(ctx, W, H, T);

  // ── الإطار ──
  ctx.save();
  ctx.shadowColor = T.glow;
  ctx.shadowBlur = 35;
  ctx.strokeStyle = T.c2 + "80";
  ctx.lineWidth = 2;
  rRect(ctx, 18, 18, W - 36, H - 36, 24);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.fillStyle = "rgba(5,8,18,0.6)";
  rRect(ctx, 18, 18, W - 36, H - 36, 24);
  ctx.fill();
  ctx.restore();

  // خط علوي
  ctx.save();
  ctx.shadowColor = T.glow;
  ctx.shadowBlur = 20;
  const tl = ctx.createLinearGradient(0, 0, W, 0);
  tl.addColorStop(0, "transparent");
  tl.addColorStop(0.5, T.c1);
  tl.addColorStop(1, "transparent");
  ctx.strokeStyle = tl;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(80, 19); ctx.lineTo(W - 80, 19);
  ctx.stroke();
  ctx.restore();

  // ── صورة البروفايل (وسط أعلى) ──
  const AX = W / 2, AY = 145, AR = 90;

  try {
    const avatarURL = `https://graph.facebook.com/${data.userID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const res = await axios.get(avatarURL, { responseType: "arraybuffer", timeout: 10000 });
    const avatar = await loadImage(Buffer.from(res.data));

    // توهج خلف الصورة
    ctx.save();
    const ag = ctx.createRadialGradient(AX, AY, 0, AX, AY, AR * 2);
    ag.addColorStop(0, T.c2 + "40");
    ag.addColorStop(1, "transparent");
    ctx.fillStyle = ag;
    ctx.fillRect(AX - AR * 2, AY - AR * 2, AR * 4, AR * 4);
    ctx.restore();

    // حلقة خارجية متقطعة
    ctx.save();
    ctx.shadowColor = T.glow;
    ctx.shadowBlur = 10;
    ctx.strokeStyle = T.c1 + "50";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 7]);
    ctx.beginPath();
    ctx.arc(AX, AY, AR + 22, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // الصورة
    ctx.save();
    ctx.beginPath();
    ctx.arc(AX, AY, AR, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(avatar, AX - AR, AY - AR, AR * 2, AR * 2);
    ctx.restore();

    // حلقة داخلية
    ctx.save();
    ctx.shadowColor = T.glow;
    ctx.shadowBlur = 30;
    ctx.strokeStyle = T.c1;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(AX, AY, AR + 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

  } catch (_) {
    ctx.save();
    const pg = ctx.createRadialGradient(AX, AY, 5, AX, AY, AR);
    pg.addColorStop(0, T.c3 + "cc");
    pg.addColorStop(1, T.bg);
    ctx.fillStyle = pg;
    ctx.beginPath();
    ctx.arc(AX, AY, AR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = T.c1;
    ctx.lineWidth = 4;
    ctx.shadowColor = T.glow;
    ctx.shadowBlur = 25;
    ctx.stroke();
    ctx.restore();
    ctx.font = "60px 'Segoe UI Emoji'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("👤", AX, AY);
  }

  // ── الاسم (وسط) ──
  ctx.font = "bold 46px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  let name = data.username;
  while (ctx.measureText(name).width > W - 100 && name.length > 3)
    name = name.slice(0, -1);
  if (name !== data.username) name += "..";

  neonText(ctx, name, W / 2, 265, "#ffffff", 25);

  // خط تحت الاسم
  ctx.save();
  ctx.shadowColor = T.glow;
  ctx.shadowBlur = 15;
  const ul = ctx.createLinearGradient(W / 2 - 200, 0, W / 2 + 200, 0);
  ul.addColorStop(0, "transparent");
  ul.addColorStop(0.5, T.c1);
  ul.addColorStop(1, "transparent");
  ctx.strokeStyle = ul;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 200, 322);
  ctx.lineTo(W / 2 + 200, 322);
  ctx.stroke();
  ctx.restore();

  // شارة الرتبة
  ctx.font = "bold 20px Arial";
  ctx.textAlign = "center";
  neonText(ctx, `${RI.emoji}  ${data.rank}  ·  ${RI.label}`, W / 2, 332, T.c2, 18);

  // ── الإحصائيات (تحت بعض) ──
  const rows = [
    { label: "💰  الرصيد",   value: formatNum(data.money) + " $",  color: T.c1 },
    { label: "⭐  الخبرة",   value: formatNum(data.exp) + " XP",   color: T.c2 },
    { label: "📈  المستوى",  value: `LV.${data.level}`,             color: T.c1 },
    { label: "💬  الرسائل", value: formatNum(data.msg),             color: T.c2 },
    { label: "🆔  المعرف",  value: data.userID,                    color: T.c1 },
  ];

  const rowH = 52, rowStartY = 378, rowX = 80, rowW = W - 160;

  rows.forEach((row, i) => {
    const ry = rowStartY + i * rowH;

    // خلفية الصف
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.03)";
    rRect(ctx, rowX, ry, rowW, rowH - 6, 12);
    ctx.fill();
    ctx.restore();

    // خط جانبي ملون
    ctx.save();
    ctx.shadowColor = row.color;
    ctx.shadowBlur = 15;
    ctx.fillStyle = row.color;
    rRect(ctx, rowX, ry, 4, rowH - 6, 2);
    ctx.fill();
    ctx.restore();

    // التسمية
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = row.color + "bb";
    ctx.shadowColor = row.color;
    ctx.shadowBlur = 8;
    ctx.fillText(row.label, rowX + 20, ry + (rowH - 6) / 2);

    // القيمة
    ctx.save();
    ctx.font = "bold 22px Arial";
    ctx.textAlign = "right";
    ctx.shadowColor = row.color;
    ctx.shadowBlur = 18;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(row.value, rowX + rowW - 18, ry + (rowH - 6) / 2);
    ctx.restore();
  });

  // ── شريط الخبرة ──
  const BX = rowX, BY = rowStartY + rows.length * rowH + 10;
  const BW = rowW, BH = 20;

  ctx.font = "bold 16px Arial";
  ctx.textAlign = "left";
  ctx.fillStyle = T.c2 + "cc";
  ctx.shadowColor = T.glow;
  ctx.shadowBlur = 8;
  ctx.fillText("✦ LEVEL PROGRESS", BX, BY - 18);
  ctx.textAlign = "right";
  ctx.fillStyle = T.c1;
  ctx.fillText(`${Math.round(data.progress)}%`, BX + BW, BY - 18);

  // خلفية
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  rRect(ctx, BX, BY, BW, BH, BH / 2);
  ctx.fill();
  ctx.restore();

  // تعبئة
  const fw = Math.max((data.progress / 100) * BW, BH);
  ctx.save();
  ctx.shadowColor = T.glow;
  ctx.shadowBlur = 25;
  const bg2 = ctx.createLinearGradient(BX, BY, BX + fw, BY);
  bg2.addColorStop(0, T.c3);
  bg2.addColorStop(0.6, T.c2);
  bg2.addColorStop(1, T.c1);
  ctx.fillStyle = bg2;
  rRect(ctx, BX, BY, fw, BH, BH / 2);
  ctx.fill();
  ctx.restore();

  // نقطة نهاية
  ctx.save();
  ctx.shadowColor = "#ffffff";
  ctx.shadowBlur = 20;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(BX + fw, BY + BH / 2, BH / 2 + 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // زوايا زخرفية
  ctx.save();
  ctx.strokeStyle = T.c2 + "60";
  ctx.lineWidth = 2.5;
  [[W - 55, 25, W - 25, 25, W - 25, 55],
   [25, H - 55, 25, H - 25, 55, H - 25],
   [25, 55, 25, 25, 55, 25],
   [W - 55, H - 25, W - 25, H - 25, W - 25, H - 55]
  ].forEach(([x1, y1, x2, y2, x3, y3]) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.stroke();
  });
  ctx.restore();

  // التوقيع
  ctx.font = "14px Arial";
  ctx.fillStyle = T.c2 + "40";
  ctx.textAlign = "right";
  ctx.shadowBlur = 0;
  ctx.fillText("✦ KIRA SYSTEM ✦", W - 35, H - 28);

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
