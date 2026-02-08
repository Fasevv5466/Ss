// ═══════════════════════════════════════════════════════════
// 👑 KIRA - نقاط
// المطور: Ayman ♛
// الوصف: التحكم الإمبراطوري في مستويات ونقاط الأعضاء
// ═══════════════════════════════════════════════════════════

module.exports.config = {
  name: "نقاط",
  aliases: [],
  version: "2.0.0",
  hasPermssion: 2,
  credits: "Ayman ♛",
  description: "التحكم الإمبراطوري في مستويات ونقاط الأعضاء",
  commandCategory: "developer",
  usages: "[بالرد / بالتاغ / UID / رفع / del]",
  cooldowns: 2
};

module.exports.run = async function({ api, event, args, Currencies, Users }) {
    const { threadID, messageID, senderID, mentions, type, messageReply } = event;
    const out = (msg) => api.sendMessage(msg, threadID, messageID);

    // 👑 التحقق من الهوية السيادية (الإمبراطور أيمن)
    const EMPEROR_ID = "61577861540407";
    if (senderID !== EMPEROR_ID) return out("◈ ───『 تـنـبـيـه مـلـكـي 』─── ◈\n\n◯ سيدي، هذا الأمر خاص بالإمبراطور أيمن فقط!\n———————————————\n◈ ─────────────── ◈");

    // 1️⃣ ميزة الرد على الرسالة (التعديل السريع)
    if (type == "message_reply") {
        const targetID = messageReply.senderID;
        const expSet = parseInt(args[0]);
        if (isNaN(expSet)) return out("⚠️ سيدي، يرجى الرد على الرسالة وكتابة عدد النقاط الجديد.");
        
        await Currencies.setData(targetID, { exp: expSet });
        const name = (await Users.getData(targetID)).name;
        return out(`◈ ───『 تـعديـل الـنقاط 』─── ◈\n\n◯ الـمستـفيد: ${name}\n◉ الـنقاط الـجديدة: ${expSet} رسالة\n———————————————\n◈ ─────────────── ◈`);
    }

    // 2️⃣ ميزة الرفع الشخصي
    if (args[0] == 'رفع') {
        const expSet = parseInt(args[1]);
        if (isNaN(expSet)) return out("⚠️ سيدي، حدد عدد النقاط الذي ترغب برفعه لنفسك.");
        await Currencies.setData(senderID, { exp: expSet });
        return out(`◈ ───『 تـعـزيـز ذاتـي 』─── ◈\n\n◯ تـم تـغيير نـقاطك إلـى: ${expSet}\n———————————————\n◈ ─────────────── ◈`);
    }

    // 3️⃣ ميزة الحذف والتصفير (del)
    if (args[0] == "del") {
        let targetID, name;
        if (args[1] == 'نقاطي') {
            targetID = senderID;
            name = "خزنتك";
        } else if (Object.keys(mentions).length > 0) {
            targetID = Object.keys(mentions)[0];
            name = mentions[targetID].replace("@", "");
        } else {
            return out("⚠️ استخدم: نقاط del [نقاطي / تاغ]");
        }

        await Currencies.setData(targetID, { exp: 0 });
        return out(`◈ ───『 تـصـفـيـر الـنقاط 』─── ◈\n\n◯ تـم حـذف جـميع نـقاط: ${name}\n———————————————\n◈ ─────────────── ◈`);
    }

    // 4️⃣ ميزة التعديل عبر التاغ (@Mention)
    if (Object.keys(mentions).length > 0) {
        const targetID = Object.keys(mentions)[0];
        const expSet = parseInt(args[args.length - 1]);
        if (isNaN(expSet)) return out("⚠️ سيدي، يرجى وضع عدد النقاط بعد التاغ.");

        await Currencies.setData(targetID, { exp: expSet });
        return out(`◈ ───『 تـعديـل الـنقاط 』─── ◈\n\n◯ الـعضو: ${mentions[targetID].replace("@", "")}\n◉ الـنقاط: ${expSet} رسالة\n———————————————\n◈ ─────────────── ◈`);
    }

    // 5️⃣ ميزة التعديل عبر الايدي (UID)
    if (args[0] == "UID") {
        const targetID = args[1];
        const expSet = parseInt(args[2]);
        if (!targetID || isNaN(expSet)) return out("⚠️ الاستخدام: نقاط UID [الايدي] [النقاط]");

        try {
            const userName = (await Users.getData(targetID)).name;
            await Currencies.setData(targetID, { exp: expSet });
            return out(`◈ ───『 تـعديـل الـنقاط 』─── ◈\n\n◯ الـحساب: ${userName}\n◉ الـنقاط: ${expSet}\n———————————————\n◈ ─────────────── ◈`);
        } catch (e) {
            return out("⚠️ فشل العثور على هذا الايدي سيدي.");
        }
    }

    // واجهة المساعدة في حال عدم إدخال أوامر صحيحة
    return out(`◈ ───『 تـحـكـم الـمـسـتـوى 』─── ◈\n\n◯ خـيارات الإمـبـراطـور :\n◉ رد + عدد (للتعديل السريع)\n◉ نقاط رفع [عدد] (لنفسك)\n◉ نقاط [تاغ] [عدد]\n◉ نقاط UID [الايدي] [عدد]\n◉ نقاط del [نقاطي/تاغ] (للحذف)\n———————————————\n◈ ─────────────── ◈\n│←› بـإدارة: أيـمـن الـتـوب`);
};
