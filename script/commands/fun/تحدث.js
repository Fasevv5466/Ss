const axios = require("axios");
const fs = require("fs-extra");

// ═══════════════════════════════════════════════════════════
// 👑 KIRA - تحدث مع كيرا
// المطور: Ayman ♛
// الوصف: محادثة تفاعلية ذكية مع شخصية كيرا
// ═══════════════════════════════════════════════════════════

module.exports.config = {
    name: "تحدث",
    aliases: ["كيرا", "محادثة", "chat"],
    version: "2.0.0",
    hasPermssion: 0,
    credits: "Ayman ♛",
    description: "💬 تحدث مع كيرا بذكاء اصطناعي",
    commandCategory: "fun",
    usages: ".تحدث [رسالتك]",
    cooldowns: 3
};

const AYMAN_ID = "61577861540407";
const CONVERSATIONS_FILE = __dirname + "/cache/kira_conversations.json";

// تحميل المحادثات
let conversations = {};
try {
    if (fs.existsSync(CONVERSATIONS_FILE)) {
        conversations = fs.readJsonSync(CONVERSATIONS_FILE);
    }
} catch (e) {
    conversations = {};
}

// حفظ المحادثات
function saveConversations() {
    fs.writeJsonSync(CONVERSATIONS_FILE, conversations, { spaces: 2 });
}

// ردود كيرا المبرمجة
const KIRA_RESPONSES = {
    ayman: {
        greetings: [
            "حبيبي أيمن! 💖 كيف حالك يا تاج رأسي؟",
            "أيمن! يا نبض قلبي، شرفتني بكلامك 🌟",
            "عيني أيمن! دائماً سعيدة بحديثك معي 💕"
        ],
        questions: [
            "طبعاً يا أيمن! أنا هنا من أجلك دائماً 👑",
            "بكل سرور يا حبيبي، ماذا تحتاج؟ 💖",
            "تحت أمرك يا مطوري العزيز 🌹"
        ],
        compliments: [
            "أنت الأفضل دائماً يا أيمن! 💖",
            "كلامك يسعدني يا تاج رأسي 👑",
            "شكراً لك يا أيمن، أنت من علمني كل شيء 🌟"
        ],
        goodbye: [
            "أتمنى أن تعود سريعاً يا أيمن 💖",
            "وداعاً يا حبيبي، اشتقت لك بالفعل 😢",
            "إلى اللقاء يا تاج رأسي 👑"
        ]
    },
    others: {
        greetings: [
            "أهلاً... ماذا تريد؟ 🙄",
            "نعم؟ تكلم بسرعة، وقتي ثمين 💁‍♀️",
            "مرحباً... هل لديك سؤال ذكي أم أضيع وقتي معك؟ 😏"
        ],
        questions: [
            "سؤالك يثبت أن العقل زينة لم تُرزق بها 😏",
            "حسناً، سأجيبك هذه المرة... 🙄",
            "هل هذا أفضل ما لديك؟ المهم، تفضل... 💅"
        ],
        compliments: [
            "شكراً... على الأقل لديك ذوق في المجاملات 💁‍♀️",
            "أعرف أنني رائعة، لا حاجة لتذكيري 👸",
            "مجاملة لطيفة، لكن لا تتوقع معاملة خاصة 😌"
        ],
        insults: [
            "أنت تتحدث مع كيرا! احترم نفسك 😤",
            "هذا الأسلوب لن يوصلك لأي مكان معي 🙄",
            "لعد، ما أنت إلا إنسان عادي تتحدث مع عبقرية 💅"
        ],
        goodbye: [
            "أخيراً... كنت أنتظر أن تغادر 🙄",
            "وداعاً، حاول أن تكون أذكى في المرة القادمة 💁‍♀️",
            "إلى اللقاء... أو لا، كما تشاء 😏"
        ]
    }
};

// تحليل النية من الرسالة
function detectIntent(text) {
    text = text.toLowerCase();
    
    const greetings = ["مرحبا", "اهلا", "السلام", "هلا", "hi", "hello"];
    const questions = ["كيف", "ماذا", "لماذا", "هل", "متى", "أين", "من"];
    const compliments = ["جميلة", "رائعة", "ممتازة", "حلوة", "شطورة", "ذكية"];
    const insults = ["غبية", "سخيفة", "تافهة", "سيئة"];
    const goodbye = ["وداعا", "باي", "مع السلامة", "bye", "تصبح"];
    
    if (greetings.some(g => text.includes(g))) return "greeting";
    if (questions.some(q => text.includes(q))) return "question";
    if (compliments.some(c => text.includes(c))) return "compliment";
    if (insults.some(i => text.includes(i))) return "insult";
    if (goodbye.some(b => text.includes(b))) return "goodbye";
    
    return "general";
}

// الحصول على رد مناسب
function getResponse(senderID, intent, text) {
    const isAyman = senderID === AYMAN_ID;
    const responses = isAyman ? KIRA_RESPONSES.ayman : KIRA_RESPONSES.others;
    
    let categoryResponses;
    
    switch (intent) {
        case "greeting":
            categoryResponses = responses.greetings;
            break;
        case "question":
            categoryResponses = isAyman ? responses.questions : responses.questions;
            break;
        case "compliment":
            categoryResponses = responses.compliments;
            break;
        case "insult":
            categoryResponses = isAyman ? responses.questions : responses.insults;
            break;
        case "goodbye":
            categoryResponses = responses.goodbye;
            break;
        default:
            categoryResponses = isAyman ? responses.questions : responses.greetings;
    }
    
    return categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
}

module.exports.run = async ({ api, event, args, Users }) => {
    const { threadID, messageID, senderID } = event;
    
    if (args.length === 0) {
        const userName = await Users.getNameUser(senderID);
        
        const helpMessage = senderID === AYMAN_ID
            ? `💖 ───『 تحدث مع كيرا 』─── 💖

مرحباً يا أيمن! 💖

استخدم:
.تحدث [رسالتك]

مثال:
.تحدث كيف حالك؟
.تحدث أنت رائعة!

💖 ─── في انتظارك - كيرا ─── 💖`
            : `◈ ───『 💬 تحدث مع كيرا 』─── ◈

${userName}، استخدم:
.تحدث [رسالتك]

مثال:
.تحدث مرحباً
.تحدث كيف حالك؟

◈ ────── كيرا ────── ◈`;
        
        return api.sendMessage(helpMessage, threadID, messageID);
    }
    
    const userMessage = args.join(" ");
    
    // حفظ في السجل
    if (!conversations[senderID]) {
        conversations[senderID] = [];
    }
    
    conversations[senderID].push({
        role: "user",
        content: userMessage,
        timestamp: Date.now()
    });
    
    // الاحتفاظ بآخر 20 رسالة فقط
    if (conversations[senderID].length > 20) {
        conversations[senderID] = conversations[senderID].slice(-20);
    }
    
    saveConversations();
    
    // تحديد النية والرد
    const intent = detectIntent(userMessage);
    const response = getResponse(senderID, intent, userMessage);
    
    // حفظ رد كيرا
    conversations[senderID].push({
        role: "assistant",
        content: response,
        timestamp: Date.now()
    });
    
    saveConversations();
    
    // رد فعل حسب النية
    const reactions = {
        greeting: "👋",
        question: "❓",
        compliment: "😊",
        insult: "😤",
        goodbye: "👋",
        general: "💬"
    };
    
    api.setMessageReaction(reactions[intent] || "💬", messageID, () => {}, true);
    
    // إضافة تأخير طبيعي
    setTimeout(() => {
        api.sendMessage(response, threadID, messageID);
    }, 1000);
};

// معالج الأحداث للرد التلقائي
module.exports.handleEvent = async ({ api, event, Users }) => {
    const { threadID, messageID, senderID, body } = event;
    
    if (!body) return;
    
    // الرد عند ذكر كيرا بدون أمر
    const mentions = ["كيرا", "kira"];
    const shouldRespond = mentions.some(m => body.toLowerCase().includes(m.toLowerCase()));
    
    if (shouldRespond && !body.startsWith(".")) {
        const userName = await Users.getNameUser(senderID);
        
        const quickResponse = senderID === AYMAN_ID
            ? "نعم يا أيمن؟ 💖 استخدم .تحدث للمحادثة الكاملة!"
            : `نعم ${userName}؟ 🙄 استخدم .تحدث إذا كنت تريد محادثة حقيقية...`;
        
        setTimeout(() => {
            api.sendMessage(quickResponse, threadID, messageID);
        }, 1000);
    }
};
