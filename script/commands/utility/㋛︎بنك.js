// ═══════════════════════════════════════════════════════════
// 👑 KIRA - بنك
// المطور: Ayman ♛
// الوصف: الخزينة المركزية - نسخة الإمبراطور اللانهائية
// ═══════════════════════════════════════════════════════════

const fs = require("fs-extra");
const path = __dirname + '/banking/central_vault.json';

module.exports.config = {
  name: "بنك",
  aliases: [],
  version: "6.0.0",
  hasPermssion: 0,
  credits: "Ayman ♛",
  description: "الخزينة المركزية - نسخة الإمبراطور اللانهائية",
  commandCategory: "utility",
  usages: "[تسجيل/ايداع/سحب/عرض/منح/تصفير]",
  cooldowns: 0
};

module.exports.onLoad = async () => {
  if (!fs.existsSync(__dirname + '/banking')) fs.mkdirSync(__dirname + '/banking');
  if (!fs.existsSync(path)) fs.writeFileSync(path, "{}", "utf-8");
};

module.exports.run = async function({ api, event, args, Currencies, Users }) {
  const { threadID, messageID, senderID } = event;
  let vault = JSON.parse(fs.readFileSync(path));
  
  // نظام التعرف على "التوب" - السيادة المطلقة
  const isTop = global.config.ADMINBOT.includes(senderID);

  if (!vault[senderID]) vault[senderID] = { bank_balance: 0, last_interest: Date.now() };

  switch(args[0]) {
    case 'عرض': {
      let pocketMoney = (await Currencies.getData(senderID)).money || 0;
      let bankMoney = vault[senderID].bank_balance;
      
      // إذا كنت أنت "التوب"، الرصيد يظهر كـ لانهائي
      let displayPocket = isTop ? "∞ (لا نهائي)" : pocketMoney.toLocaleString() + "$";
      let displayBank = isTop ? "∞ (خزينة الإمبراطور)" : bankMoney.toLocaleString() + "$";
      
      let msg = `◈ ──『 خـزيـنـة: ${isTop ? "الـتـوب ايـمـن 👑" : "الـمـسـتـخـدم"} 』── ◈\n\n`;
      msg += `💰 نـقاط الألعاب (بجيبك): ${displayPocket}\n`;
      msg += `🏦 المـودع فـي البـنك: ${displayBank}\n`;
      msg += `📈 الـحـالـة: ${isTop ? "ثـراء فـاحـش (Unlimited)" : "مـواطـن عـادي"}\n\n`;
      msg += `│←› الـسـلـطـة الـمـطـلـقـة لـلـتـوب ايـمـن 👑\n`;
      msg += `◈ ─────────────── ◈`;
      return api.sendMessage(msg, threadID, messageID);
    }

    case 'ايداع': {
      if (isTop) return api.sendMessage("👑 سيدي التوب، أموالك لا تحتاج للإيداع، أنت تملك البنك بالكامل!", threadID);
      let pocketMoney = (await Currencies.getData(senderID)).money || 0;
      let depositAmt = args[1] == "كل" ? pocketMoney : parseInt(args[1]);

      if (!depositAmt || depositAmt <= 0 || depositAmt > pocketMoney) 
        return api.sendMessage("◯ المبلغ غير صحيح!", threadID);

      await Currencies.decreaseMoney(senderID, depositAmt);
      vault[senderID].bank_balance += depositAmt;
      fs.writeFileSync(path, JSON.stringify(vault, null, 2));
      return api.sendMessage(`✅ تم تأمين ${depositAmt}$ في الخزينة المركزية.`, threadID);
    }

    case 'سحب': {
      if (isTop) {
        // ميزة السحب اللانهائي للتوب
        let topAmount = parseInt(args[1]) || 1000000000;
        await Currencies.increaseMoney(senderID, topAmount);
        return api.sendMessage(`👑 سيدي التوب.. تم سحب ${topAmount}$ من العدم إلى جيبك بنجاح!`, threadID);
      }
      let bankMoney = vault[senderID].bank_balance;
      let withdrawAmt = args[1] == "كل" ? bankMoney : parseInt(args[1]);

      if (!withdrawAmt || withdrawAmt <= 0 || withdrawAmt > bankMoney) 
        return api.sendMessage("◯ رصيدك البنكي لا يكفي!", threadID);

      await Currencies.increaseMoney(senderID, withdrawAmt);
      vault[senderID].bank_balance -= withdrawAmt;
      fs.writeFileSync(path, JSON.stringify(vault, null, 2));
      return api.sendMessage(`✅ تم سحب ${withdrawAmt}$ بنجاح.`, threadID);
    }

    case 'منح': {
      if (!isTop) return api.sendMessage("◯ هـذا الأمـر خـاص بـالـتـوب ايـمـن فـقـط 👑", threadID);
      let amount = parseInt(args[1]);
      let mention = Object.keys(event.mentions)[0];
      if (!mention || !amount) return api.sendMessage("◯ مـنـشـن الـشـخـص واكـتـب الـمـبـلغ سيدي", threadID);
      
      await Currencies.increaseMoney(mention, amount);
      return api.sendMessage(`👑 أمـرك مـطـاع سيدي التوب.. تم منح ${amount}$ للمحظوظ ${event.mentions[mention].replace("@", "")}.`, threadID);
    }

    case 'تصفير': {
      if (!isTop) return api.sendMessage("◯ تـريـد تـصـفـيـر الأمـوال وأنـت لـسـت الـتـوب؟ هـهـه!", threadID);
      let mention = Object.keys(event.mentions)[0];
      if (!mention) return api.sendMessage("◯ مـنـشـن الـضحية لـتـصـفـيـر حـسـابـه سيدي", threadID);
      
      await Currencies.setData(mention, { money: 0 });
      if (vault[mention]) vault[mention].bank_balance = 0;
      fs.writeFileSync(path, JSON.stringify(vault, null, 2));
      return api.sendMessage(`👑 سيدي التوب.. تم إعلان إفلاس المستخدم بنجاح! رصيده الآن 0$.`, threadID);
    }

    default:
      return api.sendMessage(`◈ ──『 الـبـنـك الإمـبـراطـوري 』── ◈\n\n◯ [ بنك عرض ] : كشف الثراء\n◯ [ بنك ايداع ] : تأمين النقاط\n◯ [ بنك سحب ] : استدعاء الأموال\n◯ [ بنك منح ] : هبات التوب (للمدراء)\n◯ [ بنك تصفير ] : عقاب التوب (للمدراء)\n\n│←› سـيـد الـخـزيـنـة: الـتـوب ايـمـن 👑`, threadID);
  }
};
