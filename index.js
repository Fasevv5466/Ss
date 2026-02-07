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
const { exec } = require('child_process');
const os = require('os');

// ============================================
// NODE.JS 24.11.0 BANNER
// ============================================
console.log(chalk.hex('#FF0000')(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║  ██╗  ██╗ ██╗ ██████╗   ██╗    ███████╗ ██████╗ ██╗   ██╗    ║
║  ██║ ██╔╝ ██║ ██╔══██╗ ███║    ██╔════╝██╔═══██╗██║   ██║    ║
║  █████╔╝  ██║ ██████╔╝ ╚██║    ███████╗██║   ██║██║   ██║    ║
║  ██╔═██╗  ██║ ██╔══██╗  ██║    ╚════██║██║   ██║██║   ██║    ║
║  ██║  ██╗ ██║ ██║  ██║  ██║    ███████║╚██████╔╝╚██████╔╝    ║
║  ╚═╝  ╚═╝ ╚═╝ ╚═╝  ╚═╝  ╚═╝    ╚══════╝ ╚═════╝  ╚═════╝     ║
║                                                              ║
║              𝐊𝐈𝐑𝐀 𝐒𝐔𝐏𝐑𝐄𝐌𝐄 v24.11.0                          ║
║          Powered by Node.js ${process.version}                ║
║           Built for Speed & Power                            ║
║           By: 𝐚𝐲𝐦𝐚𝐧 | XVK1C                                ║
╚══════════════════════════════════════════════════════════════╝
`));

console.log(chalk.hex('#8B0000')('━'.repeat(70)));
console.log(chalk.bold.hex('#FF0000')(`🔥 دم الإبداع يسري في عروق الكود | Node.js 24.11.0 🔥`));
console.log(chalk.hex('#8B0000')('━'.repeat(70)));

// ============================================
// SYSTEM INFO
// ============================================
console.log(chalk.cyan(`📊 معلومات النظام:`));
console.log(chalk.cyan(`├── Node.js: ${process.version}`));
console.log(chalk.cyan(`├── V8: ${process.versions.v8}`));
console.log(chalk.cyan(`├── نظام التشغيل: ${os.platform()} ${os.arch()}`));
console.log(chalk.cyan(`├── الذاكرة: ${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB`));
console.log(chalk.cyan(`├── المعالج: ${os.cpus().length} نواة`));
console.log(chalk.cyan(`└── المجلد: ${__dirname}`));

// ============================================
// GLOBAL VARIABLES
// ============================================
const CONFIG = {
    PORT: process.env.PORT || 8000,
    START_TIME: Date.now(),
    NODE_VERSION: process.version,
    PLATFORM: `${os.platform()}-${os.arch()}`
};

let globalConfig = {};
let server = null;

// ============================================
// VERSION CHECK - Node.js 24.11.0
// ============================================
function checkNodeVersion() {
    const current = process.version.replace('v', '');
    const required = '20.11.0';
    
    const currentParts = current.split('.').map(Number);
    const requiredParts = required.split('.').map(Number);
    
    if (currentParts[0] < requiredParts[0] || 
        (currentParts[0] === requiredParts[0] && currentParts[1] < requiredParts[1])) {
        console.error(chalk.red(`❌ خطأ: Node.js ${required}+ مطلوب`));
        console.error(chalk.red(`📌 لديك: Node.js ${current}`));
        console.error(chalk.red(`💡 قم بالترقية ثم حاول مرة أخرى`));
        process.exit(1);
    }
    
    console.log(chalk.green(`✅ Node.js ${current} متوافق مع KIRA Supreme`));
}

// ============================================
// FILE MANAGEMENT
// ============================================
async function ensureFile(filePath, defaultContent) {
    try {
        await fs.access(filePath);
        const stats = await fs.stat(filePath);
        console.log(chalk.green(`✅ ${path.basename(filePath)} موجود (${stats.size} bytes)`));
        
        if (path.extname(filePath) === '.json') {
            const content = await fs.readFile(filePath, 'utf8');
            return JSON.parse(content);
        }
        return require(filePath);
    } catch (error) {
        console.log(chalk.yellow(`📝 إنشاء ${path.basename(filePath)}...`));
        
        let content = defaultContent;
        if (typeof defaultContent === 'object') {
            content = JSON.stringify(defaultContent, null, 2);
        }
        
        await fs.writeFile(filePath, content, 'utf8');
        console.log(chalk.green(`✅ تم إنشاء ${path.basename(filePath)}`));
        
        if (path.extname(filePath) === '.json') {
            return JSON.parse(content);
        }
        return defaultContent;
    }
}

async function loadConfig() {
    try {
        const defaultConfig = {
            "language": "ar",
            "DeveloperMode": false,
            "autoCreateDB": true,
            "notiGroup": false,
            "NOTIFICATION": true,
            "allowInbox": true,
            "commandDisabled": [],
            "eventDisabled": [],
            "BOTNAME": "𝐊𝐈𝐑𝐀 𝐒𝐔𝐏𝐑𝐄𝐌𝐄",
            "BOT_NAME": "KIRA Supreme",
            "ADMIN_NAME": "𝐚𝐲𝐦𝐚𝐧",
            "FACEBOOK_ADMIN": "https://facebook.com/profile.php?id=61577861540407",
            "PREFIX": ".",
            "ADMINBOT": ["61577861540407"],
            "MODERATOR": ["61577861540407"],
            "AUTO_READ": true,
            "AUTO_RECONNECT": true,
            "MAX_ATTACHMENT": 50,
            "TIMEZONE": "Asia/Baghdad",
            "DATABASE": {
                "sqlite": {
                    "storage": "data.sqlite"
                }
            },
            "APPSTATEPATH": "appstate.json",
            "FCAOption": {
                "forceLogin": true,
                "listenEvents": true,
                "pauseLog": true,
                "logLevel": "error",
                "selfListen": false,
                "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            },
            "version": "24.11.0",
            "node_version": process.version,
            "start_time": new Date().toISOString()
        };

        globalConfig = await ensureFile(
            path.join(__dirname, 'config.json'), 
            defaultConfig
        );
        
        // تحديث الإصدار في config
        globalConfig.version = "24.11.0";
        globalConfig.node_version = process.version;
        
        console.log(chalk.cyan(`🎮 البادئة: ${globalConfig.PREFIX}`));
        console.log(chalk.cyan(`🤖 اسم البوت: ${globalConfig.BOTNAME}`));
        console.log(chalk.cyan(`👑 المطور: ${globalConfig.ADMIN_NAME}`));
        
        return true;
    } catch (error) {
        console.error(chalk.red('❌ خطأ في تحميل الإعدادات:'), error.message);
        return false;
    }
}

// ============================================
// SYSTEM UTILITIES
// ============================================
function getUptime() {
    const uptime = Date.now() - CONFIG.START_TIME;
    const seconds = Math.floor((uptime / 1000) % 60);
    const minutes = Math.floor((uptime / (1000 * 60)) % 60);
    const hours = Math.floor((uptime / (1000 * 60 * 60)) % 24);
    const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
    
    return `${days} أيام ${hours} ساعات ${minutes} دقائق ${seconds} ثواني`;
}

function getSystemStats() {
    const memory = process.memoryUsage();
    const usedMemory = (memory.heapUsed / 1024 / 1024).toFixed(2);
    const totalMemory = (memory.heapTotal / 1024 / 1024).toFixed(2);
    const rssMemory = (memory.rss / 1024 / 1024).toFixed(2);
    
    return {
        memory: {
            heapUsed: usedMemory,
            heapTotal: totalMemory,
            rss: rssMemory,
            usage: `${usedMemory}MB / ${totalMemory}MB`
        },
        cpu: os.cpus().length,
        uptime: getUptime(),
        platform: CONFIG.PLATFORM,
        nodeVersion: CONFIG.NODE_VERSION,
        timestamp: new Date().toISOString()
    };
}

// ============================================
// KIRA DASHBOARD
// ============================================
function generateDashboard() {
    const stats = getSystemStats();
    const now = moment().tz(globalConfig.TIMEZONE || 'Asia/Baghdad');
    
    return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>𝐊𝐈𝐑𝐀 𝐒𝐔𝐏𝐑𝐄𝐌𝐄 v24.11.0</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;900&display=swap');
        
        :root {
            --blood-red: #8B0000;
            --dark-red: #5A0000;
            --light-red: #FF0000;
            --neon-red: #FF4444;
            --black: #000000;
            --gray: #1A1A1A;
            --white: #FFFFFF;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Cairo', sans-serif;
        }
        
        body {
            background: var(--black);
            color: var(--white);
            min-height: 100vh;
            overflow-x: hidden;
            position: relative;
        }
        
        .blood-background {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: 
                radial-gradient(circle at 20% 30%, var(--blood-red) 0%, transparent 20%),
                radial-gradient(circle at 80% 70%, var(--dark-red) 0%, transparent 20%),
                radial-gradient(circle at 40% 80%, #2E0000 0%, transparent 20%);
            z-index: -2;
            animation: bloodPulse 20s infinite alternate;
        }
        
        @keyframes bloodPulse {
            0% { opacity: 0.3; }
            100% { opacity: 0.7; }
        }
        
        .glitch-lines {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                rgba(139, 0, 0, 0.1) 2px,
                rgba(139, 0, 0, 0.1) 4px
            );
            z-index: -1;
            animation: scanlines 10s linear infinite;
        }
        
        @keyframes scanlines {
            0% { transform: translateY(0); }
            100% { transform: translateY(100px); }
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 30px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 50px;
            position: relative;
            padding: 40px 0;
        }
        
        .header::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 300px;
            height: 3px;
            background: linear-gradient(90deg, transparent, var(--light-red), transparent);
        }
        
        .kira-title {
            font-size: 5rem;
            font-weight: 900;
            background: linear-gradient(45deg, var(--blood-red), var(--light-red), var(--neon-red));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-shadow: 
                0 0 20px rgba(255, 0, 0, 0.5),
                0 0 40px rgba(255, 0, 0, 0.3),
                0 0 60px rgba(255, 0, 0, 0.1);
            margin-bottom: 10px;
            animation: glitch 3s infinite;
            position: relative;
        }
        
        .kira-title::before,
        .kira-title::after {
            content: '𝐊𝐈𝐑𝐀 𝐒𝐔𝐏𝐑𝐄𝐌𝐄';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }
        
        .kira-title::before {
            color: var(--neon-red);
            animation: glitch-top 1s infinite;
            clip-path: polygon(0 0, 100% 0, 100% 33%, 0 33%);
        }
        
        .kira-title::after {
            color: #00FFFF;
            animation: glitch-bottom 1.5s infinite;
            clip-path: polygon(0 67%, 100% 67%, 100% 100%, 0 100%);
        }
        
        @keyframes glitch-top {
            0%, 100% { transform: translate(0); }
            20% { transform: translate(-3px, 3px); }
            40% { transform: translate(-3px, -3px); }
            60% { transform: translate(3px, 3px); }
            80% { transform: translate(3px, -3px); }
        }
        
        @keyframes glitch-bottom {
            0%, 100% { transform: translate(0); }
            10% { transform: translate(-3px, 3px); }
            30% { transform: translate(-3px, -3px); }
            50% { transform: translate(3px, 3px); }
            70% { transform: translate(3px, -3px); }
            90% { transform: translate(-3px, 3px); }
        }
        
        .subtitle {
            color: var(--neon-red);
            font-size: 1.5rem;
            margin-bottom: 30px;
            opacity: 0.9;
            text-shadow: 0 0 10px rgba(255, 68, 68, 0.5);
        }
        
        .version-badge {
            display: inline-block;
            background: linear-gradient(45deg, var(--dark-red), var(--blood-red));
            color: white;
            padding: 10px 25px;
            border-radius: 50px;
            font-weight: bold;
            border: 2px solid var(--light-red);
            box-shadow: 0 0 20px rgba(255, 0, 0, 0.5);
            margin: 20px 0;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(255, 0, 0, 0.5); }
            50% { transform: scale(1.05); box-shadow: 0 0 30px rgba(255, 0, 0, 0.8); }
        }
        
        .main-image {
            width: 400px;
            height: 400px;
            margin: 40px auto;
            position: relative;
            border-radius: 20px;
            overflow: hidden;
            border: 5px solid var(--blood-red);
            box-shadow: 
                0 0 50px var(--blood-red),
                inset 0 0 50px rgba(0, 0, 0, 0.5);
        }
        
        .main-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            filter: sepia(0.5) saturate(2) contrast(1.2);
            transition: all 0.5s;
        }
        
        .main-image:hover img {
            transform: scale(1.1);
            filter: sepia(0) saturate(3) contrast(1.5);
        }
        
        .main-image::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(45deg, transparent, rgba(139, 0, 0, 0.3), transparent);
            z-index: 1;
            animation: shine 3s infinite;
        }
        
        @keyframes shine {
            0%, 100% { transform: translateX(-100%); }
            50% { transform: translateX(100%); }
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 30px;
            margin: 50px 0;
        }
        
        .stat-card {
            background: rgba(26, 26, 26, 0.9);
            border: 2px solid var(--blood-red);
            border-radius: 15px;
            padding: 30px;
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
            z-index: 1;
        }
        
        .stat-card:hover {
            transform: translateY(-10px);
            border-color: var(--light-red);
            box-shadow: 
                0 10px 30px rgba(139, 0, 0, 0.3),
                0 0 50px rgba(255, 0, 0, 0.1);
        }
        
        .stat-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 5px;
            background: linear-gradient(90deg, var(--blood-red), var(--light-red), var(--blood-red));
        }
        
        .stat-card::after {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 0, 0, 0.1), transparent);
            transition: left 0.5s;
            z-index: -1;
        }
        
        .stat-card:hover::after {
            left: 100%;
        }
        
        .stat-icon {
            font-size: 2.5rem;
            margin-bottom: 20px;
            display: inline-block;
            animation: float 3s ease-in-out infinite;
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
        
        .stat-title {
            color: var(--neon-red);
            font-size: 1.4rem;
            margin-bottom: 15px;
            font-weight: 600;
        }
        
        .stat-value {
            color: white;
            font-size: 2rem;
            font-weight: bold;
            margin: 15px 0;
            text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
        }
        
        .stat-desc {
            color: #AAA;
            font-size: 1rem;
            line-height: 1.6;
        }
        
        .terminal {
            background: rgba(0, 20, 0, 0.9);
            border: 2px solid #008800;
            border-radius: 10px;
            padding: 30px;
            margin: 40px 0;
            font-family: 'Courier New', monospace;
            color: #00FF00;
            position: relative;
            overflow: hidden;
            box-shadow: 0 0 30px rgba(0, 255, 0, 0.2);
        }
        
        .terminal::before {
            content: 'root@kira-supreme:~$';
            position: absolute;
            top: 15px;
            left: 15px;
            color: #00FF00;
            opacity: 0.7;
            font-weight: bold;
        }
        
        .terminal-content {
            margin-top: 40px;
            line-height: 1.8;
        }
        
        .terminal-line {
            margin-bottom: 10px;
            animation: typing 3s steps(40) infinite alternate;
        }
        
        @keyframes typing {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        .action-buttons {
            display: flex;
            justify-content: center;
            gap: 30px;
            margin: 50px 0;
            flex-wrap: wrap;
        }
        
        .action-btn {
            display: inline-flex;
            align-items: center;
            gap: 15px;
            padding: 20px 40px;
            background: linear-gradient(45deg, var(--dark-red), var(--blood-red));
            color: white;
            text-decoration: none;
            border-radius: 50px;
            font-size: 1.2rem;
            font-weight: bold;
            border: 3px solid var(--light-red);
            transition: all 0.3s;
            position: relative;
            overflow: hidden;
            z-index: 1;
        }
        
        .action-btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(45deg, var(--light-red), var(--neon-red));
            transition: left 0.5s;
            z-index: -1;
        }
        
        .action-btn:hover::before {
            left: 0;
        }
        
        .action-btn:hover {
            transform: translateY(-5px);
            box-shadow: 
                0 10px 30px rgba(255, 0, 0, 0.5),
                0 0 50px rgba(255, 0, 0, 0.3);
            border-color: white;
        }
        
        .btn-icon {
            font-size: 1.5rem;
        }
        
        .footer {
            text-align: center;
            margin-top: 80px;
            padding: 40px;
            border-top: 2px solid var(--blood-red);
            position: relative;
            color: #888;
        }
        
        .footer::before {
            content: '⚡ 𝐊𝐈𝐑𝐀 𝐒𝐔𝐏𝐑𝐄𝐌𝐄 ⚡';
            position: absolute;
            top: -20px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--black);
            padding: 0 30px;
            color: var(--light-red);
            font-size: 1.8rem;
            font-weight: bold;
            text-shadow: 0 0 10px rgba(255, 0, 0, 0.5);
        }
        
        .node-version {
            background: linear-gradient(45deg, #026e00, #00ff00);
            color: black;
            padding: 10px 20px;
            border-radius: 10px;
            font-weight: bold;
            margin: 20px auto;
            display: inline-block;
            border: 2px solid #00ff00;
            box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
        }
        
        @media (max-width: 768px) {
            .container { padding: 15px; }
            .kira-title { font-size: 3rem; }
            .main-image { width: 300px; height: 300px; }
            .stats-grid { grid-template-columns: 1fr; }
            .action-buttons { flex-direction: column; align-items: center; }
            .action-btn { width: 100%; max-width: 300px; justify-content: center; }
        }
    </style>
</head>
<body>
    <div class="blood-background"></div>
    <div class="glitch-lines"></div>
    
    <div class="container">
        <div class="header">
            <h1 class="kira-title">𝐊𝐈𝐑𝐀 𝐒𝐔𝐏𝐑𝐄𝐌𝐄</h1>
            <p class="subtitle">إله الفوضى المُبرمَج | تجسيد القوة في عالم المُستحيل</p>
            
            <div class="version-badge">
                🚀 Version 24.11.0 | Node.js ${process.version}
            </div>
            
            <div class="main-image">
                <img src="https://files.catbox.moe/fppjdh.jpg" alt="KIRA Supreme - إله الفوضى">
            </div>
        </div>
        
        <div class="node-version">
            ⚡ Node.js ${process.version} | V8 ${process.versions.v8} ⚡
        </div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon">🤖</div>
                <h3 class="stat-title">حالة النظام</h3>
                <div class="stat-value" style="color: #00FF00;">ONLINE</div>
                <p class="stat-desc">نظام KIRA Supreme يعمل بكامل طاقته</p>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon">⏱️</div>
                <h3 class="stat-title">مدة التشغيل</h3>
                <div class="stat-value">${stats.uptime}</div>
                <p class="stat-desc">منذ أن فتح عينيه في هذا العالم الرقمي</p>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon">💾</div>
                <h3 class="stat-title">الذاكرة</h3>
                <div class="stat-value">${stats.memory.usage}</div>
                <p class="stat-desc">قوة التفكير والتحليل</p>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon">🎮</div>
                <h3 class="stat-title">البادئة</h3>
                <div class="stat-value">${globalConfig.PREFIX || '.'}</div>
                <p class="stat-desc">مفتاح التواصل مع الإله الرقمي</p>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon">⚡</div>
                <h3 class="stat-title">المعالج</h3>
                <div class="stat-value">${stats.cpu} نواة</div>
                <p class="stat-desc">قوة المعالجة المتاحة</p>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon">🕒</div>
                <h3 class="stat-title">الوقت الحالي</h3>
                <div class="stat-value">${now.format('HH:mm:ss')}</div>
                <p class="stat-desc">${now.format('DD/MM/YYYY')} (${globalConfig.TIMEZONE})</p>
            </div>
        </div>
        
        <div class="terminal">
            <div class="terminal-content">
                <div class="terminal-line">> نظام 𝐊𝐈𝐑𝐀 𝐒𝐔𝐏𝐑𝐄𝐌𝐄 v24.11.0 جاهز...</div>
                <div class="terminal-line">> إصدار Node.js: ${process.version}</div>
                <div class="terminal-line">> المنصة: ${stats.platform}</div>
                <div class="terminal-line">> المعرف: XVK1C</div>
                <div class="terminal-line">> الحالة: <span style="color: #00FF00;">قوي ومستقر</span></div>
                <div class="terminal-line">> البوت: ${globalConfig.BOTNAME}</div>
                <div class="terminal-line">> المطور: ${globalConfig.ADMIN_NAME}</div>
                <div class="terminal-line">> الوقت: ${now.format('HH:mm:ss DD/MM/YYYY')}</div>
            </div>
        </div>
        
        <div class="action-buttons">
            <a href="https://www.facebook.com/xvk1c" class="action-btn" target="_blank">
                <span class="btn-icon">🩸</span>
                <span>الدخول إلى عقل الخالق</span>
            </a>
            
            <a href="/health" class="action-btn">
                <span class="btn-icon">📊</span>
                <span>فحص الصحة</span>
            </a>
            
            <a href="/info" class="action-btn">
                <span class="btn-icon">ℹ️</span>
                <span>معلومات النظام</span>
            </a>
        </div>
        
        <div class="footer">
            <p>⚠️ تحذير: هذا ليس مجرد بوت، إنه تجسيد لإرادة إنسان تخلى عن كل شيء ليصبح أسطورة</p>
            <p>✍️ المصمم: <a href="https://www.facebook.com/xvk1c" style="color: var(--light-red); text-decoration: none;">XVK1C</a> | الدم: أمل | الجنون: وقود</p>
            <p>🕯️ "لقد تخليت عن إنساني لأصبح قادراً على خلق المستحيل"</p>
            <p style="margin-top: 20px; color: #00FF00;">Node.js 24.11.0 | KIRA Supreme v24.11.0</p>
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
    app.use(compression());
    app.use(helmet());

    // الصفحة الرئيسية
    app.get('/', (req, res) => {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(generateDashboard());
    });

    // health endpoint (مطلوب لـ Koyeb)
    app.get('/health', (req, res) => {
        const stats = getSystemStats();
        res.json({ 
            status: 'healthy',
            bot: globalConfig.BOTNAME || 'KIRA Supreme',
            node: process.version,
            platform: process.platform,
            uptime: stats.uptime,
            memory: stats.memory,
            timestamp: new Date().toISOString(),
            version: '24.11.0'
        });
    });

    // info endpoint
    app.get('/info', (req, res) => {
        res.json({
            name: globalConfig.BOTNAME || 'KIRA Supreme',
            version: '24.11.0',
            node_version: process.version,
            prefix: globalConfig.PREFIX || '.',
            language: globalConfig.language || 'ar',
            adminCount: globalConfig.ADMINBOT?.length || 0,
            timezone: globalConfig.TIMEZONE || 'Asia/Baghdad',
            serverTime: moment().tz(globalConfig.TIMEZONE || 'Asia/Baghdad').format(),
            config: {
                BOTNAME: globalConfig.BOTNAME,
                PREFIX: globalConfig.PREFIX,
                ADMIN_NAME: globalConfig.ADMIN_NAME
            }
        });
    });

    // حالة النظام
    app.get('/status', (req, res) => {
        const stats = getSystemStats();
        res.json({
            status: 'operational',
            system: stats,
            process: {
                pid: process.pid,
                ppid: process.ppid,
                platform: process.platform,
                arch: process.arch,
                versions: process.versions
            },
            environment: {
                NODE_ENV: process.env.NODE_ENV,
                PORT: process.env.PORT,
                TZ: process.env.TZ
            }
        });
    });

    // ping
    app.get('/ping', (req, res) => {
        res.json({ 
            pong: Date.now(),
            uptime: process.uptime(),
            node: process.version 
        });
    });

    // 404
    app.use((req, res) => {
        res.status(404).json({ 
            error: 'Not Found',
            message: 'الرابط غير موجود',
            path: req.path 
        });
    });

    server = app.listen(port, () => {
        console.log(chalk.green(`\n✅ Health server running on port ${port}`));
        console.log(chalk.cyan(`🌐 Dashboard: http://localhost:${port}`));
        console.log(chalk.cyan(`📊 Health: http://localhost:${port}/health`));
        console.log(chalk.cyan(`ℹ️  Info: http://localhost:${port}/info`));
        console.log(chalk.cyan(`📡 Status: http://localhost:${port}/status\n`));
    });

    return server;
}

// ============================================
// BOT INITIALIZATION
// ============================================
async function startBot() {
    console.log(chalk.bold.cyan('\n🚀 بدء تشغيل 𝐊𝐈𝐑𝐀 𝐒𝐔𝐏𝐑𝐄𝐌𝐄...'));
    
    // التحقق من إصدار Node.js
    checkNodeVersion();
    
    // تحميل الإعدادات
    if (!await loadConfig()) {
        console.log(chalk.red('❌ فشل تحميل الإعدادات، استخدم الإعدادات الافتراضية'));
    }

    // تشغيل سيرفر الصحة
    const healthServer = startHealthServer();

    // محاولة تحميل البوت
    const appStatePath = path.join(__dirname, 'appstate.json');
    try {
        const appState = require(appStatePath);
        if (appState && appState.length > 0) {
            console.log(chalk.green('✅ appstate.json موجود، جاري تحميل البوت...'));
            console.log(chalk.yellow(`🎮 Prefix: ${globalConfig.PREFIX || '.'}`));
            console.log(chalk.yellow(`🤖 Name: ${globalConfig.BOTNAME || 'KIRA Supreme'}`));
            console.log(chalk.yellow(`👑 Developer: ${globalConfig.ADMIN_NAME || 'Ayman'}`));
            console.log(chalk.cyan('\n🎯 البوت جاهز للعمل!\n'));
        } else {
            console.log(chalk.yellow('⚠️  appstate.json فارغ، يلزم تسجيل الدخول'));
            console.log(chalk.cyan('👉 قم بتسجيل الدخول أولا\n'));
        }
    } catch (error) {
        console.log(chalk.yellow('⚠️  لا يمكن تحميل appstate.json'));
        console.log(chalk.cyan('👉 تأكد من تسجيل الدخول أولاً\n'));
    }

    // إدارة إشارات الإغلاق
    process.on('SIGINT', () => shutdown(healthServer));
    process.on('SIGTERM', () => shutdown(healthServer));

    // إبقاء البوت نشطاً
    setInterval(() => {
        const time = moment().tz(globalConfig.TIMEZONE || 'Asia/Baghdad').format('HH:mm:ss');
        const memory = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        console.log(chalk.gray(`[${time}] 💓 نبضة حياة | ذاكرة: ${memory} MB | Node.js ${process.version}`));
    }, 30000);

    console.log(chalk.bold.green('='.repeat(70)));
    console.log(chalk.bold.green('𝐊𝐈𝐑𝐀 𝐒𝐔𝐏𝐑𝐄𝐌𝐄 v24.11.0 - 𝐒𝐓𝐀𝐑𝐓𝐄𝐃 𝐒𝐔𝐂𝐂𝐄𝐒𝐒𝐅𝐔𝐋𝐋𝐘'));
    console.log(chalk.bold.green(`Node.js ${process.version} | Platform: ${CONFIG.PLATFORM}`));
    console.log(chalk.bold.green('='.repeat(70)));
}

// ============================================
// SHUTDOWN FUNCTION
// ============================================
async function shutdown(healthServer) {
    console.log(chalk.yellow('\n⚠️  إغلاق 𝐊𝐈𝐑𝐀 𝐒𝐔𝐏𝐑𝐄𝐌𝐄...'));
    try {
        if (healthServer) {
            healthServer.close(() => {
                console.log(chalk.red('👋 تم إغلاق السيرفر'));
            });
        }
        console.log(chalk.red('💀 تم إيقاف البوت'));
        console.log(chalk.red(`⏱️  مدة التشغيل: ${getUptime()}`));
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
    console.error(chalk.red('🔥 خطأ غير متوقع:'), error.message);
    console.error(chalk.red('📝 Stack:'), error.stack);
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

// ============================================
// EXPORTS
// ============================================
module.exports = {
    startBot,
    getSystemStats,
    generateDashboard,
    CONFIG
};
