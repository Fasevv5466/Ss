const { Groq } = require('groq-sdk');

module.exports.config = {
    name: "تفسير_حلم",
    aliases: ["dream", "تحليل_حلم", "الأحلام"],
    description: "تفسير وتحليل الأحلام بطريقة نفسية وتراثية",
    usage: "تفسير_حلم [وصف الحلم]",
    cooldown: 5,
    permissions: [],
    category: "fun"
};

module.exports.run = async ({ api, event, args }) => {
    try {
        if (!args[0]) {
            return api.sendMessage(
                "💭 تفسير الأحلام\n\n" +
                "📝 الاستخدام:\n" +
                "تفسير_حلم [وصف حلمك بالتفصيل]\n\n" +
                "💡 مثال:\n" +
                "تفسير_حلم حلمت أني أطير في السماء\n\n" +
                "⚠️ ملاحظة: التفسير للترفيه والاستئناس فقط",
                event.threadID,
                event.messageID
            );
        }

        const dream = args.join(" ");

        const waitMsg = await api.sendMessage(
            `💭 جاري تحليل حلمك...\n🔮 قراءة الرموز والدلالات...`,
            event.threadID
        );

        const groq = new Groq({
            apiKey: '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'
        });

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "أنت محلل أحلام يجمع بين التفسير التراثي والتحليل النفسي الحديث. تقدم تفسير شامل ومتوازن للأحلام مع التذكير بأن التفسير للاستئناس فقط."
                },
                {
                    role: "user",
                    content: `فسر لي هذا الحلم بطريقة شاملة: ${dream}\n\nاكتب التفسير بهذا الشكل:\n\n🔮 التفسير التراثي:\n[تفسير حسب كتب التفسير التراثية]\n\n🧠 التحليل النفسي:\n[تحليل نفسي للحلم وما قد يعكسه من مشاعر أو حالات]\n\n🎯 الرموز الأساسية:\n[شرح الرموز المهمة في الحلم]\n\n💡 الدلالات المحتملة:\n[ماذا قد يعني الحلم في حياتك]\n\n✨ رسالة الحلم:\n[الرسالة أو الدرس المستفاد]\n\n⚠️ تنبيه مهم:\n"هذا التفسير للاستئناس فقط، ولا يمكن الاعتماد عليه في اتخاذ قرارات مصيرية. الأحلام تحتمل تفسيرات متعددة تختلف حسب حالة الرائي."`
                }
            ],
            model: "meta-llama/llama-4-maverick-17b-128e-instruct",
            temperature: 0.8,
            max_completion_tokens: 1536,
            top_p: 0.9,
            stream: false
        });

        const interpretation = chatCompletion.choices[0]?.message?.content || "عذراً، لم أتمكن من تفسير الحلم.";

        api.unsendMessage(waitMsg.messageID);

        return api.sendMessage(
            `💭 تفسير حلمك:\n\n` +
            `${interpretation}\n\n` +
            `━━━━━━━━━━━━━━━\n` +
            `📖 الحلم: ${dream.substring(0, 80)}${dream.length > 80 ? '...' : ''}\n` +
            `🔮 التفسير: للاستئناس فقط\n` +
            `✨ الأحلام تعكس ما في النفس`,
            event.threadID,
            event.messageID
        );

    } catch (error) {
        console.error("❌ خطأ في تفسير_حلم:", error);
        return api.sendMessage(
            `⚠️ حدث خطأ: ${error.message}`,
            event.threadID,
            event.messageID
        );
    }
};
