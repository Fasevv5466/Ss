module.exports.config = {
  name: "سرقة",
  version: "1.3.0",
  hasPermssion: 0,
  credits: "ايمن",
  description: "سرقة أموال عشوائية من أعضاء الكروب الحالي",
  commandCategory: "games",
  usages: "سرقة",
  cooldowns: 20
};

module.exports.run = async function({ api, event, Users, Currencies }) {
  const { threadID, messageID, senderID } = event;
  
  // 1. جلب معلومات الكروب للحصول على قائمة الأعضاء الموجودين حالياً فقط
  var threadInfo = await api.getThreadInfo(threadID);
  var participants = threadInfo.participantIDs;
  
  // 2. تصفية القائمة لاستبعاد السارق نفسه واستبعاد البوت
  var listVictims = participants.filter(id => id !== senderID && id !== api.getCurrentUserID());
  
  if (listVictims.length === 0) {
    return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 GAMES ━━ ⌬\n\nلا يوجد أحد هنا لسرقته، يبدو أنك وحيد!", threadID, messageID);
  }

  // 3. اختيار ضحية عشوائية من الكروب
  var victim = listVictims[Math.floor(Math.random() * listVictims.length)];

  var victimData = await Currencies.getData(victim) || {};
  var stealerData = await Currencies.getData(senderID) || {};
  
  var victimMoney = victimData.money || 0;
  var stealerMoney = stealerData.money || 0;

  var nameVictim = (await Users.getData(victim)).name || "عضو مجهول";
  var nameStealer = (await Users.getData(senderID)).name;

  // 4. احتمالية النجاح (50%)
  var isSuccess = Math.random() > 0.5;

  if (isSuccess) {
    if (victimMoney < 100) {
      return api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 GAMES ━━ ⌬\n\nتسللت لمحفظة ${nameVictim} لكنك وجدتها خالية من المال! حظ سيء.`, threadID, messageID);
    }

    // سرقة مبلغ عشوائي بين 100 و 2000
    var stolenMoney = Math.floor(Math.random() * 1901) + 100;
    if (stolenMoney > victimMoney) stolenMoney = victimMoney;

    await Currencies.setData(victim, { money: victimMoney - stolenMoney });
    await Currencies.setData(senderID, { money: stealerMoney + stolenMoney });

    return api.sendMessage(
      {
        body: `⌬ ━━ 𝗞𝗜𝗥𝗔 𝗦𝗧𝗘𝗔𝗟 ━━ ⌬\n\n` +
              `🧤 تمت السرقة بنجاح!\n` +
              `لقد سحبت مبلغ ${stolenMoney}$ من محفظة ${nameVictim} وهربت قبل أن يراك أحد.`,
        mentions: [{ tag: nameVictim, id: victim }]
      }, threadID, messageID
    );

  } else {
    // غرامة الفشل (500$)
    var fine = 500;
    if (stealerMoney < fine) fine = stealerMoney;

    if (fine > 0) {
      await Currencies.setData(senderID, { money: stealerMoney - fine });
      await Currencies.setData(victim, { money: victimMoney + fine });
      
      return api.sendMessage({
        body: `⌬ ━━ 𝗞𝗜𝗥𝗔 𝗣𝗢𝗟𝗜𝗖𝗘 ━━ ⌬\n\n` +
              `👮‍♂️ أُلقي القبض عليك يا ${nameStealer}!\n` +
              `تم تغريمك بمبلغ ${fine}$ ومنحه للضحية ${nameVictim} كتعويض عن محاولتك الفاشلة.`,
        mentions: [
          { tag: nameVictim, id: victim },
          { tag: nameStealer, id: senderID }
        ]
      }, threadID, messageID);
    } else {
      return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 ━━ ⌬\n\nكادت الشرطة أن تمسك بك، لكنك لا تملك فلساً واحداً لدفعه كغرامة، فأطلقوا سراحك إشفاقاً عليك!", threadID, messageID);
    }
  }
};
