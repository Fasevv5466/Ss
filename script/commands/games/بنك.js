const { createCanvas, loadImage } = require("@napi-rs/canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const mongodb = require(path.join(process.cwd(), "includes", "mongodb.js"));

module.exports.config = {
  name: "بنك",
  version: "5.0.0",
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
  if (isDev) return { c1: "#f0abfc", c2: "#c084fc", c3: "#3b0764", glow: "#e879f9" };
  const map = {
    "مبتدئ":     { c1: "#6ee7b7", c2: "#34d399", c3: "#064e3b", glow: "#6ee7b7" },
    "محارب":     { c1: "#fde68a", c2: "#fbbf24", c3: "#78350f", glow: "#fde68a" },
    "فارس":      { c1: "#7dd3fc", c2: "#38bdf8", c3: "#0c4a6e", glow: "#7dd3fc" },
    "نخبة":      { c1: "#fdba74", c2: "#fb923c", c3: "#7c2d12", glow: "#fdba74" },
    "بطل":       { c1: "#fda4af", c2: "#fb7185", c3: "#881337", glow: "#fda4af" },
    "أسطورة":    { c1: "#c4b5fd", c2: "#a78bfa", c3: "#4c1d95", glow: "#c4b5fd" },
    "ملك":       { c1: "#67e8f9", c2: "#22d3ee", c3: "#164e63", glow: "#67e8f9" },
    "إمبراطور":  { c1: "#fcd34d", c2: "#f59e0b", c3: "#78350f", glow: "#fcd34d" },
    "إله":       { c1: "#f9a8d4", c2: "#ec4899", c3: "#831843", glow: "#f9a8d4" },
    "خالد":      { c1: "#fca5a5", c2: "#ef4444", c3: "#7f1d1d", glow: "#fca5a5" },
  };
  return map[rank] || map["مبتدئ"];
}

function getRankInfo(rank, isDev) {
  if (isDev) return { label: "SYSTEM LORD" };
  const map = {
    "مبتدئ": "BEGINNER", "محارب": "WARRIOR", "فارس": "KNIGHT",
    "نخبة": "ELITE", "بطل": "HERO", "أسطورة": "LEGEND",
    "ملك": "KING", "إمبراطور": "EMPEROR", "إله": "GOD", "خالد": "IMMORTAL"
  };
  return { label: map[rank] || "BEGINNER" };
}

// ✅ إصلاح formatNum
function formatNum(n) {
  n = Number(n) || 0;
  if (n >= 1e12) return (n / 1e12).toFixed(1) + "T";
  if (n >= 1e9)  return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6)  return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3)  return (n / 1e3).toFixed(1) + "K";
  return n.toLocaleString();
}

function drawStars(ctx, W, H) {
  let s = 99991;
  const rand = () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
  for (let i = 0; i < 180; i++) {
    ctx.save();
    ctx.globalAlpha = rand() * 0.5 + 0.15;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(rand() * W, rand() * H, rand() * 1.4 + 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

async function createCard(data) {
  const W = 920, H = 780; // ✅ كانفاس أكبر
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");
  const T = getTheme(data.rank, data.isDeveloper);
  const RI = getRankInfo(data.rank, data.isDeveloper);

  // ── الخلفية ──
  ctx.fillStyle = "#04020e";
  ctx.fillRect(0, 0, W, H);

  // سديم خفيف فقط في الزوايا (مش على كل شي)
  const neb1 = ctx.createRadialGradient(0, 0, 0, 0, 0, 350);
  neb1.addColorStop(0, T.c3 + "30");
  neb1.addColorStop(1, "transparent");
  ctx.fillStyle = neb1;
  ctx.fillRect(0, 0, W, H);

  const neb2 = ctx.createRadialGradient(W, H, 0, W, H, 350);
  neb2.addColorStop(0, T.c3 + "25");
  neb2.addColorStop(1, "transparent");
  ctx.fillStyle = neb2;
  ctx.fillRect(0, 0, W, H);

  drawStars(ctx, W, H);

  // ── الإطار ──
  ctx.save();
  ctx.shadowColor = T.glow;
  ctx.shadowBlur = 30;
  ctx.strokeStyle = T.c2 + "90";
  ctx.lineWidth = 2;
  rRect(ctx, 16, 16, W - 32, H - 32, 22);
  ctx.stroke();
  ctx.restore();

  // طبقة زجاجية داخل
  ctx.save();
  ctx.fillStyle = "rgba(4, 2, 18, 0.65)";
  rRect(ctx, 16, 16, W - 32, H - 32, 22);
  ctx.fill();
  ctx.restore();

  // خط علوي
  ctx.save();
  ctx.shadowColor = T.glow;
  ctx.shadowBlur = 18;
  const tl = ctx.createLinearGradient(0, 0, W, 0);
  tl.addColorStop(0, "transparent");
  tl.addColorStop(0.5, T.c1);
  tl.addColorStop(1, "transparent");
  ctx.strokeStyle = tl;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(80, 17); ctx.lineTo(W - 80, 17);
  ctx.stroke();
  ctx.restore();

  // ── صورة البروفايل ──
  const AX = W / 2, AY = 140, AR = 88;

  try {
    const avatarURL = `https://graph.facebook.com/${data.userID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const res = await axios.get(avatarURL, { responseType: "arraybuffer", timeout: 10000 });
    const avatar = await loadImage(Buffer.from(res.data));

    // توهج خلف الصورة
    ctx.save();
    const ag = ctx.createRadialGradient(AX, AY, 0, AX, AY, AR * 2.2);
    ag.addColorStop(0, T.c2 + "35");
    ag.addColorStop(1, "transparent");
    ctx.fillStyle = ag;
    ctx.fillRect(AX - AR * 2.5, AY - AR * 2.5, AR * 5, AR * 5);
    ctx.restore();

    // حلقة متقطعة
    ctx.save();
    ctx.strokeStyle = T.c1 + "55";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 7]);
    ctx.beginPath();
    ctx.arc(AX, AY, AR + 20, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // قص الصورة
    ctx.save();
    ctx.beginPath();
    ctx.arc(AX, AY, AR, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(avatar, AX - AR, AY - AR, AR * 2, AR * 2);
    ctx.restore();

    // حلقة داخلية
    ctx.save();
    ctx.shadowColor = T.glow;
    ctx.shadowBlur = 28;
    ctx.strokeStyle = T.c1;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(AX, AY, AR + 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

  } catch (_) {
    ctx.save();
    const pg = ctx.createRadialGradient(AX, AY, 5, AX, AY, AR);
    pg.addColorStop(0, T.c3 + "dd");
    pg.addColorStop(1, "#04020e");
    ctx.fillStyle = pg;
    ctx.beginPath();
    ctx.arc(AX, AY, AR, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = T.glow;
    ctx.shadowBlur = 25;
    ctx.strokeStyle = T.c1;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();
  }

  // ── الاسم ──
  ctx.save();
  ctx.shadowColor = T.glow;
  ctx.shadowBlur = 22;
  ctx.font = "bold 44px sans-serif"; // ✅ sans-serif بدل Arial لتجنب مشاكل الخط
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  let name = data.username;
  while (ctx.measureText(name).width > W - 120 && name.length > 3)
    name = name.slice(0, -1);
  if (name !== data.username) name += "..";
  ctx.fillText(name, W / 2, 255);
  ctx.restore();

  // خط تحت الاسم
  ctx.save();
  ctx.shadowColor = T.glow;
  ctx.shadowBlur = 12;
  const ul = ctx.createLinearGradient(W / 2 - 200, 0, W / 2 + 200, 0);
  ul.addColorStop(0, "transparent");
  ul.addColorStop(0.5, T.c1);
  ul.addColorStop(1, "transparent");
  ctx.strokeStyle = ul;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 200, 312); ctx.lineTo(W / 2 + 200, 312);
  ctx.stroke();
  ctx.restore();

  // الرتبة (بدون إيموجي) ✅
  ctx.save();
  ctx.shadowColor = T.glow;
  ctx.shadowBlur = 15;
  ctx.font = "bold 20px sans-serif";
  ctx.fillStyle = T.c2;
  ctx.textAlign = "center";
  ctx.fillText(`[ ${data.rank} ]  ·  ${RI.label}`, W / 2, 322);
  ctx.restore();

  // ── الصفوف ──
  const rowData = [
    { label: "الرصيد",   value: formatNum(data.money) + " $",  c: T.c1 },
    { label: "الخبرة",   value: formatNum(data.exp) + " XP",   c: T.c2 },
    { label: "المستوى",  value: `LV.${data.level}`,             c: T.c1 },
    { label: "الرسائل", value: formatNum(data.msg),             c: T.c2 },
    { label: "المعرف",  value: data.userID,                    c: T.c1 },
  ];

  const rowH = 62, rowStartY = 368, rX = 55, rW = W - 110;

  rowData.forEach((row, i) => {
    const ry = rowStartY + i * rowH;

    // خلفية الصف
    ctx.save();
    ctx.fillStyle = i % 2 === 0
      ? "rgba(255,255,255,0.035)"
      : "rgba(255,255,255,0.02)";
    rRect(ctx, rX, ry, rW, rowH - 8, 12);
    ctx.fill();
    ctx.restore();

    // خط جانبي
    ctx.save();
    ctx.shadowColor = row.c;
    ctx.shadowBlur = 12;
    ctx.fillStyle = row.c;
    rRect(ctx, rX, ry, 4, rowH - 8, 2);
    ctx.fill();
    ctx.restore();

    // التسمية
    ctx.save();
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = row.c + "cc";
    ctx.shadowColor = row.c;
    ctx.shadowBlur = 10;
    ctx.fillText(row.label, rX + 20, ry + (rowH - 8) / 2);
    ctx.restore();

    // القيمة — تصغير الخط تلقائياً ✅
    ctx.save();
    let fs2 = 22;
    ctx.font = `bold ${fs2}px sans-serif`;
    while (ctx.measureText(row.value).width > rW * 0.5 && fs2 > 13) {
      fs2 -= 1;
      ctx.font = `bold ${fs2}px sans-serif`;
    }
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.shadowColor = row.c;
    ctx.shadowBlur = 15;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(row.value, rX + rW - 16, ry + (rowH - 8) / 2);
    ctx.restore();
  });

  // ── شريط الخبرة ──
  const BX = rX;
  const BY = rowStartY + rowData.length * rowH + 18; // ✅ مسافة كافية
  const BW = rW, BH = 22;

  ctx.save();
  ctx.font = "bold 15px sans-serif";
  ctx.textAlign = "left";
  ctx.fillStyle = T.c2 + "cc";
  ctx.shadowColor = T.glow;
  ctx.shadowBlur = 8;
  ctx.fillText("LEVEL PROGRESS", BX, BY - 16);
  ctx.textAlign = "right";
  ctx.fillStyle = T.c1;
  ctx.fillText(`${Math.round(data.progress)}%`, BX + BW, BY - 16);
  ctx.restore();

  // خلفية الشريط
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.07)";
  rRect(ctx, BX, BY, BW, BH, BH / 2);
  ctx.fill();
  ctx.restore();

  // تعبئة
  const fw = Math.max((data.progress / 100) * BW, BH);
  ctx.save();
  ctx.shadowColor = T.glow;
  ctx.shadowBlur = 22;
  const bg2 = ctx.createLinearGradient(BX, BY, BX + fw, BY);
  bg2.addColorStop(0, T.c3 + "ee");
  bg2.addColorStop(0.5, T.c2);
  bg2.addColorStop(1, T.c1);
  ctx.fillStyle = bg2;
  rRect(ctx, BX, BY, fw, BH, BH / 2);
  ctx.fill();
  ctx.restore();

  // نقطة نهاية
  ctx.save();
  ctx.shadowColor = "#ffffff";
  ctx.shadowBlur = 18;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(BX + fw, BY + BH / 2, BH / 2 + 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // ── زوايا زخرفية ──
  ctx.save();
  ctx.strokeStyle = T.c2 + "55";
  ctx.lineWidth = 2.5;
  [
    [W - 52, 22, W - 22, 22, W - 22, 52],
    [22, H - 52, 22, H - 22, 52, H - 22],
    [22, 52, 22, 22, 52, 22],
    [W - 52, H - 22, W - 22, H - 22, W - 22, H - 52]
  ].forEach(([x1, y1, x2, y2, x3, y3]) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3);
    ctx.stroke();
  });
  ctx.restore();

  // ── التوقيع ✅ داخل الكانفاس ──
  ctx.font = "13px sans-serif";
  ctx.fillStyle = T.c2 + "45";
  ctx.textAlign = "right";
  ctx.shadowBlur = 0;
  ctx.fillText("KIRA SYSTEM", W - 36, H - 26);

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
