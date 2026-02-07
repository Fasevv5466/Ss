const axios = require("axios");

module.exports.config = {
  name: "كابوي",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "عمر",
  description: "كابوي - لعبة راعي البقر (مجانية بالكامل)",
  commandCategory: "games",
  usages: "كابوي",
  cooldowns: 0
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, senderID } = event;

  if(args[0] == "help" || args[0] == "مساعدة"){
    let imag = (await axios.get("https://i.imgur.com/VYf0UGv.jpg", { responseType: "stream" })).data;
    return api.sendMessage(
      `◈ ───« لـعـبـة الـكـابـوي »─── ◈
│
◯ │ اسـم الـلـعـبـة : كـابـوي رعـايـة الـبـقـر
◯ │ طـريـقـة الـلـعـب : اخـتـار بـقـرة وسـحـبـهـا
◯ │ قـوانـيـن الـلـعـبـة : سـحـب الـبـقـرة بـحـكـمـة
◯ │ نـوع الـلـعـبـة : تـسـلـيـة وتـرفـيـه مـجـانـي
◯ │ الـجـوائـز : لـعـبـة مـجـانـيـة بـلا جـوائـز
◯ │ الـمـخـاطـر : لا تـوجـد مـخـاطـر حـقـيـقـيـة
◯ │ نـصـيـحـة : اخـتـر الـبـقـرة الـتـي تـنـاسـبـك
◯ │ تـذكـيـر : الـلـعـبـة لـلـتـسـلـيـة فـقـط
│
◈ ─────────────── ◈`,
      threadID, 
      messageID
    );
  }

  let cuoc = parseInt(args[0]) || 0;

  let tile_1 = Math.floor(Math.random() * 100);
  let tile_2 = Math.floor(Math.random() * 100);
  let tile_3 = Math.floor(Math.random() * 100);
  let tile_4 = Math.floor(Math.random() * 100);
  let tile_5 = Math.floor(Math.random() * 100);

  let sotien_1 = 0, sotien_2 = 0, sotien_3 = 0, sotien_4 = 0, sotien_5 = 0;

  let gif = (await axios.get("https://i.ibb.co/2dgF3vf/keobogif.gif", { responseType: "stream" })).data;

  let msg = {
    body: `◈ ───« اخـتـيـار الـبـقـرة »─── ◈
│
◯ │ 1. الـبـقـرة 1 [${sotien_1}$] || إحـتـمـالـيـة الـفـوز ${tile_1}%
◯ │ 2. الـبـقـرة 2 [${sotien_2}$] || إحـتـمـالـيـة الـفـوز ${tile_2}%
◯ │ 3. الـبـقـرة 3 [${sotien_3}$] || إحـتـمـالـيـة الـفـوز ${tile_3}%
◯ │ 4. الـبـقـرة 4 [${sotien_4}$] || إحـتـمـالـيـة الـفـوز ${tile_4}%
◯ │ 5. الـبـقـرة 5 [${sotien_5}$] || إحـتـمـالـيـة الـفـوز ${tile_5}%
│
◯ │ 📌 رد عـلـى الـرسـالـة بـرقـم الـبـقـرة
◯ │ 📌 كـل بـقـرة لـهـا إحـتـمـالـيـاتـهـا
◯ │ 📌 اخـتـر بـذكـاء ولاتـنـخـدع بـالـمـظـهـر
◯ │ 📌 الـفـوز يـتـطـلـب حـظـاً ومـهـارة مـعـاً
◯ │ 📌 لا تـنـسـى أن تـسـتـمـتـع بـالـلـعـبـة
◯ │ 📌 الـبـدايـة مـن الـآن اخـتـار رقـمـاً
│
◈ ─────────────── ◈`,
    attachment: gif
  };

  return api.sendMessage(msg, threadID, (err, info) => {
    global.client.handleReply.push({
      name: this.config.name,
      messageID: info.messageID,
      author: senderID,
      cuoc
    });
  }, messageID);
};

module.exports.handleReply = async ({ api, event, handleReply }) => {
  const { threadID, senderID, messageID, body } = event;
  const { author } = handleReply;

  if (author !== senderID) {
    return api.sendMessage(
      `◈ ───« رفـض دخـول »─── ◈
│
◯ │ مـو أنـت الـي سـويـت هـذا الـكـيـم
◯ │ هـذا الـلـقـب مـخـصـوص لـصـاحـبـه
◯ │ لا تـتـدخـل في أمـور غـيـر شـأنـك
◯ │ إذهـب وابـدأ لـعـبـتـك الـخـاصـة
◯ │ لا تـكـون فـضـولـي وتـقـلـد الآخـريـن
◯ │ كـل واحـد لـعـبـتـه واخـتـيـاراتـه
◯ │ خـل الـنـاس بـحـالـهـا يـا صـديـقـي
│
◈ ─────────────ــ ◈`,
      threadID, 
      messageID
    );
  }

  if(isNaN(body)) {
    return api.sendMessage(
      `◈ ───« خـطـأ في الإدخـال »─── ◈
│
◯ │ يـجـب عـلـيـك إدخـال رقـم فـقـط
◯ │ لا يـمـكـن اسـتـخـدام حـروف أو رمـوز
◯ │ الإدخـال الـذي أدخـلـتـه : ${body}
◯ │ الـمـطـلـوب رقـم مـن 1 إلـى 5
◯ │ أعـد الـمـحـاولـة بـرقـم صـحـيـح
◯ │ لا تـسـتـعـجـل وقـرأ الأمـر جـيـداً
│
◈ ─────────────ــ ◈`,
      threadID, 
      messageID
    );
  }
  
  if(body < 1 || body > 5) {
    return api.sendMessage(
      `◈ ───« خـطـأ في الـرقـم »─── ◈
│
◯ │ يـمـكـنـك فـقـط الأخـتـيـار مـن 1 إلـى 5
◯ │ الـرقـم الـذي أدخـلـتـه : ${body}
◯ │ هـذا الـرقـم خـارج نـطـاق الـمـسـمـوح
◯ │ الـمـسـمـوح فـقـط 1، 2، 3، 4، 5
◯ │ يـرجـى الإخـتـيـار مـن الـخـيـارات الـمـوجـودة
◯ │ لا تـحـاول تـجـاوز الـحـدود الـمـحـددة
│
◈ ─────────────ــ ◈`,
      threadID, 
      messageID
    );
  }

  const images = {
    "1": ["https://i.ibb.co/VH1jcVH/bo1-success.jpg","https://i.ibb.co/JCNFMF1/bo1-fail.jpg"],
    "2": ["https://i.ibb.co/cX2BN8Q/bo2-success.jpg","https://i.ibb.co/473dpvW/bo2-fail.jpg"],
    "3": ["https://i.ibb.co/vhkgzS4/bo3-success.jpg","https://i.ibb.co/42r5pPd/bo3-fail.jpg"],
    "4": ["https://i.ibb.co/gb0fbPS/bo4-success.jpg","https://i.ibb.co/hMfRHHr/bo4-fail.jpg"],
    "5": ["https://i.ibb.co/RTSKc7q/bo5-success.jpg","https://i.ibb.co/sFRsTr2/bo5-fail.jpg"]
  };

  let [win, lose] = images[body];

  let msg = `◈ ───« تـأكـيـد الإخـتـيـار »─── ◈
│
◯ │ لـقـد حـددت الـبـقـرة رقـم ${body}!
◯ │ هـذا اخـتـيـار جـريـء ومـمـيـز
◯ │ الـبـقـرة رقـم ${body} جـاهـزة للـسـحـب
◯ │ انـظـر إلـيـهـا جـيـداً وتـخـيـل نـجـاحـك
◯ │ الـوقـت الآن للـبـدء والـتـحـدي
◯ │ الـسـحـب بـدون تـردد وبـكـل قـوة
◯ │ رد ع الـرسـالـة الآن واكـتـب "سـحـب"
◯ │ لـلـبـدء في عـمـلـيـة الـسـحـب الـنـهـائـي
◯ │ تـذكـر أن الـحـظ يـنـصـر الـجـريـئـيـن
◯ │ لا تـتـردد وقـل سـحـب بـكـل ثـقـة
│
◈ ─────────────ــ ◈`;
  
  global.client.keobo = global.client.keobo || {};
  global.client.keobo[senderID] = { stt: body, author: senderID, win, lose };

  return api.sendMessage(msg, threadID, (err, info) => {});
};

module.exports.handleEvent = async({ api, event, Users }) => {
  const { threadID, senderID, body } = event;
  if(!global.client.keobo || !global.client.keobo[senderID]) return;

  if(body == "سحب" || body == "سحب" || body == "السحب") {
    let name1 = await Users.getNameUser(senderID);
    let { stt, win, lose } = global.client.keobo[senderID];

    let choose = ["true","false"];
    let ans = choose[Math.floor(Math.random() * choose.length)];

    let image = (await axios.get(ans == "true" ? win : lose, { responseType: "stream" })).data;
    
    let msg = { 
      body: ans == "true" ? 
        `◈ ───« نـجـاح مـبـهـر »─── ◈
│
◯ │ ${name1} فـاز وتمـكـن مـن إمـسـاك الـبـقـرة!
◯ │ تـحـدي الـكـابـوي نـجـح بـأجـمـل صـورة
◯ │ الـبـقـرة رقـم ${stt} الآن بـيـن يـديـك
◯ │ مـهـارة الـسـحـب كـانـت أسـطـوريـة
◯ │ الـحـظ كـان إلـى جـانـبـك الـيـوم
◯ │ الـتـهـانـيـن الـحـارة لـفـوزك الـرائـع
◯ │ اسـتـمـر فـي هـذا الـتـألـق والـنـجـاح
◯ │ أنـت أسـطـورة حـقـيـقـيـة في الـلـعـبـة
◯ │ 🐄🎉🎊🎈🏆✨🎯💪🔥
│
◈ ─────────────ــ ◈` : 
        `◈ ───« خـسـارة مـؤلـمـة »─── ◈
│
◯ │ ${name1} لـم يـتـمـكـن مـن سـحـب الـبـقـرة!
◯ │ الـبـقـرة رقـم ${stt} هـربـت مـن يـديـك
◯ │ تـحـدي الـكـابـوي انـتـهـى بـالـفـشـل
◯ │ الـحـظ لـم يـكـن في جـانـبـك الـيـوم
◯ │ لا تـحـزن فـالـفـرص لـم تـنـتـهـي بـعـد
◯ │ الـمـحـاولـة الـقـادمـة سـتـكـون أفـضـل
◯ │ كـل الـعـظـمـاء مـروا بـلـحـظـات فـشـل
◯ │ الـمـهـم أن تـقـوم وتـحـاول مـرة أخـرى
◯ │ 😅💔❌🚫😢👎😞🙈
│
◈ ─────────────ــ ◈`,
      attachment: image
    };

    api.sendMessage(msg, threadID);
    delete global.client.keobo[senderID];
  }
};
