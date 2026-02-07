const express = require('express');
const app = express();
const chalk = require('chalk');
const cron = require("node-cron");
const { exec } = require("child_process");
const moment = require("moment-timezone");
const fs = require("fs-extra");
const path = require("path");

const port = process.env.PORT || 8000;

// إظهار إصدار Node.js
console.log(chalk.bold.hex("#00FF00")(`
╔══════════════════════════════════════╗
║        KIRA SUPREME v11.0           ║
║        Node.js ${process.version}              ║
║        أقوى نظام في العالم          ║
╚══════════════════════════════════════╝
`));

// سيرفر الصحة
app.get('/', (req, res) => {
    res.json({
        status: 'online',
        bot: 'Kira Supreme',
        node_version: process.version,
        uptime: process.uptime(),
        timestamp: Date.now()
    });
});

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        memory: process.memoryUsage(),
        platform: process.platform,
        arch: process.arch
    });
});

app.get('/stats', (req, res) => {
    res.json({
        node: process.version,
        v8: process.versions.v8,
        modules: process.versions.modules,
        platform: `${process.platform} ${process.arch}`,
        memory: {
            total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
            used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
            rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`
        }
    });
});

app.listen(port, () => {
    console.log(chalk.cyan(`📡 Health server running on port ${port}`));
});

// تنظيف النظام
exec("rm -rf script/commands/data/* && rm -rf script/commands/cache/*", (error) => {
    if (!error) console.log(chalk.green("[SYSTEM] Cache cleaned successfully"));
});

const DateAndTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' });
console.log(chalk.yellow(`[TIME] ${DateAndTime}`));

const { readdirSync, readFileSync, writeFileSync, existsSync, unlinkSync } = require("fs-extra");
const { join, resolve } = require("path");
const logger = require("./utils/log.js");

// استبدال hut-chat-api بنظامنا
const KiraLoginSystem = require("./systems/login-system.js");

console.log(chalk.bold.hex("#03f0fc")("[ KIRA ] » ") + chalk.bold.hex("#fcba03")("Initializing Supreme System..."));

// تعريف المتغيرات العالمية
global.client = new Object({
    commands: new Map(),
    events: new Map(),
    cooldowns: new Map(),
    eventRegistered: new Array(),
    handleSchedule: new Array(),
    handleReaction: new Array(),
    handleReply: new Array(),
    mainPath: process.cwd(),
    configPath: new String(),
    mentionCache: new Map()
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

global.utils = require("./utils/index.js");
global.utils.config = require("./utils/config.js");
global.utils.decorations = require("./utils/decorations.js");
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
    logger.loader("Found config file: config.json");
} catch {
    return logger.loader("config.json not found!", "error");
}

try {
    for (const key in configValue) global.config[key] = configValue[key];
    logger.loader("Config Loaded!");
} catch {
    return logger.loader("Can't load config file!", "error");
}

// تحميل اللغات
try {
    const langFile = (readFileSync(`${__dirname}/languages/${global.config.language || "ar"}.lang`, { encoding: 'utf-8' })).split(/\r?\n|\r/);
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
    } catch (e) {
        return `[${args[1]}]`;
    }
}

// تحميل نظام تسجيل الدخول الخاص
try {
    const loginSystem = new KiraLoginSystem();
    if (loginSystem.loadAppState()) {
        global.client.api = loginSystem.api;
        logger.loader("💌 نظام تسجيل الدخول الخاص جاهز 💌");
        
        // بدء النظام
        startBotSystem();
    } else {
        logger.loader("❌ فشل تحميل AppState!", "error");
        createDefaultAppState();
    }
} catch (error) {
    logger.loader("❌ خطأ في نظام تسجيل الدخول: " + error.message, "error");
}

function createDefaultAppState() {
    const defaultAppState = [
        {
            "key": "c_user",
            "value": "100000000000000",
            "domain": ".facebook.com",
            "path": "/",
            "expires": 1740767595,
            "size": 39,
            "httpOnly": false,
            "secure": true,
            "session": false
        }
    ];
    
    fs.writeFileSync("appstate.json", JSON.stringify(defaultAppState, null, 2));
    console.log(chalk.yellow("📝 تم إنشاء appstate.json افتراضي، قم بتسجيل الدخول يدوياً"));
}

async function startBotSystem() {
    try {
        global.config.version = '11.0.0';
        global.client.timeStart = new Date().getTime();

        // تحميل الأوامر
        (function () {
            const commandsPath = join(global.client.mainPath, 'script', 'commands');
            const categories = readdirSync(commandsPath).filter(item => {
                return fs.statSync(join(commandsPath, item)).isDirectory();
            });

            let totalCommands = 0;
            for (const category of categories) {
                const categoryPath = join(commandsPath, category);
                const listCommand = readdirSync(categoryPath).filter(command =>
                    command.endsWith('.js') && !global.config.commandDisabled?.includes(command)
                );

                for (const command of listCommand) {
                    try {
                        const module = require(join(categoryPath, command));
                        if (!module.config || !module.run) throw new Error("Format error");

                        global.client.commands.set(module.config.name, module);
                        totalCommands++;
                        logger.loader(`✨ ${module.config.name}`);
                    } catch (error) {
                        logger.loader(`❌ فشل تحميل: ${command}`, 'error');
                    }
                }
            }
            
            console.log(chalk.green(`✅ تم تحميل ${totalCommands} أمر`));
        })();

        // تحميل الأحداث
        (function () {
            const eventsPath = join(global.client.mainPath, 'script', 'events');
            if (existsSync(eventsPath)) {
                const events = readdirSync(eventsPath).filter(ev => ev.endsWith('.js'));
                for (const ev of events) {
                    try {
                        const event = require(join(eventsPath, ev));
                        global.client.events.set(event.config.name, event);
                    } catch (err) {
                        logger.loader("❌ فشل تحميل حدث: " + ev, "error");
                    }
                }
                console.log(chalk.green(`✅ تم تحميل ${events.length} حدث`));
            }
        })();

        if (existsSync(global.client.configPath + '.temp')) {
            unlinkSync(global.client.configPath + '.temp');
        }

        // تحميل نظام المنشن
        const MentionSystem = require('./systems/mentions.js');
        global.mentionSystem = new MentionSystem(global.client.api);
        
        logger(`🤖 KIRA SUPREME v11.0`, '[ Node.js 24 ]');
        console.log(chalk.bold.hex("#FF00FF")(`
╔══════════════════════════════════════╗
║        النظام جاهز للتشغيل          ║
║        ${global.client.commands.size} أمر | ${global.client.events.size} حدث  ║
║        Node.js ${process.version}              ║
╚══════════════════════════════════════╝
        `));

        // إشعار التشغيل
        const timeNow = moment().tz("Africa/Casablanca").format("HH:mm:ss");
        if (global.config.ADMINBOT && global.config.ADMINBOT[0]) {
            global.client.api.sendMessage(
                `✅ تم تشغيل KIRA SUPREME v11.0\n` +
                `🤖 Node.js ${process.version}\n` +
                `🕒 الوقت: ${timeNow}\n` +
                `⚡ ${global.client.commands.size} أمر جاهز`,
                global.config.ADMINBOT[0]
            );
        }

        // تحديث السيرة الذاتية
        cron.schedule(`0 0 */1 * * *`, () => {
            const dateStr = moment().tz("Asia/Manila").format("MM/DD/YYYY");
            global.client.api.changeBio(
                `✨ Kira Supreme v11.0\n` +
                `Prefix: ${global.config.PREFIX}\n` +
                `Node.js: ${process.version}\n` +
                `Date: ${dateStr}`
            );
        }, { scheduled: true, timezone: "Africa/Casablanca" });

        // بدء الاستماع للرسائل
        startMessageListening();

    } catch (error) {
        console.error("❌ خطأ في بدء النظام:", error);
        logger("SYSTEM START ERROR", "error");
    }
}

function startMessageListening() {
    console.log(chalk.cyan("📡 جاري بدء الاستماع للرسائل..."));
    
    // محاكاة استقبال الرسائل
    setInterval(() => {
        // هنا سيتم إضافة نظام استقبال حقيقي
    }, 5000);
}

// الاتصال بقاعدة البيانات
(async () => {
    try {
        const { sequelize } = require('./includes/database/index.js');
        await sequelize.authenticate();
        const models = require('./includes/database/model.js')({ Sequelize: require("sequelize"), sequelize });
        
        console.log(chalk.green("✅ قاعدة البيانات متصلة بنجاح"));
        
        // يمكنك استدعاء onBot هنا إذا أردت
        // onBot({ models });
        
    } catch (error) {
        console.log(chalk.red("❌ خطأ في قاعدة البيانات:"), error.message);
    }
    
    console.log(chalk.bold.hex("#00FFFF")("════════════════ SYSTEM READY ═════════════════"));
})();

process.on('unhandledRejection', (err) => {
    console.log(chalk.red('❌ Unhandled Rejection:'), err.message);
});

process.on('SIGINT', () => {
    console.log(chalk.yellow('\n🛑 إيقاف النظام...'));
    process.exit(0);
});
