module.exports.config = {
  name: "سلاحي",
  version: "1.0.1", 
  hasPermssion: 0,
  credits: "عمر",
  description: "مواجهة الزومبي",
  commandCategory: "games", 
  usages: "سلاحي", 
  cooldowns: 0,
  dependencies: {
    "request":"",
    "fs-extra":"",
    "axios":""
  }
};

module.exports.run = async function({ api,event,args,client,Users,Threads,__GLOBAL,Currencies }) {
    var tle = Math.floor(Math.random() * 101);
    var tle1 = Math.floor(Math.random() * 101);
    var tle2 = Math.floor(Math.random() * 101);
    var name = (await Users.getData(event.senderID)).name;
    
    const axios = global.nodemodule["axios"];
    const request = global.nodemodule["request"];
    const fs = global.nodemodule["fs-extra"];
    
    var link = [
        "https://choq.fm/wp-content/uploads/2020/03/1585152608_370_%D8%A3%D9%81%D8%B6%D9%84-12-%D8%B3%D9%84%D8%A7%D8%AD-%D9%84%D9%80-Call-of-Duty-Warzone.jpg",
        "https://static1-arabia.millenium.gg/articles/7/14/37/@/8163-68712-1188612-m4a1-orig-1-orig-2-amp_main_img-1.png",
        "https://cdni.rt.com/media/pics/2013.12/orig/670358.jpg",
        "https://pubgarabia.com/wp-content/uploads/2018/10/pubg_weapon_m416_1-1024x517.jpg"
    ];
    
    var callback = () => api.sendMessage({
        body: `◈ ───« سـلاحـي »─── ◈
│
◯ │ اسـمـك : ${name}
◯ │ عـدد الـزومـبـي : ${tle}
◯ │ عـدد الـطـلـقـات : ${tle1}
◯ │ نـسـبـة الـبـقـاء : ${tle2}%
◯ │ سـلاحـك هـو :
│
◈ ─────────────── ◈`,
        attachment: fs.createReadStream(__dirname + "/cache/5.jpg")
    }, event.threadID, () => fs.unlinkSync(__dirname + "/cache/5.jpg")); 
    
    return request(encodeURI(link[Math.floor(Math.random() * link.length)])).pipe(fs.createWriteStream(__dirname+"/cache/5.jpg")).on("close",() => callback());
};
