// ═══════════════════════════════════════════════════════════
// 👑 KIRA - فاميلي
// المطور: Ayman ♛
// الوصف: اكتشف بنفسك
// ═══════════════════════════════════════════════════════════

module.exports.config = {
  name: "فاميلي",
  aliases: [],
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Ayman ♛",
  description: "اكتشف بنفسك",
  prefix: false,
    commandCategory: "fun",
  usages: "",
  cooldowns: 5,
  dependencies: {
    "request":"",
    "fs-extra":"",
    "axios":""
  }
};

module.exports.run = async({api,event,args,client,Users,Threads,__GLOBAL,Currencies}) => {
const axios = global.nodemodule["axios"];
const request = global.nodemodule["request"];
const fs = global.nodemodule["fs-extra"];
  var link = [
"https://i.imgur.com/stZLCb4.jpg",
  ];
	  var callback = () => api.sendMessage({body:`💖 سوي صورة لكل أعضاء كروبك ، مثال :
⚠️العائلة <الحجم> <كود اللون> <العنوان>
✴️ توضيح :
• الحجم: حجم صورة الشخص
• رمز اللون: رمز اللون السداسي
• العنوان: عنوان الصورة ، اذا محطيت عنوان البوت راح يحط اسم الكروب 
✨مثال: (   العائلة 200 #ffffff )`,attachment: fs.createReadStream(__dirname + "/cache/5.jpg")}, event.threadID, () => fs.unlinkSync(__dirname + "/cache/5.jpg")); 
      return request(encodeURI(link[Math.floor(Math.random() * link.length)])).pipe(fs.createWriteStream(__dirname+"/cache/5.jpg")).on("close",() => callback());
   };