const path = require("path");

module.exports.config = {
  name: "سرقة",
  version: "3.0.0",
  hasPermssion: 0,
  credits: "ayman",
  description: "سرقة أموال الأعضاء مع نظام غرامات وخط خشن",
  commandCategory: "games",
  usages: "[سرقة]",
  cooldowns: 30
};

module.exports.run = async function({ api, event }) {
  const { threadID, messageID, senderID } = event;
  const mongodb = require(path.join(process.cwd(), "includes", "mongodb.js"));
  
  // دوال التنسيق الفخم
  const boldText = (text) => global.utils.toBoldSans(text);
  const heavyTitle = (text) => global.utils.toBoldMath(text); 

  const header = `⌬ ━━━━━━━━━━━━ ⌬\n   ${heavyTitle("𝗞𝗜𝗥𝗔 𝗦𝗧𝗘𝗔𝗟 𝗦𝗬𝗦𝗧𝗘𝗠")}\n⌬ ━━━━━━━━━━━━ ⌬`;

  try {
    const threadInfo = await api.getThreadInfo(threadID);
    const participants = threadInfo.participantIDs;
    
    // تصفية الضحايا (استبعاد السارق والبوت)
    const listVictims = participants.filter(id => id !== senderID && id !== api.getCurrentUserID());
    
    if (listVictims.length === 0) {
      return api.sendMessage(`${header}\n\n⚠️ ${boldText("تنبيه:")} لا يوجد أحد لسرقته هنا!`, threadID, messageID);
    }

    // اختيار ضحية عشوائية
    const victimID = listVictims[Math.floor(Math.random() * listVictims.length)];
    
    const stealerData = await mongodb.getUserData(senderID);
    const victimData = await mongodb.getUserData(victimID);

    if (!stealerData || !victimData) return;

    const nameVictim = victimData.user.name;
    const nameStealer = stealerData.user.name;
    const victimMoney = victimData.currency.money;
    const stealerMoney = stealerData.currency.money;

    api.setMessageReaction("🕵️‍♂️", messageID, () => {}, true);

    // احتمالية النجاح (40% نجاح)
    const isSuccess = Math.random() < 0.40;

    if (isSuccess) {
      if (victimMoney < 500) {
        return api.sendMessage(`${header}\n\n🧤 ${boldText("فشل:")} تسللت إلى محفظة ${nameVictim} لكنه أفقر منك!`, threadID, messageID);
      }

      // مبلغ السرقة: من 10% إلى 30% من رصيد الضحية (بحد أقصى 10,000$)
      let stolen = Math.floor(victimMoney * (Math.random() * 0.2 + 0.1));
      if (stolen > 10000) stolen = 10000;

      await mongodb.removeMoney(victimID, stolen);
      await mongodb.addMoney(senderID, stolen);

      const winMsg = `${header}\n\n` +
          `✨ ${heavyTitle("𝗦𝗨𝗖𝗖𝗘𝗦𝗦")}\n` +
          `✅ ${boldText("تمت العملية بنجاح!")}\n\n` +
          `👤 ${boldText("الضحية:")} ${nameVictim}\n` +
          `💰 ${boldText("المسروقات:")} +${stolen}$\n` +
          `🏃‍♂️ ${boldText("الحالة:")} هربت قبل وصول الدوريات!`;

      api.setMessageReaction("💰", messageID, () => {}, true);
      return api.sendMessage({ body: winMsg, mentions: [{ tag: nameVictim, id: victimID }] }, threadID, messageID);

    } else {
      // غرامة الفشل: 1000$ أو نصف رصيد السارق إذا كان أقل
      let fine = 1000;
      if (stealerMoney < fine) fine = Math.floor(stealerMoney / 2);

      if (fine > 0) {
        await mongodb.removeMoney(senderID, fine);
        await mongodb.addMoney(victimID, fine); // الغرامة تذهب للضحية كتعويض
        
        const loseMsg = `${header}\n\n` +
            `💥 ${heavyTitle("𝗖𝗔𝗨𝗚𝗛𝗧")}\n` +
            `👮‍♂️ ${boldText("أمسكت بك الشرطة متلبساً!")}\n\n` +
            `👤 ${boldText("السارق:")} ${nameStealer}\n` +
            `⚖️ ${boldText("الغرامة:")} -${fine}$\n` +
            `🎁 ${boldText("التعويض:")} تم منحها لـ ${nameVictim}`;

        api.setMessageReaction("👮‍♂️", messageID, () => {}, true);
        return api.sendMessage({ 
          body: loseMsg, 
          mentions: [{ tag: nameVictim, id: victimID }, { tag: nameStealer, id: senderID }] 
        }, threadID, messageID);
      } else {
        return api.sendMessage(`${header}\n\n👮‍♂️ ${boldText("تم كشفك!")} لكنك مفلس لدرجة أن الشرطة تركتك ترحل..`, threadID, messageID);
      }
    }
  } catch (error) {
    console.error(error);
  }
};
