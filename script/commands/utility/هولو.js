const { createCanvas, loadImage } = require("@napi-rs/canvas");
const GIFEncoder = require("gifencoder");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const RANKS = [
  { name: "مبتدئ", color: "#00ff00", min: 0 },
  { name: "محارب", color: "#ffff00", min: 1000 },
  { name: "نخبة", color: "#00ffff", min: 3000 },
  { name: "أسطورة", color: "#8b4513", min: 6000 },
  { name: "إله", color: "#ff0000", min: 10000 },
  { name: "مصور", color: "#800080", min: 15000 }
];

module.exports.config = {
  name: "بطاقة-نيون-هولوجرام",
  version: "2.0",
  hasPermssion: 0,
  commandCategory: "profile",
  usages: ".بطاقة-هولوجرام [منشن/رد]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, Users, Currencies }) {
  try {
    let uid = event.senderID;
    if (Object.keys(event.mentions).length > 0) uid = Object.keys(event.mentions)[0];
    else if (event.type === "message_reply") uid = event.messageReply.senderID;

    const name = await Users.getNameUser(uid);
    const money = (await Currencies.getData(uid)).money || 0;
    const exp = (await Currencies.getData(uid)).exp || 0;
    const msg = (await Users.getData(uid)).messageCount || 0;

    let rank = RANKS[0];
    for (let r of RANKS) if (exp >= r.min) rank = r;
    const next = RANKS[RANKS.indexOf(rank) + 1] || rank;
    const maxExp = next.min - rank.min || 1000;
    const curExp = exp - rank.min;
    const percent = Math.min(curExp / maxExp, 1);

    const avatarURL = `https://graph.facebook.com/${uid}/picture?width=512&height=512`;
    const res = await axios.get(avatarURL, { responseType: "arraybuffer" });
    const avatar = await loadImage(res.data);

    const W = 1200, H = 600;
    const encoder = new GIFEncoder(W, H);
    const gifPath = path.join(__dirname, `card_ultra_${uid}.gif`);
    const stream = fs.createWriteStream(gifPath);
    encoder.createReadStream().pipe(stream);
    encoder.start();
    encoder.setRepeat(0);
    encoder.setDelay(100);
    encoder.setQuality(8);

    const frames = 12;

    for (let f = 0; f < frames; f++) {
      const canvas = createCanvas(W, H);
      const ctx = canvas.getContext("2d");

      // ===== خلفية Hologram Neon =====
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, "#050014");
      grad.addColorStop(1, "#1a001f");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // ===== خطوط ديناميكية Hologram =====
      ctx.strokeStyle = "#ff00ff";
      ctx.lineWidth = 1 + f%3;
      for(let i=0;i<10;i++){
        ctx.beginPath();
        ctx.moveTo(Math.random()*W, Math.random()*H);
        ctx.lineTo(Math.random()*W, Math.random()*H);
        ctx.stroke();
      }

      // ===== Avatar دائري + Glow + Lightning =====
      const ax = 80, ay = 160, r = 130;
      ctx.save();
      ctx.beginPath();
      ctx.arc(ax + r, ay + r, r, 0, Math.PI*2);
      ctx.clip();
      ctx.drawImage(avatar, ax, ay, r*2, r*2);
      ctx.restore();

      // Glow + Lightning حول الصورة
      ctx.strokeStyle = rank.color;
      ctx.lineWidth = 8;
      ctx.shadowColor = rank.color;
      ctx.shadowBlur = 25 + f*2;
      ctx.beginPath();
      ctx.arc(ax + r, ay + r, r, 0, Math.PI*2);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // ===== نصوص Neon Glitch =====
      const glitch = [-2,0,2];
      const drawText = (text,x,y,size,color)=>{
        ctx.font = `bold ${size}px Arial`;
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = color;
        ctx.shadowBlur = 18 + f*1.5;
        glitch.forEach(o=>{
          ctx.fillText(text, x+o, y+Math.random()*3);
        });
        ctx.shadowBlur = 0;
      };

      drawText(`🏦 ${name}`, 350, 180, 52, rank.color);
      drawText(`🏆 ${rank.name}`, 350, 240, 40, rank.color);
      drawText(`💰 ${money}`, 350, 300, 40, rank.color);
      drawText(`💬 ${msg} رسالة`, 350, 360, 40, rank.color);
      drawText(`⭐ XP ${curExp} / ${maxExp}`, 350, 420, 40, rank.color);

      // ===== شريط XP Neon Pulse =====
      const bx=350, by=450, bw=720, bh=38;
      ctx.fillStyle = "#1e1e2e";
      ctx.fillRect(bx, by, bw, bh);

      const barGrad = ctx.createLinearGradient(bx, by, bx+bw, by);
      barGrad.addColorStop(0, "#ff0000");
      barGrad.addColorStop(0.2, "#ff9900");
      barGrad.addColorStop(0.4, "#ffff00");
      barGrad.addColorStop(0.6, "#00ff00");
      barGrad.addColorStop(0.8, "#00ffff");
      barGrad.addColorStop(1, "#ff00ff");

      ctx.fillStyle = barGrad;
      ctx.shadowColor = "#ffffff";
      ctx.shadowBlur = 15 + f*2;
      ctx.fillRect(bx, by, bw*percent, bh);
      ctx.shadowBlur = 0;

      encoder.addFrame(ctx);
    }

    encoder.finish();

    stream.on("finish",()=>{
      api.sendMessage(
        { body: "🌌 بطاقة Hologram Neon Cyberpunk متحركة بالكامل", attachment: fs.createReadStream(gifPath) },
        event.threadID,
        ()=>fs.unlinkSync(gifPath),
        event.messageID
      );
    });

  } catch(e){
    console.error(e);
    api.sendMessage("❌ خطأ بالبطاقة ULTRA", event.threadID);
  }
};
