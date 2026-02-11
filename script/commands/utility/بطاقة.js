const { createCanvas, loadImage } = require("@napi-rs/canvas");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const RANKS = [
  { name: "مبتدئ", color: "#00ff00", min: 0 },       // أخضر نيون
  { name: "محارب", color: "#ffff00", min: 1000 },    // أصفر نيون
  { name: "نخبة", color: "#00bfff", min: 3000 },     // أزرق نيون
  { name: "أسطورة", color: "#8b4513", min: 6000 },   // بني نيون
  { name: "إله", color: "#ff0000", min: 10000 },     // أحمر نيون
  { name: "مصور", color: "#8000ff", min: 15000 }     // بنفسجي نيون
];

module.exports.config = {
  name: "بطاقة",
  version: "3.1",
  hasPermssion: 0,
  commandCategory: "profile",
  usages: ".بطاقة [منشن/رد]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, Users, Currencies }) {
  try {
    let uid = event.senderID;
    if (Object.keys(event.mentions).length > 0)
      uid = Object.keys(event.mentions)[0];
    else if (event.type === "message_reply")
      uid = event.messageReply.senderID;

    const name = await Users.getNameUser(uid);
    const money = (await Currencies.getData(uid)).money || 0;
    const exp = (await Currencies.getData(uid)).exp || 0;
    const msg = (await Users.getData(uid)).messageCount || 0;

    // حساب الرتبة
    let rank = RANKS[0];
    for (let r of RANKS) if (exp >= r.min) rank = r;
    const next = RANKS[RANKS.indexOf(rank) + 1] || rank;
    const maxExp = next.min - rank.min || 1000;
    const curExp = exp - rank.min;
    const percent = Math.min(curExp / maxExp, 1);

    // Canvas
    const W = 1100, H = 550;
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext("2d");

    // خلفية سايبرنك متدرجة
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#050008");
    bg.addColorStop(1, "#1a0018");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // خطوط سايبرنك خلفية
    ctx.strokeStyle = "#ff0055";
    ctx.lineWidth = 2;
    for (let i = 0; i < W; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, H);
      ctx.stroke();
    }
    for (let i = 0; i < H; i += 40) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(W, i);
      ctx.stroke();
    }

    // صورة دائرية
    const avatarURL = `https://graph.facebook.com/${uid}/picture?width=512&height=512`;
    const res = await axios.get(avatarURL, { responseType: "arraybuffer" });
    const avatar = await loadImage(res.data);

    const ax = 70, ay = 150, r = 120;
    ctx.save();
    ctx.beginPath();
    ctx.arc(ax + r, ay + r, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(avatar, ax, ay, r * 2, r * 2);
    ctx.restore();

    // Glow حول الصورة
    ctx.strokeStyle = rank.color;
    ctx.lineWidth = 8;
    ctx.shadowColor = rank.color;
    ctx.shadowBlur = 35;
    ctx.beginPath();
    ctx.arc(ax + r, ay + r, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // نصوص
    ctx.font = "bold 50px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = rank.color;
    ctx.shadowBlur = 10;
    ctx.fillText(name, 320, 160);

    ctx.font = "35px Arial";
    ctx.fillStyle = rank.color;
    ctx.fillText(`🏆 ${rank.name}`, 320, 220);

    ctx.fillStyle = "#f1c40f";
    ctx.fillText(`💰 ${money}`, 320, 280);

    ctx.fillStyle = "#1abc9c";
    ctx.fillText(`💬 ${msg} رسالة`, 320, 330);

    ctx.fillStyle = "#ffffff";
    ctx.fillText(`⭐ XP ${curExp} / ${maxExp}`, 320, 390);

    // شريط XP متدرج Neon
    const bx = 320, by = 410, bw = 700, bh = 35;
    const grad = ctx.createLinearGradient(bx, by, bx + bw, by);
    grad.addColorStop(0, "#ff00ff");
    grad.addColorStop(0.5, "#00ffff");
    grad.addColorStop(1, "#ffff00");

    ctx.fillStyle = "#1e1e2e";
    ctx.fillRect(bx, by, bw, bh);

    ctx.fillStyle = grad;
    ctx.shadowColor = rank.color;
    ctx.shadowBlur = 25;
    ctx.fillRect(bx, by, bw * percent, bh);
    ctx.shadowBlur = 0;

    // حفظ وإرسال
    const out = path.join(__dirname, "card.png");
    fs.writeFileSync(out, canvas.toBuffer("image/png"));

    api.sendMessage(
      { body: "🩸 بطاقتك السايبرية الجديدة", attachment: fs.createReadStream(out) },
      event.threadID,
      () => fs.unlinkSync(out),
      event.messageID
    );

  } catch (e) {
    console.error(e);
    api.sendMessage("❌ خطأ بالبطاقة", event.threadID);
  }
};
