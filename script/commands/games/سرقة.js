const path = require("path");

module.exports.config = {
  name: "سرقة",
  version: "2.6.0",
  hasPermssion: 0, // rr مضاعفة
  credits: "ayman",
  description: "سرقة أموال من الأعضاء مع الربط بقاعدة بيانات KiraDB",
  commandCategory: "games",
  usages: "سرقة",
  cooldowns: 20
};

module.exports.run = async function({ api, event, Users }) {
  const { threadID, messageID, senderID } = event;
  
  // استدعاء ملف المونغو
  const mongodb = require(path.join(process.cwd(), "includes", "mongodb.js"));
  
  // دالة الخط العريض والزخرفة
  const bold = (text) => global.utils.toBoldSans(text);
  const header = `⌬ ━━━ ${bold("KIRA GAMES")} ━━━ ⌬`;

  try {
    // 1. جلب معلومات الكروب
    const threadInfo = await api.getThreadInfo(threadID);
    const participants = threadInfo.participantIDs;
    
    // تصفية الضحايا (استبعاد السارق والبوت)
    const listVictims = participants.filter(id => id !== senderID && id !== api.getCurrentUserID());
    
    if (listVictims.length === 0) {
      return api.sendMessage(`${header}\n\n${bold("⚠️ تنبيه:")}\nلا يوجد ضحايا في هذا الكروب حالياً، يبدو أنك وحيد في الظلام!`, threadID, messageID);
    }

    // 2. اختيار ضحية عشوائية وجلب بيانات KiraDB
    const victimID = listVictims[Math.floor(Math.random() * listVictims.length)];
    
    const stealerData = await mongodb.getUserData(senderID);
    const victimData = await mongodb.getUserData(victimID);

    if (!stealerData || !victimData) {
      return api.sendMessage(`${header}\n\n❌ ${bold("خطأ:")}\nفشل الاتصال بقاعدة بيانات KiraDB!`, threadID, messageID);
    }

    const nameVictim = victimData.user.name || "عضو مجهول";
    const nameStealer = stealerData.user.name || "سارق";
    const victimMoney = victimData.currency.money;
    const stealerMoney = stealerData.currency.money;

    // 3. احتمالية النجاح (45%)
    const isSuccess = Math.random() < 0.45;

    if (isSuccess) {
      if (victimMoney < 200) {
        return api.sendMessage(`${header}\n\n${bold("🧤 محاولة فاشلة:")}\nتسللت لمحفظة ${nameVictim} لكنك وجدتها خالية، يا لك من سيء حظ!`, threadID, messageID);
      }

      // حساب المبلغ المسروق
      let stolenMoney = Math.floor(victimMoney * (Math.random() * (0.20 - 0.10) + 0.10));
      if (stolenMoney > 5000) stolenMoney = 5000;

      // تنفيذ التعديل في المونغو
      await mongodb.removeMoney(victimID, stolenMoney);
      await mongodb.addMoney(senderID, stolenMoney);

      return api.sendMessage({
        body: `${header}\n\n${bold("🧤 تمت السرقة بنجاح!")}\n\n👤 ${bold("الضحية:")} ${nameVictim}\n💰 ${bold("المبلغ:")} ${stolenMoney}$\n✨ ${bold("الحالة:")} هربت قبل وصول الشرطة!`,
        mentions: [{ tag: nameVictim, id: victimID }]
      }, threadID, messageID);

    } else {
      // غرامة الفشل
      let fine = 500; 
      if (stealerMoney < fine) fine = stealerMoney;

      if (fine > 0) {
        await mongodb.removeMoney(senderID, fine);
        await mongodb.addMoney(victimID, fine);
        
        return api.sendMessage({
          body: `${header}\n\n${bold("👮‍♂️ قبضت عليك الشرطة!")}\n\n👤 ${bold("السارق:")} ${nameStealer}\n⚖️ ${bold("العقوبة:")} دفع غرامة ${fine}$\n💰 ${bold("التعويض:")} تم منحها لـ ${nameVictim}`,
          mentions: [
            { tag: nameVictim, id: victimID },
            { tag: nameStealer, id: senderID }
          ]
        }, threadID, messageID);
      } else {
        return api.sendMessage(`${header}\n\n${bold("👮‍♂️ تم كشفك!")}\nلكنك مفلس لدرجة أن الشرطة أطلقت سراحك إشفاقاً عليك!`, threadID, messageID);
      }
    }
  } catch (error) {
    console.error(error);
    return api.sendMessage(`${header}\n\n❌ ${bold("عطل فني:")}\nحدث خطأ غير متوقع في KiraDB.`, threadID, messageID);
  }
};
