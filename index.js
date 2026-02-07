// =================================================================
// 🖥️ نظام KIRA UPTIME - النسخة المطابقة للصورة
// =================================================================

const express = require('express');
const app = express();
const chalk = require('chalk');
const moment = require('moment-timezone');

// =================================================================
// ⚡ نظام Uptime المطابق للصورة
// =================================================================
class KiraUptimeSystem {
    constructor() {
        this.startTime = new Date();
        this.startTime.setDate(this.startTime.getDate() - 1);
        this.startTime.setHours(this.startTime.getHours() - 12);
        this.startTime.setMinutes(this.startTime.getMinutes() - 34);
        this.startTime.setSeconds(this.startTime.getSeconds() - 56);
        
        this.services = [
            {
                name: "محال",
                id: "2.0666",
                type: 'Spoler "calor" Cpector ARCOHOVI',
                status: "عطل",
                memory: { used: 125.67, total: 32.00 },
                temperature: 55.78,
                url: "https://locabst:8000"
            },
            {
                name: "البندير",
                id: "8888",
                version: "D04 5.0.84",
                status: "أحميل",
                identifier: "669",
                type: "SDAK 0.20"
            },
            {
                name: "الحجر",
                id: "779",
                version: "D04 A 1.0.84",
                status: "أحميل",
                identifier: "669",
                type: "SDAK 0.20"
            },
            {
                name: "الحجر",
                id: "78888",
                version: "D04 A 1.0.84",
                status: "أحميل",
                identifier: "669",
                type: "SDAK 0.20"
            },
            {
                name: "الحجر",
                id: "789",
                version: "D04 A 1.0.84",
                status: "أحميل",
                identifier: "669",
                type: "SDAK 0.20"
            }
        ];
        
        this.systemInfo = {
            version: "v2.0",
            title: "kira uptime slâm",
            subtitle: "الغان مالوبايد يفيض - الرملي الخفقر الله"
        };
        
        this.initSystem();
    }
    
    initSystem() {
        console.log(chalk.hex('#ff6b6b').bold(`
        ╔═══════════════════════════════════════════════════════╗
        ║                                                       ║
        ║   🖥️  KIRA UPTIME SYSTEM - مطابق للصورة             ║
        ║                                                       ║
        ╚═══════════════════════════════════════════════════════╝
        `));
        
        // تحديث البيانات تلقائياً
        setInterval(() => {
            this.updateDynamicData();
        }, 5000);
    }
    
    getUptime() {
        const now = new Date();
        const diff = now - this.startTime;
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        return {
            days: days.toString().padStart(2, '0'),
            hours: hours.toString().padStart(2, '0'),
            minutes: minutes.toString().padStart(2, '0'),
            seconds: seconds.toString().padStart(2, '0'),
            full: `${days} يوم ${hours} ساعة ${minutes} دقيقة ${seconds} ثانية`
        };
    }
    
    updateDynamicData() {
        // تحديث الحرارة بشكل عشوائي
        this.services[0].temperature = 55.78 + (Math.random() - 0.5) * 0.5;
        
        // تحديث الذاكرة المستخدمة
        this.services[0].memory.used = 125.67 + (Math.random() - 0.5) * 0.3;
        
        // تحديث حالة الخدمات عشوائياً (باستثناء الأولى)
        for (let i = 1; i < this.services.length; i++) {
            if (Math.random() > 0.95) {
                this.services[i].status = this.services[i].status === "أحميل" ? "عطل" : "أحميل";
            }
        }
    }
    
    getServiceStatusClass(status) {
        return status === "أحميل" ? "status-active" : "status-inactive";
    }
    
    formatTemperature(temp) {
        return temp.toFixed(2).replace('.', 'S') + '°C';
    }
    
    formatMemory(memory) {
        return `${memory.used.toFixed(2)} mb / ${memory.total.toFixed(2)} gb`;
    }
    
    getAllData() {
        return {
            system: this.systemInfo,
            uptime: this.getUptime(),
            services: this.services,
            timestamp: moment().tz("Asia/Riyadh").format("HH:mm:ss")
        };
    }
}

// إنشاء النظام
const kiraSystem = new KiraUptimeSystem();

// =================================================================
// ⚙️ الإعدادات
// =================================================================
const port = process.env.PORT || 8000;

// =================================================================
// 🎭 واجهة الويب المطابقة للصورة
// =================================================================
app.get('/', (req, res) => {
    const data = kiraSystem.getAllData();
    
    const html = `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Kira Uptime System</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700&display=swap');
            
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                font-family: 'Cairo', sans-serif;
            }
            
            body {
                background: linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%);
                color: #e0e0e0;
                min-height: 100vh;
                padding: 20px;
                direction: rtl;
            }
            
            .container {
                max-width: 1000px;
                margin: 0 auto;
                background: rgba(10, 10, 10, 0.95);
                border-radius: 15px;
                padding: 30px;
                border: 1px solid #333;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7);
            }
            
            .header {
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid #333;
            }
            
            .title {
                color: #ff6b6b;
                font-size: 2.8rem;
                font-weight: 900;
                margin-bottom: 5px;
                text-shadow: 0 0 10px rgba(255, 107, 107, 0.5);
                letter-spacing: 2px;
            }
            
            .subtitle {
                color: #888;
                font-size: 1.2rem;
                font-weight: 300;
            }
            
            .divider {
                height: 2px;
                background: linear-gradient(to left, transparent, #444, transparent);
                margin: 25px 0;
            }
            
            .uptime-section {
                background: rgba(20, 20, 20, 0.8);
                border-radius: 10px;
                padding: 20px;
                margin-bottom: 25px;
                border: 1px solid #333;
            }
            
            .section-title {
                color: #4dabf7;
                font-size: 1.8rem;
                margin-bottom: 15px;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .section-title i {
                color: #ff6b6b;
            }
            
            .uptime-numbers {
                display: flex;
                justify-content: center;
                gap: 30px;
                flex-wrap: wrap;
            }
            
            .uptime-unit {
                text-align: center;
                background: rgba(30, 30, 30, 0.9);
                padding: 15px 25px;
                border-radius: 8px;
                border: 1px solid #444;
                min-width: 120px;
            }
            
            .uptime-value {
                font-size: 2.8rem;
                font-weight: 700;
                color: #fff;
                font-family: 'Courier New', monospace;
                letter-spacing: 3px;
            }
            
            .uptime-label {
                color: #aaa;
                font-size: 1rem;
                margin-top: 5px;
            }
            
            .services-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 20px;
                margin-top: 30px;
            }
            
            .service-card {
                background: rgba(25, 25, 25, 0.9);
                border-radius: 10px;
                padding: 20px;
                border: 1px solid #333;
                transition: all 0.3s;
            }
            
            .service-card:hover {
                border-color: #4dabf7;
                transform: translateY(-5px);
                box-shadow: 0 5px 15px rgba(77, 171, 247, 0.2);
            }
            
            .service-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 1px solid #333;
            }
            
            .service-name {
                color: #4dabf7;
                font-size: 1.4rem;
                font-weight: 600;
            }
            
            .service-id {
                background: #333;
                color: #aaa;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 0.9rem;
            }
            
            .service-info {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .info-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 0;
                border-bottom: 1px dashed #333;
            }
            
            .info-label {
                color: #aaa;
                font-size: 0.95rem;
            }
            
            .info-value {
                color: #fff;
                font-weight: 500;
                font-size: 1rem;
            }
            
            .status-active {
                color: #51cf66;
                background: rgba(81, 207, 102, 0.1);
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 0.9rem;
            }
            
            .status-inactive {
                color: #ff6b6b;
                background: rgba(255, 107, 107, 0.1);
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 0.9rem;
            }
            
            .url-link {
                color: #4dabf7;
                text-decoration: none;
                font-size: 0.95rem;
                word-break: break-all;
            }
            
            .url-link:hover {
                text-decoration: underline;
            }
            
            .temperature {
                color: #ff922b;
                font-weight: bold;
            }
            
            .memory {
                color: #51cf66;
            }
            
            .footer {
                margin-top: 40px;
                text-align: center;
                color: #666;
                font-size: 0.9rem;
                padding-top: 20px;
                border-top: 1px solid #333;
            }
            
            .version {
                color: #4dabf7;
                font-weight: bold;
            }
            
            @media (max-width: 768px) {
                .container {
                    padding: 15px;
                }
                
                .title {
                    font-size: 2rem;
                }
                
                .uptime-numbers {
                    gap: 15px;
                }
                
                .uptime-unit {
                    min-width: 100px;
                    padding: 10px 15px;
                }
                
                .uptime-value {
                    font-size: 2.2rem;
                }
                
                .services-grid {
                    grid-template-columns: 1fr;
                }
            }
            
            .heart {
                color: #ff6b6b;
                animation: heartbeat 1.5s infinite;
            }
            
            @keyframes heartbeat {
                0% { transform: scale(1); }
                5% { transform: scale(1.1); }
                10% { transform: scale(1); }
                15% { transform: scale(1.1); }
                20% { transform: scale(1); }
                100% { transform: scale(1); }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <!-- العنوان الرئيسي -->
            <div class="header">
                <h1 class="title">${data.system.title}</h1>
                <p class="subtitle">${data.system.subtitle}</p>
            </div>
            
            <!-- مدة التشغيل -->
            <div class="uptime-section">
                <h2 class="section-title"><i class="fas fa-heartbeat"></i> محال الذكي كونه <span class="heart">❤️</span></h2>
                <div class="uptime-numbers">
                    <div class="uptime-unit">
                        <div class="uptime-value">${data.uptime.days}</div>
                        <div class="uptime-label">يوم</div>
                    </div>
                    <div class="uptime-unit">
                        <div class="uptime-value">${data.uptime.hours}</div>
                        <div class="uptime-label">ساعة</div>
                    </div>
                    <div class="uptime-unit">
                        <div class="uptime-value">${data.uptime.minutes}</div>
                        <div class="uptime-label">دقيقة</div>
                    </div>
                    <div class="uptime-unit">
                        <div class="uptime-value">${data.uptime.seconds}</div>
                        <div class="uptime-label">ثانية</div>
                    </div>
                </div>
            </div>
            
            <!-- الفاصل -->
            <div class="divider"></div>
            
            <!-- الخدمات -->
            <div class="services-grid">
                ${data.services.map(service => `
                    <div class="service-card">
                        <div class="service-header">
                            <h3 class="service-name">${service.name}</h3>
                            <span class="service-id">${service.id}</span>
                        </div>
                        <div class="service-info">
                            ${service.type ? `
                                <div class="info-row">
                                    <span class="info-label">النوع</span>
                                    <span class="info-value">${service.type}</span>
                                </div>
                            ` : ''}
                            
                            ${service.version ? `
                                <div class="info-row">
                                    <span class="info-label">الإصدار</span>
                                    <span class="info-value">${service.version}</span>
                                </div>
                            ` : ''}
                            
                            <div class="info-row">
                                <span class="info-label">الحالة</span>
                                <span class="${kiraSystem.getServiceStatusClass(service.status)}">${service.status}</span>
                            </div>
                            
                            ${service.memory ? `
                                <div class="info-row">
                                    <span class="info-label">الذاكرة</span>
                                    <span class="info-value memory">${kiraSystem.formatMemory(service.memory)}</span>
                                </div>
                            ` : ''}
                            
                            ${service.temperature ? `
                                <div class="info-row">
                                    <span class="info-label">الحرارة</span>
                                    <span class="info-value temperature">${kiraSystem.formatTemperature(service.temperature)}</span>
                                </div>
                            ` : ''}
                            
                            ${service.url ? `
                                <div class="info-row">
                                    <span class="info-label">الرابط</span>
                                    <a href="${service.url}" class="info-value url-link">${service.url}</a>
                                </div>
                            ` : ''}
                            
                            ${service.identifier ? `
                                <div class="info-row">
                                    <span class="info-label">المعرف</span>
                                    <span class="info-value">${service.identifier}</span>
                                </div>
                            ` : ''}
                            
                            ${service.type && !service.url ? `
                                <div class="info-row">
                                    <span class="info-label">النوع</span>
                                    <span class="info-value">${service.type}</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <!-- الفاصل -->
            <div class="divider"></div>
            
            <!-- التذييل -->
            <div class="footer">
                <p><i class="fas fa-server"></i> kira uptime system</p>
                <p class="version">kira uptime ${data.system.version}</p>
                <p>⏱️ ${data.timestamp} | 🖥️ ${data.services.length} خدمات</p>
            </div>
        </div>

        <script>
            // تحديث عداد التشغيل كل ثانية
            function updateUptime() {
                fetch('/api/uptime')
                    .then(response => response.json())
                    .then(data => {
                        document.querySelector('.uptime-unit:nth-child(1) .uptime-value').textContent = 
                            data.days;
                        document.querySelector('.uptime-unit:nth-child(2) .uptime-value').textContent = 
                            data.hours;
                        document.querySelector('.uptime-unit:nth-child(3) .uptime-value').textContent = 
                            data.minutes;
                        document.querySelector('.uptime-unit:nth-child(4) .uptime-value').textContent = 
                            data.seconds;
                    });
            }
            
            // تحديث البيانات كل 5 ثواني
            function updateServices() {
                fetch('/api/services')
                    .then(response => response.json())
                    .then(services => {
                        services.forEach((service, index) => {
                            const card = document.querySelectorAll('.service-card')[index];
                            if (card) {
                                // تحديث الحالة
                                const statusElement = card.querySelector('.status-active, .status-inactive');
                                if (statusElement) {
                                    statusElement.textContent = service.status;
                                    statusElement.className = service.status === "أحميل" ? 
                                        "status-active" : "status-inactive";
                                }
                                
                                // تحديث الحرارة
                                if (service.temperature) {
                                    const tempElement = card.querySelector('.temperature');
                                    if (tempElement) {
                                        tempElement.textContent = service.temperature.toFixed(2).replace('.', 'S') + '°C';
                                    }
                                }
                                
                                // تحديث الذاكرة
                                if (service.memory) {
                                    const memoryElement = card.querySelector('.memory');
                                    if (memoryElement) {
                                        memoryElement.textContent = service.memory.used.toFixed(2) + ' mb / ' + 
                                                                     service.memory.total.toFixed(2) + ' gb';
                                    }
                                }
                            }
                        });
                    });
            }
            
            // بدء التحديثات
            setInterval(updateUptime, 1000);
            setInterval(updateServices, 5000);
            
            // تأثير النبض للقلب
            const heart = document.querySelector('.heart');
            setInterval(() => {
                heart.style.animation = 'none';
                setTimeout(() => {
                    heart.style.animation = 'heartbeat 1.5s infinite';
                }, 10);
            }, 3000);
            
            // تأثيرات تفاعلية للبطاقات
            document.querySelectorAll('.service-card').forEach(card => {
                card.addEventListener('click', function() {
                    this.classList.toggle('active');
                });
            });
        </script>
    </body>
    </html>
    `;
    
    res.send(html);
});

// =================================================================
// 📡 نقاط نهاية API
// =================================================================

app.get('/api/uptime', (req, res) => {
    res.json(kiraSystem.getUptime());
});

app.get('/api/services', (req, res) => {
    res.json(kiraSystem.services);
});

app.get('/api/system', (req, res) => {
    res.json(kiraSystem.getAllData());
});

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        system: 'Kira Uptime System',
        version: '2.0',
        uptime: kiraSystem.getUptime().full
    });
});

// =================================================================
// 🚀 تشغيل الخادم
// =================================================================
const server = app.listen(port, () => {
    console.log(chalk.hex('#ff6b6b').bold(`
    ╔═══════════════════════════════════════════════════════╗
    ║                                                       ║
    ║   🖥️  KIRA UPTIME SYSTEM - مطابق للصورة             ║
    ║                                                       ║
    ║   🔗 رابط النظام: http://localhost:${port}            ${port < 10 ? ' ' : ''}
    ║   ⏱️  وقت البدء: ${moment().tz("Asia/Riyadh").format("HH:mm:ss")}             ║
    ║   📊  عدد الخدمات: ${kiraSystem.services.length}                       ║
    ║                                                       ║
    ╚═══════════════════════════════════════════════════════╝
    `));
});

// =================================================================
// 📦 package.json المطلوب
// =================================================================
/*
{
  "name": "kira-uptime-system",
  "version": "2.0.0",
  "description": "نظام Kira Uptime مطابق للصورة",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "chalk": "^4.1.2",
    "moment-timezone": "^0.5.43"
  }
}
*/

// =================================================================
// 💡 ملاحظات التركيب
// =================================================================
/*
1. قم بتثبيت الحزم المطلوبة:
   npm install express chalk moment-timezone

2. قم بتشغيل الخادم:
   node index.js

3. افتح المتصفح على:
   http://localhost:8000
*/
