const Canvas = require("@napi-rs/canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// استيراد نظام المونجو من المسار الذي حددته
const mongodb = require(path.join(process.cwd(), "includes", "mongodb.js"));

module.exports.config = {
  name: "رانك",
  version: "3.5.0",
  hasPermssion: 0,
  credits: "ايمن",
  description: "بطاقة رانك نيون متصلة بقاعدة بيانات KiraDB",
  commandCategory: "economy",
  usages: "[@منشن]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  
  try {
    // تحديد المستهدف (منشن، رد، أو المرسل)
    let targetID = senderID;
    if (Object.keys(event.mentions).length > 0) {
      targetID = Object.keys(event.mentions)[0];
    } else if (event.type === "message_reply") {
      targetID = event.messageReply.senderID;
    }

    // جلب البيانات مباشرة من KiraDB
    const data = await mongodb.getUserData(targetID);
    
    if (!data || !data.currency) {
      return api.sendMessage("❌ لم يتم العثور على بيانات المستخدم في KiraDB!", threadID, messageID);
    }
    
    const money = data.currency.money || 0;
    const exp = data.currency.exp || 0;
    const username = data.user.name || (await api.getUserInfo(targetID))[targetID].name || "مستخدم كايرا";
    
    // حساب الرتبة
    const rankData = calculateRank(exp);
    
    api.sendMessage("🎨 جاري سحب بياناتك من KiraDB ومعالجة البطاقة...", threadID, messageID);
    
    const card = await createRankCard({
      userID: targetID,
      username: username,
      money: money,
      exp: exp,
      rankData: rankData
    });
    
    const cachePath = path.join(__dirname, "cache", `rank_${targetID}.png`);
    await fs.ensureDir(path.join(__dirname, "cache"));
    await fs.writeFile(cachePath, card);
    
    return api.sendMessage({
      body: `⌬ ━━━ 𝗞𝗜𝗥𝗔 𝗥𝗔𝗡𝗞 ━━━ ⌬\n\n👤 المستخدم: ${username}\n💰 الرصيد: ${formatNumber(money)} $\n✨ الخبرة: ${formatNumber(exp)} XP\n🏆 الرتبة: ${rankData.current.emoji} ${rankData.current.name}`,
      attachment: fs.createReadStream(cachePath)
    }, threadID, () => {
        if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
    }, messageID);
    
  } catch (error) {
    console.error("❌ خطأ:", error);
    return api.sendMessage("❌ حدث خطأ في النظام!", threadID, messageID);
  }
};

// ═══ الدوال المساعدة ═══

function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const RANKS = [
  { level: 0, name: "مبتدئ", emoji: "🔰", color: "#ffffff", minExp: 0 },
  { level: 1, name: "محارب", emoji: "⚔️", color: "#cc9900", minExp: 100 },
  { level: 2, name: "فارس", emoji: "🛡️", color: "#00ccff", minExp: 300 },
  { level: 3, name: "نخبة", emoji: "💎", color: "#9900ff", minExp: 600 },
  { level: 4, name: "بطل", emoji: "👑", color: "#ffcc00", minExp: 1000 },
  { level: 5, name: "أسطورة", emoji: "⚡", color: "#ff6600", minExp: 1500 },
  { level: 6, name: "ملك", emoji: "🔱", color: "#ff0066", minExp: 2200 },
  { level: 7, name: "إمبراطور", emoji: "🌟", color: "#ff0000", minExp: 3000 },
  { level: 8, name: "إله الحرب", emoji: "🔥", color: "#cc0000", minExp: 4000 },
  { level: 9, name: "سيد الجحيم", emoji: "😈", color: "#990000", minExp: 5500 }
];

function calculateRank(exp) {
  let rank = RANKS[0];
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (exp >= RANKS[i].minExp) { rank = RANKS[i]; break; }
  }
  const nextRank = RANKS[rank.level + 1] || rank;
  const diff = nextRank.minExp - rank.minExp;
  const progress = diff === 0 ? 100 : Math.min(((exp - rank.minExp) / diff) * 100, 100);
  return { current: rank, next: nextRank, progress: progress };
}

async function createRankCard(data) {
  const WIDTH = 1200, HEIGHT = 600;
  const canvas = Canvas.createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  // خلفية Kira النيون
  ctx.fillStyle = "#050000";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  const grad = ctx.createRadialGradient(WIDTH/2, HEIGHT/2, 0, WIDTH/2, HEIGHT/2, 900);
  grad.addColorStop(0, "rgba(150, 0, 0, 0.2)");
  grad.addColorStop(1, "black");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // صورة البروفايل
  const avatarSize = 280, xAv = 100, yAv = 150;
  try {
    const avatarUrl = `https://graph.facebook.com/${data.userID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const response = await axios.get(avatarUrl, { responseType: "arraybuffer" });
    const avatar = await Canvas.loadImage(Buffer.from(response.data));
    ctx.save();
    ctx.beginPath(); ctx.arc(xAv + avatarSize/2, yAv + avatarSize/2, avatarSize/2, 0, Math.PI*2); ctx.clip();
    ctx.drawImage(avatar, xAv, yAv, avatarSize, avatarSize);
    ctx.restore();
    ctx.strokeStyle = "#ff0000"; ctx.lineWidth = 12; ctx.shadowColor = "#ff0000"; ctx.shadowBlur = 30; ctx.stroke();
    ctx.shadowBlur = 0;
  } catch(e) { 
    ctx.fillStyle = "#220000"; ctx.beginPath(); ctx.arc(xAv+140, yAv+140, 140, 0, Math.PI*2); ctx.fill(); 
  }

  // نصوص بيضاء ساطعة (KIRA Style)
  const drawWhiteText = (text, x, y, size, color) => {
    ctx.font = `bold ${size}px Arial`;
    ctx.textAlign = "left";
    ctx.shadowColor = "#ffffff"; ctx.shadowBlur = 8;
    ctx.fillStyle = "#ffffff"; // اللون الأبيض الصافي
    ctx.fillText(text, x, y);
    ctx.shadowColor = color; ctx.shadowBlur = 15;
    ctx.fillText(text, x, y);
    ctx.shadowBlur = 0;
  };

  drawWhiteText(data.username, 450, 200, 65, "#ff0000");
  drawWhiteText(`${data.rankData.current.emoji} ${data.rankData.current.name}`, 450, 285, 50, data.rankData.current.color);

  // الإحصائيات
  ctx.font = "35px Arial";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(`💰 الرصيد: ${formatNumber(data.money)} $`, 450, 370);
  ctx.fillText(`🔥 الخبرة: ${formatNumber(data.exp)} XP`, 450, 440);

  // شريط التقدم
  const barX = 100, barY = 520, barW = 1000, barH = 40;
  ctx.fillStyle = "#110000";
  ctx.beginPath(); ctx.roundRect(barX, barY, barW, barH, 20); ctx.fill();
  
  const progressW = (data.rankData.progress / 100) * barW;
  ctx.fillStyle = "#ff0000";
  ctx.shadowColor = "#ff0000"; ctx.shadowBlur = 25;
  ctx.beginPath(); ctx.roundRect(barX, barY, progressW, barH, 20); ctx.fill();

  return canvas.toBuffer("image/png");
}
