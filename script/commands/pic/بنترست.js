const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "بنترست",
  version: "1.1.0",
  hasPermssion: 0,
  credits: "ايمن",
  description: "البحث عن صور من Pinterest باستخدام API مستقر",
  commandCategory: "pic",
  usages: "[كلمة البحث] [العدد]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;

  // تحسين جلب المدخلات
  let keySearch, numberImages;
  if (!isNaN(args[args.length - 1])) {
    numberImages = parseInt(args.pop());
    keySearch = args.join(" ");
  } else {
    keySearch = args.join(" ");
    numberImages = 6; // العدد الافتراضي
  }

  if (!keySearch) {
    return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 PIC ━━ ⌬\n\n📝 الاستخدام: بنترست [كلمة البحث] [العدد]\n\n💡 مثال: بنترست ليفاي 10", threadID, messageID);
  }

  if (numberImages > 10) numberImages = 10; // تقليل العدد لضمان سرعة الرفع وعدم الحظر

  try {
    const waitMsg = await api.sendMessage(`⏳ جاري البحث عن "${keySearch}" في بنترست...`, threadID);

    // استخدام API بديل ومستقر
    const res = await axios.get(`https://api.kenliejugar.com/pinterestsearch/?search=${encodeURIComponent(keySearch)}`);
    const data = res.data.data; // تعديل حسب استجابة الـ API الجديد

    if (!data || data.length === 0) {
      return api.sendMessage(`❌ لم يتم العثور على نتائج لـ "${keySearch}"`, threadID, messageID);
    }

    const attachments = [];
    const cacheDir = path.join(__dirname, "cache", `pin_${Date.now()}`);
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    const limit = Math.min(data.length, numberImages);

    for (let i = 0; i < limit; i++) {
      const imagePath = path.join(cacheDir, `${i}.jpg`);
      const imgRes = await axios.get(data[i], { responseType: "arraybuffer" });
      fs.writeFileSync(imagePath, Buffer.from(imgRes.data, "utf-8"));
      attachments.push(fs.createReadStream(imagePath));
    }

    api.unsendMessage(waitMsg.messageID);

    await api.sendMessage({
      body: `⌬ ━━ 𝗞𝗜𝗥𝗔 PIC ━━ ⌬\n\n✅ تم العثور على ${limit} صورة\n🔍 البحث: ${keySearch}`,
      attachment: attachments
    }, threadID, () => fs.removeSync(cacheDir), messageID);

  } catch (error) {
    console.error(error);
    return api.sendMessage(`❌ حدث خطأ: الـ API الخارجي لا يستجيب حالياً.\n📝 ${error.message}`, threadID, messageID);
  }
};
