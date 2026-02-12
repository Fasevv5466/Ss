module.exports.config = {
    name: "setwelcome",
    version: "2.0.0",
    hasPermssion: 1,
    credits: "KIRA System",
    description: "تخصيص رسالة الترحيب",
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
                customJoin: null
            });
            
            return api.sendMessage(
                "✅ تم إعادة تعيين رسالة الترحيب للافتراضية",
                threadID,
                messageID
            );
        }

        // التحقق من الإدخال
        if (!input || input.trim().length === 0) {
            const guide = 
                `◈ ───『 📝 دليل الاستخدام 』─── ◈\n` +
                `◈ ────────────── ◈\n\n` +
                `⚙️ الأمر: .setwelcome <الرسالة>\n\n` +
                `📋 المتغيرات المتاحة:\n` +
                `• {names} - أسماء الأعضاء الجدد\n` +
                `• {name} - اسم العضو الأول\n` +
                `• {threadName} - اسم المجموعة\n` +
                `• {count} - عدد الأعضاء\n` +
                `• {author} - من أضاف العضو\n\n` +
                `🔄 لإعادة التعيين: .setwelcome reset\n\n` +
                `💡 مثال:\n` +
                `.setwelcome أهلاً {name} في {threadName}!\n` +
                `أنت العضو رقم {count} 💖\n\n` +
                `◈ ────────────── ◈`;

            return api.sendMessage(guide, threadID, messageID);
        }

        // حفظ الرسالة المخصصة
        await Threads.setData(threadID, {
            customJoin: input
        });

        // تحديث الذاكرة
        const threadData = global.data.threadData.get(parseInt(threadID)) || {};
        threadData.customJoin = input;
        global.data.threadData.set(parseInt(threadID), threadData);

        return api.sendMessage(
            `✅ تم تعيين رسالة الترحيب بنجاح!\n\n` +
            `📝 المعاينة:\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `${input}\n` +
            `━━━━━━━━━━━━━━━━━━━━\n\n` +
            `💡 سيتم استخدام هذه الرسالة عند انضمام أعضاء جدد`,
            threadID,
            messageID
        );

    } catch (error) {
        console.error("❌ خطأ في setwelcome:", error);
        return api.sendMessage(
            "❌ حدث خطأ أثناء حفظ رسالة الترحيب",
            threadID,
            messageID
        );
    }
};
