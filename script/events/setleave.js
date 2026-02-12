module.exports.config = {
    name: "setleave",
    version: "2.0.0",
    hasPermssion: 1,
    credits: "KIRA System",
    description: "تخصيص رسالة الوداع",
    commandCategory: "admin",
    usages: "[الرسالة] أو reset",
    cooldowns: 5
};

module.exports.run = async function({ api, event, args, Threads }) {
    const { threadID, messageID } = event;

    try {
        const input = args.join(" ");

        // إعادة تعيين
        if (input.toLowerCase() === "reset") {
            await Threads.setData(threadID, {
                customLeave: null
            });
            
            return api.sendMessage(
                "✅ تم إعادة تعيين رسالة الوداع للافتراضية",
                threadID,
                messageID
            );
        }

        // التحقق من الإدخال
        if (!input || input.trim().length === 0) {
            const guide = 
                `◈ ───『 📝 دليل الاستخدام 』─── ◈\n` +
                `◈ ────────────── ◈\n\n` +
                `⚙️ الأمر: .setleave <الرسالة>\n\n` +
                `📋 المتغيرات المتاحة:\n` +
                `• {userName} - اسم من غادر\n` +
                `• {name} - اسم من غادر (بديل)\n` +
                `• {threadName} - اسم المجموعة\n` +
                `• {kickerName} - من طرد (إن وُجد)\n` +
                `• {author} - من طرد (بديل)\n\n` +
                `🔄 لإعادة التعيين: .setleave reset\n\n` +
                `💡 مثال:\n` +
                `.setleave وداعاً {userName}\n` +
                `نتمنى لك التوفيق 💔\n\n` +
                `◈ ────────────── ◈`;

            return api.sendMessage(guide, threadID, messageID);
        }

        // حفظ الرسالة المخصصة
        await Threads.setData(threadID, {
            customLeave: input
        });

        // تحديث الذاكرة
        const threadData = global.data.threadData.get(parseInt(threadID)) || {};
        threadData.customLeave = input;
        global.data.threadData.set(parseInt(threadID), threadData);

        return api.sendMessage(
            `✅ تم تعيين رسالة الوداع بنجاح!\n\n` +
            `📝 المعاينة:\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `${input}\n` +
            `━━━━━━━━━━━━━━━━━━━━\n\n` +
            `💡 سيتم استخدام هذه الرسالة عند مغادرة الأعضاء`,
            threadID,
            messageID
        );

    } catch (error) {
        console.error("❌ خطأ في setleave:", error);
        return api.sendMessage(
            "❌ حدث خطأ أثناء حفظ رسالة الوداع",
            threadID,
            messageID
        );
    }
};
