const axios = require("axios");

module.exports.config = {
    name: "جزاء",
    version: "1.3.1",
    hasPermssion: 0,
    credits: "Ayman",
    description: "تحدي ركلات الجزاء",
    commandCategory: "games",
    usages: "جزاء",
    cooldowns: 5
};

module.exports.run = async ({ api, event }) => {
    const { threadID, messageID, senderID } = event;

    const players = [
        { name: "ليونيل ميسي", chance: 85 },
        { name: "كيليان مبابي", chance: 75 },
        { name: "إيرلينغ هالاند", chance: 70 },
        { name: "كريستيانو رونالدو", chance: 65 },
        { name: "فينيسيوس جونيور", chance: 55 }
    ];

    let msgBody = `◈ ───« جـزاء »─── ◈
│
◯ │ اخـتـر أسـطـورتـك
◯ │ لـتـنـفـيـذ ركـلـة
│
◯ │ 1. ${players[0].name}
◯ │ 2. ${players[1].name}
◯ │ 3. ${players[2].name}
◯ │ 4. ${players[3].name}
◯ │ 5. ${players[4].name}
│
◯ │ رد بـرقـم
◯ │ اللاعـب (1-5)
│
◈ ─────────────── ◈`;

    try {
        let gif = (await axios.get("https://i.postimg.cc/bJ60WRwL/20220728-113119.gif", { responseType: "stream" })).data;
        return api.sendMessage({ body: msgBody, attachment: gif }, threadID, (err, info) => {
            global.client.handleReply.push({ 
                name: this.config.name, 
                messageID: info.messageID, 
                author: senderID, 
                players 
            });
        }, messageID);
    } catch (e) {
        return api.sendMessage(msgBody, threadID, (err, info) => {
            global.client.handleReply.push({ 
                name: this.config.name, 
                messageID: info.messageID, 
                author: senderID, 
                players 
            });
        }, messageID);
    }
};

module.exports.handleReply = async ({ api, event, handleReply }) => {
    const { threadID, senderID, messageID, body } = event;
    const { author, players } = handleReply;
    if (author !== senderID) return;

    const choice = parseInt(body);
    if (isNaN(choice) || choice < 1 || choice > 5) {
        return api.sendMessage(
          `◈ ───« خـطـأ »─── ◈
│
◯ │ اخـتـر
◯ │ مـن 1
◯ │ إلـى 5
│
◈ ─────────────── ◈`,
          threadID, 
          messageID
        );
    }

    const selectedPlayer = players[choice - 1];
    api.unsendMessage(handleReply.messageID);
    api.sendMessage(
      `◈ ───« جـزاء »─── ◈
│
◯ │ ${selectedPlayer.name}
◯ │ يـسـدد الآن
◯ │ بـصـلـب...
│
◈ ─────────────── ◈`,
      threadID, 
      messageID
    );

    setTimeout(async () => {
        const rand = Math.floor(Math.random() * 100);
        if (rand < selectedPlayer.chance) {
            api.setMessageReaction("⚽", messageID, () => {}, true);
            return api.sendMessage(
              `◈ ───« هـدف »─── ◈
│
◯ │ هـــدف !
◯ │ تـم تـسـجـيـل
◯ │ بـواسـطـة
◯ │ ${selectedPlayer.name}!
◯ │ ⚽🎉🎊
│
◈ ─────────────── ◈`,
              threadID, 
              messageID
            );
        } else {
            api.setMessageReaction("❌", messageID, () => {}, true);
            return api.sendMessage(
              `◈ ───« خـسـارة »─── ◈
│
◯ │ خـسـارة !
◯ │ أخـطـأ
◯ │ ${selectedPlayer.name}
◯ │ الـركـلـة
◯ │ ❌😔
│
◈ ─────────────── ◈`,
              threadID, 
              messageID
            );
        }
    }, 2000);
};
