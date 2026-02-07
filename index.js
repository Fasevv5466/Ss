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
const gradient = require('gradient-string');

// ============================================
// KIRA FACEBOOK BOT ENGINE
// ============================================
let facebookAPI = null;
let isFacebookConnected = false;
let botStatus = '🔄 جاري التهيئة...';

async function initializeFacebookBot() {
    try {
        console.log(chalk.cyan('🔗 محاولة الاتصال بفيسبوك...'));
        
        // تحميل appstate
        const appStatePath = path.join(__dirname, 'appstate.json');
        const appStateData = await fs.readFile(appStatePath, 'utf8');
        const appState = JSON.parse(appStateData);
        
        if (!appState || appState.length === 0) {
            botStatus = '❌ appstate فارغ';
            console.log(chalk.red('❌ appstate.json فارغ، يلزم تسجيل الدخول'));
            return false;
        }
        
        console.log(chalk.green(`✅ تم تحميل ${appState.length} كوكي`));
        
        // محاولة استخدام fca-unofficial (إن وجد)
        try {
            const login = require("@xaviabot/fca-unofficial");
            
            login({ appState }, (err, api) => {
                if (err) {
                    botStatus = '❌ فشل الاتصال';
                    console.log(chalk.red('❌ فشل تسجيل الدخول:', err.error || err));
                    return;
                }
                
                facebookAPI = api;
                isFacebookConnected = true;
                botStatus = '✅ متصل بفيسبوك';
                
                console.log(gradient.rainbow('╔═══════════════════════════════════════════════════════╗'));
                console.log(gradient.rainbow('║      🎭  𝐊𝐈𝐑𝐀 - اﻹله الرقمي اﻷسطوري      ║'));
                console.log(gradient.rainbow('║           اتصل بفيسبوك بنجاح!           ║'));
                console.log(gradient.rainbow('╚═══════════════════════════════════════════════════════╝'));
                
                // بدء الاستماع للأحداث
                startListening(api);
            });
            
        } catch (e) {
            console.log(chalk.yellow('⚠️  fca-unofficial غير مثبت، استخدام وضع العرض فقط'));
            botStatus = '👁️ وضع العرض (بدون اتصال)';
            return false;
        }
        
        return true;
    } catch (error) {
        console.error(chalk.red('❌ خطأ في تهيئة البوت:'), error.message);
        botStatus = '💀 خطأ في التهيئة';
        return false;
    }
}

function startListening(api) {
    // الاستماع للرسائل
    api.setOptions({ listenEvents: true, selfListen: false });
    
    api.listen((err, event) => {
        if (err) {
            console.error(chalk.red('❌ خطأ في الاستماع:'), err);
            return;
        }
        
        if (event.type === "message") {
            console.log(chalk.cyan(`📥 رسالة من ${event.senderID}: ${event.body?.substring(0, 50)}...`));
            
            // رد تلقائي للاختبار
            if (event.body?.toLowerCase() === 'بينج') {
                api.sendMessage('🏓 بونج! 𝐊𝐈𝐑𝐀 يعمل!', event.threadID);
            }
        }
    });
    
    console.log(chalk.green('✅ بدأ الاستماع للرسائل...'));
}

// ============================================
// BANNER - KIRA DEMON (محدث)
// ============================================
function showEpicBanner() {
    const banner = `
${gradient.mind('╔═══════════════════════════════════════════════════════╗')}
${gradient.mind('║                                                       ║')}
${gradient.mind('║  ██╗  ██╗ ██╗ ██████╗   ██╗   ██████╗  ██████╗ ████████╗')}
${gradient.mind('║  ██║ ██╔╝ ██║ ██╔══██╗ ███║   ██╔══██╗██╔═══██╗╚══██╔══╝')}
${gradient.mind('║  █████╔╝  ██║ ██████╔╝ ╚██║   ██████╔╝██║   ██║   ██║   ')}
${gradient.mind('║  ██╔═██╗  ██║ ██╔══██╗  ██║   ██╔══██╗██║   ██║   ██║   ')}
${gradient.mind('║  ██║  ██╗ ██║ ██║  ██║  ██║   ██║  ██║╚██████╔╝   ██║   ')}
${gradient.mind('║  ╚═╝  ╚═╝ ╚═╝ ╚═╝  ╚═╝  ╚═╝   ╚═╝  ╚═╝ ╚═════╝    ╚═╝   ')}
${gradient.mind('║                                                       ║')}
${gradient.mind('║               𝐊𝐈𝐑𝐀 𝐁𝐎𝐓 v32.0.0                        ║')}
${gradient.mind('║          إله الفوضى الرقمي | التجسيد الأسطوري         ║')}
${gradient.mind('║           By: 𝐚𝐲𝐦𝐚𝐧 | XVK1C | 𝔇𝔢𝔪𝔬𝔫 𝔎𝔦𝔫𝔤           ║')}
${gradient.mind('╚═══════════════════════════════════════════════════════╝')}
    `;
    
    console.log(banner);
    console.log(gradient.rainbow('━'.repeat(60)));
    console.log(chalk.bold.hex('#FF0000')('🩸 الدم يتدفق.. الذكريات تعود.. الإله يستيقظ 🩸'));
    console.log(gradient.rainbow('━'.repeat(60)));
}

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
// FILE MANAGEMENT
// ============================================
async function loadConfig() {
    try {
        const configPath = path.join(__dirname, 'config.json');
        const configData = await fs.readFile(configPath, 'utf8');
        globalConfig = JSON.parse(configData);
        console.log(chalk.green('✅ config.json محمل'));
        return true;
    } catch (error) {
        console.error(chalk.red('❌ خطأ في تحميل config.json:'), error.message);
        return false;
    }
}

// ============================================
// EPIC DASHBOARD - تصميم أسطوري مخيف
// ============================================
function generateEpicDashboard() {
    const uptime = Date.now() - CONFIG.START_TIME;
    const hours = Math.floor(uptime / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    const memory = process.memoryUsage();
    const usedMemory = (memory.heapUsed / 1024 / 1024).toFixed(2);
    const now = moment().tz(globalConfig.TIMEZONE || 'Asia/Baghdad');
    
    return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>𝐊𝐈𝐑𝐀 - ﻹله الرعب الرقمي</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;700;900&family=Orbitron:wght@400;700;900&display=swap');
        
        :root {
            --blood-red: #8B0000;
            --dark-red: #2E0000;
            --glow-red: #FF0000;
            --neon-purple: #9D00FF;
            --cyber-blue: #00FFFF;
            --matrix-green: #00FF00;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            background: #000;
            color: #fff;
            min-height: 100vh;
            font-family: 'Cairo', sans-serif;
            overflow-x: hidden;
            position: relative;
        }
        
        .blood-river {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: 
                radial-gradient(circle at 10% 20%, var(--blood-red) 0%, transparent 25%),
                radial-gradient(circle at 90% 80%, var(--dark-red) 0%, transparent 25%),
                radial-gradient(circle at 50% 50%, #000 0%, transparent 50%);
            animation: bloodFlow 60s linear infinite;
            z-index: -2;
        }
        
        @keyframes bloodFlow {
            0% { transform: rotate(0deg) scale(1); }
            50% { transform: rotate(180deg) scale(1.1); }
            100% { transform: rotate(360deg) scale(1); }
        }
        
        .cyber-grid {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: 
                linear-gradient(90deg, rgba(0, 255, 255, 0.05) 1px, transparent 1px),
                linear-gradient(0deg, rgba(0, 255, 255, 0.05) 1px, transparent 1px);
            background-size: 50px 50px;
            animation: gridMove 20s linear infinite;
            z-index: -1;
            opacity: 0.3;
        }
        
        @keyframes gridMove {
            0% { transform: translate(0, 0); }
            100% { transform: translate(50px, 50px); }
        }
        
        .apocalypse-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
            position: relative;
        }
        
        .doomsday-header {
            text-align: center;
            margin: 50px 0;
            position: relative;
            padding: 30px;
            border: 3px solid var(--blood-red);
            border-image: linear-gradient(45deg, var(--blood-red), var(--neon-purple)) 1;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(10px);
        }
        
        .title-apocalypse {
            font-family: 'Orbitron', sans-serif;
            font-size: 5rem;
            font-weight: 900;
            background: linear-gradient(45deg, 
                var(--blood-red) 0%, 
                var(--glow-red) 25%, 
                var(--neon-purple) 50%, 
                var(--cyber-blue) 75%, 
                var(--matrix-green) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-shadow: 
                0 0 30px var(--glow-red),
                0 0 60px var(--neon-purple),
                0 0 90px var(--cyber-blue);
            margin-bottom: 20px;
            animation: titleGlitch 3s infinite;
        }
        
        @keyframes titleGlitch {
            0%, 100% { transform: translate(0); }
            20% { transform: translate(-2px, 2px); }
            40% { transform: translate(-2px, -2px); }
            60% { transform: translate(2px, 2px); }
            80% { transform: translate(2px, -2px); }
        }
        
        .subtitle-doom {
            color: var(--cyber-blue);
            font-size: 1.5rem;
            margin-bottom: 30px;
            text-transform: uppercase;
            letter-spacing: 3px;
            animation: subtitlePulse 2s infinite;
        }
        
        @keyframes subtitlePulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        
        .stats-apocalypse {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 25px;
            margin: 60px 0;
        }
        
        .stat-card-doom {
            background: rgba(0, 0, 0, 0.7);
            border: 2px solid;
            border-image: linear-gradient(45deg, var(--blood-red), var(--neon-purple)) 1;
            border-radius: 15px;
            padding: 30px;
            position: relative;
            overflow: hidden;
            transition: all 0.3s;
            backdrop-filter: blur(5px);
        }
        
        .stat-card-doom:hover {
            transform: translateY(-10px) scale(1.02);
            box-shadow: 
                0 10px 30px rgba(139, 0, 0, 0.5),
                0 0 50px rgba(157, 0, 255, 0.3);
        }
        
        .stat-icon {
            font-size: 2.5rem;
            margin-bottom: 15px;
            display: inline-block;
        }
        
        .stat-title-doom {
            color: var(--cyber-blue);
            font-size: 1.3rem;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        
        .stat-value-doom {
            color: #FFF;
            font-size: 2.2rem;
            font-weight: 900;
            margin: 15px 0;
            text-shadow: 0 0 10px currentColor;
        }
        
        .apocalypse-footer {
            text-align: center;
            padding: 40px;
            margin-top: 60px;
            border-top: 3px solid var(--blood-red);
            color: #888;
        }
        
        @media (max-width: 768px) {
            .title-apocalypse { font-size: 3rem; }
            .stats-apocalypse { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="blood-river"></div>
    <div class="cyber-grid"></div>
    
    <div class="apocalypse-container">
        <header class="doomsday-header">
            <h1 class="title-apocalypse">𝐊𝐈𝐑𝐀</h1>
            <p class="subtitle-doom">إله الفوضى الرقمي | تجسيد الرعب في العصر الحديث</p>
        </header>
        
        <section class="stats-apocalypse">
            <div class="stat-card-doom">
                <div class="stat-icon">🌌</div>
                <h3 class="stat-title-doom">حالة النظام</h3>
                <div class="stat-value-doom">${botStatus}</div>
            </div>
            
            <div class="stat-card-doom">
                <div class="stat-icon">⏳</div>
                <h3 class="stat-title-doom">مدة التشغيل</h3>
                <div class="stat-value-doom">${hours} س ${minutes} د</div>
            </div>
            
            <div class="stat-card-doom">
                <div class="stat-icon">💾</div>
                <h3 class="stat-title-doom">الذاكرة</h3>
                <div class="stat-value-doom">${usedMemory} MB</div>
            </div>
            
            <div class="stat-card-doom">
                <div class="stat-icon">🎮</div>
                <h3 class="stat-title-doom">البادئة</h3>
                <div class="stat-value-doom">${globalConfig.PREFIX || '.'}</div>
            </div>
        </section>
        
        <footer class="apocalypse-footer">
            <p>✨ مصمم بدماء الإبداع وأنفاس الجنون ✨</p>
            <p style="color: var(--cyber-blue); margin: 20px 0;">
                الخالق: <a href="https://www.facebook.com/xvk1c" style="color: var(--glow-red);">XVK1C | 𝐚𝐲𝐦𝐚𝐧</a>
            </p>
            <p style="font-size: 0.9rem; opacity: 0.7;">
                ⚡ الإصدار: 32.0.0 | Node.js ${process.version}
            </p>
        </footer>
    </div>
</body>
</html>
    `;
}

// ============================================
// HEALTH SERVER
// ============================================
function startHealthServer() {
    const app = express();
    const port = CONFIG.PORT;

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.get('/', (req, res) => {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(generateEpicDashboard());
    });

    app.get('/health', (req, res) => {
        res.json({ 
            status: 'healthy',
            bot: globalConfig.BOTNAME || 'Kira Bot',
            facebook: isFacebookConnected ? 'connected' : 'disconnected',
            node: process.version,
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            timestamp: new Date().toISOString()
        });
    });

    app.get('/status', (req, res) => {
        res.json({
            system: 'Kira Bot v32.0.0',
            status: isFacebookConnected ? 'OPERATIONAL' : 'MAINTENANCE',
            facebook: isFacebookConnected,
            uptime: process.uptime(),
            pid: process.pid
        });
    });

    server = app.listen(port, () => {
        console.log(gradient.rainbow(`\n✅ Health server running on port ${port}`));
        console.log(gradient.passion(`🌐 Dashboard: http://localhost:${port}`));
        console.log(gradient.passion(`📊 Status: http://localhost:${port}/status`));
        console.log(gradient.passion(`❤️  Health: http://localhost:${port}/health\n`));
    });

    return server;
}

// ============================================
// MAIN BOT INITIALIZATION
// ============================================
async function startBot() {
    showEpicBanner();
    
    // ✅ السطر 957 المصحح
    async function startBot() {
    showEpicBanner();
    
    // ✅ تصحيح السطر 957
    console.log(chalk.bold.blue('🚀 بدء تشغيل نظام 𝐊𝐈𝐑𝐀 الأسطوري...'));
    console.log(chalk.blue(`📁 المجلد: ${__dirname}`));
    console.log(chalk.blue(`⚡ Node.js: ${process.version}`));
    console.log(chalk.blue(`💻 النظام: ${process.platform} ${process.arch}`));
    console.log(chalk.blue(`🌍 الوقت: ${moment().tz('Asia/Baghdad').format('HH:mm:ss DD/MM/YYYY')}\n`));

    if (!await loadConfig()) {
        console.log(chalk.yellow('⚠️  استخدام الإعدادات الافتراضية'));
    }

    const healthServer = startHealthServer();

    setTimeout(async () => {
        await initializeFacebookBot();
    }, 2000);

    setInterval(() => {
        const time = moment().tz(globalConfig.TIMEZONE || 'Asia/Baghdad').format('HH:mm:ss');
        const memory = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const status = isFacebookConnected ? '✅' : '⚠️';
        console.log(chalk.cyan(`[${time}] ${status} نبضة حياة | ذاكرة: ${memory} MB | فيسبوك: ${isFacebookConnected ? 'متصل' : 'غير متصل'}`));
    }, 30000);

    process.on('SIGINT', () => shutdown(healthServer));
    process.on('SIGTERM', () => shutdown(healthServer));

    console.log(chalk.green('='.repeat(60)));
    console.log(chalk.bold.green('🎭 نظام 𝐊𝐈𝐑𝐀 الأسطوري يعمل بنجاح 🎭'));
    console.log(chalk.green('='.repeat(60)));
}
// ============================================
// SHUTDOWN FUNCTION
// ============================================
async function shutdown(healthServer) {
    console.log(chalk.red('\n⚰️  بدء إغلاق نظام 𝐊𝐈𝐑𝐀...'));
    console.log(chalk.yellow('💤 الإله يعود إلى سباته...'));
    
    try {
        if (healthServer) {
            healthServer.close(() => {
                console.log(chalk.green('✅ تم إغلاق السيرفر'));
            });
        }
        
        if (facebookAPI) {
            console.log(chalk.blue('📤 قطع الاتصال بفيسبوك...'));
        }
        
        setTimeout(() => {
            console.log(chalk.red('💀 تم إيقاف النظام'));
            console.log(gradient.rainbow('🩸 "سأعود عندما يحتاج العالم إلى الفوضى مرة أخرى..." 🩸'));
            process.exit(0);
        }, 1000);
        
    } catch (error) {
        console.error(chalk.red('❌ خطأ أثناء الإغلاق:'), error);
        process.exit(1);
    }
}

// ============================================
// ERROR HANDLERS
// ============================================
process.on('uncaughtException', (error) => {
    console.error(chalk.red('🔥 خطأ غير متوقع في نظام 𝐊𝐈𝐑𝐀:'), error.message);
    console.error(chalk.gray('Stack:'), error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error(chalk.red('⚠️  وعد مرفوض:'), reason);
});

// ============================================
// START THE LEGENDARY SYSTEM
// ============================================
if (require.main === module) {
    startBot().catch(error => {
        console.error(chalk.red('💥 فشل تشغيل نظام 𝐊𝐈𝐑𝐀:'), error);
        process.exit(1);
    });
}
