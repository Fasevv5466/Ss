const { createCanvas, loadImage } = require("@napi-rs/canvas");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

// ══════════ الرتب (نيون) ══════════
const RANKS = [
  { name: "مبتدئ",   color: "#00ff66", min: 0 },       // أخضر
  { name: "محارب",   color: "#ffee00", min: 1000 },    // أصفر
  { name: "نخبة",    color: "#00bbff", min: 3000 },    // أزرق
  { name: "أسطورة",  color: "#8b5a2b", min: 6000 },    // بني
  { name: "إله",     color: "#ff0033", min: 10000 },   // أحمر
  { name: "مصور",    color: "#9b00ff", min: 15000 }    // بنفسجي
];

module.exports.config = {
  name: "بطاقة",
  version: "4.0",
  hasPermssion: 0,
  commandCategory: "profile",
  usages: ".بطاقة [منشن/رد]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, Users, Currencies }) {
  try {
    // ═══ تحديد الهدف ═══
    let uid = event.senderID;
    if (Object.keys(event.mentions).length > 0)
      uid = Object.keys(event.mentions)[0];
    else if (event.type === "message_reply")
      uid = event.messageReply.senderID;

    const name  = await Users.getNameUser(uid);
    const money = (await Currencies.getData(uid)).money || 0;
    const exp   = (await Currencies.getData(uid)).exp || 0;
    const msg   = (await Users.getData(uid)).messageCount || 0;

    // ═══ حساب الرتبة ═══
    let rank = RANKS[0];
    for (const r of RANKS) if (exp >= r.min) rank = r;
    const next = RANKS[RANKS.indexOf(rank) + 1] || rank;

    const need = Math.max(next.min - rank.min, 1);
    const cur  = exp - rank.min;
    const pct  = Math.min(cur / need, 1);

    // ═══ Canvas ═══
    const W = 1100, H = 520;
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext("2d");

    // ═══ خلفية سايبرنك حقيقية ═══
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#04000a");
    bg.addColorStop(1, "#120018");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // خطوط حمراء خفيفة (مش فاسدة)
    ctx.strokeStyle = "rgba(255,0,60,0.15)";
    ctx.lineWidth = 1;
    for (let i = 0; i < W; i += 50) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, H); ctx.stroke();
    }

    // ═══ إطار نيون ═══
    ctx.strokeStyle = rank.color;
    ctx.lineWidth = 5;
    ctx.shadowColor = rank.color;
    ctx.shadowBlur = 30;
    ctx.strokeRect(18, 18, W - 36, H - 36);
    ctx.shadowBlur = 0;

    // ═══ صورة دائرية ═══
    const avatarURL = `https://graph.facebook.com/${uid}/picture?width=512&height=512`;
    const res = await axios.get(avatarURL, { responseType: "arraybuffer" });
    const avatar = await loadImage(res.data);

    const ax = 70, ay = 130, r = 110;
    ctx.save();
    ctx.beginPath();
    ctx.arc(ax + r, ay + r, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(avatar, ax, ay, r * 2, r * 2);
    ctx.restore();

    // Glow حول الصورة
    ctx.beginPath();
    ctx.arc(ax + r, ay + r, r, 0, Math.PI * 2);
    ctx.strokeStyle = rank.color;
    ctx.lineWidth = 7;
    ctx.shadowColor = rank.color;
    ctx.shadowBlur = 35;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // ═══ النصوص ═══
    ctx.textAlign = "left";
    ctx.shadowColor = rank.color;
    ctx.shadowBlur = 15;

    ctx.font = "bold 48px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(name, 320, 150);

    ctx.font = "32px Arial";
    ctx.fillStyle = rank.color;
    ctx.fillText(`🏆 ${rank.name}`, 320, 200);

    ctx.shadowBlur = 0;

    ctx.font = "28px Arial";
    ctx.fillStyle = "#f1c40f";
    ctx.fillText(`💰 الرصيد: ${money}`, 320, 260);

    ctx.fillStyle = "#1abc9c";
    ctx.fillText(`💬 الرسائل: ${msg}`, 320, 305);

    ctx.fillStyle = "#ffffff";
    ctx.fillText(`⭐ XP: ${cur} / ${need}`, 320, 350);

    // ═══ شريط XP نيون ═══
    const bx = 320, by = 380, bw = 700, bh = 30;
    ctx.fillStyle = "#141414";
    ctx.fillRect(bx, by, bw, bh);

    const xpGrad = ctx.createLinearGradient(bx, by, bx + bw, by);
    xpGrad.addColorStop(0, rank.color);
    xpGrad.addColorStop(1, "#ffffff");

    ctx.fillStyle = xpGrad;
    ctx.shadowColor = rank.color;
    ctx.shadowBlur = 25;
    ctx.fillRect(bx, by, bw * pct, bh);
    ctx.shadowBlur = 0;

    // ═══ حفظ وإرسال ═══
    const out = path.join(__dirname, "card.png");
    fs.writeFileSync(out, canvas.toBuffer("image/png"));

    api.sendMessage(
      { body: "🩸 𝗞𝗜𝗥𝗔 𝗡𝗘𝗢𝗡 𝗖𝗔𝗥𝗗", attachment: fs.createReadStream(out) },
      event.threadID,
      () => fs.unlinkSync(out),
      event.messageID
    );

  } catch (err) {
    console.error(err);
    api.sendMessage("❌ خطأ في توليد البطاقة", event.threadID);
  }
};
