// ═══════════════════════════════════════════════════════════
// 👑 KIRA - رصيدي
// المطور: Ayman ♛
// الوصف: الاستعلام عن الرصيد بالهوية الرقمية الفخمة (منشن/رد/مرسل)
// ═══════════════════════════════════════════════════════════

const fs = require("fs-extra");
const { createCanvas, loadImage, registerFont } = require("canvas");
const axios = require("axios");

module.exports.config = {
  name: "رصيدي",
  aliases: [],
  version: "3.0.0",
  hasPermssion: 0,
  credits: "Ayman ♛",
  description: "الاستعلام عن الرصيد بالهوية الرقمية الفخمة (منشن/رد/مرسل)",
  commandCategory: "utility",
  usages: "[منشن / رد]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args, Currencies, Users }) {
  const { threadID, messageID, senderID, mentions, type, messageReply } = event;

  // تحديد الشخص المستهدف
  let targetID = senderID;
  if (type == "message_reply") targetID = messageReply.senderID;
  else if (Object.keys(mentions).length > 0) targetID = Object.keys(mentions)[0];

  const isTopAdmin = global.config.ADMINBOT.includes(targetID);

  // جلب بيانات المستخدم
  const userData = await Users.getData(targetID);
  const name = userData.name;
  const userMoney = isTopAdmin ? "∞" : ((await Currencies.getData(targetID)).money || 0).toLocaleString() + "$";

  // مسار الصورة
  const pathImg = __dirname + `/cache/balance_${targetID}.png`;

  try {
    // تحميل الخلفية
    if (!fs.existsSync(pathImg)) {
      const bg = (await axios.get("https://i.postimg.cc/j50RwyQd/received-1527894564687842.jpg", { responseType: "arraybuffer" })).data;
      fs.writeFileSync(pathImg, Buffer.from(bg, "utf-8"));
    }

    const bgImg = await loadImage(pathImg);
    const canvas = createCanvas(bgImg.width, bgImg.height);
    const ctx = canvas.getContext("2d");

    // تحميل الخط إذا لم يكن موجود
    const fontPath = __dirname + '/cache/SplineSans-Medium.ttf';
    if (!fs.existsSync(fontPath)) {
      const fontData = (await axios.get("https://drive.google.com/u/0/uc?id=102B8O3_0vTn_zla13wzSzMa-vdTZOCmp&export=download", { responseType: "arraybuffer" })).data;
      fs.writeFileSync(fontPath, Buffer.from(fontData, "utf-8"));
    }
    registerFont(fontPath, { family: "SplineSans-Medium" });

    // رسم الصورة
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
    ctx.font = "50px SplineSans-Medium";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText(userMoney, canvas.width/2, 267);

    const imageBuffer = canvas.toBuffer();
    fs.writeFileSync(pathImg, imageBuffer);

    const msg = `◈ ───『 الـهـويـة الـمـالـيـة 』─── ◈\n\n` +
                `👤 الاسـم: ${name}\n` +
                `💰 الرصيد: ${userMoney}\n` +
                `🏛️ الرتبة: ${isTopAdmin ? "الـتـوب ايـمـن 👑" : "مواطن"}\n\n` +
                ` ———————————————\n` +
                `│←› بـإدارة الـتـوب ايـمـن 👑\n` +
                `◈ ──────────────── ◈`;

    await api.sendMessage({ body: msg, attachment: fs.createReadStream(pathImg) }, threadID, () => fs.unlinkSync(pathImg), messageID);

  } catch (err) {
    return api.sendMessage("❌ حدث خطأ أثناء استخراج البطاقة المالية.", threadID, messageID);
  }
};
