const Canvas = require("@napi-rs/canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const mongodb = require(path.join(process.cwd(), "includes", "mongodb.js"));

module.exports.config = {
  name: "بنك",
  version: "17.0.2",
  hasPermssion: 0,
  credits: "VOID SYSTEM",
  description: "Void Neon Emperor Card - التصميم الأعظم",
  commandCategory: "games",
  usages: "[@منشن/رد]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID, senderID, type, messageReply, mentions } = event;

  try {
    let targetID = senderID;
    if (type === "message_reply") targetID = messageReply.senderID;
    else if (Object.keys(mentions).length > 0) targetID = Object.keys(mentions)[0];

    const data = await mongodb.getUserData(targetID);
    if (!data || !data.currency)
      return api.sendMessage("❌ لا توجد بيانات مسجلة لهذا المستخدم.", threadID, messageID);

    const { currency, calculated } = data;
    const userInfo = await api.getUserInfo(targetID);

    const username =
      data.user?.name || (userInfo[targetID]?.name || "USER");

    const isDeveloper =
      global.config.ADMINBOT && global.config.ADMINBOT.includes(targetID);

    const exp = currency.exp || 0;
    const expNeeded = calculated?.expNeeded || 100;
    const progress = Math.min(Math.floor((exp / expNeeded) * 100), 100);

    // تفاعل التحميل
    if (api.setMessageReaction) {
      api.setMessageReaction("⌛", messageID, () => {}, true);
    }

    const card = await createCard({
      userID: targetID,
      username: username.toUpperCase(),
      money: currency.money || 0,
      exp,
      level: currency.level || 1,
      msg: currency.messageCount || 0,
      rank: calculated?.rank?.name || "مبتدئ",
      progress,
      isDeveloper
    });

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    const cachePath = path.join(cacheDir, `bank_${targetID}.png`);
    await fs.writeFile(cachePath, card);

    return api.sendMessage(
      { attachment: fs.createReadStream(cachePath) },
      threadID,
      () => {
        if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
        if (api.setMessageReaction) {
          api.setMessageReaction("✅", messageID, () => {}, true);
        }
      },
      messageID
    );

  } catch (e) {
    console.error("❌ خطأ في أمر البنك:", e);
    api.sendMessage("❌ حدث خطأ في النظام الفراغي.", threadID, messageID);
  }
};

// ══════════════════════════════════════════════════════════
// دالة الألوان حسب الرتبة
// ══════════════════════════════════════════════════════════
function getTheme(rank, isDev) {
  if (isDev) return { primary: "#c084fc", secondary: "#a855f7", neon: "#e879f9", accent: "#f0abfc", dark: "#2e1065" };
  switch (rank) {
    case "مبتدئ": return { primary: "#22c55e", secondary: "#16a34a", neon: "#4ade80", accent: "#86efac", dark: "#14532d" };
    case "محارب": return { primary: "#eab308", secondary: "#ca8a04", neon: "#fde047", accent: "#fef08a", dark: "#854d0e" };
    case "فارس": return { primary: "#0ea5e9", secondary: "#0284c7", neon: "#38bdf8", accent: "#7dd3fc", dark: "#0c4a6e" };
    case "نخبة": return { primary: "#d97706", secondary: "#b45309", neon: "#f59e0b", accent: "#fbbf24", dark: "#7c2d12" };
    case "بطل": return { primary: "#ef4444", secondary: "#dc2626", neon: "#f87171", accent: "#fca5a5", dark: "#7f1d1d" };
    default: return { primary: "#22c55e", secondary: "#16a34a", neon: "#4ade80", accent: "#86efac", dark: "#14532d" };
  }
}

// ══════════════════════════════════════════════════════════
// تأثير النويز الخفيف
// ══════════════════════════════════════════════════════════
function applyNoise(ctx, w, h) {
  try {
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = Math.random() * 15;
      data[i] = Math.min(255, data[i] + noise);
      data[i + 1] = Math.min(255, data[i + 1] + noise);
      data[i + 2] = Math.min(255, data[i + 2] + noise);
    }
    ctx.putImageData(imageData, 0, 0);
  } catch (e) {}
}

// ══════════════════════════════════════════════════════════
// تصميم البطاقة الرئيسي (معدل بالكامل)
// ══════════════════════════════════════════════════════════
async function createCard(data) {
  const W = 1400;
  const H = 550;
  const canvas = Canvas.createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  const theme = getTheme(data.rank, data.isDeveloper);

  // الخلفية الكونية
  const bgGrad = ctx.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, 800);
  bgGrad.addColorStop(0, "#0b0e14");
  bgGrad.addColorStop(0.7, "#03050a");
  bgGrad.addColorStop(1, "#000000");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // شبكة خفيفة
  ctx.strokeStyle = "rgba(255,255,255,0.04)";
  ctx.lineWidth = 0.6;
  for (let i = 0; i < W; i += 40) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, H); ctx.stroke(); }
  for (let i = 0; i < H; i += 40) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(W, i); ctx.stroke(); }

  // إطار زجاجي متوهج
  const borderRadius = 40;
  ctx.save();
  ctx.shadowColor = theme.neon + "80";
  ctx.shadowBlur = 40;
  ctx.fillStyle = "rgba(18, 22, 36, 0.55)";
  ctx.strokeStyle = theme.primary + "30";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(40, 40, W - 80, H - 80, borderRadius);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // إطار داخلي نيون
  ctx.save();
  ctx.shadowColor = theme.neon;
  ctx.shadowBlur = 30;
  ctx.strokeStyle = theme.primary + "80";
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.restore();

  // ========== صورة البروفايل ==========
  const avatarX = 200, avatarY = 275, avatarRadius = 120;
  try {
    // رابط مباشر بدون توكن – يعمل بشكل أفضل
    const avatarURL = `https://graph.facebook.com/${data.userID}/picture?width=512&height=512`;
    const res = await axios.get(avatarURL, { responseType: "arraybuffer" });
    const avatar = await Canvas.loadImage(res.data);

    // ظل خلفي
    ctx.save();
    ctx.shadowColor = theme.neon;
    ctx.shadowBlur = 40;
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, avatarRadius + 5, 0, Math.PI * 2);
    ctx.fillStyle = theme.dark;
    ctx.fill();
    ctx.restore();

    // قص الصورة
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(avatar, avatarX - avatarRadius, avatarY - avatarRadius, avatarRadius * 2, avatarRadius * 2);
    ctx.restore();

    // حلقات متوهجة
    ctx.save();
    ctx.shadowColor = theme.neon;
    ctx.shadowBlur = 35;
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, avatarRadius + 2, 0, Math.PI * 2);
    ctx.stroke();

    ctx.shadowBlur = 20;
    ctx.strokeStyle = theme.primary;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, avatarRadius + 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  } catch (err) {
    // إذا فشل تحميل الصورة
    ctx.save();
    ctx.shadowColor = theme.neon;
    ctx.shadowBlur = 40;
    ctx.fillStyle = theme.dark;
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ========== الاسم والرتبة ==========
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  // اسم المستخدم
  ctx.save();
  ctx.shadowColor = theme.neon;
  ctx.shadowBlur = 30;
  ctx.font = "bold 58px 'Arial Black', 'Helvetica Bold', 'Arial', sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(data.username, 420, 110);
  ctx.restore();

  // خط تحت الاسم
  ctx.save();
  ctx.shadowColor = theme.neon;
  ctx.shadowBlur = 25;
  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(420, 180);
  ctx.lineTo(420 + ctx.measureText(data.username).width, 180);
  ctx.stroke();
  ctx.restore();

  // شارة الرتبة
  ctx.save();
  ctx.shadowColor = theme.neon;
  ctx.shadowBlur = 25;
  ctx.fillStyle = theme.dark;
  ctx.beginPath();
  ctx.roundRect(420, 200, 280, 50, 25);
  ctx.fill();
  ctx.fillStyle = theme.primary;
  ctx.font = "bold 28px 'Arial'";
  ctx.fillText(`⚡ ${data.rank} ⚡`, 440, 210);
  ctx.restore();

  // ========== لوحة الإحصائيات ==========
  const stats = [
    { icon: "📊", label: "المستوى", value: data.level },
    { icon: "✨", label: "الخبرة", value: `${data.exp} XP` },
    { icon: "💰", label: "البنك", value: `${data.money.toLocaleString()} $` },
    { icon: "💬", label: "الرسائل", value: data.msg }
  ];

  stats.forEach((stat, i) => {
    const y = 270 + i * 55;

    // خلفية شفافة
    ctx.fillStyle = "rgba(255,255,255,0.03)";
    ctx.beginPath();
    ctx.roundRect(410, y - 5, 500, 45, 10);
    ctx.fill();

    // أيقونة
    ctx.font = "30px 'Segoe UI Emoji', 'Arial'";
    ctx.fillStyle = theme.accent;
    ctx.fillText(stat.icon, 420, y);

    // التسمية
    ctx.font = "bold 26px 'Arial'";
    ctx.fillStyle = "#aaa";
    ctx.fillText(stat.label, 480, y + 2);

    // القيمة
    ctx.font = "bold 32px 'Arial'";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "right";
    ctx.fillText(stat.value, 900, y);
    ctx.textAlign = "left";
  });

  // ========== شريط الخبرة ==========
  const barX = 420;
  const barY = 490;
  const barW = 800;
  const barH = 24;

  // خلفية الشريط
  ctx.fillStyle = "rgba(20,20,30,0.8)";
  ctx.beginPath();
  ctx.roundRect(barX, barY, barW, barH, 12);
  ctx.fill();

  // التعبئة
  const fillW = (data.progress / 100) * barW;
  const grad = ctx.createLinearGradient(barX, barY, barX + fillW, barY + barH);
  grad.addColorStop(0, theme.neon);
  grad.addColorStop(1, theme.primary);

  ctx.save(); // ✅ حفظ الحالة قبل إضافة الظل
  ctx.shadowColor = theme.neon;
  ctx.shadowBlur = 30;
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(barX, barY, fillW, barH, 12);
  ctx.fill();
  ctx.restore(); // ✅ استرجاع الحالة بعد الظل

  // إطار الشريط
  ctx.save();
  ctx.shadowColor = theme.neon;
  ctx.shadowBlur = 15;
  ctx.strokeStyle = theme.accent + "80";
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.roundRect(barX, barY, barW, barH, 12);
  ctx.stroke();
  ctx.restore();

  // نسبة التقدم
  ctx.font = "bold 24px 'Arial'";
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "#000000";
  ctx.shadowBlur = 10;
  ctx.fillText(`${data.progress}%`, barX + barW + 30, barY + 5);
  ctx.shadowBlur = 0;

  // ========== وسام المطور ==========
  if (data.isDeveloper) {
    ctx.save();
    ctx.shadowColor = theme.neon;
    ctx.shadowBlur = 40;
    ctx.font = "bold 38px 'Arial'";
    ctx.fillStyle = theme.primary;
    ctx.fillText("👑 SYSTEM LORD", 420, 40);
    ctx.restore();
  }

  // ========== توقيع VOID ==========
  ctx.font = "20px 'Arial'";
  ctx.fillStyle = "rgba(255,255,255,0.2)";
  ctx.textAlign = "right";
  ctx.fillText("✦ VOID NEON CARD ✦", W - 80, H - 50);
  ctx.textAlign = "left";

  // تأثير نويز خفيف
  applyNoise(ctx, W, H);

  return canvas.toBuffer("image/png");
}

// ══════════════════════════════════════════════════════════
// بروتوتايب لرسم المستطيل المدور
// ══════════════════════════════════════════════════════════
Canvas.CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  this.moveTo(x + r, y);
  this.lineTo(x + w - r, y);
  this.quadraticCurveTo(x + w, y, x + w, y + r);
  this.lineTo(x + w, y + h - r);
  this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  this.lineTo(x + r, y + h);
  this.quadraticCurveTo(x, y + h, x, y + h - r);
  this.lineTo(x, y + r);
  this.quadraticCurveTo(x, y, x + r, y);
  return this;
};
