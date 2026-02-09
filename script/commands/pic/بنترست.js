const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "بنترست",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "ايمن",
  description: "البحث عن صور من Pinterest",
  commandCategory: "pic",
  usages: "[كلمة البحث] [العدد]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;

  const keySearch = args.slice(0, -1).join(" ");
  const numberImages = parseInt(args[args.length - 1]) || 5;

  if (!keySearch) {
    return api.sendMessage(
      "⌬ ━━ 𝗞𝗜𝗥𝗔 PIC ━━ ⌬\n\n📝 الاستخدام: بنترست [كلمة البحث] [العدد]\n\n💡 مثال: بنترست cat 10",
      threadID,
      messageID
    );
  }

  if (numberImages > 20) {
    return api.sendMessage(
      "⌬ ━━ 𝗞𝗜𝗥𝗔 PIC ━━ ⌬\n\n⚠️ العدد الأقصى للصور هو 20",
      threadID,
      messageID
    );
  }

  try {
    const waitMsg = await api.sendMessage(
      `⌬ ━━ 𝗞𝗜𝗥𝗔 PIC ━━ ⌬\n\n⏳ جاري البحث عن "${keySearch}"...`,
      threadID
    );

    const apiUrl = `https://catbox-mnib.onrender.com/pinterest`;
    const { data } = await axios.get(apiUrl, {
      params: { 
        query: keySearch,
        count: numberImages
      }
    });

    api.unsendMessage(waitMsg.messageID);

    if (!data || !data.images || data.images.length === 0) {
      return api.sendMessage(
        `⌬ ━━ 𝗞𝗜𝗥𝗔 PIC ━━ ⌬\n\n❌ لم يتم العثور على صور لـ "${keySearch}"`,
        threadID,
        messageID
      );
    }

    const attachments = [];
    const cacheDir = path.join(__dirname, "cache");
    
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    for (let i = 0; i < data.images.length; i++) {
      const imageUrl = data.images[i];
      const imagePath = path.join(cacheDir, `pinterest_${Date.now()}_${i}.jpg`);
      
      const imageResponse = await axios.get(imageUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(imagePath, imageResponse.data);
      
      attachments.push(fs.createReadStream(imagePath));
    }

    await api.sendMessage(
      {
        body: `⌬ ━━ 𝗞𝗜𝗥𝗔 PIC ━━ ⌬\n\n✅ تم العثور على ${data.images.length} صورة\n🔍 البحث: ${keySearch}`,
        attachment: attachments
      },
      threadID,
      () => {
        attachments.forEach((_, i) => {
          const filePath = path.join(cacheDir, `pinterest_${Date.now()}_${i}.jpg`);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        });
      },
      messageID
    );

  } catch (error) {
    console.error("بنترست - خطأ:", error);
    return api.sendMessage(
      `⌬ ━━ 𝗞𝗜𝗥𝗔 PIC ━━ ⌬\n\n❌ حدث خطأ أثناء البحث\n📝 ${error.message}`,
      threadID,
      messageID
    );
  }
};

