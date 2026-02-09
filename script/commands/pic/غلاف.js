const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "غلاف",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "ايمن",
  description: "إنشاء غلاف فيسبوك مخصص",
  commandCategory: "pic",
  usages: "[الاسم] | [العنوان] | [العنوان] | [البريد] | [الهاتف] | [اللون]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args, Users }) {
  const { threadID, messageID, senderID, mentions } = event;

  try {
    const input = args.join(" ");
    let targetID = senderID;

    if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    } else if (event.messageReply) {
      targetID = event.messageReply.senderID;
    }

    if (!input) {
      return api.sendMessage(
        "⌬ ━━ 𝗞𝗜𝗥𝗔 PIC ━━ ⌬\n\n📝 الاستخدام:\nغلاف [الاسم] | [العنوان] | [العنوان] | [البريد] | [الهاتف] | [اللون]\n\n💡 مثال:\nغلاف كيرا | مطور | سوريا | kira@bot.com | +123456 | white",
        threadID,
        messageID
      );
    }

    const parts = input.split("|").map(p => p.trim());
    const [name, subname, address, email, phone, color = "white"] = parts;

    const userName = await Users.getNameUser(targetID);
    const apiUrl = `https://catbox-mnib.onrender.com/fbcover`;
    
    const params = {
      name: name || userName,
      uid: targetID,
      address: address || "",
      email: email || "",
      subname: subname || "",
      phone: phone || "",
      color: color
    };

    const waitMsg = await api.sendMessage(
      "⌬ ━━ 𝗞𝗜𝗥𝗔 PIC ━━ ⌬\n\n⏳ جاري إنشاء الغلاف، يرجى الانتظار...",
      threadID
    );

    const response = await axios.get(apiUrl, { 
      params,
      responseType: "arraybuffer"
    });

    const cachePath = path.join(__dirname, "cache", `cover_${Date.now()}.png`);
    
    if (!fs.existsSync(path.join(__dirname, "cache"))) {
      fs.mkdirSync(path.join(__dirname, "cache"), { recursive: true });
    }

    fs.writeFileSync(cachePath, response.data);

    api.unsendMessage(waitMsg.messageID);

    await api.sendMessage(
      {
        body: "⌬ ━━ 𝗞𝗜𝗥𝗔 PIC ━━ ⌬\n\n✅ تم إنشاء الغلاف بنجاح",
        attachment: fs.createReadStream(cachePath)
      },
      threadID,
      () => fs.unlinkSync(cachePath),
      messageID
    );

  } catch (error) {
    console.error("غلاف - خطأ:", error);
    return api.sendMessage(
      `⌬ ━━ 𝗞𝗜𝗥𝗔 PIC ━━ ⌬\n\n❌ حدث خطأ أثناء إنشاء الغلاف\n📝 ${error.message}`,
      threadID,
      messageID
    );
  }
};
