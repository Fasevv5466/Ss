const axios = require("axios");

module.exports.config = {
  name: "كابوي",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "عمر",
  description: "كابوي - لعبة راعي البقر (مرتبطة بنظام المزامنة)",
  commandCategory: "games",
  usages: ".كابوي [المبلغ]",
  cooldowns: 0
};

module.exports.run = async ({ api, event, args, Currencies }) => {
  const { threadID, messageID, senderID } = event;

  if(args[0] == "help"){
    let imag = (await axios.get("https://i.imgur.com/VYf0UGv.jpg", { responseType: "stream" })).data;
    return api.sendMessage({ body: "◈ ───『 𝑲𝑰𝑹𝑨 𝑪𝑶𝑾𝑩𝑶𝒀 』─── ◈\n\nسحب البقرة ، ولكن ماذا تختار؟ =)))", attachment: imag }, threadID, messageID);
  }

  let money = (await Currencies.getData(senderID)).money;
  let cuoc = parseInt(args[0]);

  if (isNaN(cuoc) || cuoc <= 0) return api.sendMessage("◈ ───『 𝑲𝑰𝑹𝑨 𝑮𝑨𝑴𝑬𝑺 』─── ◈\n\n⚠️ يرجى إدخال مبلغ صحيح للرهان!\nمثال: .كابوي 100", threadID, messageID);
  if (cuoc > money) return api.sendMessage(`◈ ───『 𝑲𝑰𝑹𝑨 𝑮𝑨𝑴𝑬𝑺 』─── ◈\n\n❌ رصيدك لا يكفي! رصيدك الحالي هو: ${money}$`, threadID, messageID);

  let tile_1 = Math.floor(Math.random() * 100);
  let tile_2 = Math.floor(Math.random() * 100);
  let tile_3 = Math.floor(Math.random() * 100);
  let tile_4 = Math.floor(Math.random() * 100);
  let tile_5 = Math.floor(Math.random() * 100);

  let gif = (await axios.get("https://i.ibb.co/2dgF3vf/keobogif.gif", { responseType: "stream" })).data;

  let msg = {
    body: `◈ ───『 𝑲𝑰𝑹𝑨 𝑮𝑨𝑴𝑬𝑺 』─── ◈\n\nاختر بقرة :\n1. البقرة 1 [${cuoc}$] || احتمالية الفوز ${tile_1}%\n2. البقرة 2 [${cuoc}$] || احتمالية الفوز ${tile_2}%\n3. البقرة 3 [${cuoc}$] || احتمالية الفوز ${tile_3}%\n4. البقرة 4 [${cuoc}$] || احتمالية الفوز ${tile_4}%\n5. البقرة 5 [${cuoc}$] || احتمالية الفوز ${tile_5}%\n\nرد برقم البقرة للبدء!`,
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
  if (handleReply.author !== senderID) return api.sendMessage("❌ مو انت الي سويت هذا الكيم!", threadID, messageID);

  if(isNaN(body) || body < 1 || body > 5) return api.sendMessage("⚠️ اختر من 1 إلى 5 فقط!", threadID, messageID);

  const images = {
    "1": ["https://i.ibb.co/VH1jcVH/bo1-success.jpg","https://i.ibb.co/JCNFMF1/bo1-fail.jpg"],
    "2": ["https://i.ibb.co/cX2BN8Q/bo2-success.jpg","https://i.ibb.co/473dpvW/bo2-fail.jpg"],
    "3": ["https://i.ibb.co/vhkgzS4/bo3-success.jpg","https://i.ibb.co/42r5pPd/bo3-fail.jpg"],
    "4": ["https://i.ibb.co/gb0fbPS/bo4-success.jpg","https://i.ibb.co/hMfRHHr/bo4-fail.jpg"],
    "5": ["https://i.ibb.co/RTSKc7q/bo5-success.jpg","https://i.ibb.co/sFRsTr2/bo5-fail.jpg"]
  };

  let [win, lose] = images[body];
  global.client.keobo = global.client.keobo || {};
  global.client.keobo[senderID] = { stt: body, author: senderID, win, lose, cuoc: handleReply.cuoc };

  return api.sendMessage(`◈ ───『 𝑲𝑰𝑹𝑨 𝑪𝑶𝑾𝑩𝑶𝒀 』─── ◈\n\nلقد حددت البقرة ${body}!\nرد على الرسالة بكلمة "سحب" الآن!`, threadID, messageID);
};

module.exports.handleEvent = async({ api, event, Users, Currencies }) => {
  const { threadID, senderID, body } = event;
  if(!global.client.keobo || !global.client.keobo[senderID]) return;

  if(body == "سحب") {
    let name1 = await Users.getNameUser(senderID);
    let { win, lose, cuoc } = global.client.keobo[senderID];
    let ans = Math.random() > 0.5 ? "true" : "false";
    let image = (await axios.get(ans == "true" ? win : lose, { responseType: "stream" })).data;
    
    if (ans == "true") {
        await Currencies.increaseMoney(senderID, cuoc);
        var status = `✅ ${name1} فاز وتمكن من امساك البقرة!\n💰 ربحت: ${cuoc}$`;
    } else {
        await Currencies.decreaseMoney(senderID, cuoc);
        var status = `❌ ${name1} لم يتمكن من سحب البقرة!\n💸 خسرت: ${cuoc}$`;
    }

    api.sendMessage({ body: `◈ ───『 𝑲𝑰𝑹𝑨 𝑹𝑬𝑺𝑼𝑳𝑻 』─── ◈\n\n${status}`, attachment: image }, threadID);
    delete global.client.keobo[senderID];
  }
};
