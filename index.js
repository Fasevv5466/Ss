#!/usr/bin/env node
'use strict';

// ============================================
// MODULE IMPORTS
// ============================================
const express = require('express');
const chalk = require('chalk');
const fs = require('fs').promises;
const path = require('path');
const moment = require('moment-timezone');

// ============================================
// BANNER - KIRA DEMON
// ============================================
console.log(chalk.red(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║  ██╗  ██╗ ██╗ ██████╗   ██╗   ██████╗  ██████╗ ████████╗
║  ██║ ██╔╝ ██║ ██╔══██╗ ███║   ██╔══██╗██╔═══██╗╚══██╔══╝
║  █████╔╝  ██║ ██████╔╝ ╚██║   ██████╔╝██║   ██║   ██║   
║  ██╔═██╗  ██║ ██╔══██╗  ██║   ██╔══██╗██║   ██║   ██║   
║  ██║  ██╗ ██║ ██║  ██║  ██║   ██║  ██║╚██████╔╝   ██║   
║  ╚═╝  ╚═╝ ╚═╝ ╚═╝  ╚═╝  ╚═╝   ╚═╝  ╚═╝ ╚═════╝    ╚═╝   
║                                                       ║
║               𝐊𝐈𝐑𝐀 𝐁𝐎𝐓 v31.7.2                        ║
║          Powered by Node.js ${process.version}          ║
║           By: 𝐚𝐲𝐦𝐚𝐧 | XVK1C                         ║
╚═══════════════════════════════════════════════════════╝
`));

console.log(chalk.hex('#8B0000')('━'.repeat(60)));
console.log(chalk.bold.hex('#FF0000')('🩸 دم الإبداع يسري في عروق الكود 🩸'));
console.log(chalk.hex('#8B0000')('━'.repeat(60)));

// ============================================
// GLOBAL VARIABLES
// ============================================
const CONFIG = {
    PORT: process.env.PORT || 8000,
    START_TIME: Date.now()
};

let globalConfig = {};
let server = null;

// ============================================
// FILE MANAGEMENT - AUTO CREATE
// ============================================
async function ensureFile(filePath, defaultContent) {
    try {
        await fs.access(filePath);
        console.log(chalk.green(`✅ ${path.basename(filePath)} موجود`));
        return require(filePath);
    } catch {
        console.log(chalk.yellow(`⚠️  إنشاء ${path.basename(filePath)}...`));
        await fs.writeFile(filePath, JSON.stringify(defaultContent, null, 2));
        console.log(chalk.green(`✅ تم إنشاء ${path.basename(filePath)}`));
        return defaultContent;
    }
}

async function loadConfig() {
    try {
        const defaultConfig = {
            "PREFIX": ".",
            "BOTNAME": "𝐤𝐢𝐫𝐚",
            "ADMINBOT": ["61577861540407"],
            "APPSTATEPATH": "appstate.json",
            "FCAOption": {
                "listenEvents": true,
                "selfListen": false,
                "online": true
            },
            "language": "ar",
            "commandDisabled": [],
            "version": "1.2.14",
            "TIMEZONE": "Asia/Baghdad"
        };

        globalConfig = await ensureFile(
            path.join(__dirname, 'config.json'), 
            defaultConfig
        );
        
        // تأكد من وجود appstate.json
        await ensureFile(
            path.join(__dirname, 'appstate.json'),
            []
        );

        return true;
    } catch (error) {
        console.error(chalk.red('❌ خطأ في تحميل الإعدادات:'), error);
        return false;
    }
}

// ============================================
// KIRA DASHBOARD - Página Épica
// ============================================
function getUptime() {
    const uptime = Date.now() - CONFIG.START_TIME;
    const seconds = Math.floor((uptime / 1000) % 60);
    const minutes = Math.floor((uptime / (1000 * 60)) % 60);
    const hours = Math.floor((uptime / (1000 * 60 * 60)) % 24);
    const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
    
    return `${days} أيام ${hours} ساعات ${minutes} دقائق ${seconds} ثواني`;
}

function generateDashboard() {
    const uptime = getUptime();
    const memory = process.memoryUsage();
    const usedMemory = (memory.heapUsed / 1024 / 1024).toFixed(2);
    const totalMemory = (memory.heapTotal / 1024 / 1024).toFixed(2);
    const now = moment().tz(globalConfig.TIMEZONE || 'Asia/Baghdad');
    
    return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>𝐊𝐈𝐑𝐀 - لوحة التحكم الأسطورية</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Cairo', sans-serif;
        }
        
        body {
            background: #000;
            color: #fff;
            min-height: 100vh;
            background-image: 
                radial-gradient(circle at 20% 30%, #8B0000 0%, transparent 20%),
                radial-gradient(circle at 80% 70%, #4B0082 0%, transparent 20%),
                radial-gradient(circle at 40% 80%, #2E0000 0%, transparent 20%);
            overflow-x: hidden;
        }
        
        .glitch-container {
            position: relative;
            width: 100%;
            min-height: 100vh;
            padding: 20px;
        }
        
        .blood-effect {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><path d="M0,0 L400,400" stroke="%238B0000" stroke-width="2" opacity="0.1"/><path d="M400,0 L0,400" stroke="%234B0082" stroke-width="2" opacity="0.1"/></svg>');
            pointer-events: none;
            z-index: -1;
            animation: bloodFlow 20s linear infinite;
        }
        
        @keyframes bloodFlow {
            0% { transform: translate(0, 0) rotate(0deg); }
            100% { transform: translate(100px, 100px) rotate(360deg); }
        }
        
        .kira-header {
            text-align: center;
            margin: 40px 0;
            position: relative;
        }
        
        .kira-title {
            font-size: 4rem;
            font-weight: 900;
            background: linear-gradient(45deg, #8B0000, #FF0000, #4B0082);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-shadow: 0 0 30px rgba(139, 0, 0, 0.5);
            margin-bottom: 10px;
            animation: glitch 3s infinite;
        }
        
        @keyframes glitch {
            0%, 100% { transform: translate(0); }
            2%, 64% { transform: translate(-2px, 0); }
            4%, 60% { transform: translate(2px, 0); }
            62% { transform: translate(0, 0) skew(5deg); }
        }
        
        .subtitle {
            color: #FF4444;
            font-size: 1.2rem;
            margin-bottom: 30px;
            opacity: 0.8;
        }
        
        .main-image {
            width: 300px;
            height: 300px;
            border-radius: 50%;
            border: 5px solid #8B0000;
            box-shadow: 0 0 50px #FF0000;
            margin: 30px auto;
            overflow: hidden;
            position: relative;
        }
        
        .main-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            filter: sepia(0.5) saturate(2);
            transition: transform 0.3s;
        }
        
        .main-image:hover img {
            transform: scale(1.05);
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin: 40px 0;
        }
        
        .stat-card {
            background: rgba(0, 0, 0, 0.7);
            border: 2px solid #8B0000;
            border-radius: 15px;
            padding: 25px;
            backdrop-filter: blur(10px);
            transition: all 0.3s;
            position: relative;
            overflow: hidden;
        }
        
        .stat-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 5px;
            background: linear-gradient(90deg, #8B0000, #FF0000);
        }
        
        .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(139, 0, 0, 0.3);
            border-color: #FF0000;
        }
        
        .stat-title {
            color: #FF4444;
            font-size: 1.3rem;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .stat-value {
            color: #FFF;
            font-size: 1.8rem;
            font-weight: bold;
            margin: 10px 0;
        }
        
        .stat-desc {
            color: #AAA;
            font-size: 0.9rem;
            line-height: 1.5;
        }
        
        .heartbeat {
            color: #FF0000;
            animation: heartbeat 1.5s infinite;
            display: inline-block;
        }
        
        @keyframes heartbeat {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        
        .blood-pulse {
            position: absolute;
            width: 100px;
            height: 100px;
            border-radius: 50%;
            background: radial-gradient(circle, #8B0000, transparent);
            animation: pulse 2s infinite;
            z-index: -1;
        }
        
        @keyframes pulse {
            0% { transform: scale(0.8); opacity: 0.7; }
            100% { transform: scale(2); opacity: 0; }
        }
        
        .btn-visit {
            display: block;
            width: 300px;
            margin: 40px auto;
            padding: 20px;
            background: linear-gradient(45deg, #8B0000, #4B0082);
            color: white;
            text-decoration: none;
            text-align: center;
            border-radius: 50px;
            font-size: 1.2rem;
            font-weight: bold;
            border: 3px solid #FF0000;
            transition: all 0.3s;
            position: relative;
            overflow: hidden;
            z-index: 1;
        }
        
        .btn-visit::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(45deg, #FF0000, #8B0000);
            transition: all 0.5s;
            z-index: -1;
        }
        
        .btn-visit:hover::before {
            left: 0;
        }
        
        .btn-visit:hover {
            transform: scale(1.05);
            box-shadow: 0 0 30px rgba(255, 0, 0, 0.5);
            border-color: #FFF;
        }
        
        .footer {
            text-align: center;
            margin-top: 60px;
            padding: 30px;
            border-top: 2px solid #8B0000;
            color: #888;
            font-size: 0.9rem;
            position: relative;
        }
        
        .footer::before {
            content: '𝐊𝐈𝐑𝐀';
            position: absolute;
            top: -20px;
            left: 50%;
            transform: translateX(-50%);
            background: #000;
            padding: 0 20px;
            color: #8B0000;
            font-size: 1.5rem;
            font-weight: bold;
        }
        
        .terminal-effect {
            background: rgba(0, 20, 0, 0.9);
            border: 1px solid #008800;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
            font-family: 'Courier New', monospace;
            color: #00FF00;
            position: relative;
            overflow: hidden;
        }
        
        .terminal-effect::before {
            content: 'root@kira:~$';
            position: absolute;
            top: 10px;
            left: 10px;
            color: #00FF00;
            opacity: 0.7;
        }
        
        .glitch-text {
            position: relative;
            display: inline-block;
        }
        
        .glitch-text::before,
        .glitch-text::after {
            content: attr(data-text);
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }
        
        .glitch-text::before {
            left: 2px;
            text-shadow: -2px 0 #FF0000;
            animation: glitch-1 2s infinite linear alternate-reverse;
        }
        
        .glitch-text::after {
            left: -2px;
            text-shadow: -2px 0 #0000FF;
            animation: glitch-2 3s infinite linear alternate-reverse;
        }
        
        @keyframes glitch-1 {
            0% { clip: rect(20px, 9999px, 21px, 0); }
            5% { clip: rect(32px, 9999px, 88px, 0); }
            10% { clip: rect(54px, 9999px, 65px, 0); }
            15% { clip: rect(12px, 9999px, 99px, 0); }
            20% { clip: rect(76px, 9999px, 102px, 0); }
            100% { clip: rect(0, 0, 0, 0); }
        }
        
        @media (max-width: 768px) {
            .kira-title { font-size: 2.5rem; }
            .stats-grid { grid-template-columns: 1fr; }
            .main-image { width: 200px; height: 200px; }
            .btn-visit { width: 90%; }
        }
    </style>
</head>
<body>
    <div class="blood-effect"></div>
    <div class="glitch-container">
        
        <div class="kira-header">
            <h1 class="kira-title" data-text="𝐊𝐈𝐑𝐀">𝐊𝐈𝐑𝐀</h1>
            <p class="subtitle">إله الفوضى المُبرمَج | تجسيد الإرادة في عالم المُستحيل</p>
            
            <div class="main-image">
                <img src="https://files.catbox.moe/fppjdh.jpg" alt="KIRA - الإله الرقمي">
            </div>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="blood-pulse" style="top: -50px; left: -50px;"></div>
                <h3 class="stat-title">📊 حالة النظام</h3>
                <div class="stat-value"><span class="heartbeat">❤️</span> ONLINE</div>
                <p class="stat-desc">النظام يعمل بسلاسة، الدم يتدفق في العروق الرقمية</p>
            </div>
            
            <div class="stat-card">
                <div class="blood-pulse" style="top: -30px; right: -30px;"></div>
                <h3 class="stat-title">⏱️ مدة التشغيل</h3>
                <div class="stat-value">${uptime}</div>
                <p class="stat-desc">منذ أن فتح عينيه في هذا العالم الرقمي</p>
            </div>
            
            <div class="stat-card">
                <div class="blood-pulse" style="bottom: -40px; left: 50%;"></div>
                <h3 class="stat-title">💾 استخدام الذاكرة</h3>
                <div class="stat-value">${usedMemory} MB / ${totalMemory} MB</div>
                <p class="stat-desc">ذاكرة النظام - قوة التفكير</p>
            </div>
            
            <div class="stat-card">
                <h3 class="stat-title">🎮 البادئة</h3>
                <div class="stat-value">${globalConfig.PREFIX || '.'}</div>
                <p class="stat-desc">مفتاح التواصل مع الإله</p>
            </div>
            
            <div class="stat-card">
                <h3 class="stat-title">🤖 اسم البوت</h3>
                <div class="stat-value">${globalConfig.BOTNAME || '𝐤𝐢𝐫𝐚'}</div>
                <p class="stat-desc">الهوية الرقمية</p>
            </div>
            
            <div class="stat-card">
                <h3 class="stat-title">🕒 الوقت الحالي</h3>
                <div class="stat-value">${now.format('HH:mm:ss')}</div>
                <div class="stat-desc">${now.format('DD/MM/YYYY')}</div>
            </div>
        </div>
        
        <div class="terminal-effect">
            <p>> نظام 𝐊𝐈𝐑𝐀 يعمل بنجاح...</p>
            <p>> إصدار Node.js: ${process.version}</p>
            <p>> المنصة: ${process.platform}</p>
            <p>> المعرف: XVK1C</p>
            <p>> الحالة: <span style="color: #00FF00;">جاهز للدماء</span></p>
        </div>
        
        <a href="https://www.facebook.com/xvk1c" class="btn-visit" target="_blank">
            🩸 الدخول إلى عقل الخالق 🩸
        </a>
        
        <div class="footer">
            <p>⚠️ تحذير: هذا ليس مجرد بوت، إنه تجسيد لإرادة إنسان تخلى عن كل شيء ليصبح أسطورة</p>
            <p>✍️ المصمم: <a href="https://www.facebook.com/xvk1c" style="color: #FF0000; text-decoration: none;">XVK1C</a> | الدم: أمل | الجنون: وقود</p>
            <p>🕯️ "لقد تخليت عن إنساني لأصبح قادراً على خلق المستحيل"</p>
        </div>
    </div>
</body>
</html>
    `;
}

// ============================================
// HEALTH SERVER - Koyeb Compatible
// ============================================
function startHealthServer() {
    const app = express();
    const port = CONFIG.PORT;

    // Middleware
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // الصفحة الرئيسية الأسطورية
    app.get('/', (req, res) => {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(generateDashboard());
    });

    // health endpoint (مطلوب لـ Koyeb)
    app.get('/health', (req, res) => {
        res.json({ 
            status: 'healthy',
            bot: globalConfig.BOTNAME || 'Kira Bot',
            node: process.version,
            platform: process.platform,
            uptime: getUptime(),
            timestamp: new Date().toISOString()
        });
    });

    // info endpoint
    app.get('/info', (req, res) => {
        res.json({
            name: globalConfig.BOTNAME || 'Kira Bot',
            version: globalConfig.version || '1.2.14',
            prefix: globalConfig.PREFIX || '.',
            language: globalConfig.language || 'ar',
            adminCount: globalConfig.ADMINBOT?.length || 0,
            timezone: globalConfig.TIMEZONE || 'Asia/Baghdad',
            serverTime: moment().tz(globalConfig.TIMEZONE || 'Asia/Baghdad').format()
        });
    });

    // حالة النظام
    app.get('/status', (req, res) => {
        const memory = process.memoryUsage();
        res.json({
            status: 'operational',
            uptime: process.uptime(),
            memory: {
                heapUsed: `${(memory.heapUsed / 1024 / 1024).toFixed(2)} MB`,
                heapTotal: `${(memory.heapTotal / 1024 / 1024).toFixed(2)} MB`,
                external: `${(memory.external / 1024 / 1024).toFixed(2)} MB`
            },
            cpu: process.cpuUsage(),
            pid: process.pid,
            platform: process.platform,
            arch: process.arch
        });
    });

    server = app.listen(port, () => {
        console.log(chalk.green(`\n✅ Health server running on port ${port}`));
        console.log(chalk.cyan(`🌐 Dashboard: http://localhost:${port}`));
        console.log(chalk.cyan(`📊 Health: http://localhost:${port}/health`));
        console.log(chalk.cyan(`ℹ️  Info: http://localhost:${port}/info\n`));
    });

    return server;
}

// ============================================
// BOT INITIALIZATION
// ============================================
async function startBot() {
    console.log(chalk.bold.cyan('\n🚀 بدء تشغيل 𝐊𝐈𝐑𝐀...'));
    console.log(chalk.blue(`📁 المجلد: ${__dirname}`));
    console.log(chalk.blue(`⚡ Node.js: ${process.version}`));
    console.log(chalk.blue(`💻 النظام: ${process.platform} ${process.arch}`));
    console.log(chalk.blue(`🌍 الوقت: ${moment().tz('Asia/Baghdad').format('HH:mm:ss')}\n`));

    // 1. تحميل الإعدادات
    if (!await loadConfig()) {
        console.log(chalk.red('❌ فشل تحميل الإعدادات، استخدم الإعدادات الافتراضية'));
    }

    // 2. تشغيل سيرفر الصحة
    const healthServer = startHealthServer();

    // 3. محاولة تحميل البوت إذا كان appstate موجوداً
    const appStatePath = path.join(__dirname, 'appstate.json');
    try {
        const appState = require(appStatePath);
        if (appState && appState.length > 0) {
            console.log(chalk.green('✅ appstate.json موجود، جاري تحميل البوت...'));
            console.log(chalk.yellow(`🎮 Prefix: ${globalConfig.PREFIX || '.'}`));
            console.log(chalk.yellow(`🤖 Name: ${globalConfig.BOTNAME || 'Kira'}`));
            console.log(chalk.cyan('\n🎯 البوت جاهز للعمل!\n'));
        } else {
            console.log(chalk.yellow('⚠️  appstate.json فارغ، يلزم تسجيل الدخول'));
            console.log(chalk.cyan('👉 استخدم: npm run login\n'));
        }
    } catch (error) {
        console.log(chalk.yellow('⚠️  لا يمكن تحميل appstate.json'));
        console.log(chalk.cyan('👉 تأكد من تسجيل الدخول أولاً\n'));
    }

    // 4. إدارة إشارات الإغلاق
    process.on('SIGINT', () => shutdown(healthServer));
    process.on('SIGTERM', () => shutdown(healthServer));

    // 5. إبقاء البوت نشطاً
    setInterval(() => {
        const time = moment().tz(globalConfig.TIMEZONE || 'Asia/Baghdad').format('HH:mm:ss');
        const memory = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        console.log(chalk.gray(`[${time}] 💓 نبضة حياة | ذاكرة: ${memory} MB`));
    }, 30000);

    console.log(chalk.bold.green('='.repeat(60)));
    console.log(chalk.bold.green('𝐊𝐈𝐑𝐀 𝐁𝐎𝐓 𝐒𝐓𝐀𝐑𝐓𝐄𝐃 𝐒𝐔𝐂𝐂𝐄𝐒𝐒𝐅𝐔𝐋𝐋𝐘'));
    console.log(chalk.bold.green('='.repeat(60)));
}

// ============================================
// SHUTDOWN FUNCTION
// ============================================
async function shutdown(healthServer) {
    console.log(chalk.yellow('\n⚠️  إغلاق 𝐊𝐈𝐑𝐀...'));
    try {
        if (healthServer) {
            healthServer.close(() => {
                console.log(chalk.red('👋 تم إغلاق السيرفر'));
            });
        }
        console.log(chalk.red('💀 تم إيقاف البوت'));
        process.exit(0);
    } catch (error) {
        console.error(chalk.red('❌ خطأ أثناء الإغلاق:'), error);
        process.exit(1);
    }
}

// ============================================
// ERROR HANDLERS
// ============================================
process.on('uncaughtException', (error) => {
    console.error(chalk.red('🔥 خطأ غير متوقع:'), error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error(chalk.red('🔥 وعد مرفوض:'), reason);
});

// ============================================
// START THE BOT
// ============================================
if (require.main === module) {
    startBot().catch(error => {
        console.error(chalk.red('❌ فشل تشغيل البوت:'), error);
        process.exit(1);
    });
}
