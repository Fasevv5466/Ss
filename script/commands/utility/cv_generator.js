const Groq = require('groq-sdk');

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
                "• سيرة_ذاتية مصمم جرافيك",
                event.threadID,
                event.messageID
            );
        }

        const job = args.join(" ");
        const waitMsg = await api.sendMessage(
            `📄 جاري إنشاء سيرة ذاتية احترافية...\n💼 الوظيفة: ${job}`,
            event.threadID
        );

        // تأكد من وضع مفتاح الـ API الجديد والخاص بك هنا
        const groq = new Groq({
            apiKey: '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'
        });

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "أنت خبير في كتابة السير الذاتية الاحترافية باللغة العربية. تكتب نماذج جذابة ومنظمة."
                },
                {
                    role: "user",
                    content: `اكتب نموذج سيرة ذاتية احترافية لوظيفة: ${job}\n\nاستخدم التنسيق التالي:\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n📄 السيرة الذاتية\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n(اكمل بقية الأقسام...)`
                }
            ],
            model: "llama-3.3-70b-versatile", // تم تغيير الموديل لضمان العمل
            temperature: 0.7,
            max_tokens: 2048, 
            top_p: 1,
            stream: false
        });

        const cv = chatCompletion.choices[0]?.message?.content || "عذراً، لم أتمكن من إنشاء السيرة.";

        api.unsendMessage(waitMsg.messageID);

        // إرسال النتيجة
        return api.sendMessage(
            `${cv}\n\n` +
            `━━━━━━━━━━━━━━━\n` +
            `🤖 مدعوم بـ Groq AI`,
            event.threadID,
            event.messageID
        );

    } catch (error) {
        console.error("❌ خطأ في سيرة_ذاتية:", error);
        return api.sendMessage(
            `⚠️ حدث خطأ: تأكد من مفتاح الـ API أو حاول لاحقاً.\n📝 نوع الخطأ: ${error.message}`,
            event.threadID,
            event.messageID
        );
    }
};
