const fs = require("fs-extra");
const { createCanvas, loadImage } = require("canvas");

// ═══════════════════════════════════════════════════════════
// 👑 KIRA - لوحة المتصدرين
// المطور: Ayman ♛
// الوصف: عرض أغنى المستخدمين في المجموعة
// ═══════════════════════════════════════════════════════════

module.exports.config = {
    name: "توب",
    aliases: ["top", "متصدرين", "الأغنى", "leaderboard"],
    version: "2.0.0",
    hasPermssion: 0,
    credits: "Ayman ♛",
    description: "🏆 لوحة المتصدرين - أغنى الأعضاء",
    commandCategory: "utility",
    usages: ".توب [عدد]",
    cooldowns: 10
};

module.exports.run = async ({ api, event, args, Currencies, Users }) => {
    const { threadID, messageID, senderID } = event;
    const AYMAN_ID = "61577861540407";

    try {
        // عدد المتصدرين المطلوب (افتراضي 10)
        const limit = parseInt(args[0]) || 10;
        const maxLimit = Math.min(limit, 20); // حد أقصى 20
        
        // جلب جميع المستخدمين
        const allUsers = await Currencies.getAll(['userID', 'money', 'exp']);
        
        // ترتيب حسب المال
        const sorted = allUsers
            .filter(user => user.money > 0)
            .sort((a, b) => b.money - a.money)
            .slice(0, maxLimit);
        
        if (sorted.length === 0) {
            return api.sendMessage(
                "❌ لا توجد بيانات متاحة!",
                threadID,
                messageID
            );
        }
        
        // إنشاء الصورة
        const height = 300 + (sorted.length * 80);
        const canvas = createCanvas(900, height);
        const ctx = canvas.getContext('2d');
        
        // خلفية متدرجة
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#1e3c72');
        gradient.addColorStop(1, '#2a5298');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 900, height);
        
        // العنوان
        ctx.font = 'bold 60px Arial';
        ctx.fillStyle = '#ffd700';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 15;
        ctx.fillText('🏆 لوحة المتصدرين 🏆', 450, 80);
        
        // خط فاصل
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(100, 120);
        ctx.lineTo(800, 120);
        ctx.stroke();
        
        // عرض المعلومات الإضافية
        ctx.font = '24px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`إجمالي الأعضاء: ${allUsers.length} | عرض أفضل ${sorted.length}`, 450, 160);
        
        // رسم قائمة المتصدرين
        let y = 240;
        
        for (let i = 0; i < sorted.length; i++) {
            const user = sorted[i];
            const userName = await Users.getNameUser(user.userID);
            const isCurrentUser = user.userID === senderID;
            const isAyman = user.userID === AYMAN_ID;
            
            // لون الخلفية حسب الترتيب
            let bgColor, medalEmoji;
            if (i === 0) {
                bgColor = 'rgba(255, 215, 0, 0.3)'; // ذهبي
                medalEmoji = '🥇';
            } else if (i === 1) {
                bgColor = 'rgba(192, 192, 192, 0.3)'; // فضي
                medalEmoji = '🥈';
            } else if (i === 2) {
                bgColor = 'rgba(205, 127, 50, 0.3)'; // برونزي
                medalEmoji = '🥉';
            } else {
                bgColor = 'rgba(255, 255, 255, 0.1)';
                medalEmoji = `${i + 1}.`;
            }
            
            // تمييز المستخدم الحالي
            if (isCurrentUser) {
                bgColor = 'rgba(0, 255, 136, 0.3)';
            }
            
            // تمييز أيمن
            if (isAyman) {
                bgColor = 'rgba(255, 0, 136, 0.4)';
            }
            
            // صندوق المستخدم
            ctx.fillStyle = bgColor;
            ctx.fillRect(50, y - 50, 800, 70);
            
            // الترتيب
            ctx.font = 'bold 40px Arial';
            ctx.fillStyle = i < 3 ? '#ffd700' : '#ffffff';
            ctx.textAlign = 'left';
            ctx.fillText(medalEmoji, 70, y);
            
            // الاسم
            ctx.font = isAyman ? 'bold 32px Arial' : '28px Arial';
            ctx.fillStyle = isAyman ? '#ff0088' : '#ffffff';
            const displayName = userName.length > 20 ? userName.substring(0, 20) + '...' : userName;
            ctx.fillText(
                isAyman ? `👑 ${displayName}` : displayName,
                180,
                y
            );
            
            // المال
            ctx.font = 'bold 28px Arial';
            ctx.fillStyle = '#00ff88';
            ctx.textAlign = 'right';
            ctx.fillText(
                `💰 ${user.money.toLocaleString()} دينار`,
                820,
                y
            );
            
            y += 80;
        }
        
        // موقع المستخدم الحالي إذا لم يكن في القائمة
        const userRank = sorted.findIndex(u => u.userID === senderID);
        if (userRank === -1) {
            const allRank = allUsers
                .sort((a, b) => b.money - a.money)
                .findIndex(u => u.userID === senderID) + 1;
            
            const userData = await Currencies.getData(senderID);
            const userName = await Users.getNameUser(senderID);
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.fillRect(50, y + 20, 800, 70);
            
            ctx.font = '28px Arial';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'left';
            ctx.fillText(`أنت: #${allRank}`, 70, y + 60);
            ctx.fillText(userName, 200, y + 60);
            
            ctx.textAlign = 'right';
            ctx.fillStyle = '#00ff88';
            ctx.fillText(
                `💰 ${(userData.money || 0).toLocaleString()} دينار`,
                820,
                y + 60
            );
        }
        
        // حفظ الصورة
        const path = __dirname + `/cache/leaderboard_${threadID}.png`;
        fs.writeFileSync(path, canvas.toBuffer());
        
        // الرسالة
        const userName = await Users.getNameUser(senderID);
        const userRankNum = allUsers
            .sort((a, b) => b.money - a.money)
            .findIndex(u => u.userID === senderID) + 1;
        
        const message = senderID === AYMAN_ID
            ? `💖 ───『 لوحة المتصدرين 』─── 💖

👑 أيمن في الترتيب #${userRankNum}
🏆 أفضل ${sorted.length} عضو
💰 إجمالي: ${allUsers.length} عضو

💖 ─── دائماً الأفضل - كيرا ─── 💖`
            : `◈ ───『 🏆 لوحة المتصدرين 』─── ◈

👤 ${userName}
📊 ترتيبك: #${userRankNum}
🏆 عرض أفضل ${sorted.length}
👥 إجمالي: ${allUsers.length}

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
        console.error("Leaderboard Error:", error);
        
        // رسالة بديلة نصية
        try {
            const allUsers = await Currencies.getAll(['userID', 'money']);
            const sorted = allUsers
                .filter(user => user.money > 0)
                .sort((a, b) => b.money - a.money)
                .slice(0, 10);
            
            let message = "🏆 ───『 المتصدرين 』─── 🏆\n\n";
            
            for (let i = 0; i < sorted.length; i++) {
                const userName = await Users.getNameUser(sorted[i].userID);
                const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i+1}.`;
                message += `${medal} ${userName}: ${sorted[i].money.toLocaleString()} 💰\n`;
            }
            
            message += "\n◈ ────── كيرا ────── ◈";
            
            return api.sendMessage(message, threadID, messageID);
            
        } catch (err) {
            return api.sendMessage(
                "❌ حدث خطأ أثناء جلب البيانات!",
                threadID,
                messageID
            );
        }
    }
};
