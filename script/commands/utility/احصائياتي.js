const axios = require("axios");
const fs = require("fs-extra");
const { createCanvas, loadImage } = require("canvas");

// ═══════════════════════════════════════════════════════════
// 👑 KIRA - إحصائياتي
// المطور: Ayman ♛
// الوصف: عرض إحصائيات المستخدم الشاملة
// ═══════════════════════════════════════════════════════════

module.exports.config = {
    name: "احصائياتي",
    aliases: ["stats", "إحصائيات", "معلوماتي"],
    version: "2.0.0",
    hasPermssion: 0,
    credits: "Ayman ♛",
    description: "📊 عرض إحصائياتك الكاملة بتصميم فخم",
    commandCategory: "utility",
    usages: ".احصائياتي",
    cooldowns: 10
};

module.exports.run = async ({ api, event, Users, Threads, Currencies }) => {
    const { threadID, messageID, senderID } = event;
    const AYMAN_ID = "61577861540407";

    try {
        // جلب البيانات
        const userData = await Users.getData(senderID);
        const userInfo = await api.getUserInfo(senderID);
        const threadInfo = await Threads.getInfo(threadID);
        const userName = await Users.getNameUser(senderID);
        
        // حساب الإحصائيات
        const level = Math.floor((userData.exp || 0) / 100) + 1;
        const nextLevelExp = level * 100;
        const currentExp = (userData.exp || 0) % 100;
        const progress = Math.floor((currentExp / 100) * 100);
        
        const money = userData.money || 0;
        const firstSeen = new Date(userData.createdAt || Date.now());
        const daysActive = Math.floor((Date.now() - firstSeen) / (1000 * 60 * 60 * 24));
        
        // رتبة المستخدم في المجموعة
        const allUsers = await Currencies.getAll(['userID', 'money']);
        const sorted = allUsers.sort((a, b) => b.money - a.money);
        const rank = sorted.findIndex(user => user.userID === senderID) + 1;
        
        // إنشاء بطاقة إحصائيات
        const canvas = createCanvas(800, 1000);
        const ctx = canvas.getContext('2d');
        
        // خلفية متدرجة
        const gradient = ctx.createLinearGradient(0, 0, 0, 1000);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 800, 1000);
        
        // الصورة الشخصية
        const avatar = await loadImage(`https://graph.facebook.com/${senderID}/picture?width=512&height=512`);
        ctx.save();
        ctx.beginPath();
        ctx.arc(400, 150, 100, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, 300, 50, 200, 200);
        ctx.restore();
        
        // إطار الصورة
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(400, 150, 100, 0, Math.PI * 2);
        ctx.stroke();
        
        // الاسم
        ctx.font = 'bold 48px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 10;
        ctx.fillText(userName, 400, 300);
        
        // معلومات أساسية
        ctx.font = '32px Arial';
        ctx.fillText(`🆔 ${senderID}`, 400, 350);
        
        // صندوق الإحصائيات
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(50, 400, 700, 550);
        
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.font = 'bold 36px Arial';
        
        let y = 460;
        const stats = [
            `🏆 المستوى: ${level}`,
            `⭐ الخبرة: ${currentExp}/${nextLevelExp} (${progress}%)`,
            `💰 الرصيد: ${money.toLocaleString()} دينار`,
            `📊 الترتيب: #${rank} من ${allUsers.length}`,
            `📅 نشط منذ: ${daysActive} يوم`,
            `📍 أول ظهور: ${firstSeen.toLocaleDateString('ar')}`,
            `🎮 الألعاب: قريباً`,
            `💬 الرسائل: قريباً`
        ];
        
        stats.forEach(stat => {
            ctx.fillText(stat, 100, y);
            y += 60;
        });
        
        // شريط التقدم
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(100, 500, 600, 30);
        
        const progressWidth = (progress / 100) * 600;
        const progressGradient = ctx.createLinearGradient(100, 500, 700, 530);
        progressGradient.addColorStop(0, '#00ff88');
        progressGradient.addColorStop(1, '#00cc66');
        ctx.fillStyle = progressGradient;
        ctx.fillRect(100, 500, progressWidth, 30);
        
        // حفظ الصورة
        const path = __dirname + `/cache/stats_${senderID}.png`;
        fs.writeFileSync(path, canvas.toBuffer());
        
        // الرسالة
        const message = senderID === AYMAN_ID
            ? `💖 ───『 إحصائيات تاج الرأس 』─── 💖

📊 تقرير شامل عن حضورك المميز

🎯 إنجازاتك:
• المستوى ${level} - في تقدم مستمر!
• الترتيب #${rank} - دائماً في القمة!
• ${money.toLocaleString()} دينار - ثروة متزايدة!

💖 ─── فخورة بك - كيرا ─── 💖`
            : `◈ ───『 📊 إحصائياتك 』─── ◈

👤 ${userName}
🏆 المستوى: ${level}
💰 الرصيد: ${money.toLocaleString()} دينار
📊 الترتيب: #${rank}

⭐ الخبرة: ${progress}%
📅 نشط منذ: ${daysActive} يوم

◈ ────── كيرا ────── ◈`;
        
        return api.sendMessage(
            {
                body: message,
                attachment: fs.createReadStream(path)
            },
            threadID,
            () => fs.unlinkSync(path),
            messageID
        );
        
    } catch (error) {
        console.error("Stats Error:", error);
        
        // رسالة بديلة نصية
        const userData = await Users.getData(senderID);
        const userName = await Users.getNameUser(senderID);
        const level = Math.floor((userData.exp || 0) / 100) + 1;
        const money = userData.money || 0;
        
        const simpleMessage = senderID === AYMAN_ID
            ? `💖 ───『 إحصائياتك يا أيمن 』─── 💖

👤 ${userName}
🏆 المستوى: ${level}
💰 الرصيد: ${money.toLocaleString()} دينار
⭐ الخبرة: ${userData.exp || 0}

💖 ─── كيرا ─── 💖`
            : `◈ ───『 📊 إحصائياتك 』─── ◈

👤 ${userName}
🏆 المستوى: ${level}
💰 الرصيد: ${money.toLocaleString()} دينار
⭐ الخبرة: ${userData.exp || 0}

◈ ─── كيرا ─── ◈`;
        
        return api.sendMessage(simpleMessage, threadID, messageID);
    }
};
