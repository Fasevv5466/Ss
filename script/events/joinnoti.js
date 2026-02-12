const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "joinNoti",
    eventType: ["log:subscribe"],
    version: "5.0.0",
    credits: "KIRA System - Enhanced by Ayman",
    description: "نظام ترحيب متقدم ومتكامل",
    category: "events"
};

module.exports.run = async function({ api, event, Users, Threads }) {
    const { threadID, logMessageData, author } = event;
    const { decorations } = global.utils || require("../../utils/decorations");
    
    // ═══════════════════════════════════════════════════════════
    // إذا البوت انضم للمجموعة
    // ═══════════════════════════════════════════════════════════
    
    if (logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
        try {
            // تغيير اسم البوت
            api.changeNickname(
                `『 ${global.config.PREFIX} 』• ${global.config.BOTNAME || "KIRA"}`,
                threadID,
                api.getCurrentUserID()
            );

            // رسالة الاتصال
            const connectMsg = 
                `◈ ───『 ✨ كـيـرا ✨ 』─── ◈\n` +
                `◈ ────────────── ◈\n\n` +
                `✅ تـم الـاتـصـال بـنـجـاح!\n\n` +
                `📋 الـبـادئـة: ${global.config.PREFIX}\n` +
                `🤖 الـبـوت: ${global.config.BOTNAME}\n` +
                `⚙️ الإصـدار: ${global.config.version || "5.0"}\n\n` +
                `💡 اكـتـب: ${global.config.PREFIX}أوامـر\n` +
                `💡 للـحـصـول عـلـى قـائـمـة الأوامـر\n\n` +
                `◈ ────────────── ◈\n` +
                `💖 شـكـراً لـلـثـقـة`;

            return api.sendMessage(connectMsg, threadID);
            
        } catch (error) {
            console.error("❌ خطأ في إعداد البوت:", error);
            return api.sendMessage("✅ تم الاتصال بنجاح!", threadID);
        }
    }

    // ═══════════════════════════════════════════════════════════
    // معالجة انضمام الأعضاء
    // ═══════════════════════════════════════════════════════════

    try {
        const { threadName, participantIDs } = await api.getThreadInfo(threadID);
        const threadData = global.data.threadData.get(parseInt(threadID)) || {};
        
        // جمع معلومات الأعضاء الجدد
        const newMembers = [];
        const mentions = [];
        
        for (const participant of logMessageData.addedParticipants) {
            const userID = participant.userFbId;
            const userName = participant.fullName || "عضو جديد";
            
            newMembers.push({
                id: userID,
                name: userName
            });
            
            mentions.push({
                tag: userName,
                id: userID
            });
            
            // تحديث قاعدة البيانات
            if (!global.data.allUserID.includes(userID)) {
                await Users.createData(userID, { name: userName, data: {} });
                global.data.userName.set(userID, userName);
                global.data.allUserID.push(userID);
            }
        }

        // معلومات من أضاف
        const adderData = await Users.getData(author);
        const adderName = adderData?.name || "رابط دعوة";
        
        // ═══════════════════════════════════════════════════════════
        // نظام الترحيب المتقدم
        // ═══════════════════════════════════════════════════════════
        
        // التحقق من رسالة ترحيب مخصصة
        let welcomeMessage = threadData.customJoin;
        
        if (!welcomeMessage) {
            // رسالة افتراضية متقدمة
            const memberCount = participantIDs.length;
            const newMembersList = newMembers.map(m => m.name).join("، ");
            
            welcomeMessage = 
                `◈ ───『 🎉 تـرحـيـب 🎉 』─── ◈\n` +
                `◈ ────────────── ◈\n\n` +
                `👋 أهـلاً وسـهـلاً\n` +
                `✨ {names}\n\n` +
                `📍 فـي: {threadName}\n` +
                `👥 أنـت الـعـضـو رقـم: {count}\n` +
                `💫 تـمـت الإضـافـة بـواسـطـة: {author}\n\n` +
                `💡 نـصـيـحـة: اقـرأ قـوانـيـن الـمـجـمـوعـة\n` +
                `💖 نـتـمـنـى لـك وقـتـاً مـمـتـعـاً\n\n` +
                `◈ ────────────── ◈`;
        }
        
        // استبدال المتغيرات
        welcomeMessage = welcomeMessage
            .replace(/{names}/g, newMembers.map(m => m.name).join("، "))
            .replace(/{name}/g, newMembers[0]?.name || "")
            .replace(/{threadName}/g, threadName)
            .replace(/{count}/g, participantIDs.length)
            .replace(/{author}/g, adderName);

        // ═══════════════════════════════════════════════════════════
        // إرسال الرسالة مع صورة (اختياري)
        // ═══════════════════════════════════════════════════════════
        
        const messageData = {
            body: welcomeMessage,
            mentions: mentions
        };

        // محاولة إضافة صورة ترحيب
        if (threadData.welcomeImage || global.config.welcomeImage) {
            try {
                const imageUrl = threadData.welcomeImage || global.config.welcomeImage;
                const cachePath = path.join(__dirname, "cache");
                
                if (!fs.existsSync(cachePath)) {
                    fs.mkdirSync(cachePath, { recursive: true });
                }
                
                const imagePath = path.join(cachePath, `welcome_${Date.now()}.jpg`);
                
                const response = await axios.get(imageUrl, {
                    responseType: 'arraybuffer',
                    timeout: 10000
                });
                
                fs.writeFileSync(imagePath, Buffer.from(response.data));
                messageData.attachment = fs.createReadStream(imagePath);
                
                return api.sendMessage(messageData, threadID, () => {
                    // حذف الصورة بعد الإرسال
                    if (fs.existsSync(imagePath)) {
                        fs.unlinkSync(imagePath);
                    }
                });
                
            } catch (imageError) {
                console.log("⚠️ تعذر تحميل صورة الترحيب، إرسال رسالة نصية فقط");
                // إرسال بدون صورة
                return api.sendMessage(messageData, threadID);
            }
        } else {
            // إرسال بدون صورة
            return api.sendMessage(messageData, threadID);
        }

    } catch (error) {
        console.error("❌ خطأ في نظام الترحيب:", error);
        console.error("التفاصيل:", error.stack);
        
        // رسالة احتياطية بسيطة
        try {
            return api.sendMessage(
                "👋 مرحباً بالأعضاء الجدد في المجموعة! 🎉",
                threadID
            );
        } catch (fallbackError) {
            console.error("❌ فشل إرسال رسالة الترحيب الاحتياطية");
        }
    }
};

// ═══════════════════════════════════════════════════════════
// دليل الاستخدام
// ═══════════════════════════════════════════════════════════

/*
الميزات المتوفرة:

1️⃣ رسالة ترحيب مخصصة:
   - استخدم الأمر: .setwelcome <الرسالة>
   
2️⃣ المتغيرات المتاحة:
   {names}      - أسماء الأعضاء الجدد
   {name}       - اسم العضو الأول
   {threadName} - اسم المجموعة
   {count}      - عدد الأعضاء
   {author}     - من أضاف العضو

3️⃣ صورة ترحيب:
   - ضع رابط الصورة في threadData.welcomeImage
   - أو في config.welcomeImage

4️⃣ تعطيل الترحيب:
   - احذف الرسالة المخصصة
   - أو علّق السطر الذي يرسل الرسالة

مثال رسالة مخصصة:
━━━━━━━━━━━━━━━━━━━━
أهلاً {name} في {threadName}!
أنت العضو رقم {count}
نتمنى لك وقتاً ممتعاً 💖
━━━━━━━━━━━━━━━━━━━━
*/
