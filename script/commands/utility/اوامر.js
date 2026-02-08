const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "اوامر",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "عرض جميع أوامر البوت تلقائياً ومقسّمة حسب الفئات",
  commandCategory: "system",
  usages: ".اوامر",
  cooldowns: 5
};

// 📂 قراءة الملفات بشكل递归
function getAllCommandFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllCommandFiles(fullPath, fileList);
    } else if (file.endsWith(".js")) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;

  const commandsPath = path.join(__dirname, ".."); 
  const files = getAllCommandFiles(commandsPath);

  const categories = {};

  for (const file of files) {
    try {
      delete require.cache[require.resolve(file)];
      const cmd = require(file);

      if (!cmd.config || !cmd.config.name) continue;

      const category = cmd.config.commandCategory || "غير مصنّف";

      if (!categories[category]) {
        categories[category] = [];
      }

      categories[category].push(cmd.config.name);
    } catch (e) {
      continue;
    }
  }

  let msg = "◈ ───『 📜 أوامر البوت 』─── ◈\n\n";

  for (const category of Object.keys(categories).sort()) {
    msg += `◯ ${category}\n`;
    for (const name of categories[category].sort()) {
      msg += `│ • .${name}\n`;
    }
    msg += "│\n";
  }

  msg += "◈ ────────────── ◈";

  return api.sendMessage(msg, threadID, messageID);
};
