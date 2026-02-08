// ═══════════════════════════════════════════════════════════
// 👑 KIRA - ايدي
// المطور: Ayman ♛
// الوصف: عرض بطاقة الهوية الملكية الخاصة بك
// ═══════════════════════════════════════════════════════════

const fs = require("fs-extra");
const axios = require("axios");
const { join } = require("path");

function getRank(exp) {
  if (exp >= 100000) return '🥇 إمبراطور مـبـجـل';
  if (exp >= 50000) return '🥈 مـلـك الـتـفـاعـل';
  if (exp >= 20000) return '👑 أسـطـوري';
  if (exp >= 10000) return '💎 نـخـبـة الـمـجـتـمـع';
  if (exp >= 5000) return '🔥 مـتـفـاعـل حـارق';
  if (exp >= 2000) return '⚡ نـشـط جـداً';
  if (exp >= 1000) return '🏅 مـتـفـاعـل جـيـد';
  if (exp >= 500) return '✨ بـدايـة مـتـألـقـة';
  if (exp >= 100) return '🗿 صـنـم مـتـحـرك';
  return '⚰️ مـيـت سـريـرياً';
}

module.exports.config = {
  name: "ايدي",
  aliases: [],
  version: "2.5.0",
  hasPermssion: 0,
  credits: "Ayman ♛",
  description: "عرض بطاقة الهوية الملكية الخاصة بك",
  commandCategory: "games",
  cooldowns: 2,
  dependencies: {
    "axios": "",
    "fs-extra": ""
  }
};

module.exports.run = async function ({ api, event, Currencies, Users }) {
  const { threadID, messageID, senderID, type, messageReply } = event;
  
  // تحديد الأيدي المطلوب (صاحب الرسالة أو الشخص الذي تم الرد عليه)
  const id = type == "message_reply" ? messageReply.senderID : senderID;

  // وضع تفاعل التحميل
  api.setMessageReaction("💳", messageID, () => {}, true);

  try {
    const infoUser = await Users.getData(id);
    const name = infoUser.name;
    const userData = await Currencies.getData(id);
    const exp = userData.exp || 0;
    const money = userData.money || 0;
    const rank = getRank(exp);

    // جلب بيانات البنك (إذا كان لديك نظام بنك)
    const bankPath = join(__dirname, 'banking', 'banking.json');
    let bankMoney = 0;
    if (fs.existsSync(bankPath)) {
      const bankData = JSON.parse(fs.readFileSync(bankPath, "utf-8"));
      const userBank = bankData.find(u => u.senderID === id);
      bankMoney = userBank ? userBank.money : 0;
    }

    const pathImg = join(__dirname, "cache", `avatar_${id}.png`);
    const avatarUrl = `https://graph.facebook.com/${id}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

    // جلب الصورة باستخدام axios (أسرع وأكثر استقراراً)
    const response = await axios.get(avatarUrl, { responseType: 'arraybuffer' });
    fs.writeFileSync(pathImg, Buffer.from(response.data, 'binary'));

    const msg = `◈ ───『 الـهـويـة الـمـلـكـيـة 👤 』─── ◈\n\n` +
                `◯ الإسـم: ${name}\n` +
                `🆔 الآيـدي: ${id}\n` +
                `✉️ الـرسـائـل: [ ${exp} ]\n` +
                `🏆 الـرتبـة: ${rank}\n` +
                `💵 الـكـاش: ${money} $\n` +
                `🏦 الـبـنـك: ${bankMoney} $\n\n` +
                `———————————————\n` +
                `│←› بـأوامـر: الـتـوب أيـمـن 👑`;

    api.setMessageReaction("✅", messageID, () => {}, true);

    return api.sendMessage({
      body: msg,
      attachment: fs.createReadStream(pathImg)
    }, threadID, () => {
      if (fs.existsSync(pathImg)) fs.unlinkSync(pathImg);
    }, messageID);

  } catch (error) {
    console.error(error);
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage("⚠️ عذراً سيدي، فشلت في استخراج بيانات الهوية حالياً.", threadID, messageID);
  }
};
