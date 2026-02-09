const { Groq } = require('groq-sdk');

module.exports.config = {
    name: "جروك",
    aliases: ["groq", "شات_جروك", "محادثة"],
    description: "محادثة ذكية مع Groq AI (نموذج Llama 4)",
    usage: "جروك [رسالتك]",
    cooldown: 5,
    permissions: [],
    category: "ai"
};

module.exports.run = async ({ api, event, args }) => {
    try {
        // التحقق من وجود رسالة
        if (!args[0]) {
            return api.sendMessage(
                "⚠️ الرجاء كتابة رسالتك!\n\n" +
                "📝 مثال: جروك من هو ألبرت آينشتاين؟",
                event.threadID,
                event.messageID
            );
        }

        const userMessage = args.join(" ");
        
        // إرسال رسالة انتظار
        const waitMsg = await api.sendMessage(
            "⏳ جاري التفكير والرد على سؤالك...\n💭 الرجاء الانتظار",
            event.threadID
        );

        // إنشاء client مع API key
        const groq = new Groq({
            apiKey: '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'
        });

        // إنشاء المحادثة
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "أنت مساعد ذكي ومفيد. تجيب بالعربية بشكل واضح ومفصل."
                },
                {
                    role: "user",
                    content: userMessage
                }
            ],
            model: "meta-llama/llama-4-maverick-17b-128e-instruct",
            temperature: 0.8,
            max_completion_tokens: 2048,
            top_p: 0.9,
            stream: false
        });

        // الحصول على الرد
        const response = chatCompletion.choices[0]?.message?.content || "عذراً، لم أتمكن من الحصول على رد.";

        // حذف رسالة الانتظار
        api.unsendMessage(waitMsg.messageID);

        // إرسال الرد
        return api.sendMessage(
            `🤖 جروك AI:\n\n${response}\n\n` +
            `━━━━━━━━━━━━━━━\n` +
            `💬 سؤالك: ${userMessage.substring(0, 50)}${userMessage.length > 50 ? '...' : ''}`,
            event.threadID,
            event.messageID
        );

    } catch (error) {
        console.error("❌ خطأ في أمر جروك:", error);
        
        let errorMsg = "⚠️ حدث خطأ أثناء معالجة طلبك.";
        
        if (error.message.includes("rate_limit")) {
            errorMsg = "⚠️ تم تجاوز حد الطلبات. الرجاء المحاولة بعد قليل.";
        } else if (error.message.includes("invalid_api_key")) {
            errorMsg = "⚠️ مفتاح API غير صالح. الرجاء التحقق من الإعدادات.";
        }
        
        return api.sendMessage(
            `${errorMsg}\n\n📝 الخطأ: ${error.message}`,
            event.threadID,
            event.messageID
        );
    }
};
