// =================================================================
// 🎭 نظام KIRA UPTIME الأسطوري المخيف - Koyeb Edition
// =================================================================

const express = require('express');
const app = express();
const chalk = require('chalk');
const cron = require("node-cron");
const { exec } = require("child_process");
const moment = require("moment-timezone");
const axios = require('axios');

// =================================================================
// ⚡ نظام Uptime المخيف (بدون systeminformation)
// =================================================================
class UptimeSystem {
    constructor() {
        this.startTime = Date.now();
        this.soulsCollected = 0;
        this.ritualsPerformed = 0;
        this.guardians = [
            { name: "Azazel", power: 1666, element: "Fire", status: "Awake" },
            { name: "Beelzebub", power: 1333, element: "Shadow", status: "Awake" },
            { name: "Lilith", power: 1555, element: "Blood", status: "Awake" },
            { name: "Mephistopheles", power: 1444, element: "Soul", status: "Awake" },
            { name: "Asmodeus", power: 1777, element: "Chaos", status: "Awake" }
        ];
        this.prophecies = [];
        this.omens = [];
        
        this.initSystem();
    }
    
    initSystem() {
        console.log(chalk.hex('#ff0000').bold(`
        ╔═══════════════════════════════════════════════════════╗
        ║                                                       ║
        ║  🩸 KIRA UPTIME DAEMON v2.0 ACTIVATED 🩸           ║
        ║                                                       ║
        ╚═══════════════════════════════════════════════════════╝
        `));
        
        // بدء النبوءات
        this.startProphecies();
    }
    
    startProphecies() {
        setInterval(() => {
            if (Math.random() > 0.7) {
                this.addProphecy();
            }
        }, 30000);
    }
    
    addProphecy() {
        const prophecies = [
            "الخوادم تتنفس في الظلام...",
            "الكود يتدفق كالدم في العروق...",
            "وقت التشغيل يسعى للأبدية...",
            "عاصفة من الطلبات تقترب...",
            "قاعدة البيانات تحلم بالفوضى...",
            "الذاكرة تتذكر كل شيء...",
            "الشبكة تنبض بالحياة..."
        ];
        
        const prophecy = prophecies[Math.floor(Math.random() * prophecies.length)];
        this.prophecies.push({
            id: this.prophecies.length + 1,
            text: prophecy,
            timestamp: moment().format('HH:mm:ss'),
            severity: ['MINOR', 'MAJOR', 'CRITICAL'][Math.floor(Math.random() * 3)]
        });
        
        if (this.prophecies.length > 10) this.prophecies.shift();
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
        
        // معلومات النظام من os
        const os = require('os');
        const usedMemory = process.memoryUsage().heapUsed / 1024 / 1024;
        const totalMemory = os.totalmem() / 1024 / 1024 / 1024;
        const freeMemory = os.freemem() / 1024 / 1024 / 1024;
        
        return {
            version: "2.0.666",
            status: "ACTIVE",
            performance: ['OPTIMAL', 'HIGH', 'MEDIUM'][Math.floor(Math.random() * 3)],
            uptime: `${uptime.days}d ${uptime.hours}h ${uptime.minutes}m ${uptime.seconds}s`,
            memory: {
                used: usedMemory.toFixed(2) + ' MB',
                total: totalMemory.toFixed(2) + ' GB',
                free: freeMemory.toFixed(2) + ' GB',
                percentage: ((usedMemory / (totalMemory * 1024)) * 100).toFixed(2) + '%'
            },
            cpu: {
                cores: os.cpus().length,
                load: (Math.random() * 100).toFixed(2) + '%'
            },
            guardians: this.guardians.length,
            prophecies: this.prophecies.length,
            soulsCollected: this.soulsCollected,
            ritualsPerformed: this.ritualsPerformed
        };
    }
}

// إنشاء نظام Uptime
const uptimeSystem = new UptimeSystem();

// =================================================================
// ⚙️ الإعدادات
// =================================================================
const timerestart = 120;
const port = process.env.PORT || 8000;

// =================================================================
// 🎭 واجهة الـ Uptime المخيفة
// =================================================================
app.get('/', (req, res) => {
    const uptime = uptimeSystem.getUptime();
    const systemInfo = uptimeSystem.getSystemInfo();
    
    // الحصول على عنوان URL الحالي من Koyeb
    const koyebUrl = process.env.KOYEB_APP_URL || `http://localhost:${port}`;
    const koyebService = process.env.KOYEB_SERVICE_NAME || 'kira-uptime';
    const koyebRegion = process.env.KOYEB_REGION || 'unknown';
    const koyebInstance = process.env.KOYEB_INSTANCE_ID || 'unknown';
    
    const html = `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>🎭 KIRA UPTIME DAEMON</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Reem+Kufi:wght@400;700&display=swap');
            
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                background: linear-gradient(135deg, #000000, #1a0000, #00001a);
                color: #ff0000;
                font-family: 'Reem Kufi', sans-serif;
                min-height: 100vh;
                overflow-x: hidden;
            }
            
            .container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
            }
            
            .header {
                text-align: center;
                padding: 40px 0;
                border-bottom: 3px solid #ff0000;
                margin-bottom: 40px;
                position: relative;
            }
            
            .header h1 {
                font-size: 3.5rem;
                text-shadow: 0 0 15px #ff0000, 0 0 25px #ff0000;
                margin-bottom: 20px;
            }
            
            .header p {
                font-size: 1.3rem;
                color: #ff6666;
            }
            
            .uptime-display {
                background: rgba(0, 0, 0, 0.85);
                border: 3px solid #ff0000;
                border-radius: 20px;
                padding: 30px;
                margin-bottom: 30px;
                box-shadow: 0 0 40px rgba(255, 0, 0, 0.3);
            }
            
            .uptime-title {
                font-size: 2.2rem;
                color: #ff4444;
                margin-bottom: 25px;
                text-align: center;
            }
            
            .uptime-numbers {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            
            .time-unit {
                background: linear-gradient(145deg, #1a0000, #330000);
                border: 2px solid #ff0000;
                border-radius: 15px;
                padding: 25px;
                text-align: center;
                transition: all 0.3s;
            }
            
            .time-unit:hover {
                transform: translateY(-10px);
                box-shadow: 0 10px 25px rgba(255, 0, 0, 0.4);
            }
            
            .time-value {
                font-size: 3.5rem;
                font-weight: bold;
                color: #ffffff;
                text-shadow: 0 0 10px #ff0000;
                margin-bottom: 10px;
            }
            
            .time-label {
                font-size: 1.3rem;
                color: #ff8888;
                text-transform: uppercase;
            }
            
            .system-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 25px;
                margin-bottom: 40px;
            }
            
            .info-card {
                background: rgba(26, 0, 0, 0.9);
                border: 2px solid #660000;
                border-radius: 15px;
                padding: 25px;
                transition: all 0.3s;
            }
            
            .info-card:hover {
                border-color: #ff0000;
                box-shadow: 0 0 25px rgba(255, 0, 0, 0.2);
            }
            
            .card-title {
                font-size: 1.8rem;
                color: #ff4444;
                margin-bottom: 20px;
                padding-bottom: 10px;
                border-bottom: 2px solid #330000;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .info-content {
                color: #ff9999;
                font-size: 1.1rem;
                line-height: 1.8;
            }
            
            .koyeb-info {
                background: linear-gradient(135deg, #000033, #000066);
                border: 2px solid #0066ff;
            }
            
            .koyeb-info .card-title {
                color: #00aaff;
            }
            
            .status-badge {
                display: inline-block;
                padding: 8px 20px;
                border-radius: 25px;
                font-weight: bold;
                font-size: 0.9rem;
                margin: 5px;
            }
            
            .status-active {
                background: rgba(0, 255, 0, 0.15);
                color: #00ff00;
                border: 1px solid #00ff00;
            }
            
            .guardians-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 20px;
                margin-top: 15px;
            }
            
            .guardian {
                background: rgba(51, 0, 51, 0.8);
                border: 1px solid #8a2be2;
                border-radius: 12px;
                padding: 15px;
                text-align: center;
                transition: all 0.3s;
            }
            
            .guardian:hover {
                transform: scale(1.05);
                box-shadow: 0 0 20px rgba(138, 43, 226, 0.4);
            }
            
            .guardian-name {
                color: #da70d6;
                font-size: 1.3rem;
                font-weight: bold;
                margin-bottom: 8px;
            }
            
            .footer {
                text-align: center;
                padding: 40px 0;
                border-top: 2px solid #660000;
                margin-top: 40px;
                color: #ff6666;
                font-size: 1.1rem;
            }
            
            .floating {
                position: fixed;
                font-size: 2rem;
                opacity: 0.1;
                animation: float 20s linear infinite;
                pointer-events: none;
                z-index: -1;
            }
            
            @keyframes float {
                0% { transform: translateY(100vh) rotate(0deg); }
                100% { transform: translateY(-100vh) rotate(360deg); }
            }
            
            @media (max-width: 768px) {
                .header h1 { font-size: 2.5rem; }
                .uptime-numbers { grid-template-columns: repeat(2, 1fr); }
                .time-value { font-size: 2.5rem; }
                .system-grid { grid-template-columns: 1fr; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎭 KIRA UPTIME DAEMON</h1>
                <p>⏳ نظام مراقبة الوقت التشغيلي المخيف على Koyeb</p>
            </div>
            
            <div class="uptime-display">
                <div class="uptime-title">⏳ وقت التشغيل الحالي</div>
                <div class="uptime-numbers">
                    <div class="time-unit">
                        <div class="time-value">${uptime.days}</div>
                        <div class="time-label">أيام</div>
                    </div>
                    <div class="time-unit">
                        <div class="time-value">${uptime.hours}</div>
                        <div class="time-label">ساعات</div>
                    </div>
                    <div class="time-unit">
                        <div class="time-value">${uptime.minutes}</div>
                        <div class="time-label">دقائق</div>
                    </div>
                    <div class="time-unit">
                        <div class="time-value">${uptime.seconds}</div>
                        <div class="time-label">ثواني</div>
                    </div>
                </div>
            </div>
            
            <div class="system-grid">
                <div class="info-card">
                    <div class="card-title">🏰 معلومات النظام</div>
                    <div class="info-content">
                        <p>📊 الإصدار: ${systemInfo.version}</p>
                        <p>⚡ الحالة: <span class="status-badge status-active">${systemInfo.status}</span></p>
                        <p>🎯 الأداء: ${systemInfo.performance}</p>
                        <p>💾 الذاكرة: ${systemInfo.memory.used} / ${systemInfo.memory.total}</p>
                        <p>🧠 المعالج: ${systemInfo.cpu.cores} نواة | ${systemInfo.cpu.load} تحميل</p>
                        <p>👹 الحراس: ${systemInfo.guardians}/13 نشط</p>
                        <p>🔮 النبوءات: ${systemInfo.prophecies} نشطة</p>
                    </div>
                </div>
                
                <div class="info-card koyeb-info">
                    <div class="card-title">☁️ معلومات Koyeb</div>
                    <div class="info-content">
                        <p>🔗 الرابط: <a href="${koyebUrl}" style="color:#00aaff">${koyebUrl}</a></p>
                        <p>📦 الخدمة: ${koyebService}</p>
                        <p>📍 المنطقة: ${koyebRegion}</p>
                        <p>🆔 المثيل: ${koyebInstance}</p>
                        <p>🌐 المنفذ: ${port}</p>
                        <p>📅 وقت التشغيل: ${systemInfo.uptime}</p>
                        <p>🎯 النظام: Koyeb + Node.js v18</p>
                    </div>
                </div>
                
                <div class="info-card">
                    <div class="card-title">👹 حراس النظام</div>
                    <div class="info-content">
                        <div class="guardians-grid">
                            ${uptimeSystem.guardians.map(g => `
                                <div class="guardian">
                                    <div class="guardian-name">${g.name}</div>
                                    <div style="color:#ffd700">قوة: ${g.power}</div>
                                    <div style="color:#${g.element === 'Fire' ? 'ff4500' : g.element === 'Shadow' ? '8a2be2' : 'ff0000'}">العنصر: ${g.element}</div>
                                    <div style="color:#00ff00">الحالة: ${g.status}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="info-card">
                <div class="card-title">🔮 النبوءات الأخيرة</div>
                <div class="info-content">
                    ${uptimeSystem.prophecies.slice(-5).map(p => `
                        <p style="margin-bottom: 10px; padding: 10px; background: rgba(75, 0, 130, 0.2); border-radius: 8px;">
                            <span style="color:#${p.severity === 'CRITICAL' ? 'ff0000' : p.severity === 'MAJOR' ? 'ff9900' : 'ff69b4'}">
                                #${p.id} [${p.severity}]
                            </span>
                            <br>${p.text}
                            <br><small style="color:#888">${p.timestamp}</small>
                        </p>
                    `).join('')}
                    ${uptimeSystem.prophecies.length === 0 ? '<p style="color:#888; text-align:center;">⏳ جاري استقبال النبوءات...</p>' : ''}
                </div>
            </div>
            
            <div class="footer">
                <p>🎭 نظام KIRA UPTIME DAEMON v2.0</p>
                <p>☁️ مستضاف على Koyeb | 🕒 ${moment().tz("Asia/Riyadh").format("HH:mm:ss")}</p>
                <p>📅 ${moment().tz("Asia/Riyadh").format("DD/MM/YYYY")} | 👁️ العين الثالثة: مفتوحة</p>
                <p>"النظام يعمل... الظلام يراقب... Koyeb يحمي..."</p>
            </div>
        </div>
        
        <script>
            // عناصر عائمة مخيفة
            const symbols = ['👹', '🔮', '🩸', '⚡', '🌀', '💀', '👁️', '🔥', '🌑', '⚰️'];
            for (let i = 0; i < 15; i++) {
                const el = document.createElement('div');
                el.className = 'floating';
                el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
                el.style.left = Math.random() * 100 + 'vw';
                el.style.animationDuration = (Math.random() * 30 + 20) + 's';
                el.style.animationDelay = Math.random() * 5 + 's';
                document.body.appendChild(el);
            }
            
            // تحديث الوقت كل ثانية
            function updateTime() {
                const timeEls = document.querySelectorAll('.time-value');
                if (timeEls.length === 4) {
                    fetch('/api/uptime')
                        .then(r => r.json())
                        .then(data => {
                            timeEls[0].textContent = data.days;
                            timeEls[1].textContent = data.hours;
                            timeEls[2].textContent = data.minutes;
                            timeEls[3].textContent = data.seconds;
                        });
                }
            }
            setInterval(updateTime, 1000);
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
    res.json(uptimeSystem.getUptime());
});

app.get('/api/system', (req, res) => {
    res.json(uptimeSystem.getSystemInfo());
});

app.get('/api/prophecies', (req, res) => {
    res.json(uptimeSystem.prophecies);
});

app.get('/api/guardians', (req, res) => {
    res.json(uptimeSystem.guardians);
});

app.get('/api/koyeb', (req, res) => {
    res.json({
        url: process.env.KOYEB_APP_URL || `http://localhost:${port}`,
        service: process.env.KOYEB_SERVICE_NAME || 'kira-uptime',
        region: process.env.KOYEB_REGION || 'unknown',
        instance: process.env.KOYEB_INSTANCE_ID || 'unknown',
        port: port,
        nodeVersion: process.version,
        platform: process.platform
    });
});

// =================================================================
// 🎭 مسار الـ Uptime للبوت
// =================================================================
app.get('/uptime', (req, res) => {
    const uptime = uptimeSystem.getUptime();
    const systemInfo = uptimeSystem.getSystemInfo();
    
    const koyebUrl = process.env.KOYEB_APP_URL || `http://localhost:${port}`;
    
    res.json({
        success: true,
        data: {
            uptime: systemInfo.uptime,
            version: systemInfo.version,
            status: systemInfo.status,
            performance: systemInfo.performance,
            koyeb: {
                url: koyebUrl,
                online: true
            },
            guardians: systemInfo.guardians,
            prophecies: systemInfo.prophecies,
            memory: systemInfo.memory.used,
            timestamp: moment().tz("Asia/Riyadh").format("HH:mm:ss")
        }
    });
});

// =================================================================
// 🖼️ صفحة بسيطة للـ health check
// =================================================================
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        koyeb: {
            app_url: process.env.KOYEB_APP_URL,
            service_name: process.env.KOYEB_SERVICE_NAME
        }
    });
});

// =================================================================
// 🚀 تشغيل الخادم
// =================================================================
app.listen(port, () => {
    console.log(chalk.hex('#ff0000').bold(`
    ╔═══════════════════════════════════════════════════════╗
    ║                                                       ║
    ║   🎭 KIRA UPTIME DAEMON v2.0 ON KOYEB 🎭           ║
    ║                                                       ║
    ║   🔗 رابط النظام: http://localhost:${port}            ${port < 10 ? ' ' : ''}
    ║   ☁️  مستضاف على: Koyeb Cloud                       ║
    ║   ⏳  وقت البدء: ${moment().tz("Asia/Riyadh").format("HH:mm:ss")}              ║
    ║   🎯  الحالة: نشط وجاهز                            ║
    ║                                                       ║
    ╚═══════════════════════════════════════════════════════╝
    `));
    
    // معلومات Koyeb
    if (process.env.KOYEB_APP_URL) {
        console.log(chalk.hex('#0066ff').bold(`
    ╔═══════════════════════════════════════════════════════╗
    ║                                                       ║
    ║   ☁️  KOYEB DEPLOYMENT INFORMATION                  ║
    ║                                                       ║
    ║   🔗 الرابط العام: ${process.env.KOYEB_APP_URL}      ║
    ║   📦 الخدمة: ${process.env.KOYEB_SERVICE_NAME || 'N/A'}          ║
    ║   📍 المنطقة: ${process.env.KOYEB_REGION || 'N/A'}              ║
    ║   🆔 المثيل: ${process.env.KOYEB_INSTANCE_ID || 'N/A'}         ║
    ║                                                       ║
    ╚═══════════════════════════════════════════════════════╝
        `));
    }
});

// =================================================================
// 🎭 رسالة البدء المخيفة
// =================================================================
setTimeout(() => {
    console.log(chalk.hex('#00ff00').bold(`
    ═══════════════════════════════════════════════════
          SYSTEM UPTIME MONITORING INITIATED
          KOYEB CLOUD DEPLOYMENT ACTIVE
          ALL HAIL THE ETERNAL UPTIME!
    ═══════════════════════════════════════════════════
    `));
}, 2000);

// =================================================================
// ⚠️ معالجة الأخطاء
// =================================================================
process.on('unhandledRejection', (err) => {
    console.error(chalk.red('⚠️  خطأ غير معالج:', err.message));
});

// =================================================================
// 🔄 تحديث معلومات النظام كل دقيقة
// =================================================================
cron.schedule('* * * * *', () => {
    const uptime = uptimeSystem.getUptime();
    console.log(chalk.hex('#ff69b4')(`⏳ وقت التشغيل: ${uptime.days} يوم ${uptime.hours} ساعة ${uptime.minutes} دقيقة`));
    
    // زيادة عدد الأرواح بشكل عشوائي
    if (Math.random() > 0.5) {
        uptimeSystem.soulsCollected += Math.floor(Math.random() * 10);
    }
    
    // زيادة الطقوس
    if (Math.random() > 0.7) {
        uptimeSystem.ritualsPerformed++;
    }
});

// =================================================================
// 🎉 اكتمال النظام
// =================================================================
console.log(chalk.hex('#ffff00')(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🎉 SYSTEM READY FOR KOYEB DEPLOYMENT 🎉           ║
║                                                       ║
║   • نظام Uptime المخيف نشط                          ║
║   • واجهة ويب جاهزة                                 ║
║   • API نقاط نهاية نشطة                             ║
║   • معلومات Koyeb متاحة                             ║
║   • النظام جاهز للبوت                               ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
`));
