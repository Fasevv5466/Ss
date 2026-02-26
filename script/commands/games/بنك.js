
const { createCanvas, loadImage } = require("@napi-rs/canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const mongodb = require(path.join(process.cwd(), "includes", "mongodb.js"));

module.exports.config = {
  name: "بنك",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "بطاقة بنك المستخدم",
  commandCategory: "games",
  usages: "بنك [@منشن/رد]",
  cooldowns: 5
};

// ══════════════════════════════════════════
// دالة رسم مستطيل مدور (بدل prototype)
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
// ألوان الرتب
// ══════════════════════════════════════════
function getTheme(rank, isDev) {
  if (isDev) return { a: "#f0abfc", b: "#c084fc", c: "#7c3aed", glow: "#e879f9", bg: "#0d0015" };
  const map = {
    "مبتدئ":    { a: "#86efac", b: "#22c55e", c: "#14532d", glow: "#4ade80", bg: "#000d05" },
    "محارب":    { a: "#fef08a", b: "#eab308", c: "#713f12", glow: "#fde047", bg: "#0d0a00" },
    "فارس":     { a: "#7dd3fc", b: "#0ea5e9", c: "#0c4a6e", glow: "#38bdf8", bg: "#00080d" },
    "نخبة":     { a: "#fbbf24", b: "#d97706", c: "#7c2d12", glow: "#f59e0b", bg: "#0d0700" },
    "بطل":      { a: "#fca5a5", b: "#ef4444", c: "#7f1d1d", glow: "#f87171", bg: "#0d0000" },
    "أسطورة":   { a: "#c4b5fd", b: "#8b5cf6", c: "#4c1d95", glow: "#a78bfa", bg: "#05000d" },
    "ملك":      { a: "#67e8f9", b: "#06b6d4", c: "#164e63", glow: "#22d3ee", bg: "#000b0d" },
    "إمبراطور": { a: "#fde68a", b: "#f59e0b", c: "#78350f", glow: "#fbbf24", bg: "#0d0800" },
    "إله":      { a: "#fbcfe8", b: "#ec4899", c: "#831843", glow: "#f472b6", bg: "#0d0008" },
    "خالد":     { a: "#fecaca", b: "#dc2626", c: "#450a0a", glow: "#ef4444", bg: "#0d0000" },
  };
  return map[rank] || map["مبتدئ"];
}

// ══════════════════════════════════════════
// إيموجي الرتبة
// ══════════════════════════════════════════
function getRankEmoji(rank, isDev) {
  if (isDev) return "👑";
  const e = { "مبتدئ": "🔰", "محارب": "⚔️", "فارس": "🛡️", "نخبة": "💎", "بطل": "🏆", "أسطورة": "⚡", "ملك": "🔱", "إمبراطور": "🌟", "إله": "🔥", "خالد": "😈" };
  return e[rank] || "🔰";
}

// ══════════════════════════════════════════
// رسم البطاقة
// ══════════════════════════════════════════
async function createCard(data) {
  const W = 1200, H = 520;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");
  const T = getTheme(data.rank, data.isDeveloper);

  // ─── الخلفية ───
  ctx.fillStyle = T.bg;
  ctx.fillRect(0, 0, W, H);

  // تدرج جانبي
  const sideFade = ctx.createLinearGradient(0, 0, W, 0);
  sideFade.addColorStop(0, T.c + "cc");
  sideFade.addColorStop(0.4, "transparent");
  sideFade.addColorStop(1, "transparent");
  ctx.fillStyle = sideFade;
  ctx.fillRect(0, 0, W, H);

  // تأثير ضوء من الأعلى
  const topLight = ctx.createRadialGradient(W * 0.3, 0, 0, W * 0.3, 0, H * 1.2);
  topLight.addColorStop(0, T.glow + "22");
  topLight.addColorStop(1, "transparent");
  ctx.fillStyle = topLight;
  ctx.fillRect(0, 0, W, H);

  // نقاط زخرفية (grid dots)
  ctx.fillStyle = T.b + "18";
  for (let x = 0; x < W; x += 30) {
    for (let y = 0; y < H; y += 30) {
      ctx.beginPath();
      ctx.arc(x, y, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ─── الإطار الخارجي ───
  ctx.save();
  ctx.shadowColor = T.glow;
  ctx.shadowBlur = 35;
  ctx.strokeStyle = T.b + "90";
  ctx.lineWidth = 2.5;
  rRect(ctx, 20, 20, W - 40, H - 40, 32);
  ctx.stroke();
  ctx.restore();

  // إطار داخلي شفاف
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.025)";
  rRect(ctx, 20, 20, W - 40, H - 40, 32);
  ctx.fill();
  ctx.restore();

  // ─── الشريط الجانبي الأيسر ───
  ctx.save();
  ctx.shadowColor = T.glow;
  ctx.shadowBlur = 25;
  const sideBar = ctx.createLinearGradient(45, 0, 45, H);
  sideBar.addColorStop(0, "transparent");
  sideBar.addColorStop(0.5, T.b);
  sideBar.addColorStop(1, "transparent");
  ctx.fillStyle = sideBar;
  ctx.fillRect(44, 60, 4, H - 120);
  ctx.restore();

  // ─── صورة البروفايل ───
  const AX = 160, AY = 200, AR = 110;
  try {
    const avatarURL = `https://graph.facebook.com/${data.userID}/picture?width=512&height=512`;
    const res = await axios.get(avatarURL, { responseType: "arraybuffer", timeout: 8000 });
    const avatar = await loadImage(res.data);

    // توهج خلف الصورة
    ctx.save();
    ctx.shadowColor = T.glow;
    ctx.shadowBlur = 60;
    ctx.fillStyle = T.b + "40";
    ctx.beginPath();
    ctx.arc(AX, AY, AR + 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // حلقة خارجية متقطعة
    ctx.save();
    ctx.shadowColor = T.glow;
    ctx.shadowBlur = 20;
    ctx.strokeStyle = T.a + "60";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.arc(AX, AY, AR + 20, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // قص الصورة دائري
    ctx.save();
    ctx.beginPath();
    ctx.arc(AX, AY, AR, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(avatar, AX - AR, AY - AR, AR * 2, AR * 2);
    ctx.restore();

    // حلقة داخلية متوهجة
    ctx.save();
    ctx.shadowColor = T.glow;
    ctx.shadowBlur = 30;
    ctx.strokeStyle = T.a;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(AX, AY, AR + 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

  } catch (_) {
    // placeholder إذا فشلت الصورة
    ctx.save();
    ctx.shadowColor = T.glow;
    ctx.shadowBlur = 40;
    const pg = ctx.createRadialGradient(AX, AY, 10, AX, AY, AR);
    pg.addColorStop(0, T.b + "80");
    pg.addColorStop(1, T.c);
    ctx.fillStyle = pg;
    ctx.beginPath();
    ctx.arc(AX, AY, AR, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.font = "70px 'Segoe UI Emoji'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("👤", AX, AY);
  }

  // شارة الرتبة تحت الصورة
  ctx.save();
  ctx.shadowColor = T.glow;
  ctx.shadowBlur = 20;
  ctx.fillStyle = T.c;
  rRect(ctx, AX - 65, AY + AR + 15, 130, 36, 18);
  ctx.fill();
  ctx.strokeStyle = T.b + "80";
  ctx.lineWidth = 1.5;
  rRect(ctx, AX - 65, AY + AR + 15, 130, 36, 18);
  ctx.stroke();
  ctx.restore();

  ctx.font = "bold 18px Arial";
  ctx.fillStyle = T.a;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(`${getRankEmoji(data.rank, data.isDeveloper)} ${data.rank}`, AX, AY + AR + 22);

  // ─── الاسم ───
  const NX = 330, NY = 65;
  ctx.save();
  ctx.shadowColor = T.glow;
  ctx.shadowBlur = 25;
  ctx.font = "bold 52px Arial";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(data.username, NX, NY);
  ctx.restore();

  // خط متوهج تحت الاسم
  const nameW = ctx.measureText(data.username).width;
  ctx.save();
  ctx.shadowColor = T.glow;
  ctx.shadowBlur = 15;
  const lineGrad = ctx.createLinearGradient(NX, 0, NX + nameW, 0);
  lineGrad.addColorStop(0, T.a);
  lineGrad.addColorStop(1, "transparent");
  ctx.strokeStyle = lineGrad;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(NX, NY + 62);
  ctx.lineTo(NX + nameW, NY + 62);
  ctx.stroke();
  ctx.restore();

  // وسام المطور
  if (data.isDeveloper) {
    ctx.save();
    ctx.shadowColor = T.glow;
    ctx.shadowBlur = 30;
    ctx.fillStyle = T.c + "cc";
    rRect(ctx, NX, NY + 72, 210, 34, 17);
    ctx.fill();
    ctx.strokeStyle = T.b;
    ctx.lineWidth = 1.5;
    rRect(ctx, NX, NY + 72, 210, 34, 17);
    ctx.stroke();
    ctx.font = "bold 18px Arial";
    ctx.fillStyle = T.a;
    ctx.fillText("👑 SYSTEM LORD", NX + 12, NY + 79);
    ctx.restore();
  }

  // ─── بطاقات الإحصائيات (2×2) ───
  const stats = [
    { icon: "💰", label: "الرصيد", value: `${data.money.toLocaleString()}$` },
    { icon: "⭐", label: "الخبرة", value: `${data.exp} XP` },
    { icon: "📈", label: "المستوى", value: `LV.${data.level}` },
    { icon: "💬", label: "الرسائل", value: `${data.msg}` }
  ];

  const cardW = 195, cardH = 90, cardGap = 14;
  const startX = 330, startY = 160;

  stats.forEach((s, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cx = startX + col * (cardW + cardGap);
    const cy = startY + row * (cardH + cardGap);

    // خلفية البطاقة
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    ctx.strokeStyle = T.b + "35";
    ctx.lineWidth = 1.5;
    rRect(ctx, cx, cy, cardW, cardH, 14);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // شريط لوني علوي
    ctx.save();
    ctx.shadowColor = T.glow;
    ctx.shadowBlur = 8;
    const topBar = ctx.createLinearGradient(cx, cy, cx + cardW, cy);
    topBar.addColorStop(0, T.b + "cc");
    topBar.addColorStop(1, T.b + "00");
    ctx.fillStyle = topBar;
    ctx.fillRect(cx + 14, cy, cardW - 28, 3);
    ctx.restore();

    // الأيقونة
    ctx.font = "26px 'Segoe UI Emoji'";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(s.icon, cx + 12, cy + 12);

    // التسمية
    ctx.font = "16px Arial";
    ctx.fillStyle = T.a + "aa";
    ctx.fillText(s.label, cx + 48, cy + 14);

    // القيمة
    ctx.save();
    ctx.shadowColor = T.glow;
    ctx.shadowBlur = 10;
    ctx.font = "bold 26px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(s.value, cx + 12, cy + 48);
    ctx.restore();
  });

  // ─── قسم يمين: معلومات إضافية ───
  const RX = 750, RY = 160;

  // المعرف
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.04)";
  ctx.strokeStyle = T.b + "30";
  ctx.lineWidth = 1;
  rRect(ctx, RX, RY, 390, 50, 12);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  ctx.font = "16px Arial";
  ctx.fillStyle = T.a + "99";
  ctx.textAlign = "left";
  ctx.fillText("🆔 USER ID", RX + 15, RY + 10);
  ctx.font = "bold 20px Arial";
  ctx.fillStyle = T.a;
  ctx.fillText(data.userID, RX + 15, RY + 28);

  // ─── شريط الخبرة ───
  const BX = 330, BY = 390, BW = 810, BH = 22;

  // عنوان الشريط
  ctx.font = "bold 18px Arial";
  ctx.fillStyle = T.a + "cc";
  ctx.textAlign = "left";
  ctx.fillText("✦ تقدم المستوى", BX, BY - 22);
  ctx.font = "bold 18px Arial";
  ctx.fillStyle = T.a;
  ctx.textAlign = "right";
  ctx.fillText(`${Math.round(data.progress)}%`, BX + BW, BY - 22);

  // خلفية الشريط
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  rRect(ctx, BX, BY, BW, BH, BH / 2);
  ctx.fill();

  // تعبئة الشريط
  const fillW = Math.max((data.progress / 100) * BW, 20);
  ctx.save();
  ctx.shadowColor = T.glow;
  ctx.shadowBlur = 25;
  const barGrad = ctx.createLinearGradient(BX, BY, BX + fillW, BY);
  barGrad.addColorStop(0, T.b);
  barGrad.addColorStop(0.7, T.a);
  barGrad.addColorStop(1, "#ffffff");
  ctx.fillStyle = barGrad;
  rRect(ctx, BX, BY, fillW, BH, BH / 2);
  ctx.fill();
  ctx.restore();

  // نقطة نهاية متوهجة
  ctx.save();
  ctx.shadowColor = T.glow;
  ctx.shadowBlur = 30;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(BX + fillW, BY + BH / 2, BH / 2 + 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // ─── التوقيع ───
  ctx.font = "15px Arial";
  ctx.fillStyle = T.b + "55";
  ctx.textAlign = "right";
  ctx.fillText("✦ KIRA SYSTEM ✦", W - 35, H - 30);

  // ─── زاوية زخرفية ───
  ctx.save();
  ctx.strokeStyle = T.b + "40";
  ctx.lineWidth = 2;
  // زاوية يمين علوي
  ctx.beginPath(); ctx.moveTo(W - 65, 35); ctx.lineTo(W - 35, 35); ctx.lineTo(W - 35, 65); ctx.stroke();
  // زاوية يسار سفلي
  ctx.beginPath(); ctx.moveTo(35, H - 65); ctx.lineTo(35, H - 35); ctx.lineTo(65, H - 35); ctx.stroke();
  ctx.restore();

  return canvas.toBuffer("image/png");
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
    const progress = calculated?.progress || 0;

    if (api.setMessageReaction) api.setMessageReaction("⌛", messageID, () => {}, true);

    const card = await createCard({
      userID: targetID,
      username,
      money: currency.money || 0,
      exp: currency.exp || 0,
      level: currency.level || 1,
      msg: currency.messageCount || 0,
      rank: currency.rank || "مبتدئ",
      progress,
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
    return api.sendMessage("❌ حدث خطأ: " + e.message, threadID, messageID);
  }
};
