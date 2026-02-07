const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "معلمي",
  version: "1.0.5",
  hasPermssion: 0,
  credits: "النظام",
  description: "تقدير للمعلم",
  commandCategory: "utility",
  usages: "معلمي",
  cooldown: 5
};

module.exports.run = async function({ api, event }) {
  const { threadID, messageID } = event;
  const teacherID = "61584059280197"; 
  const imagePath = path.join(__dirname, "cache", `teacher_${Date.now()}.png`);

  try {
    const imgUrl = `https://graph.facebook.com/${teacherID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const response = await axios.get(imgUrl, { responseType: "arraybuffer" });
    
    if (!fs.existsSync(path.join(__dirname, "cache"))) {
      fs.mkdirSync(path.join(__dirname, "cache"), { recursive: true });
    }
    
    fs.writeFileSync(imagePath, Buffer.from(response.data, "utf-8"));

    const msg = `◈ ───« كـلـمـة شـكـر »─── ◈
│
◯ │ شـكـراً لـمـعـلـمـي الـذي عـلـمـنـي الـتـطـويـر
◯ │ شـكـراً لـمـن جـعـلـنـي مـا أنـا عـلـيـه الـيـوم
◯ │ بـفـضـلـك تـعـلـمـت الـبـرمـجـة والألـغـوريـثـمـات
◯ │ بـفـضـلـك أصـبـحـت مـطـوراً قـادراً عـلـى الإبـداع
◯ │ بـفـضـلـك تـعـلـمـت الـصـبـر والإصـرار والـتـحـدي
◯ │ لـك كـل الـتـقـديـر والإحـتـرام يـا مـنـارة دربـي
◯ │ لـك كـل الـشـكـر يـا مـن أشـرقـت عـقـلـي بـالـعـلـم
◯ │ لـك كـل الـتـحـيـة يـا مـن كـنـت خـيـر مـعـلـم
◯ │ لـك كـل الـفـخـر يـا مـن صـنـعـت مـنـي إنسـانـاً
◯ │ ذكـراك سـتـبـقـى مـنـقـوشـة في قـلـبـي للأبـد
│
◈ ─────────────── ◈`;

    return api.sendMessage({
      body: msg,
      attachment: fs.createReadStream(imagePath)
    }, threadID, () => {
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
    }, messageID);

  } catch (error) {
    return api.sendMessage(
      `◈ ───« شـكـر لـلـمـعـلـم »─── ◈
│
◯ │ شـكـراً لـمـعـلـمـي الـذي عـلـمـنـي الـتـطـويـر🐢
◯ │ شـكـراً لـمـن جـعـل مـنـي مـطـوراً مـبـدعـاً🐢
◯ │ لـك مـنـي كـل الـشـكـر والإحـتـرام والتـقـديـر🐢
◯ │ لـك مـنـي كـل الـفـخـر والـاعتـزاز والـتـبـجـيـل🐢
◯ │ دمـت ذخـراً لـلـعـلـم ونـبـراسـاً لـلـمـعـرفـة🐢
◯ │ دمـت فـخـراً لـلـمـجـتـمـع ونـوراً لـلـتـلامـيـذ🐢
◯ │ تـقـبـل مـنـي هـذه الـكـلـمـات الـمـتـواضـعـة🐢
◯ │ فـقـد كـنـت وستـبـقـى الأسـتـاذ الأفـضـل عـلـيـهـا 🐢
│
◈ ─────────────── ◈`,
      threadID, 
      messageID
    );
  }
};
