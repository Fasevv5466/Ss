const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "leaveNoti",
    eventType: ["log:unsubscribe"],
    version: "5.0.0",
    credits: "KIRA System - Enhanced by Ayman",
    description: "نظام وداع متقدم",
    category: "events"
};

module.exports.run = async function({ api, event, Users, Threads }) {
    const { threadID, logMessageData, author } = event;
    const leftID = logMessageData.leftParticipantFbId;

    // ═══════════════════════════════════════════════════════════
    // تجاهل خروج البوت
    // ═══════════════════════════════════════════════════════════
    
    if (leftID == api.getCurrentUserID()) {
        return; // البوت غادر، لا نفعل شيء
    }

    try {
        const { threadName } = await api.getThreadInfo(threadID);
        const threadData = global.data.threadData.get(parseInt(threadID)) || {};
        
        // معلومات العضو الذي غادر
        const userData = await Users.getData(leftID);
        const userName = userData?.name || "عضو سابق";
        
        // ═══════════════════════════════════════════════════════════
        // تحديد نوع المغادرة
        // ═══════════════════════════════════════════════════════════
        
        const isKicked = (author !== leftID); // طُرد من قبل شخص آخر
        const leftVoluntarily = (author === leftID); // غادر بنفسه
        
        // معلومات من طرد (إذا كان مطروداً)
        let kickerName = "";
        if (isKicked) {
            const kickerData = await Users.getData(author);
            kickerName = kickerData?.name || "مشرف";
        }

        // ═══════════════════════════════════════════════════════════
        // رسالة الوداع
        // ═══════════════════════════════════════════════════════════
        
        let leaveMessage = threadData.customLeave;
        
        if (!leaveMessage) {
            // رسالة افتراضية حسب نوع المغادرة
            if (leftVoluntarily) {
                // غادر بنفسه
                leaveMessage = 
                    `◈ ───『 👋 وداعـــاً 👋 』─── ◈\n` +
                    `◈ ────────────── ◈\n\n` +
                    `💔 غـادر: {userName}\n` +
                    `📍 مـن: {threadName}\n\n` +
                    `😢 سـنـفـتـقـدك\n` +
                    `🚪 الـبـاب مـفـتـوح دائـمـاً لـلـعـودة\n\n` +
                    `◈ ────────────── ◈`;
            } else {
                // تم طرده
                leaveMessage = 
                    `◈ ───『 ⚔️ طـرد عـضـو ⚔️ 』─── ◈\n` +
                    `◈ ────────────── ◈\n\n` +
                    `👤 تـم طـرد: {userName}\n` +
                    `⚔️ بـواسـطـة: {kickerName}\n` +
                    `📍 مـن: {threadName}\n\n` +
                    `⚠️ الـتـزم بـالـقـوانـيـن\n\n` +
                    `◈ ────────────── ◈`;
            }
        }

        // استبدال المتغيرات
        leaveMessage = leaveMessage
            .replace(/{userName}/g, userName)
            .replace(/{name}/g, userName)
            .replace(/{threadName}/g, threadName)
            .replace(/{kickerName}/g, kickerName)
            .replace(/{author}/g, kickerName);

        // ═══════════════════════════════════════════════════════════
        // إرسال الرسالة
        // ═══════════════════════════════════════════════════════════
        
        const messageData = {
            body: leaveMessage
        };

        // محاولة إضافة صورة وداع
        if (threadData.leaveImage || global.config.leaveImage) {
            try {
                const imageUrl = threadData.leaveImage || global.config.leaveImage;
                const cachePath = path.join(__dirname, "cache");
                
                if (!fs.existsSync(cachePath)) {
                    fs.mkdirSync(cachePath, { recursive: true });
                }
                
                const imagePath = path.join(cachePath, `leave_${Date.now()}.jpg`);
                
                const response = await axios.get(imageUrl, {
                    responseType: 'arraybuffer',
                    timeout: 10000
                });
                
                fs.writeFileSync(imagePath, Buffer.from(response.data));
                messageData.attachment = fs.createReadStream(imagePath);
                
                return api.sendMessage(messageData, threadID, () => {
                    if (fs.existsSync(imagePath)) {
                        fs.unlinkSync(imagePath);
                    }
                });
                
            } catch (imageError) {
                console.log("⚠️ تعذر تحميل صورة الوداع، إرسال رسالة نصية فقط");
                return api.sendMessage(messageData, threadID);
            }
        } else {
            return api.sendMessage(messageData, threadID);
        }

    } catch (error) {
        console.error("❌ خطأ في نظام الوداع:", error);
        console.error("التفاصيل:", error.stack);
        
        // رسالة احتياطية
        try {
            return api.sendMessage("👋 وداعاً...", threadID);
        } catch (fallbackError) {
            console.error("❌ فشل إرسال رسالة الوداع");
        }
    }
};

// ═══════════════════════════════════════════════════════════
// دليل الاستخدام
// ═══════════════════════════════════════════════════════════

/*
الميزات المتوفرة:

1️⃣ رسالة وداع مخصصة:
   - استخدم الأمر: .setleave <الرسالة>
   
2️⃣ المتغيرات المتاحة:
   {userName}   - اسم من غادر
   {name}       - اسم من غادر (بديل)
   {threadName} - اسم المجموعة
   {kickerName} - من طرد العضو (إن وُجد)
   {author}     - من طرد العضو (بديل)

3️⃣ صورة وداع:
   - ضع رابط الصورة في threadData.leaveImage
   - أو في config.leaveImage

4️⃣ التمييز بين الأنواع:
   - يميز بين من غادر بنفسه ومن تم طرده
   - يعرض اسم من قام بالطرد

مثال رسالة مخصصة:
━━━━━━━━━━━━━━━━━━━━
وداعاً {userName}
نتمنى لك التوفيق 💔
الباب مفتوح للعودة دائماً
━━━━━━━━━━━━━━━━━━━━
*/
