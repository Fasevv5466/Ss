const axios = require("axios");

module.exports.config = {
  name: "كابوي",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "عمر",
  description: "كابوي - لعبة راعي البقر (مرتبطة بنظام العملات)",
  commandCategory: "games",
  usages: "كابوي [المبلغ]",
  cooldowns: 0
};

module.exports.run = async ({ api, event, args, Currencies }) => {
  const { threadID, messageID, senderID } = event;

  // إذا كتب help
  if(args[0] == "help"){
    let imag = (await axios.get("https://i.imgur.com/VYf0UGv.jpg", { responseType: "stream" })).data;
    return api.sendMessage({ body: "سحب البقرة ، ولكن ماذا تختار؟ =)))", attachment: imag }, threadID, messageID);
  }

  // التحقق من الرصيد والرهان
  let money = (await Currencies.getData(senderID)).money;
  let cuoc = parseInt(args[0]);

  if (isNaN(cuoc) || cuoc <= 0) return api.sendMessage("⚠️ يرجى إدخال مبلغ صحيح للرهان!\nمثال: .كابوي 100", threadID, messageID);
  if (cuoc > money) return api.sendMessage(`❌ رصيدك لا يكفي! رصيدك الحالي هو: ${money}$`, threadID, messageID);

  // احصائيات الفوز العشوائية
  let tile_1 = Math.floor(Math.random() * 100);
  let tile_2 = Math.floor(Math.random() * 100);
  let tile_3 = Math.floor(Math.random() * 100);
  let tile_4 = Math.floor(Math.random() * 100);
  let tile_5 = Math.floor(Math.random() * 100);

  // عرض المبالغ (نفس المبلغ لكل بقرة)
  let sotien_1 = cuoc, sotien_2 = cuoc, sotien_3 = cuoc, sotien_4 = cuoc, sotien_5 = cuoc;

  let gif = (await axios.get("https://i.ibb.co/2dgF3vf/keobogif.gif", { responseType: "stream" })).data;

  let msg = {
    body: `اختر بقرة :\n1. البقرة 1 [${sotien_1}$] || احتمالية الفوز ${tile_1}%\n2. البقرة 2 [${sotien_2}$] || احتمالية الفوز ${tile_2}%\n3. البقرة 3 [${sotien_3}$] || احتمالية الفوز ${tile_3}%\n4. البقرة 4 [${sotien_4}$] || احتمالية الفوز ${tile_4}%\n5. البقرة 5 [${sotien_5}$] || احتمالية الفوز ${tile_5}%\nرد برقم البقرة`,
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
  const { author, cuoc } = handleReply;

  if (author !== senderID)
    return api.sendMessage("مو انت الي سويت هذا الكيم، ميصر تلعب!", threadID, messageID);

  if(isNaN(body)) return api.sendMessage("يجب عليك إدخال رقم!", threadID);
  if(body < 1 || body > 5) return api.sendMessage("يمكنك فقط الاختيار من 1 إلى 5", threadID, messageID);

  const images = {
    "1": ["https://i.ibb.co/VH1jcVH/bo1-success.jpg","https://i.ibb.co/JCNFMF1/bo1-fail.jpg"],
    "2": ["https://i.ibb.co/cX2BN8Q/bo2-success.jpg","https://i.ibb.co/473dpvW/bo2-fail.jpg"],
    "3": ["https://i.ibb.co/vhkgzS4/bo3-success.jpg","https://i.ibb.co/42r5pPd/bo3-fail.jpg"],
    "4": ["https://i.ibb.co/gb0fbPS/bo4-success.jpg","https://i.ibb.co/hMfRHHr/bo4-fail.jpg"],
    "5": ["https://i.ibb.co/RTSKc7q/bo5-success.jpg","https://i.ibb.co/sFRsTr2/bo5-fail.jpg"]
  };

  let [win, lose] = images[body];

  let msg = `لقد حددت البقرة ${body}!  \nرد ع الرسالة واكتب "سحب" للبدء`;
  global.client.keobo = global.client.keobo || {};
  global.client.keobo[senderID] = { stt: body, author: senderID, win, lose, cuoc };

  return api.sendMessage(msg, threadID, (err, info) => {});
};

module.exports.handleEvent = async({ api, event, Users, Currencies }) => {
  const { threadID, senderID, body } = event;
  if(!global.client.keobo || !global.client.keobo[senderID]) return;

  if(body == "سحب") {
    let name1 = await Users.getNameUser(senderID);
    let { stt, win, lose, cuoc } = global.client.keobo[senderID];

    let choose = ["true","false"];
    let ans = choose[Math.floor(Math.random() * choose.length)];

    let image = (await axios.get(ans == "true" ? win : lose, { responseType: "stream" })).data;
    
    if (ans == "true") {
        await Currencies.increaseMoney(senderID, cuoc); // يربح ضعف الرهان
        var status = `${name1} فاز وتمكن من امساك البقرة! 🐄\nربحت: ${cuoc}$`;
    } else {
        await Currencies.decreaseMoney(senderID, cuoc); // يخسر الرهان
        var status = `${name1} لم يتمكن من سحب البقرة! 😅\nخسرت: ${cuoc}$`;
    }

    let msg = { body: status, attachment: image };

    api.sendMessage(msg, threadID);
    delete global.client.keobo[senderID];
  }
};
