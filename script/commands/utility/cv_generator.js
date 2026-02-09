const { Groq } = require('groq-sdk');

module.exports.config = {
    name: "سيرة_ذاتية",
    aliases: ["cv", "resume", "نموذج_سيرة"],
    description: "كتابة سيرة ذاتية احترافية مخصصة",
    usage: "سيرة_ذاتية [المجال/الوظيفة]",
    cooldown: 10,
    permissions: [],
    category: "utility"
};

module.exports.run = async ({ api, event, args }) => {
    try {
        if (!args[0]) {
            return api.sendMessage(
                "📄 مولد السير الذاتية الاحترافية\n\n" +
                "📝 الاستخدام:\n" +
                "سيرة_ذاتية [المجال أو الوظيفة]\n\n" +
                "💡 أمثلة:\n" +
                "• سيرة_ذاتية مبرمج\n" +
                "• سيرة_ذاتية مدير تسويق\n" +
                "• سيرة_ذاتية مصمم جرافيك\n" +
                "• سيرة_ذاتية طبيب\n" +
                "• سيرة_ذاتية محاسب",
                event.threadID,
                event.messageID
            );
        }

        const job = args.join(" ");

        const waitMsg = await api.sendMessage(
            `📄 جاري إنشاء سيرة ذاتية احترافية...\n💼 الوظيفة: ${job}`,
            event.threadID
        );

        const groq = new Groq({
            apiKey: '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'
        });

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "أنت خبير في كتابة السير الذاتية. تكتب نماذج احترافية تسلط الضوء على المهارات والخبرات بطريقة جذابة لأصحاب العمل."
                },
                {
                    role: "user",
                    content: `اكتب نموذج سيرة ذاتية احترافية لوظيفة: ${job}\n\nاكتب السيرة بهذا الشكل:\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n📄 السيرة الذاتية\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n👤 المعلومات الشخصية:\n[اسم افتراضي]\n[معلومات اتصال نموذجية]\n\n🎯 الهدف الوظيفي:\n[هدف مهني واضح ومختصر]\n\n💼 الخبرات العملية:\nالشركة | الفترة | المنصب\n• [إنجاز رئيسي 1]\n• [إنجاز رئيسي 2]\n• [إنجاز رئيسي 3]\n\n[كرر لـ 2-3 خبرات]\n\n🎓 المؤهلات التعليمية:\n[الدرجة - الجامعة - السنة]\n\n💻 المهارات:\n[مهارات تقنية ومهارات شخصية مناسبة للوظيفة]\n\n🏆 الإنجازات والجوائز:\n[إنجازات بارزة]\n\n🌐 اللغات:\n[اللغات ومستوى الإتقان]\n\n📚 الدورات والشهادات:\n[دورات ذات صلة]\n\n💡 الاهتمامات:\n[اهتمامات مهنية]\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nاجعلها نموذجية يمكن تعديلها وملء البيانات الشخصية فيها.`
                }
            ],
            model: "meta-llama/llama-4-maverick-17b-128e-instruct",
            temperature: 0.7,
            max_completion_tokens: 2048,
            top_p: 0.9,
            stream: false
        });

        const cv = chatCompletion.choices[0]?.message?.content || "عذراً، لم أتمكن من إنشاء السيرة.";

        api.unsendMessage(waitMsg.messageID);

        // تقسيم إذا كان طويلاً
        if (cv.length > 1800) {
            const parts = [];
            let currentPart = "";
            const lines = cv.split('\n');

            for (const line of lines) {
                if ((currentPart + line + '\n').length > 1800) {
                    if (currentPart) parts.push(currentPart);
                    currentPart = line + '\n';
                } else {
                    currentPart += line + '\n';
                }
            }
            if (currentPart) parts.push(currentPart);

            for (let i = 0; i < parts.length; i++) {
                await api.sendMessage(
                    parts[i],
                    event.threadID,
                    i === parts.length - 1 ? event.messageID : null
                );

                if (i < parts.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1500));
                }
            }

            // نصائح إضافية
            await api.sendMessage(
                `📋 نصائح لسيرة ذاتية ناجحة:\n\n` +
                `✅ استخدم أرقام وإحصائيات في الإنجازات\n` +
                `✅ اجعلها قصيرة (صفحة أو صفحتين)\n` +
                `✅ خصص السيرة لكل وظيفة\n` +
                `✅ استخدم كلمات قوية (قدت، أنجزت، طورت)\n` +
                `✅ راجع الأخطاء الإملائية\n` +
                `✅ أضف رابط LinkedIn\n\n` +
                `💡 هذا نموذج - عدّله بمعلوماتك الشخصية!\n` +
                `🎯 بالتوفيق في البحث عن وظيفة!`,
                event.threadID
            );

        } else {
            return api.sendMessage(
                `${cv}\n\n` +
                `━━━━━━━━━━━━━━━\n` +
                `📋 نصائح:\n` +
                `✅ عدّل المعلومات الشخصية\n` +
                `✅ أضف خبراتك الحقيقية\n` +
                `✅ خصصها لكل وظيفة\n` +
                `✅ راجع الأخطاء قبل الإرسال\n\n` +
                `💼 بالتوفيق في مسيرتك المهنية!`,
                event.threadID,
                event.messageID
            );
        }

    } catch (error) {
        console.error("❌ خطأ في سيرة_ذاتية:", error);
        return api.sendMessage(
            `⚠️ حدث خطأ: ${error.message}`,
            event.threadID,
            event.messageID
        );
    }
};
