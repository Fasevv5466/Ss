const Canvas = require("@napi-rs/canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const mongodb = require(path.join(process.cwd(), "includes", "mongodb.js"));

module.exports.config = {
  name: "بنك",
  version: "16.0.0",
  hasPermssion: 0,
  credits: "VOID SYSTEM",
  description: "Void Neon Emperor Card",
  commandCategory: "games",
  usages: "[@منشن]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID, senderID } = event;

  try {
    let targetID = senderID;

    if (Object.keys(event.mentions).length > 0)
      targetID = Object.keys(event.mentions)[0];
    else if (event.type === "message_reply")
      targetID = event.messageReply.senderID;

    const data = await mongodb.getUserData(targetID);
    if (!data || !data.currency)
      return api.sendMessage("❌ لا توجد بيانات.", threadID, messageID);

    const { currency, calculated } = data;
    const userInfo = await api.getUserInfo(targetID);

    const username =
      data.user?.name ||
      userInfo[targetID]?.name ||
      "USER";

    const isDeveloper =
      global.config.ADMINBOT &&
      global.config.ADMINBOT.includes(targetID);

    const exp = currency.exp || 0;
    const expNeeded = calculated?.expNeeded || 100;
    const progress = Math.min(
      Math.floor((exp / expNeeded) * 100),
      100
    );

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

    const cachePath = path.join(__dirname, `bank_${targetID}.png`);
    await fs.writeFile(cachePath, card);

    return api.sendMessage(
      { attachment: fs.createReadStream(cachePath) },
      threadID,
      () => fs.unlinkSync(cachePath),
      messageID
    );

  } catch (e) {
    console.log(e);
    api.sendMessage("❌ Error", threadID, messageID);
  }
};

function getTheme(rank, isDev) {
  if (isDev)
    return { primary: "#a855f7", neon: "#e879f9" };

  switch (rank) {
    case "مبتدئ":
      return { primary: "#22c55e", neon: "#4ade80" };
    case "محارب":
      return { primary: "#eab308", neon: "#fde047" };
    case "فارس":
      return { primary: "#0ea5e9", neon: "#38bdf8" };
    case "نخبة":
      return { primary: "#a16207", neon: "#d97706" };
    case "بطل":
      return { primary: "#ef4444", neon: "#f87171" };
    default:
      return { primary: "#22c55e", neon: "#4ade80" };
  }
}

async function createCard(data) {
  const W = 1400;
  const H = 550;
  const canvas = Canvas.createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  const theme = getTheme(data.rank, data.isDeveloper);

  // ═════════════════ BACKGROUND ═════════════════
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#050507");
  bg.addColorStop(1, "#0f172a");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // خطوط شبكة خفيفة
  ctx.strokeStyle = "rgba(255,255,255,0.03)";
  for (let i = 0; i < W; i += 40) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, H);
    ctx.stroke();
  }

  // ═════════════════ إطار زجاجي ═════════════════
  ctx.fillStyle = "rgba(255,255,255,0.03)";
  ctx.fillRect(40, 40, W - 80, H - 80);

  ctx.strokeStyle = theme.primary;
  ctx.lineWidth = 4;
  ctx.shadowColor = theme.neon;
  ctx.shadowBlur = 30;
  ctx.strokeRect(40, 40, W - 80, H - 80);
  ctx.shadowBlur = 0;

  // ═════════════════ صورة البروفايل (بنفس طريقتك) ═════════════════
  try {
    const avatarURL = `https://graph.facebook.com/${data.userID}/picture?width=512&height=512`;
    const res = await axios.get(avatarURL, {
      responseType: "arraybuffer"
    });

    const avatar = await Canvas.loadImage(res.data);

    ctx.save();
    ctx.beginPath();
    ctx.arc(220, 275, 130, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(avatar, 90, 145, 260, 260);
    ctx.restore();

    ctx.strokeStyle = theme.primary;
    ctx.lineWidth = 8;
    ctx.shadowColor = theme.neon;
    ctx.shadowBlur = 25;
    ctx.beginPath();
    ctx.arc(220, 275, 130, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;

  } catch (err) {
    console.log("Avatar error:", err);
  }

  // ═════════════════ الاسم ═════════════════
  ctx.font = "bold 60px Arial";
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = theme.neon;
  ctx.shadowBlur = 25;
  ctx.fillText(data.username, 420, 170);
  ctx.shadowBlur = 0;

  // رتبة
  ctx.font = "bold 30px Arial";
  ctx.fillStyle = theme.primary;
  ctx.fillText(`RANK : ${data.rank}`, 420, 220);

  // بيانات
  ctx.font = "bold 28px Arial";
  ctx.fillStyle = "#cccccc";

  ctx.fillText(`LEVEL : ${data.level}`, 420, 280);
  ctx.fillText(`XP : ${data.exp}`, 420, 320);
  ctx.fillText(`BANK : ${data.money}$`, 420, 360);
  ctx.fillText(`MSG : ${data.msg}`, 420, 400);

  // ═════════════════ XP BAR متوهج ═════════════════
  const barX = 420;
  const barY = 440;
  const barW = 800;
  const barH = 35;

  ctx.fillStyle = "#111";
  ctx.fillRect(barX, barY, barW, barH);

  const fillW = (data.progress / 100) * barW;

  const grad = ctx.createLinearGradient(barX, barY, barX + fillW, barY);
  grad.addColorStop(0, theme.neon);
  grad.addColorStop(1, theme.primary);

  ctx.fillStyle = grad;
  ctx.shadowColor = theme.neon;
  ctx.shadowBlur = 20;
  ctx.fillRect(barX, barY, fillW, barH);
  ctx.shadowBlur = 0;

  ctx.strokeStyle = theme.primary;
  ctx.lineWidth = 2;
  ctx.strokeRect(barX, barY, barW, barH);

  ctx.font = "bold 24px Arial";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(`${data.progress}%`, barX + barW + 20, barY + 25);

  if (data.isDeveloper) {
    ctx.font = "bold 35px Arial";
    ctx.fillStyle = theme.primary;
    ctx.fillText("👑 SYSTEM OWNER", 420, 110);
  }

  return canvas.toBuffer("image/png");
}
