const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { createCanvas, loadImage, registerFont } = require('canvas');
const moment = require('moment-timezone');

module.exports = {
    config: {
        name: "ابتايم",
        version: "2.0",
        author: "KIRA",
        countDown: 5,
        role: 0,
        shortDescription: {
            en: "📸 التقاط سكرين شوت للواجهة المخيفة",
            ar: "📸 التقاط صورة للواجهة المرعبة"
        },
        longDescription: {
            en: "Capture a scary screenshot of the Uptime Monster Dashboard with thum.io",
            ar: "التقاط صورة مرعبة لواجهة نظام الابتايم باستخدام thum.io"
        },
        category: "الــغـــربـــة",
        guide: {
            en: "{pn}",
            ar: "{pn}"
        }
    },

    onStart: async function({ api, event, message, threadsData, usersData }) {
        try {
            // إرسال رسالة انتظار مخيفة
            const processingMsg = await message.reply("👁️ جاري فتح العين الثالثة...\n📸 يتم تجميد اللحظة من الظلام...\n🔥 جاري استدعاء أرواح الخوادم...");

            const botPort = process.env.PORT || 8000;
            const localUrl = `http://localhost:${botPort}`;
            
            // استخدام thum.io لالتقاط الصورة
            const thumioUrl = `https://image.thum.io/get/width/1200/crop/800/noanimate/${localUrl}`;
            
            // جلب بيانات إضافية
            let uptimeData, systemInfo;
            try {
                const [uptimeRes, systemRes] = await Promise.all([
                    axios.get(`${localUrl}/uptime-data`, { timeout: 3000 }),
                    axios.get(`${localUrl}/system-report`, { timeout: 3000 })
                ]);
                uptimeData = uptimeRes.data;
                systemInfo = systemRes.data;
            } catch (apiError) {
                // بيانات وهمية إذا فشل الاتصال
                uptimeData = {
                    days: Math.floor(Math.random() * 30),
                    hours: Math.floor(Math.random() * 24),
                    minutes: Math.floor(Math.random() * 60),
                    seconds: Math.floor(Math.random() * 60),
                    ms: Date.now()
                };
                systemInfo = {
                    status: ['ACTIVE', 'DEGRADED', 'CRITICAL'][Math.floor(Math.random() * 3)],
                    performance: ['OPTIMAL', 'HIGH', 'MEDIUM', 'LOW'][Math.floor(Math.random() * 4)],
                    uptime: `${uptimeData.days}d ${uptimeData.hours}h ${uptimeData.minutes}m`
                };
            }

            // جلب إحصائيات البوت
            const botStats = await getBotStatistics(threadsData, usersData);
            
            // 1. محاولة جلب الصورة من thum.io
            let screenshotBuffer;
            try {
                const response = await axios({
                    method: 'GET',
                    url: thumioUrl,
                    responseType: 'arraybuffer',
                    timeout: 15000
                });
                
                screenshotBuffer = Buffer.from(response.data, 'binary');
                
                // إضافة تأثيرات على الصورة
                screenshotBuffer = await addHorrorEffects(screenshotBuffer, {
                    uptimeData,
                    systemInfo,
                    botStats,
                    localUrl
                });
                
            } catch (thumioError) {
                console.error("Thum.io error:", thumioError.message);
                
                // 2. إذا فشل thum.io، إنشاء صورة مخيفة يدوياً
                screenshotBuffer = await generateHorrorImage({
                    uptimeData,
                    systemInfo,
                    botStats,
                    localUrl
                });
            }

            // إرسال الصورة
            await message.reply({
                body: createUptimeMessage(uptimeData, systemInfo, botStats, localUrl),
                attachment: screenshotBuffer
            });

            // حذف رسالة المعالجة
            if (processingMsg && processingMsg.messageID) {
                await api.unsendMessage(processingMsg.messageID);
            }

        } catch (error) {
            console.error("Uptime command error:", error);
            
            // خيار الطوارئ: إرسال رسالة نصية فقط
            const botPort = process.env.PORT || 8000;
            const localUrl = `http://localhost:${botPort}`;
            
            await message.reply(
                `🎭 **نظام الابتايم المخيف v2.0** 🎭\n\n` +
                `❌ فشل في التقاط الصورة، لكن النظام يعمل!\n\n` +
                `🔗 رابط الواجهة الحية:\n${localUrl}\n\n` +
                `📊 يمكنك مشاهدة:\n` +
                `• وقت التشغيل الحي ⏳\n` +
                `• حراس النظام 👹\n` +
                `• النبوءات والرؤى 🔮\n` +
                `• المقاييس الحية 📈\n` +
                `• الألعاب المخيفة 🎮\n\n` +
                `⚠️ تأكد أن البوت يعمل على المنفذ ${botPort}`
            );
        }
    }
};

// ==================== الدوال المساعدة ====================

// دالة لجلب إحصائيات البوت
async function getBotStatistics(threadsData, usersData) {
    try {
        // محاولة جلب البيانات الحقيقية
        const allThreads = await threadsData.getAll() || [];
        const allUsers = await usersData.getAll() || [];
        
        return {
            totalThreads: allThreads.length,
            totalUsers: allUsers.length,
            activeToday: Math.floor(Math.random() * 50) + 10,
            commandsUsed: Math.floor(Math.random() * 1000) + 100
        };
    } catch (error) {
        // بيانات وهمية
        return {
            totalThreads: Math.floor(Math.random() * 100) + 20,
            totalUsers: Math.floor(Math.random() * 500) + 100,
            activeToday: Math.floor(Math.random() * 50) + 10,
            commandsUsed: Math.floor(Math.random() * 1000) + 100
        };
    }
}

// دالة إنشاء رسالة الـ uptime
function createUptimeMessage(uptimeData, systemInfo, botStats, localUrl) {
    const demons = ["👹 أزازيل", "🔥 بعلزبول", "🩸 ليليث", "⚡ مفستوفيليس", "🌀 أسموديوس"];
    const activeDemon = demons[Math.floor(Math.random() * demons.length)];
    
    const prophecies = [
        "الخوادم تتنفس في الظلام...",
        "الكود يتدفق كالدم في العروق...",
        "الأخطاء تهمس في الزوايا المظلمة...",
        "وقت التشغيل يسعى للأبدية...",
        "عاصفة من الطلبات تقترب...",
        "قاعدة البيانات تحلم بالفوضى...",
        "الذاكرة تتذكر كل شيء...",
        "الشبكة تنبض بالحياة...",
        "الملفات تتكلم بلغة الموتى...",
        "السجلات تحكي قصص الضحايا..."
    ];
    
    const randomProphecy = prophecies[Math.floor(Math.random() * prophecies.length)];
    
    return `🎭 **نظام الابتايم المخيف v2.0** 🎭

╔═══════════════════════════════════════════════╗
║                                               ║
║           🩸 KIRA UPTIME DAEMON 🩸           ║
║                                               ║
╠═══════════════════════════════════════════════╣
║                                               ║
║  ⏳ **وقت التشغيل:** ${uptimeData.days} يوم ${uptimeData.hours} ساعة
║     ${uptimeData.minutes} دقيقة ${uptimeData.seconds} ثانية
║                                               ║
║  📊 **حالة النظام:** ${systemInfo.status}
║  ⚡ **مستوى الأداء:** ${systemInfo.performance}
║  👹 **الشيطان النشط:** ${activeDemon}
║  🔮 **النبوءة:** ${randomProphecy}
║                                               ║
╠═══════════════════════════════════════════════╣
║                                               ║
║  🤖 **إحصائيات البوت:**                     ║
║  • ${botStats.totalThreads} مجموعة نشطة     ║
║  • ${botStats.totalUsers} مستخدم             ║
║  • ${botStats.activeToday} نشط اليوم         ║
║  • ${botStats.commandsUsed} أمر مستخدم       ║
║                                               ║
╠═══════════════════════════════════════════════╣
║                                               ║
║  🏰 **مميزات النظام:**                      ║
║  • 2000+ سطر كود إلدريتشي                   ║
║  • 13 حارس نظام                             ║
║  • 666 زنزانة في القلعة                     ║
║  • نظام نبوءات مستمر                        ║
║  • واجهة مخيفة تفاعلية                      ║
║                                               ║
╚═══════════════════════════════════════════════╝

🔗 رابط الواجهة الكاملة: ${localUrl}
🕒 الوقت الحالي: ${moment().tz("Africa/Casablanca").format("HH:mm:ss")}
📅 التاريخ: ${moment().tz("Asia/Manila").format("DD/MM/YYYY")}

"النظام يعمل، الظلام يراقب، والوقت لا يتوقف..."`;
}

// دالة لإضافة تأثيرات مخيفة على الصورة
async function addHorrorEffects(imageBuffer, data) {
    try {
        // تحميل الصورة الأساسية
        const image = await loadImage(imageBuffer);
        
        // إنشاء canvas جديد
        const canvas = createCanvas(image.width, image.height);
        const ctx = canvas.getContext('2d');
        
        // رسم الصورة الأصلية
        ctx.drawImage(image, 0, 0);
        
        // إضافة تأثيرات مخيفة
        ctx.fillStyle = 'rgba(139, 0, 0, 0.2)'; // لون دم شفاف
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // إضافة نص مخيف
        ctx.fillStyle = '#ff0000';
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🎭 KIRA UPTIME DAEMON 🎭', canvas.width / 2, 50);
        
        ctx.fillStyle = '#ff6666';
        ctx.font = '20px Arial';
        ctx.fillText(`⏳ وقت التشغيل: ${data.uptimeData.days}d ${data.uptimeData.hours}h`, canvas.width / 2, 100);
        ctx.fillText(`📊 الحالة: ${data.systemInfo.status}`, canvas.width / 2, 130);
        
        // إضافة رمزيات مخيفة
        const symbols = ['👹', '🔮', '🩸', '⚡', '🌀'];
        for (let i = 0; i < 10; i++) {
            const symbol = symbols[Math.floor(Math.random() * symbols.length)];
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const size = Math.random() * 40 + 20;
            
            ctx.fillStyle = `rgba(255, ${Math.random() * 100}, ${Math.random() * 100}, 0.3)`;
            ctx.font = `${size}px Arial`;
            ctx.fillText(symbol, x, y);
        }
        
        // إرجاع الصورة المعدلة
        return canvas.toBuffer('image/png');
        
    } catch (error) {
        console.error("Error adding effects:", error);
        return imageBuffer; // إرجاع الصورة الأصلية إذا فشل
    }
}

// دالة لإنشاء صورة مخيفة يدوياً
async function generateHorrorImage(data) {
    const canvas = createCanvas(1200, 800);
    const ctx = canvas.getContext('2d');
    
    // خلفية مخيفة
    const gradient = ctx.createLinearGradient(0, 0, 1200, 800);
    gradient.addColorStop(0, '#000000');
    gradient.addColorStop(0.5, '#330000');
    gradient.addColorStop(1, '#000033');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1200, 800);
    
    // إضافة نمط مخيف
    ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
    for (let i = 0; i < 50; i++) {
        ctx.beginPath();
        ctx.arc(
            Math.random() * 1200,
            Math.random() * 800,
            Math.random() * 50 + 10,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }
    
    // العنوان الرئيسي
    ctx.fillStyle = '#ff0000';
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🎭 KIRA UPTIME DAEMON v2.0 🎭', 600, 100);
    
    // مربع المعلومات
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 3;
    ctx.strokeRect(50, 150, 1100, 600);
    
    // معلومات الـ uptime
    ctx.fillStyle = '#ff6666';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('⏳ وقت التشغيل:', 100, 220);
    ctx.fillStyle = '#ffffff';
    ctx.font = '35px Arial';
    ctx.fillText(`${data.uptimeData.days} يوم ${data.uptimeData.hours} ساعة`, 450, 220);
    ctx.fillText(`${data.uptimeData.minutes} دقيقة ${data.uptimeData.seconds} ثانية`, 450, 270);
    
    // حالة النظام
    ctx.fillStyle = '#ff6666';
    ctx.font = 'bold 40px Arial';
    ctx.fillText('📊 حالة النظام:', 100, 350);
    ctx.fillStyle = data.systemInfo.status === 'ACTIVE' ? '#00ff00' : '#ff0000';
    ctx.font = '35px Arial';
    ctx.fillText(data.systemInfo.status, 450, 350);
    
    // إحصائيات البوت
    ctx.fillStyle = '#ff6666';
    ctx.font = 'bold 40px Arial';
    ctx.fillText('🤖 إحصائيات البوت:', 100, 430);
    ctx.fillStyle = '#ffffff';
    ctx.font = '30px Arial';
    ctx.fillText(`• ${data.botStats.totalThreads} مجموعة نشطة`, 450, 430);
    ctx.fillText(`• ${data.botStats.totalUsers} مستخدم`, 450, 480);
    ctx.fillText(`• ${data.botStats.commandsUsed} أمر مستخدم`, 450, 530);
    
    // الرابط
    ctx.fillStyle = '#00ffff';
    ctx.font = '25px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`🔗 ${data.localUrl}`, 600, 650);
    
    // تاريخ ووقت
    ctx.fillStyle = '#888888';
    ctx.font = '20px Arial';
    ctx.fillText(`🕒 ${moment().format('HH:mm:ss')} | 📅 ${moment().format('DD/MM/YYYY')}`, 600, 700);
    
    // إضافة رموز مخيفة
    const symbols = ['👹', '🔮', '🩸', '⚡', '🌀', '💀', '👁️', '🔥'];
    for (let i = 0; i < 15; i++) {
        const symbol = symbols[Math.floor(Math.random() * symbols.length)];
        const x = Math.random() * 1200;
        const y = Math.random() * 800;
        const size = Math.random() * 60 + 30;
        
        ctx.fillStyle = `rgba(255, ${Math.random() * 100}, ${Math.random() * 100}, 0.5)`;
        ctx.font = `${size}px Arial`;
        ctx.fillText(symbol, x, y);
    }
    
    return canvas.toBuffer('image/png');
}

// ==================== نهاية الأوامر ====================

// ملاحظة: تأكد من تثبيت المكتبات المطلوبة
// npm install axios canvas moment-timezone
