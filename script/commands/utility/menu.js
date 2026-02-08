// ═══════════════════════════════════════════════════════════
// 👑 KIRA - الاوامر
// المطور: Ayman ♛
// الوصف: beginner
// ═══════════════════════════════════════════════════════════

const axios = require("axios");
const fs = require("fs-extra");

module.exports.config = {
  name: "الاوامر",
  aliases: [],
  version: "1.0.2",
  permission: 0,
  credits: "Ayman ♛",
  description: "beginner's guide",
  prefix: false,
  premium: false,
  commandCategory: "utility",
  usages: "[Shows Commands]",
  cooldowns: 5,
  envConfig: {
    autoUnsend: true,
    delayUnsend: 60
  }
};

module.exports.languages = {
  en: {
    moduleInfo:
      "%1\n%2\n\nطريقة الاستعمال : %3\nالفئة : %4\nالتبريد : %5 ث\n : %6\n\nالمؤلف : %7.",
    helpList:
      `هناك حوالي %1 امر و %2 فئة على ${global.config.BOTNAME} البوت`,
    user: "مستخدم",
    adminGroup: "آدمن",
    adminBot: "المطور",
  },
};

module.exports.run = async function ({ api, event, args, getText }) {
  const { commands } = global.client;
  const { threadID, messageID } = event;
  const command = commands.get((args[0] || "").toLowerCase());
  const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
  const { autoUnsend, delayUnsend } = global.configModule[this.config.name];
  const prefix = threadSetting.hasOwnProperty("PREFIX")
    ? threadSetting.PREFIX
    : global.config.PREFIX;

  if (!command) {
    const commandList = Array.from(commands.values());
    const categories = new Set(commandList.map((cmd) => cmd.config.category.toLowerCase()));
    const categoryCount = categories.size;

    const categoryNames = Array.from(categories);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(categoryNames.length / itemsPerPage);

    let currentPage = 1;
    if (args[0]) {
      const parsedPage = parseInt(args[0]);
      if (!isNaN(parsedPage) && parsedPage >= 1 && parsedPage <= totalPages) {
        currentPage = parsedPage;
      } else {
        return api.sendMessage(
          `⁉️ | ذهبت كثيرا اختر رقما بين 1 و ${totalPages}.`,
          threadID,
          messageID
        );
      }
    }

    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const visibleCategories = categoryNames.slice(startIdx, endIdx);

    let msg = "";
    for (let i = 0; i < visibleCategories.length; i++) {
      const category = visibleCategories[i];
      const categoryCommands = commandList.filter(
        (cmd) => cmd.config.category.toLowerCase() === category
      );
      const commandNames = categoryCommands.map((cmd) => cmd.config.name);
      msg += `${category.charAt(0).toLowerCase() + category.slice(1)}:\n${commandNames.join("\n")}\n\n⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\n\n`;
    }

    msg += `الــصــفــحــة ${currentPage}/${totalPages}\n\n`;
    
    const imagePath = __dirname + "/cache/menu.png";
    const imageUrl = "https://i.ibb.co/XkS4MRF/947fe622ad70647c3aafbc9f3e8aefee.jpg";

    // Download the image
    const { data } = await axios.get(imageUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(imagePath, Buffer.from(data, "utf-8"));

    // Send the message with the image attachment
    api.sendMessage({
      body: `${global.config.BOTNAME} menu :\n\n${msg}`,
      attachment: fs.createReadStream(imagePath)
    }, threadID, async (error, info) => {
      fs.unlinkSync(imagePath); // Remove the image file
      if (autoUnsend) {
        await new Promise(resolve => setTimeout(resolve, delayUnsend * 1000));
        return api.unsendMessage(info.messageID);
      }
    }, messageID);
  }
};
