    module.exports.config = {
  name: "اوامر",
  version: "10.2.0",
  hasPermssion: 0,
  credits: "ayman",
  description: "قائمة الأوامر بنظام الرد المباشر - نسخة نظيفة",
  commandCategory: "utility",
  usages: "[اوامر]",
  cooldowns: 5
};

const heavy = (text) => {
    const keys = {"A":"𝗔","B":"Ｂ","C":"Ｃ","D":"Ｄ","E":"Ｅ","F":"Ｆ","G":"Ｇ","H":"Ｈ","I":"Ｉ","J":"Ｊ","K":"Ｋ","L":"Ｌ","M":"Ｍ","N":"Ｎ","O":"Ｏ","P":"Ｐ","Q":"Ｑ","R":"Ｒ","S":"Ｓ","T":"Ｔ","U":"Ｕ","V":"Ｖ","W":"Ｗ","X":"Ｘ","Y":"Ｙ","Z":"Ｚ","a":"ａ","b":"ｂ","c":"ｃ","d":"ｄ","e":"ｅ","f":"ｆ","g":"ｇ","h":"ｈ","i":"ｉ","j":"ｊ","k":"ｋ","l":"ｌ","m":"ｍ","n":"ｎ","o":"ｏ","p":"ｐ","q":"ｑ","r":"ｒ","s":"ｓ","t":"ｔ","u":"ｕ","v":"ｖ","w":"ｗ","x":"ｘ","y":"ｙ","z":"ｚ","0":"𝟬","1":"𝟭","2":"𝟮","3":"𝟯","4":"𝟰","5":"𝟱","6":"𝟲","7":"𝟳","8":"𝟴","9":"𝟵"};
    return text.toString().split("").map(char => keys[char] || char).join("");
};

module.exports.handleReply = async function({ api, event, handleReply }) {
  const { threadID, messageID, body, senderID } = event;
  if (senderID !== handleReply.author) return;

  const categories = {
    "1": { id: "fun", name: "الترفيه" },
    "2": { id: "admin", name: "الإدارة" },
    "3": { id: "developer", name: "المطور" },
    "4": { id: "games", name: "الألعاب" },
    "5": { id: "media", name: "الوسائط" },
    "6": { id: "pic", name: "الصور" },
    "7": { id: "utility", name: "الخدمات" }
  };

  if (body.toLowerCase() === "رجوع") {
     api.unsendMessage(handleReply.messageID);
     return module.exports.run({ api, event });
  }

  const choice = categories[body];
  if (!choice) return;

  const allCommands = Array.from(global.client.commands.values());
  const categoryCommands = allCommands
    .filter(cmd => cmd.config.commandCategory.toLowerCase() === choice.id.toLowerCase())
    .map(cmd => cmd.config.name);

  if (categoryCommands.length === 0) return api.sendMessage(`لا توجد أوامر في فئة ${choice.name}`, threadID, messageID);

  const msg = `--- ${heavy(choice.name.toUpperCase())} ---\n\n` +
              `${categoryCommands.join(" - ")}\n\n` +
              `عدد الأوامر: ${categoryCommands.length}\n` +
              `للعودة أرسل: رجوع`;

  api.unsendMessage(handleReply.messageID);
  return api.sendMessage(msg, threadID, (err, info) => {
    global.client.handleReply.push({
      name: this.config.name,
      messageID: info.messageID,
      author: senderID
    });
  }, messageID);
};

module.exports.run = async function({ api, event }) {
  const { threadID, messageID, senderID } = event;

  const menu = `${heavy("قائمة الفئات")}\n` +
               `------------------\n` +
               `1. الترفيه\n` +
               `2. الإدارة\n` +
               `3. المطور\n` +
               `4. الألعاب\n` +
               `5. الوسائط\n` +
               `6. الصور\n` +
               `7. الخدمات\n` +
               `------------------\n` +
               `رد برقم الفئة لعرض الأوامر.`;

  return api.sendMessage(menu, threadID, (err, info) => {
    global.client.handleReply.push({
      name: this.config.name,
      messageID: info.messageID,
      author: senderID
    });
  }, messageID);
};
