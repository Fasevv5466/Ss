// ═══════════════════════════════════════════════════════════
// 👑 KIRA - اكامي
// المطور: Ayman ♛
// الوصف: 
// ═══════════════════════════════════════════════════════════

const fs = global.nodemodule["fs-extra"];
module.exports.config = {
  name: "اكامي",
  aliases: [],
  version: "1.0.1",
  hasPermssion: 0,
  credits: "Ayman ♛",
  description: "",
  prefix: false,
  commandCategory: "utility", 
  usages: "noprefix",
  cooldowns: 5,
};
module.exports.handleEvent = async function({ api, event, args, Threads, Users }) {
  var { threadID, messageID, reason } = event;
  const moment = require("moment-timezone");
  const time = moment.tz("Africa/Cairo").format("HH:MM:ss L");
  var idgr = `${event.threadID}`;
  var id = event.senderID;
  var name = await Users.getNameUser(event.senderID);

  var tl = ["عمتكم😺؟" , "منو ينادي محبوبه الكل >_<..." , "أحبك🤧🖤" , "الورده الطيبه💞🙃 " , "خادمتك فاي وقت 🖤🙁", "سمعتك تنادي علي؟👀", "كنت هموت ملل بدونك 🙃💞", "حبك الاول والاخير🙂🎧"];
 var rand = tl[Math.floor(Math.random() * tl.length)]

  if ((event.body.toLowerCase() == "مفتقدك") || (event.body.toLowerCase() == "حثتيني")) {
     return api.sendMessage("️حياتي بدونك ولا شئ 🙃💞", threadID, messageID);
   };
  if ((event.body.toLowerCase() == "احبك") || (event.body.toLowerCase() == "بحبك")) {
     return api.sendMessage("️ شادو حبيبي الوحيد يولد 🤧", threadID, messageID);
   };
   
  if ((event.body.toLowerCase() == "ملل") || (event.body.toLowerCase() == "ملل يجيب شلل")) {
     return api.sendMessage("️ امشيطلعبرراااااا", threadID, messageID);
   };
  
if ((event.body.toLowerCase() == " كيوت") || (event.body.toLowerCase() == "كيوتت")) {
     return api.sendMessage("️يعمريييي🤧💞", threadID, messageID);
   };
   
   if ((event.body.toLowerCase() == "شسمك") || (event.body.toLowerCase() == "ايش هو اسمك")) {
     return api.sendMessage("️اكامي عمتك 💞😺", threadID, messageID);
   };
   
   if ((event.body.toLowerCase() == "كيفكم") || (event.body.toLowerCase() == "كيفك")) {
     return api.sendMessage("️بخير وانت👀", threadID, messageID);
   };
   
   if ((event.body.toLowerCase() == "السلام عليكم") || (event.body.toLowerCase() == "سلام عليكم")) {
     return api.sendMessage("️ وعليكم السلام ورحمه الله وبركاته", threadID, messageID);
   };
   
   if ((event.body.toLowerCase() == "جيت") || (event.body.toLowerCase() == "سلام")) {
     return api.sendMessage("️منور", threadID, messageID);
   };
   if ((event.body.toLowerCase() == "منوره ايلي") || (event.body.toLowerCase() == " منوره كيوتتي")) {
     return api.sendMessage("️نورك الأصل الأصيل بلا منازع او مثيل 👀💞", threadID, messageID);
   };
   
if ((event.body.toLowerCase() == "كيفها حياتك ") || (event.body.toLowerCase() == "كيف حياتك")) {
     return api.sendMessage("️ماشيا الحمد لله وانت ❤️", threadID, messageID);
   };
   
   if ((event.body.toLowerCase() == "ماشيا") || (event.body.toLowerCase() == "بخير الحمد لله")) {
     return api.sendMessage("️دومك بخير وصحه وسعاده ", threadID, messageID);
   };
   
   if ((event.body.toLowerCase() == "بوت") || (event.body.toLowerCase() == "يا بوت ")) {
     return api.sendMessage("️يا روحها اسمي اكامي عمتك 💖", threadID, messageID);
   };
  
  if ((event.body.toLowerCase() == "جييتت") || (event.body.toLowerCase() == "باااكك")) {
     return api.sendMessage("️نورت البيت🫣❤", threadID, messageID);
   };
   
   if ((event.body.toLowerCase() == "المطور") || (event.body.toLowerCase() == "من المطور")) {
     return api.sendMessage("شادو حبيبي وروحي وتاج راسكم 💞🙃", threadID);
   };
   mess = "{name}"
  
  if (event.body.indexOf("كيوتتي") == 0 || (event.body.indexOf("اكامي") == 0)) {
    var msg = {
      body: ` ${rand}`
    }
    return api.sendMessage(msg, threadID, messageID);
  };

}

module.exports.run = function({ api, event, client, __GLOBAL }) { }
