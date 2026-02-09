const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "نسخ",
  version: "1.0.0",
  hasPermssion: 2,
  credits: "ايمن",
  description: "نسخ احتياطي لبيانات البوت",
  commandCategory: "admin",
  usages: "نسخ",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
  const { threadID, messageID } = event;

  try {
    const tmpDir = path.join(__dirname, "tmp");
    
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    const threadsPath = path.join(tmpDir, "threads.json");
    const usersPath = path.join(tmpDir, "users.json");
    const currenciesPath = path.join(tmpDir, "currencies.json");

    const threadsData = {};
    const usersData = {};
    const currenciesData = {};

    for (const [tid, data] of Object.entries(global.data.allThreadID || {})) {
      threadsData[tid] = data;
    }

    for (const [uid, data] of Object.entries(global.data.allUserID || {})) {
      usersData[uid] = data;
    }

    for (const [uid, money] of Object.entries(global.data.currencies || {})) {
      currenciesData[uid] = money;
    }

    fs.writeFileSync(threadsPath, JSON.stringify(threadsData, null, 2));
    fs.writeFileSync(usersPath, JSON.stringify(usersData, null, 2));
    fs.writeFileSync(currenciesPath, JSON.stringify(currenciesData, null, 2));

    const files = [
      fs.createReadStream(threadsPath),
      fs.createReadStream(usersPath),
      fs.createReadStream(currenciesPath)
    ];

    await api.sendMessage(
      {
        body: "⌬ ━━ 𝗞𝗜𝗥𝗔 ADMIN ━━ ⌬\n\n✅ تم إنشاء النسخة الاحتياطية بنجاح\n\n📦 الملفات:\n• threads.json - بيانات المجموعات\n• users.json - بيانات المستخدمين\n• currencies.json - بيانات العملات",
        attachment: files
      },
      threadID,
      () => {
        fs.unlinkSync(threadsPath);
        fs.unlinkSync(usersPath);
        fs.unlinkSync(currenciesPath);
      },
      messageID
    );

  } catch (error) {
    console.error("نسخ - خطأ:", error);
    return api.sendMessage(
      `⌬ ━━ 𝗞𝗜𝗥𝗔 ADMIN ━━ ⌬\n\n❌ فشل إنشاء النسخة الاحتياطية\n📝 ${error.message}`,
      threadID,
      messageID
    );
  }
};
