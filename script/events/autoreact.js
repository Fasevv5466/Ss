const fs = require("fs-extra");
const path = require("path");

const DB_PATH = path.join(process.cwd(), "Heba_DB", "autoReact.json");

module.exports.config = {
    name: "autoReactPro",
    eventType: ["message", "event"],
    version: "3.0.0",
    credits: "Ayman",
    description: "تفاعل تلقائي متقدم مع رسائل البوت"
};

// تفعيل تلقائي عند التشغيل
module.exports.onLoad = async function ({ api }) {
    console.log("🤖 نظام التفاعل التلقائي جاهز!");
    
    if (!fs.existsSync(path.dirname(DB_PATH))) {
        fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    }
    
    if (!fs.existsSync(DB_PATH)) {
        fs.writeJsonSync(DB_PATH, {
            enabled: true,
            groups: {},
            settings: {
                defaultReaction: "🤖",
                alternativeReactions: ["⚡", "✨", "👾", "💻"],
                reactionChance: 1.0
            }
        });
    }
};

module.exports.run = async function ({ api, event }) {
    try {
        const db = fs.readJsonSync(DB_PATH);
        
        // إذا كان النظام معطلاً
        if (!db.enabled) return;
        
        // تفعيل تلقائي للمجموعة إذا كانت جديدة
        if (!db.groups[event.threadID]) {
            db.groups[event.threadID] = {
                enabled: true,
                firstSeen: new Date().toISOString(),
                reactionCount: 0
            };
            fs.writeJsonSync(DB_PATH, db);
        }
        
        // إذا كانت التفاعلات معطلة في هذه المجموعة
        if (!db.groups[event.threadID].enabled) return;
        
        // التحقق إذا كانت الرسالة من البوت
        if (event.senderID == api.getCurrentUserID()) {
            // اختيار الرمز (80% 🤖, 20% رمز آخر)
            const reaction = Math.random() < 0.8 ? "🤖" : 
                            db.settings.alternativeReactions[
                                Math.floor(Math.random() * db.settings.alternativeReactions.length)
                            ];
            
            // تفاعل تلقائي
            await api.setMessageReaction(reaction, event.messageID, event.threadID);
            
            // تحديث العداد
            db.groups[event.threadID].reactionCount++;
            db.groups[event.threadID].lastReact = new Date().toISOString();
            fs.writeJsonSync(DB_PATH, db);
        }
    } catch (error) {
        // تجاهل الأخطاء
    }
};

// أوامر التحكم
module.exports.onStart = async function ({ api, event, args }) {
    const threadID = event.threadID;
    
    if (args[0] === "تشغيل") {
        const db = fs.readJsonSync(DB_PATH);
        db.enabled = true;
        db.groups[threadID] = { enabled: true };
        fs.writeJsonSync(DB_PATH, db);
        
        await api.sendMessage({
            body: "✅ تم تفعيل التفاعل التلقائي\n🤖 البوت سيتفاعل مع رسائله تلقائياً"
        }, threadID);
    }
    else if (args[0] === "إيقاف") {
        const db = fs.readJsonSync(DB_PATH);
        db.enabled = false;
        fs.writeJsonSync(DB_PATH, db);
        
        await api.sendMessage("❌ تم تعطيل التفاعل التلقائي", threadID);
    }
    else {
        await api.sendMessage({
            body: "🤖 *أوامر التفاعل التلقائي:*\n" +
                  "• autoReactPro تشغيل - تفعيل النظام\n" +
                  "• autoReactPro إيقاف - تعطيل النظام\n\n" +
                  "📌 النظام يتفاعل مع رسائل البوت تلقائياً ب 🤖"
        }, threadID);
    }
};
