// ═══════════════════════════════════════════════════════════
// 👑 KIRA - ايبي
// المطور: Ayman ♛
// الوصف: عرض معلومات الاي بي الخاصة بك 
// ═══════════════════════════════════════════════════════════

module.exports.config = {
	name: "ايبي",
  aliases: [],	
	version: "1.0.0", 
	hasPermssion: 0,
  credits: "Ayman ♛",
	description: "عرض معلومات الاي بي الخاصة بك ",
  prefix: false,
    commandCategory: "fun",
	usages: "",
	cooldowns: 5, 
	dependencies: "",
};

module.exports.run = async function({ api, args, event, __GLOBAL }) {
  const timeStart = Date.now();
  
    const axios = require("axios");
  if (!args[0]) {api.sendMessage("الرجاء ادخال الايبي اللذي تريد التحقق من معلوماته \n\n- روح ع كوكل واكتب my ip وانسخه",event.threadID, event.messageID);}
  else {
var infoip = (await axios.get(`http://ip-api.com/json/${args.join(' ')}?fields=66846719`)).data;
       if (infoip.status == 'fail')
         {api.sendMessage(`Error!`, event.threadID, event.messageID)}
          else {
            /////////////////
          //////////////////
 api.sendMessage({body:`======${(Date.now()) - timeStart}ms=====
 🗺️القارة: ${infoip.continent}
🏳️البلد: ${infoip.country}
🎊كود البلد: ${infoip.countryCode}
🕋المنطقة: ${infoip.region}
خط العرض:🧭 ${infoip.lat}
خط الطول:🧭 ${infoip.lon}
⏱️المنطقة الزمنية: ${infoip.timezone}
👨‍✈️أسم مزود الشبكة: ${infoip.org}
💵العملة: ${infoip.currency}
`,location: {
				latitude: infoip.lat,
				longitude: infoip.lon,
				current: true
			}}
,event.threadID, event.messageID);}
        }
    
                  }

  
  
  
  
  





