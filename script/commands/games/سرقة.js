module.exports.config = {
  name: "سرقة",
  version: "1.2.5",
  hasPermssion: 0,
  credits: "Ayman",
  description: "سرقة أموال",
  commandCategory: "games",
  usages: "سرقة",
  cooldowns: 20
};

module.exports.run = async function({ api, event, Users, Currencies }) {
    const { threadID, messageID, senderID } = event;
    
    var alluser = global.data.allUserID;
    var victim = alluser[Math.floor(Math.random() * alluser.length)];
    
    if (victim == senderID || victim == api.getCurrentUserID()) {
        return api.sendMessage(
          `◈ ───« سـرقـة »─── ◈
│
◯ │ حـاولـت
◯ │ الـسـرقـة
◯ │ وشـعـرت بـالـنـدم
│
◈ ─────────────── ◈`,
          threadID, 
          messageID
        );
    }

    var victimData = await Currencies.getData(victim) || {};
    var stealerData = await Currencies.getData(senderID) || {};
    
    var victimMoney = victimData.money || 0;
    var stealerMoney = stealerData.money || 0;

    var nameVictim = (await Users.getData(victim)).name || "مجهول";

    var isSuccess = Math.random() > 0.5;

    if (isSuccess) {
        if (victimMoney < 100) {
            return api.sendMessage(
              `◈ ───« فـارغ »─── ◈
│
◯ │ دخـلـت
◯ │ مـحـفـظـة
◯ │ ${nameVictim}
◯ │ وجـدتـهـا فـارغـة
│
◈ ─────────────── ◈`,
              threadID, 
              messageID
            );
        }

        var stolenMoney = Math.floor(Math.random() * 1901) + 100;
        if (stolenMoney > victimMoney) stolenMoney = victimMoney;

        await Currencies.setData(victim, { money: victimMoney - stolenMoney });
        await Currencies.setData(senderID, { money: stealerMoney + stolenMoney });

        return api.sendMessage(
          `◈ ───« نـجـاح »─── ◈
│
◯ │ سـرقـة نـاجـحـة
◯ │ سـحـبـت : ${stolenMoney}$
◯ │ مـن : ${nameVictim}
◯ │ وهـربـت 💨
│
◈ ─────────────── ◈`,
          threadID, 
          messageID
        );

    } else {
        var fine = 500;
        if (stealerMoney < fine) fine = stealerMoney;

        if (fine > 0) {
            await Currencies.setData(senderID, { money: stealerMoney - fine });
            await Currencies.setData(victim, { money: victimMoney + fine });
            
            return api.sendMessage({
                body: `◈ ───« فـشـل »─── ◈
│
◯ │ ألـقـي
◯ │ الـقـبـض عـلـيـك
◯ │ خـصـم : ${fine}$
◯ │ لـ : ${nameVictim}
◯ │ كـتـعـويـض ⚖️
│
◈ ─────────────── ◈`,
                mentions: [{ tag: nameVictim, id: victim }]
            }, threadID, messageID);
        } else {
            return api.sendMessage(
              `◈ ───« سـلام »─── ◈
│
◯ │ كـادـت
◯ │ الـشـرطـة
◯ │ تـمـسـك بـك
◯ │ ولـكـن لـيـس
◯ │ عـنـدك غـرامـة
│
◈ ─────────────── ◈`,
              threadID, 
              messageID
            );
        }
    }
};
