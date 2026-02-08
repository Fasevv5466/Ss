module.exports.config = {
    name: "حظر",
    version: "2.0.0",
    hasPermssion: 2,
    credits: "ايمن",
    description: "حظر مستخدم من استخدام البوت",
    commandCategory: "admin",
    usages: "حظر [@منشن/رد/ID] [السبب]",
    cooldowns: 3
};

module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
    const { threadID, messageID, senderID, mentions, type } = event;
    const fs = require('fs-extra');
    const moment = require('moment-timezone');
    
    const adminID = global.config.ADMINBOT[0];
    
    if (senderID !== adminID) {
        return api.sendMessage(
            "⌬ ━━ 𝗞𝗜𝗥𝗔 𝗔𝗗𝗠𝗜𝗡 ━━ ⌬\n\n⛔ هذا الأمر مخصص للمطور فقط",
            threadID,
            messageID
        );
    }

    let targetID = null;
    let targetName = null;
    let reason = args.slice(1).join(" ") || "لم يُحدد سبب";

    if (Object.keys(mentions).length > 0) {
        targetID = Object.keys(mentions)[0];
        targetName = mentions[targetID];
    } else if (type === "message_reply") {
        targetID = event.messageReply.senderID;
        const userInfo = await api.getUserInfo(targetID);
        targetName = userInfo[targetID].name;
    } else if (args[0] && !isNaN(args[0])) {
        targetID = args[0];
        try {
            const userInfo = await api.getUserInfo(targetID);
            targetName = userInfo[targetID].name;
        } catch {
            return api.sendMessage(
                "⌬ ━━ 𝗞𝗜𝗥𝗔 𝗔𝗗𝗠𝗜𝗡 ━━ ⌬\n\n❌ المعرف غير صحيح",
                threadID,
                messageID
            );
        }
    } else {
        return api.sendMessage(
            "⌬ ━━ 𝗞𝗜𝗥𝗔 𝗔𝗗𝗠𝗜𝗡 ━━ ⌬\n\n💡 الاستخدام:\n• حظر [@منشن]\n• حظر [ID]\n• الرد على رسالة + حظر",
            threadID,
            messageID
        );
    }

    if (targetID === adminID) {
        return api.sendMessage(
            "⌬ ━━ 𝗞𝗜𝗥𝗔 𝗔𝗗𝗠𝗜𝗡 ━━ ⌬\n\n🤔 لا يمكنك حظر المطور!",
            threadID,
            messageID
        );
    }

    try {
        const userData = await Users.getData(targetID);
        
        if (userData.banned) {
            return api.sendMessage(
                "⌬ ━━ 𝗞𝗜𝗥𝗔 𝗔𝗗𝗠𝗜𝗡 ━━ ⌬\n\n⚠️ هذا المستخدم محظور مسبقاً",
                threadID,
                messageID
            );
        }

        await Users.setData(targetID, {
            banned: true,
            reason: reason,
            bannedBy: senderID,
            bannedAt: moment().tz("Africa/Casablanca").format("DD/MM/YYYY HH:mm:ss")
        });

        global.data.userBanned.set(targetID, {
            reason: reason,
            dateAdded: Date.now()
        });

        api.sendMessage(
            `⌬ ━━ 𝗞𝗜𝗥𝗔 𝗔𝗗𝗠𝗜𝗡 ━━ ⌬\n\n✅ تم حظر المستخدم بنجاح\n\n👤 الاسم: ${targetName}\n🆔 المعرف: ${targetID}\n📝 السبب: ${reason}\n⏰ الوقت: ${moment().tz("Africa/Casablanca").format("HH:mm DD/MM/YYYY")}`,
            threadID,
            messageID
        );

    } catch (error) {
        console.error(error);
        return api.sendMessage(
            "⌬ ━━ 𝗞𝗜𝗥𝗔 𝗗𝗘𝗩𝗘𝗟𝗢𝗣𝗘𝗥 ━━ ⌬\n\n❌ حدث خطأ أثناء تنفيذ الأمر",
            threadID,
            messageID
        );
    }
};
