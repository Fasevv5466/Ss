const express = require('express');
const app = express();
const chalk = require('chalk');
const cron = require("node-cron");
const { exec } = require("child_process");
const moment = require("moment-timezone");
const { join, resolve } = require("path");
const { readFileSync, writeFileSync, readdirSync, existsSync, unlinkSync } = require("fs");
const login = require("ws3-fca");

const timerestart = 120;
const port = process.env.PORT || 8000;

// ========================
// 🔥 نظام الإحصائيات الجهنمية 🔥
// ========================
global.hellStats = {
    startTime: Date.now(),
    totalMessages: 0,
    commandsExecuted: 0,
    errorCount: 0,
    deathCount: 0,
    soulsCaptured: 0,
    restarts: 0
};

// سيرفر الـ Health Check + واجهة جهنمية
app.get('/', (req, res) => {
    const uptime = Math.floor((Date.now() - global.hellStats.startTime) / 1000);
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = uptime % 60;
    
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🔥 نظام المراقبة الجهنمي 🔥</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            background: linear-gradient(135deg, #0a0000 0%, #1a0000 25%, #2d0a0a 50%, #1a0000 75%, #0a0000 100%);
            font-family: 'Courier New', monospace;
            color: #ff3333;
            overflow-x: hidden;
            position: relative;
            min-height: 100vh;
        }
        
        @keyframes flames {
            0%, 100% { text-shadow: 0 0 10px #ff0000, 0 0 20px #ff3300, 0 0 30px #ff6600; }
            50% { text-shadow: 0 0 20px #ff3300, 0 0 40px #ff6600, 0 0 60px #ff9900; }
        }
        
        @keyframes bloodDrip {
            0% { top: -100px; opacity: 1; }
            100% { top: 100vh; opacity: 0; }
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-2px) rotate(-0.5deg); }
            75% { transform: translateX(2px) rotate(0.5deg); }
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1; }
        }
        
        .blood-drop {
            position: fixed;
            width: 3px;
            height: 20px;
            background: linear-gradient(to bottom, #8b0000, #ff0000);
            border-radius: 0 0 50% 50%;
            animation: bloodDrip linear infinite;
            z-index: 1;
        }
        
        .skull {
            position: fixed;
            font-size: 30px;
            opacity: 0.1;
            animation: pulse 3s ease-in-out infinite;
        }
        
        .container {
            position: relative;
            z-index: 10;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            padding: 40px 20px;
            border-bottom: 3px solid #8b0000;
            animation: shake 0.5s infinite;
        }
        
        .header h1 {
            font-size: 48px;
            animation: flames 2s ease-in-out infinite;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 3px;
        }
        
        .subtitle {
            color: #ff6666;
            font-size: 18px;
            margin-top: 10px;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 40px 0;
        }
        
        .stat-card {
            background: rgba(139, 0, 0, 0.3);
            border: 2px solid #8b0000;
            border-radius: 10px;
            padding: 25px;
            box-shadow: 0 0 20px rgba(255, 0, 0, 0.3);
            transition: all 0.3s;
            position: relative;
            overflow: hidden;
        }
        
        .stat-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 0, 0, 0.2), transparent);
            transition: left 0.5s;
        }
        
        .stat-card:hover::before {
            left: 100%;
        }
        
        .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 5px 30px rgba(255, 0, 0, 0.5);
            border-color: #ff0000;
        }
        
        .stat-label {
            font-size: 14px;
            color: #ff9999;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .stat-value {
            font-size: 36px;
            font-weight: bold;
            color: #ff3333;
            text-shadow: 0 0 10px #ff0000;
        }
        
        .stat-icon {
            font-size: 24px;
            margin-right: 10px;
        }
        
        .uptime-bar {
            background: rgba(0, 0, 0, 0.5);
            border: 2px solid #8b0000;
            border-radius: 20px;
            padding: 30px;
            margin: 30px 0;
            text-align: center;
        }
        
        .uptime-display {
            font-size: 48px;
            color: #ff0000;
            text-shadow: 0 0 20px #ff0000;
            font-weight: bold;
            margin: 20px 0;
            animation: flames 2s ease-in-out infinite;
        }
        
        .souls-container {
            margin: 40px 0;
            text-align: center;
        }
        
        .souls-count {
            font-size: 72px;
            color: #ff0000;
            text-shadow: 0 0 30px #ff0000, 0 0 60px #ff3300;
            animation: pulse 2s ease-in-out infinite;
            font-weight: bold;
        }
        
        .footer {
            text-align: center;
            padding: 30px;
            margin-top: 50px;
            border-top: 2px solid #8b0000;
            color: #666;
        }
        
        .warning {
            background: rgba(255, 0, 0, 0.1);
            border: 2px dashed #ff0000;
            padding: 20px;
            margin: 30px 0;
            border-radius: 10px;
            text-align: center;
            animation: pulse 1.5s ease-in-out infinite;
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
        }
        
        .demon-emoji {
            font-size: 100px;
            display: inline-block;
            animation: float 3s ease-in-out infinite;
        }
    </style>
</head>
<body>
    <script>
        // تأثير قطرات الدم
        for(let i = 0; i < 20; i++) {
            const drop = document.createElement('div');
            drop.className = 'blood-drop';
            drop.style.left = Math.random() * 100 + '%';
            drop.style.animationDuration = (Math.random() * 3 + 2) + 's';
            drop.style.animationDelay = Math.random() * 5 + 's';
            document.body.appendChild(drop);
        }
        
        // جماجم طائرة
        const positions = [
            {top: '10%', left: '10%'},
            {top: '20%', left: '80%'},
            {top: '50%', left: '5%'},
            {top: '70%', left: '90%'},
            {top: '80%', left: '15%'}
        ];
        
        positions.forEach(pos => {
            const skull = document.createElement('div');
            skull.className = 'skull';
            skull.innerHTML = '💀';
            skull.style.top = pos.top;
            skull.style.left = pos.left;
            skull.style.animationDelay = Math.random() + 's';
            document.body.appendChild(skull);
        });
        
        // تحديث تلقائي كل 5 ثواني
        setInterval(() => {
            location.reload();
        }, 5000);
    </script>

    <div class="container">
        <div class="header">
            <h1>🔥 نظام المراقبة الجهنمي 🔥</h1>
            <div class="subtitle">⚡ KIRA BOT - HELL EDITION ⚡</div>
            <div class="subtitle">By Ayman 😈</div>
        </div>

        <div class="warning">
            <div class="demon-emoji">😈</div>
            <h2 style="color: #ff0000; margin: 20px 0;">⚠️ تحذير جهنمي ⚠️</h2>
            <p style="color: #ff6666;">النظام يعمل بكامل طاقته الجهنمية... الأرواح تُحتجز في كل لحظة!</p>
        </div>

        <div class="uptime-bar">
            <div class="stat-label">⏱️ وقت التشغيل الجهنمي</div>
            <div class="uptime-display">${hours}س ${minutes}د ${seconds}ث</div>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label"><span class="stat-icon">💬</span>إجمالي الرسائل</div>
                <div class="stat-value">${global.hellStats.totalMessages}</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-label"><span class="stat-icon">⚡</span>الأوامر المنفذة</div>
                <div class="stat-value">${global.hellStats.commandsExecuted}</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-label"><span class="stat-icon">❌</span>عدد الأخطاء</div>
                <div class="stat-value">${global.hellStats.errorCount}</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-label"><span class="stat-icon">💀</span>الجثث المتساقطة</div>
                <div class="stat-value">${global.hellStats.deathCount}</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-label"><span class="stat-icon">🔄</span>عدد إعادات التشغيل</div>
                <div class="stat-value">${global.hellStats.restarts}</div>
            </div>
        </div>

        <div class="souls-container">
            <div class="stat-label">👻 الأرواح المحتجزة في الجحيم 👻</div>
            <div class="souls-count">${global.hellStats.soulsCaptured}</div>
        </div>

        <div class="footer">
            <p>🔥 نظام كيرا الجهنمي يعمل بنجاح! | Kira Hell Bot is Online 🔥</p>
            <p style="margin-top: 10px; color: #999;">تحديث تلقائي كل 5 ثواني</p>
        </div>
    </div>
</body>
</html>
    `);
});

app.listen(port, () => {
    console.log(chalk.cyan(`📡 Health check server is running on port ${port}`));
});

// إعداد المتغيرات العامة
const logger = require('./utils/log.js');

global.client = new Object({
    commands: new Map(),
    events: new Map(),
    cooldowns: new Map(),
    mainPath: process.cwd()
});

global.data = new Object({
    threadInfo: new Map(),
    threadData: new Map(),
    userName: new Map(),
    userBanned: new Map(),
    threadBanned: new Map(),
    commandBanned: new Map(),
    threadAllowNSFW: new Array(),
    allUserID: new Array(),
    allCurrenciesID: new Array(),
    allThreadID: new Array()
});

global.utils = require("./utils");

global.nodemodule = new Object();
global.config = new Object();
global.configModule = new Object();
global.moduleData = new Array();
global.language = new Object();

// تحميل الإعدادات
var configValue;
try {
    global.client.configPath = join(global.client.mainPath, "config.json");
    configValue = require(global.client.configPath);
    logger.loader("Found file config: config.json");
} catch {
    return logger.loader("config.json not found!", "error");
}

try {
    for (const key in configValue) global.config[key] = configValue[key];
    logger.loader("Config Loaded!");
} catch { return logger.loader("Can't load file config!", "error") }

const { Sequelize, sequelize } = require("./includes/database/index.js");
writeFileSync(global.client.configPath + ".temp", JSON.stringify(global.config, null, 4), 'utf8');

// تحميل اللغات
try {
    const langFile = (readFileSync(`${__dirname}/languages/${global.config.language || "en"}.lang`, { encoding: 'utf-8' })).split(/\r?\n|\r/);
    const langData = langFile.filter(item => item.indexOf('#') != 0 && item != '');
    for (const item of langData) {
        const getSeparator = item.indexOf('=');
        const itemKey = item.slice(0, getSeparator);
        const itemValue = item.slice(getSeparator + 1, item.length);
        const head = itemKey.slice(0, itemKey.indexOf('.'));
        const key = itemKey.replace(head + '.', '');
        const value = itemValue.replace(/\\n/gi, '\n');
        if (typeof global.language[head] == "undefined") global.language[head] = new Object();
        global.language[head][key] = value;
    }
} catch (e) {
    console.log("Language Load Error: " + e.message);
}

global.getText = function (...args) {
    try {
        const langText = global.language;    
        var text = langText[args[0]][args[1]];
        if (!text) return `[${args[1]}]`;
        for (var i = args.length - 1; i > 0; i--) {
            const regEx = RegExp(`%${i}`, 'g');
            text = text.replace(regEx, args[i + 1]);
        }
        return text;
    } catch (e) { return `[${args[1]}]`; }
}

// --- نظام تسجيل الدخول المطور لـ Koyeb ---
var appStateFile = resolve(join(global.client.mainPath, global.config.APPSTATEPATH || "appstate.json"));
var appState;

if (process.env.APPSTATE) {
    try {
        appState = JSON.parse(process.env.APPSTATE);
        logger.loader("💌 ───『 تم العثور على APPSTATE في إعدادات السيرفر 』─── 💌");
    } catch (e) {
        return logger.loader("خطأ في تنسيق JSON الخاص بـ APPSTATE!", "error");
    }
} else {
    try {
        appState = require(appStateFile);
        logger.loader("💌 ───『 تم العثور على ملف appstate.json محلياً 』─── 💌");
    } catch { 
        return logger.loader("لم يتم العثور على ملف تسجيل الدخول أو متغير البيئة APPSTATE!", "error");
    }
}

function onBot({ models: botModel }) {
    const loginData = { appState };
    login(loginData, async(loginError, loginApiData) => {
        if (loginError) {
            console.error(loginError);
            global.hellStats.errorCount++;
            return logger("حدث خطأ أثناء تسجيل الدخول، تأكد من صحة الـ AppState", `ERROR`);
        }

        loginApiData.setOptions(global.config.FCAOption);
        
        // تحديث الملف المحلي إذا كان مسموحاً بالكتابة
        try { writeFileSync(appStateFile, JSON.stringify(loginApiData.getAppState(), null, '\x09')); } catch(e) {}

        global.config.version = '1.2.14';
        global.client.timeStart = new Date().getTime();

        // تحميل الأوامر
        const commandsPath = join(global.client.mainPath, 'script', 'commands');
        const categories = readdirSync(commandsPath).filter(item => require('fs').statSync(join(commandsPath, item)).isDirectory());
        
        for (const category of categories) {
            const categoryPath = join(commandsPath, category);
            const listCommand = readdirSync(categoryPath).filter(command => command.endsWith('.js') && !global.config.commandDisabled.includes(command));
            
            for (const command of listCommand) {
                try {
                    const module = require(join(categoryPath, command));
                    if (module.config && module.run) {
                        global.client.commands.set(module.config.name, module);
                        logger.loader(`🌸『 تـم تحميل: ${module.config.name} 』🌸`);
                    }
                } catch (error) {
                    global.hellStats.errorCount++;
                    logger.loader(`Fail load command: ${command}`, 'error');
                }
            }
        }

        // تحميل الأحداث
        const eventsPath = join(global.client.mainPath, 'script', 'events');
        if (existsSync(eventsPath)) {
            const events = readdirSync(eventsPath).filter(ev => ev.endsWith('.js'));
            for (const ev of events) {
                try {
                    const event = require(join(eventsPath, ev));
                    global.client.events.set(event.config.name, event);
                } catch (err) { 
                    global.hellStats.errorCount++;
                    logger.loader("Fail load event: " + ev, "error"); 
                }
            }
        }

        logger.loader(`Loaded ${global.client.commands.size} commands and ${global.client.events.size} events`);
        if (existsSync(global.client.configPath + '.temp')) unlinkSync(global.client.configPath + '.temp');        
        
        const listenerData = { api: loginApiData, models: botModel };
        const listener = require('./includes/listen.js')(listenerData);
        loginApiData.listenMqtt((error, message) => {
            if (error) {
                global.hellStats.errorCount++;
                return;
            }
            global.hellStats.totalMessages++;
            global.hellStats.soulsCaptured++;
            return listener(message);
        });
        
        global.client.api = loginApiData;
        logger(`KIRA ✨ 🔥 HELL EDITION 🔥`, '[ by ayman ]');
        console.log(chalk.red.bold(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🔥🔥🔥  نظام المراقبة الجهنمي نشط  🔥🔥🔥          ║
║                                                       ║
║   😈 الأرواح تُحتجز...                              ║
║   💀 الجثث تتساقط كل ثانية...                       ║
║   ⚡ النظام يعمل بكامل قوته الجهنمية...             ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
        `));

        const timeNow = moment().tz("Africa/Casablanca").format("HH:mm:ss");
        if (global.config.ADMINBOT && global.config.ADMINBOT[0]) {
            loginApiData.sendMessage(`🔥 لـقـد تـم تـشـغـيـل الـبـوت الجهنمي فـي ${timeNow} ✅\n💀 الجثث بدأت بالتساقط...`, global.config.ADMINBOT[0]);
        }

        cron.schedule(`0 0 */1 * * *`, () => {
            const dateStr = moment().tz("Asia/Manila").format("MM/DD/YYYY");
            loginApiData.changeBio(`🔥 Prefix: ${global.config.PREFIX}\n\nBot Name: ${global.config.BOTNAME}\nDate: ${dateStr}\n💀 Souls: ${global.hellStats.soulsCaptured}`);
        }, { scheduled: true, timezone: "Africa/Casablanca" });
        
        // تحديث عداد الجثث كل ثانية
        setInterval(() => {
            global.hellStats.deathCount++;
        }, 1000);
    });
}

(async() => {
    try {
        await sequelize.authenticate();
        const models = require('./includes/database/model.js')({ Sequelize, sequelize });
        
        // ✅ نظام حفظ تلقائي كل 5 دقائق
        const Currencies = require('./includes/controllers/currencies')({ models });
        
        setInterval(async () => {
            try {
                await sequelize.sync({ force: false });
                console.log(chalk.green('✅ [AUTO-SAVE] تم حفظ قاعدة البيانات تلقائياً'));
            } catch (error) {
                global.hellStats.errorCount++;
                console.error(chalk.red('❌ [AUTO-SAVE] خطأ في الحفظ:'), error.message);
            }
        }, 5 * 60 * 1000); // كل 5 دقائق
        
        console.log(chalk.yellow('💾 [AUTO-SAVE] نظام الحفظ التلقائي نشط (كل 5 دقائق)'));
        
        onBot({ models });
    } catch (error) { 
        console.log(error);
        global.hellStats.errorCount++;
        logger("DB Error", "error"); 
    }
    console.log(chalk.bold.hex("#eff1f0").bold("════════════════ SUCCESFULLY ═════════════════"));
})();

process.on('unhandledRejection', (err) => { 
    global.hellStats.errorCount++;
    console.log(err); 
});

// ✅ حفظ قاعدة البيانات قبل إيقاف البوت
process.on('SIGINT', async () => {
    console.log(chalk.yellow('\n⏳ إيقاف البوت... جاري حفظ البيانات...'));
    try {
        await sequelize.sync({ force: false });
        await sequelize.close();
        console.log(chalk.green('✅ تم حفظ البيانات بنجاح'));
        process.exit(0);
    } catch (error) {
        console.error(chalk.red('❌ خطأ في الحفظ:'), error);
        process.exit(1);
    }
});

process.on('SIGTERM', async () => {
    console.log(chalk.yellow('\n⏳ تلقي إشارة SIGTERM... جاري حفظ البيانات...'));
    try {
        await sequelize.sync({ force: false });
        await sequelize.close();
        console.log(chalk.green('✅ تم حفظ البيانات بنجاح'));
        process.exit(0);
    } catch (error) {
        console.error(chalk.red('❌ خطأ في الحفظ:'), error);
        process.exit(1);
    }
});
