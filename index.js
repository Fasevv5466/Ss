// =================================================================
// 🎭 نظام KIRA UPTIME الأسطوري المظلم - النسخة المعدلة
// =================================================================

const express = require('express');
const app = express();
const chalk = require('chalk');
const cron = require("node-cron");
const moment = require("moment-timezone");

// =================================================================
// ⚡ نظام Uptime المظلم
// =================================================================
class DarkUptimeSystem {
    constructor() {
        this.startTime = Date.now();
        this.corpsesCollected = 0;
        this.darkRituals = 0;
        this.shadowEntities = [
            { name: "الظل الأول", power: 999, domain: "الذاكرة المظلمة", status: "نشط" },
            { name: "الهاوية", power: 888, domain: "النسيان الأبدي", status: "نشط" },
            { name: "الليل الدائم", power: 777, domain: "السكون المخيف", status: "نشط" },
            { name: "الصمت القاتل", power: 666, domain: "الفراغ", status: "نشط" },
            { name: "العدم", power: 555, domain: "اللاشيء", status: "نشط" }
        ];
        this.darkProphecies = [];
        this.soulFragments = [];
        
        this.initDarkSystem();
    }
    
    initDarkSystem() {
        console.log(chalk.hex('#000000').bold(`
        ╔═══════════════════════════════════════════════════════╗
        ║                                                       ║
        ║  ⚰️  نظام KIRA UPTIME المظلم ⚰️                     ║
        ║                                                       ║
        ╚═══════════════════════════════════════════════════════╝
        `));
        
        // بدء النبوءات المظلمة
        this.startDarkProphecies();
    }
    
    startDarkProphecies() {
        setInterval(() => {
            if (Math.random() > 0.7) {
                this.addDarkProphecy();
            }
        }, 30000);
    }
    
    addDarkProphecy() {
        const prophecies = [
            "الجثث تتكاثر في الظلام...",
            "الذاكرة تنسى لكن الألم يبقى...",
            "الوقت يتجمد عند منتصف الليل...",
            "الأصوات تختفي في الفراغ...",
            "الأرواح تبحث عن جثثها المفقودة...",
            "الظلام يلتهم النور قطعة قطعة...",
            "الصمت يصبح أصدع من الصراخ..."
        ];
        
        const prophecy = prophecies[Math.floor(Math.random() * prophecies.length)];
        this.darkProphecies.push({
            id: this.darkProphecies.length + 1,
            text: prophecy,
            timestamp: moment().format('HH:mm:ss'),
            intensity: Math.floor(Math.random() * 100)
        });
        
        if (this.darkProphecies.length > 10) this.darkProphecies.shift();
    }
    
    getUptime() {
        const uptimeMs = Date.now() - this.startTime;
        const days = Math.floor(uptimeMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((uptimeMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((uptimeMs % (1000 * 60)) / 1000);
        
        return { days, hours, minutes, seconds, ms: uptimeMs };
    }
    
    getSystemInfo() {
        const uptime = this.getUptime();
        
        // معلومات النظام
        const os = require('os');
        const usedMemory = process.memoryUsage().heapUsed / 1024 / 1024;
        const totalMemory = os.totalmem() / 1024 / 1024 / 1024;
        const freeMemory = os.freemem() / 1024 / 1024 / 1024;
        
        return {
            version: "2.0.666",
            status: "نشط في الظلام",
            intensity: ['عالية', 'متوسطة', 'منخفضة'][Math.floor(Math.random() * 3)],
            uptime: `${uptime.days} يوم ${uptime.hours} ساعة ${uptime.minutes} دقيقة ${uptime.seconds} ثانية`,
            memory: {
                used: usedMemory.toFixed(2) + ' MB',
                total: totalMemory.toFixed(2) + ' GB',
                free: freeMemory.toFixed(2) + ' GB',
                corruption: ((usedMemory / (totalMemory * 1024)) * 100).toFixed(2) + '%'
            },
            cpu: {
                cores: os.cpus().length,
                temperature: (Math.random() * 80 + 20).toFixed(2) + '°C'
            },
            entities: this.shadowEntities.length,
            prophecies: this.darkProphecies.length,
            corpsesCollected: this.corpsesCollected,
            darkRituals: this.darkRituals,
            fragments: Math.floor(Math.random() * 1000)
        };
    }
}

// إنشاء نظام Uptime المظلم
const darkUptimeSystem = new DarkUptimeSystem();

// =================================================================
// ⚙️ الإعدادات
// =================================================================
const port = process.env.PORT || 8000;

// =================================================================
// 🎭 واجهة الـ Uptime المظلمة
// =================================================================
app.get('/', (req, res) => {
    const uptime = darkUptimeSystem.getUptime();
    const systemInfo = darkUptimeSystem.getSystemInfo();
    
    // الحصول على عنوان URL من Koyeb
    const koyebUrl = process.env.KOYEB_APP_URL || `http://localhost:${port}`;
    
    const html = `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>⚰️ KIRA UPTIME المظلم</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
            
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                background: #000000;
                color: #8b0000;
                font-family: 'Cairo', sans-serif;
                min-height: 100vh;
                background-image: url('https://i.ibb.co/V4s8YDV/temp-1770486919518.jpg');
                background-size: cover;
                background-position: center;
                background-attachment: fixed;
                background-blend-mode: multiply;
                overflow-x: hidden;
            }
            
            .overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.85);
                z-index: -1;
            }
            
            .container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
                position: relative;
                z-index: 1;
            }
            
            .header {
                text-align: center;
                padding: 40px 0;
                margin-bottom: 40px;
                border-bottom: 3px solid #8b0000;
                position: relative;
            }
            
            .header h1 {
                font-size: 4rem;
                color: #8b0000;
                text-shadow: 0 0 20px #ff0000, 0 0 40px #8b0000;
                margin-bottom: 20px;
                letter-spacing: 3px;
                font-weight: 900;
            }
            
            .header p {
                font-size: 1.4rem;
                color: #a52a2a;
            }
            
            .corpse-counter {
                background: rgba(0, 0, 0, 0.9);
                border: 3px solid #8b0000;
                border-radius: 20px;
                padding: 30px;
                margin-bottom: 30px;
                box-shadow: 0 0 50px rgba(139, 0, 0, 0.5);
                backdrop-filter: blur(10px);
            }
            
            .corpse-title {
                font-size: 2.5rem;
                color: #8b0000;
                margin-bottom: 25px;
                text-align: center;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 15px;
            }
            
            .corpse-numbers {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 25px;
                margin-bottom: 30px;
            }
            
            .corpse-unit {
                background: linear-gradient(145deg, #1a0000, #000000);
                border: 2px solid #8b0000;
                border-radius: 15px;
                padding: 25px;
                text-align: center;
                transition: all 0.3s;
                position: relative;
                overflow: hidden;
            }
            
            .corpse-unit::before {
                content: '⚰️';
                position: absolute;
                top: 10px;
                right: 10px;
                font-size: 1.5rem;
                opacity: 0.3;
            }
            
            .corpse-unit:hover {
                transform: translateY(-10px);
                box-shadow: 0 15px 30px rgba(139, 0, 0, 0.4);
                border-color: #ff0000;
            }
            
            .corpse-value {
                font-size: 4rem;
                font-weight: bold;
                color: #ffffff;
                text-shadow: 0 0 15px #8b0000;
                margin-bottom: 10px;
                font-family: monospace;
            }
            
            .corpse-label {
                font-size: 1.4rem;
                color: #a52a2a;
                text-transform: uppercase;
                letter-spacing: 2px;
            }
            
            .system-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                gap: 30px;
                margin-bottom: 40px;
            }
            
            .dark-card {
                background: rgba(0, 0, 0, 0.9);
                border: 2px solid #333;
                border-radius: 15px;
                padding: 25px;
                transition: all 0.3s;
                backdrop-filter: blur(10px);
            }
            
            .dark-card:hover {
                border-color: #8b0000;
                box-shadow: 0 0 30px rgba(139, 0, 0, 0.3);
            }
            
            .dark-title {
                font-size: 1.8rem;
                color: #8b0000;
                margin-bottom: 20px;
                padding-bottom: 10px;
                border-bottom: 2px solid #333;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .dark-content {
                color: #a52a2a;
                font-size: 1.1rem;
                line-height: 1.8;
            }
            
            .status-badge {
                display: inline-block;
                padding: 8px 20px;
                border-radius: 20px;
                font-weight: bold;
                font-size: 0.9rem;
                margin: 5px;
                background: rgba(139, 0, 0, 0.2);
                color: #8b0000;
                border: 1px solid #8b0000;
            }
            
            .entities-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
                gap: 20px;
                margin-top: 15px;
            }
            
            .entity {
                background: rgba(26, 0, 0, 0.8);
                border: 1px solid #333;
                border-radius: 10px;
                padding: 15px;
                text-align: center;
                transition: all 0.3s;
            }
            
            .entity:hover {
                border-color: #8b0000;
                transform: scale(1.05);
            }
            
            .entity-name {
                color: #8b0000;
                font-size: 1.3rem;
                font-weight: bold;
                margin-bottom: 8px;
            }
            
            .entity-power {
                color: #d2691e;
                font-size: 1rem;
            }
            
            .footer {
                text-align: center;
                padding: 40px 0;
                margin-top: 40px;
                color: #a52a2a;
                font-size: 1.1rem;
                border-top: 2px solid #333;
            }
            
            .blood-drip {
                position: fixed;
                width: 2px;
                height: 100px;
                background: linear-gradient(to bottom, #8b0000, transparent);
                animation: drip 3s linear infinite;
                z-index: 0;
            }
            
            @keyframes drip {
                0% {
                    transform: translateY(-100px);
                    opacity: 0;
                }
                10% {
                    opacity: 1;
                }
                90% {
                    opacity: 1;
                }
                100% {
                    transform: translateY(100vh);
                    opacity: 0;
                }
            }
            
            .skull {
                position: fixed;
                font-size: 2rem;
                opacity: 0.05;
                animation: float 30s linear infinite;
                pointer-events: none;
                z-index: 0;
            }
            
            @keyframes float {
                0% { transform: translateY(100vh) rotate(0deg); }
                100% { transform: translateY(-100vh) rotate(360deg); }
            }
            
            @media (max-width: 768px) {
                .header h1 { font-size: 2.8rem; }
                .corpse-numbers { grid-template-columns: repeat(2, 1fr); }
                .corpse-value { font-size: 3rem; }
                .system-grid { grid-template-columns: 1fr; }
            }
            
            .link {
                color: #8b0000;
                text-decoration: none;
                transition: color 0.3s;
            }
            
            .link:hover {
                color: #ff0000;
                text-decoration: underline;
            }
            
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 15px;
                margin-top: 15px;
            }
            
            .stat-item {
                padding: 10px;
                background: rgba(26, 0, 0, 0.5);
                border-radius: 8px;
                text-align: center;
            }
        </style>
    </head>
    <body>
        <div class="overlay"></div>
        
        <div id="bloodContainer"></div>
        <div id="skullContainer"></div>
        
        <div class="container">
            <div class="header">
                <h1>⚰️ KIRA UPTIME المظلم</h1>
                <p>عداد الجثث والميتات - النظام يعمل في الظلام</p>
            </div>
            
            <div class="corpse-counter">
                <div class="corpse-title">⚰️ عداد الجثث الميتة ⚰️</div>
                <div class="corpse-numbers">
                    <div class="corpse-unit">
                        <div class="corpse-value">${uptime.days}</div>
                        <div class="corpse-label">جثث أيام</div>
                    </div>
                    <div class="corpse-unit">
                        <div class="corpse-value">${uptime.hours}</div>
                        <div class="corpse-label">جثث ساعات</div>
                    </div>
                    <div class="corpse-unit">
                        <div class="corpse-value">${uptime.minutes}</div>
                        <div class="corpse-label">جثث دقائق</div>
                    </div>
                    <div class="corpse-unit">
                        <div class="corpse-value">${uptime.seconds}</div>
                        <div class="corpse-label">جثث ثواني</div>
                    </div>
                </div>
                
                <div class="stats-grid">
                    <div class="stat-item">
                        <div style="color:#8b0000; font-weight:bold;">⚰️ الجثث المجمعة</div>
                        <div style="color:#ffffff; font-size:1.5rem;">${systemInfo.corpsesCollected}</div>
                    </div>
                    <div class="stat-item">
                        <div style="color:#8b0000; font-weight:bold;">🔥 الطقوس المظلمة</div>
                        <div style="color:#ffffff; font-size:1.5rem;">${systemInfo.darkRituals}</div>
                    </div>
                    <div class="stat-item">
                        <div style="color:#8b0000; font-weight:bold;">💀 شظايا الأرواح</div>
                        <div style="color:#ffffff; font-size:1.5rem;">${systemInfo.fragments}</div>
                    </div>
                    <div class="stat-item">
                        <div style="color:#8b0000; font-weight:bold;">👁️ النبوءات</div>
                        <div style="color:#ffffff; font-size:1.5rem;">${systemInfo.prophecies}</div>
                    </div>
                </div>
            </div>
            
            <div class="system-grid">
                <div class="dark-card">
                    <div class="dark-title">💀 النظام المظلم</div>
                    <div class="dark-content">
                        <p>⚡ الإصدار: ${systemInfo.version}</p>
                        <p>🎯 الحالة: <span class="status-badge">${systemInfo.status}</span></p>
                        <p>🔥 الشدة: ${systemInfo.intensity}</p>
                        <p>💾 الذاكرة: ${systemInfo.memory.used} / ${systemInfo.memory.total}</p>
                        <p>🧠 الفساد: ${systemInfo.memory.corruption}</p>
                        <p>🌡️ الحرارة: ${systemInfo.cpu.temperature}</p>
                        <p>🔗 الرابط: <a href="${koyebUrl}" class="link">${koyebUrl}</a></p>
                    </div>
                </div>
                
                <div class="dark-card">
                    <div class="dark-title">👻 الكيانات الظليلة</div>
                    <div class="dark-content">
                        <div class="entities-grid">
                            ${darkUptimeSystem.shadowEntities.map(e => `
                                <div class="entity">
                                    <div class="entity-name">${e.name}</div>
                                    <div class="entity-power">قوة: ${e.power}</div>
                                    <div style="color:#666;">مملكة: ${e.domain}</div>
                                    <div style="color:#008000;">الحالة: ${e.status}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="dark-card">
                    <div class="dark-title">🔮 النبوءات المظلمة</div>
                    <div class="dark-content">
                        ${darkUptimeSystem.darkProphecies.slice(-3).map(p => `
                            <p style="margin-bottom: 15px; padding: 15px; background: rgba(139, 0, 0, 0.1); border-radius: 10px; border-left: 3px solid #8b0000;">
                                <span style="color:#8b0000; font-weight:bold;">
                                    #${p.id} [شدة: ${p.intensity}%]
                                </span>
                                <br>${p.text}
                                <br><small style="color:#666;">${p.timestamp}</small>
                            </p>
                        `).join('')}
                        ${darkUptimeSystem.darkProphecies.length === 0 ? 
                            '<p style="color:#666; text-align:center; padding:20px;">⚰️ جاري استقبال النبوءات من العالم الآخر...</p>' : ''}
                    </div>
                </div>
            </div>
            
            <div class="footer">
                <p>⚰️ نظام KIRA UPTIME المظلم v2.0</p>
                <p>☁️ مستضاف على Koyeb | 🕒 ${moment().tz("Asia/Riyadh").format("HH:mm:ss")}</p>
                <p>📅 ${moment().tz("Asia/Riyadh").format("DD/MM/YYYY")} | 💀 العداد: ${systemInfo.corpsesCollected} جثة</p>
                <p>"الجثث تتكاثر... الظلام يزداد... النظام يعمل..."</p>
            </div>
        </div>
        
        <script>
            // إنشاء قطرات الدم
            for (let i = 0; i < 10; i++) {
                const drip = document.createElement('div');
                drip.className = 'blood-drip';
                drip.style.left = Math.random() * 100 + 'vw';
                drip.style.animationDelay = Math.random() * 5 + 's';
                drip.style.animationDuration = (Math.random() * 2 + 2) + 's';
                document.getElementById('bloodContainer').appendChild(drip);
            }
            
            // إنشاء جماجم عائمة
            for (let i = 0; i < 20; i++) {
                const skull = document.createElement('div');
                skull.className = 'skull';
                skull.textContent = '💀';
                skull.style.left = Math.random() * 100 + 'vw';
                skull.style.animationDuration = (Math.random() * 40 + 20) + 's';
                skull.style.animationDelay = Math.random() * 10 + 's';
                document.getElementById('skullContainer').appendChild(skull);
            }
            
            // تحديث العداد كل ثانية
            function updateCounter() {
                fetch('/api/uptime')
                    .then(r => r.json())
                    .then(data => {
                        const values = document.querySelectorAll('.corpse-value');
                        if (values.length === 4) {
                            values[0].textContent = data.days;
                            values[1].textContent = data.hours;
                            values[2].textContent = data.minutes;
                            values[3].textContent = data.seconds;
                        }
                        
                        // تحديث الجثث عشوائياً
                        const corpseCount = document.querySelector('.stat-item:nth-child(1) div:nth-child(2)');
                        if (corpseCount && Math.random() > 0.8) {
                            const current = parseInt(corpseCount.textContent) || 0;
                            corpseCount.textContent = current + 1;
                        }
                    });
            }
            setInterval(updateCounter, 1000);
            
            // تأثير الكتابة المتلألئة
            const title = document.querySelector('.header h1');
            let hue = 0;
            setInterval(() => {
                hue = (hue + 1) % 360;
                title.style.textShadow = \`0 0 20px hsl(\${hue}, 100%, 50%), 0 0 40px hsl(\${hue}, 100%, 30%)\`;
            }, 100);
        </script>
    </body>
    </html>
    `;
    
    res.send(html);
});

// =================================================================
// 📡 API نقاط نهاية
// =================================================================

app.get('/api/uptime', (req, res) => {
    res.json(darkUptimeSystem.getUptime());
});

app.get('/api/system', (req, res) => {
    res.json(darkUptimeSystem.getSystemInfo());
});

app.get('/api/prophecies', (req, res) => {
    res.json(darkUptimeSystem.darkProphecies);
});

app.get('/api/entities', (req, res) => {
    res.json(darkUptimeSystem.shadowEntities);
});

app.get('/uptime', (req, res) => {
    const systemInfo = darkUptimeSystem.getSystemInfo();
    const koyebUrl = process.env.KOYEB_APP_URL || `http://localhost:${port}`;
    
    res.json({
        success: true,
        data: {
            uptime: systemInfo.uptime,
            version: systemInfo.version,
            status: systemInfo.status,
            corpses: systemInfo.corpsesCollected,
            rituals: systemInfo.darkRituals,
            koyeb: {
                url: koyebUrl,
                online: true
            },
            entities: systemInfo.entities,
            prophecies: systemInfo.prophecies,
            timestamp: moment().tz("Asia/Riyadh").format("HH:mm:ss")
        }
    });
});

// =================================================================
// 🩺 Health Check للـ Koyeb
// =================================================================
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage().heapUsed / 1024 / 1024,
        corpses: darkUptimeSystem.corpsesCollected
    });
});

app.get('/healthz', (req, res) => {
    res.status(200).send('OK');
});

// =================================================================
// 🚀 تشغيل الخادم مع معالجة الأخطاء
// =================================================================

// معالجة الأخطاء لمنع إيقاف الخادم
process.on('uncaughtException', (err) => {
    console.error('💀 خطأ غير معالج:', err.message);
});

process.on('unhandledRejection', (err) => {
    console.error('💀 خطأ في الوعد:', err.message);
});

const server = app.listen(port, () => {
    console.log(chalk.hex('#8b0000').bold(`
    ╔═══════════════════════════════════════════════════════╗
    ║                                                       ║
    ║   ⚰️  KIRA UPTIME المظلم على KOYEB ⚰️              ║
    ║                                                       ║
    ║   🔗 رابط النظام: http://localhost:${port}            ${port < 10 ? ' ' : ''}
    ║   ☁️  مستضاف على: Koyeb Cloud                       ║
    ║   ⏳  وقت البدء: ${moment().tz("Asia/Riyadh").format("HH:mm:ss")}              ║
    ║   💀  الحالة: الجثث تتكاثر                           ║
    ║                                                       ║
    ╚═══════════════════════════════════════════════════════╝
    `));
    
    // معلومات Koyeb
    if (process.env.KOYEB_APP_URL) {
        console.log(chalk.hex('#000000').bold(`
    ╔═══════════════════════════════════════════════════════╗
    ║                                                       ║
    ║   ☁️  معلومات النشر على KOYEB                       ║
    ║                                                       ║
    ║   🔗 الرابط العام: ${process.env.KOYEB_APP_URL}      ║
    ║   📦 الخدمة: ${process.env.KOYEB_SERVICE_NAME || 'kira-dark-uptime'} ║
    ║   💀 الجثث المجمعة: ${darkUptimeSystem.corpsesCollected}              ║
    ║                                                       ║
    ╚═══════════════════════════════════════════════════════╝
        `));
    }
});

// Keep-Alive للمنفذ
server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;

// =================================================================
// 🔄 تحديث النظام كل دقيقة
// =================================================================
cron.schedule('* * * * *', () => {
    const uptime = darkUptimeSystem.getUptime();
    console.log(chalk.hex('#8b0000')(`⚰️  عداد الجثث: ${uptime.days} يوم ${uptime.hours} ساعة ${uptime.minutes} دقيقة`));
    
    // زيادة الجثث بشكل عشوائي
    if (Math.random() > 0.3) {
        darkUptimeSystem.corpsesCollected += Math.floor(Math.random() * 5) + 1;
    }
    
    // زيادة الطقوس المظلمة
    if (Math.random() > 0.8) {
        darkUptimeSystem.darkRituals++;
    }
});

// =================================================================
// 🎉 رسالة البدء
// =================================================================
setTimeout(() => {
    console.log(chalk.hex('#000000').bold(`
    ═══════════════════════════════════════════════════
          النظام المظلم يعمل... الجثث تتكاثر...
          KOYEB يحمل الظلام... العداد يدور...
    ═══════════════════════════════════════════════════
    `));
}, 1000);
