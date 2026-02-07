module.exports.config = {
  name: "زوجيني",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "زواج عشوائي",
  commandCategory: "games",
  usages: "زوجيني",
  cooldowns: 5
};

module.exports.run = async function({ api, event, Users }) {
    const axios = require("axios");
    const fs = require("fs-extra");
    const { threadID, messageID, senderID } = event;

    let threadInfo = await api.getThreadInfo(threadID);
    var participants = threadInfo.participantIDs;
    var listID = participants.filter(ID => ID !== senderID);
    
    if (listID.length === 0) {
      return api.sendMessage(
        `◈ ───« فـارغ »─── ◈
│
◯ │ لا يـوجـد
◯ │ أعـضـاء
◯ │ كـافـيـيـن
│
◈ ─────────────── ◈`,
        threadID, 
        messageID
      );
    }
    
    var id = listID[Math.floor(Math.random() * listID.length)];

    var name1 = (await Users.getData(senderID)).name;
    var name2 = (await Users.getData(id)).name;

    var lovePercent = Math.floor(Math.random() * 101);

    api.sendMessage(
      `◈ ───« بـحـث »─── ◈
│
◯ │ جـاري
◯ │ الـبـحـث
◯ │ عـن شـريـك
│
◈ ─────────────── ◈`,
      threadID, 
      messageID
    );

    try {
        let Avatar1 = (await axios.get(`https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" })).data;
        fs.writeFileSync(__dirname + "/cache/avt1.png", Buffer.from(Avatar1, "utf-8"));
        
        let Avatar2 = (await axios.get(`https://graph.facebook.com/${id}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" })).data;
        fs.writeFileSync(__dirname + "/cache/avt2.png", Buffer.from(Avatar2, "utf-8"));

        var imglove = [
            fs.createReadStream(__dirname + "/cache/avt1.png"),
            fs.createReadStream(__dirname + "/cache/avt2.png")
        ];

        var msg = {
            body: `◈ ───« زواج »─── ◈
│
◯ │ الف مـبـروك
◯ │ وجـدت شـريـك
◯ │ مـنـاسـب
│
◯ │ الـزوج الأول : ${name1}
◯ │ الـزوج الثاني : ${name2}
◯ │ نـسـبـة الـتـوافـق : ${lovePercent}%
◯ │ بـاركـوا للعـروسـيـن
│
◈ ─────────────── ◈`,
            mentions: [
                { tag: name1, id: senderID },
                { tag: name2, id: id }
            ],
            attachment: imglove
        };

        return api.sendMessage(msg, threadID, () => {
            fs.unlinkSync(__dirname + "/cache/avt1.png");
            fs.unlinkSync(__dirname + "/cache/avt2.png");
        }, messageID);

    } catch (err) {
        return api.sendMessage(
          `◈ ───« زواج »─── ◈
│
◯ │ اخـتـيـار : ${name2}
◯ │ نـسـبـة الـحـب : ${lovePercent}%
◯ │ تـهـانـيـن
│
◈ ─────────────── ◈`,
          threadID, 
          messageID
        );
    }
}
