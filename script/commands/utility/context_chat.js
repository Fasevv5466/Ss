const { Groq } = require('groq-sdk');

// تخزين مؤقت للمحادثات (في الذاكرة)
const conversations = new Map();

module.exports.config = {
    name: "جرو",
    aliases: ["chat_groq", "حوار", "دردشة_جروك"],
    description: "محادثة متواصلة مع Groq AI (يحفظ السياق)",
    usage: "جرو [رسالتك] | استخدم 'مسح' لحذف السياق",
    cooldown: 5,
    permissions: [],
    category: "ai"
};

module.exports.run = async ({ api, event, args }) => {
    try {
        const userId = event.senderID;
        const threadId = event.threadID;
        const conversationKey = `${threadId}_${userId}`;

        // التحقق من أمر المسح
        if (args[0] === "مسح" || args[0] === "clear" || args[0] === "حذف") {
            conversations.delete(conversationKey);
            return api.sendMessage(
                "🗑️ تم مسح سياق المحادثة!\n\n" +
                "✨ يمكنك البدء بمحادثة جديدة الآن.",
                event.threadID,
                event.messageID
            );
        }

        if (!args[0]) {
            const hasContext = conversations.has(conversationKey);
            return api.sendMessage(
                "💬 محادثة جرو - نموذج متقدم\n\n" +
                "📝 الاستخدام: جرو [رسالتك]\n" +
                "🗑️ لمسح السياق: جرو مسح\n\n" +
                `📊 الحالة: ${hasContext ? '✅ يوجد سياق محادثة' : '❌ لا يوجد سياق'}`,
                event.threadID,
                event.messageID
            );
        }

        const userMessage = args.join(" ");
        
        const waitMsg = await api.sendMessage(
            "💭 جاري التفكير...\n🧠 استخدام السياق السابق",
            event.threadID
        );

        // الحصول على المحادثة السابقة أو إنشاء جديدة
        if (!conversations.has(conversationKey)) {
            conversations.set(conversationKey, [
                {
                    role: "system",
                    content: "أنت مساعد ذكي ومحترف. تتحدث العربية بطلاقة. تحفظ سياق المحادثة وتجيب بناءً عليه. تكون ودوداً ومفيداً."
                }
            ]);
        }

        const conversationHistory = conversations.get(conversationKey);
        
        // إضافة رسالة المستخدم
        conversationHistory.push({
            role: "user",
            content: userMessage
        });

        // تحديد عدد الرسائل (لتجنب تجاوز الحد)
        const maxMessages = 10; // آخر 10 رسائل
        if (conversationHistory.length > maxMessages) {
            // الاحتفاظ بـ system message + آخر الرسائل
            const systemMsg = conversationHistory[0];
            const recentMessages = conversationHistory.slice(-maxMessages);
            conversations.set(conversationKey, [systemMsg, ...recentMessages]);
        }

        const groq = new Groq({
            apiKey: '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'
        });

        const chatCompletion = await groq.chat.completions.create({
            messages: conversations.get(conversationKey),
            model: "meta-llama/llama-4-maverick-17b-128e-instruct",
            temperature: 0.8,
            max_completion_tokens: 2048,
            top_p: 0.9,
            stream: false
        });

        const response = chatCompletion.choices[0]?.message?.content || "عذراً، لم أتمكن من الرد.";

        // حفظ رد المساعد
        conversationHistory.push({
            role: "assistant",
            content: response
        });

        conversations.set(conversationKey, conversationHistory);

        // حذف رسالة الانتظار
        api.unsendMessage(waitMsg.messageID);

        // حساب عدد الرسائل في السياق
        const messageCount = Math.floor((conversationHistory.length - 1) / 2);

        return api.sendMessage(
            `💬 جروك AI (محادثة):\n\n${response}\n\n` +
            `━━━━━━━━━━━━━━━\n` +
            `📊 عدد الرسائل في السياق: ${messageCount}\n` +
            `🗑️ لمسح السياق: جرو مسح`,
            event.threadID,
            event.messageID
        );

    } catch (error) {
        console.error("❌ خطأ في جرو:", error);
        return api.sendMessage(
            `⚠️ حدث خطأ: ${error.message}`,
            event.threadID,
            event.messageID
        );
    }
};

// تنظيف المحادثات القديمة كل ساعة
setInterval(() => {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    for (const [key, value] of conversations.entries()) {
        // يمكنك إضافة timestamp لكل محادثة لتنظيف القديمة
        // هنا نحذف فقط المحادثات الطويلة جداً
        if (value.length > 50) {
            conversations.delete(key);
            console.log(`🗑️ تم حذف محادثة قديمة: ${key}`);
        }
    }
}, 3600000); // كل ساعة
