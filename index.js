const express = require('express'); // إضافة Express
const app = express();
const chalk = require('chalk');
const cron = require("node-cron");
const { exec } = require("child_process");
const moment = require("moment-timezone"); // تعريف moment في البداية

const timerestart = 120;
const port = process.env.PORT || 8000; // المنفذ الذي يطلبه Koyeb

// سيرفر صغير للـ Health Check والـ Uptime
app.get('/', (req, res) => {
    res.send('📓 نظام كيرا يعمل بنجاح! | Kira Bot is Online');
});

app.listen(port, () => {
    console.log(chalk.cyan(`📡 Health check server is running on port ${port}`));
});

// تنظيف الكاش عند التشغيل
exec("rm -rf script/commands/data && mkdir -p script/commands/data && rm -rf script/commands/tad/* ", (error) => {
    if (error) return;
    console.log(chalk.bold.hex("#00FA9A")("[ AUTO CLEAR CACHE ] 🪽❯ ") + chalk.hex("#00FA9A")("Successfully delete cache"))
});

const DateAndTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' }); 
console.log(chalk.bold.hex("#059242").bold(DateAndTime));

const { readdirSync, readFileSync, writeFileSync, existsSync, unlinkSync } = require("fs-extra");
const { join, resolve } = require("path");
const { execSync } = require('child_process');
const logger = require("./utils/log.js");
const login = require("hut-chat-api");
const axios = require("axios");

console.log(chalk.bold.hex("#03f0fc").bold("[ KIRA ] » ") + chalk.bold.hex("#fcba03").bold("Initializing variables..."));

global.client = new Object({
    commands: new Map(),
    events: new Map(),
    cooldowns: new Map(),
    eventRegistered: new Array(),
    handleSchedule: new Array(),
    handleReaction: new Array(),
    handleReply: new Array(),
    mainPath: process.cwd(),
    configPath: new String()
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

// تحميل اللغات - إضافة فحص لتجنب خطأ newUser
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
        if (!text) return `[${args[1]}]`; // حل مؤقت لتجنب انهيار البوت إذا نقص نص
        for (var i = args.length - 1; i > 0; i--) {
            const regEx = RegExp(`%${i}`, 'g');
            text = text.replace(regEx, args[i + 1]);
        }
        return text;
    } catch (e) { return `[${args[1]}]`; }
}

try {
    var appStateFile = resolve(join(global.client.mainPath, global.config.APPSTATEPATH || "appstate.json"));
    var appState = require(appStateFile);
    logger.loader("💌 ───『 تم العثور على ملف تسجيل الدخول 』─── 💌")
} catch { return logger.loader("لم يتم العثور على ملف تسجيل الدخول!", "error") }

function onBot({ models: botModel }) {
    const loginData = { appState };
    login(loginData, async(loginError, loginApiData) => {
        if (loginError) return logger(JSON.stringify(loginError), `ERROR`);

        loginApiData.setOptions(global.config.FCAOption);
        writeFileSync(appStateFile, JSON.stringify(loginApiData.getAppState(), null, '\x09'));
        global.config.version = '1.2.14';
        global.client.timeStart = new Date().getTime();

        // تحميل الأوامر
        (function () {
            const commandsPath = join(global.client.mainPath, 'script', 'commands');
            const categories = readdirSync(commandsPath).filter(item => {
                return require('fs').statSync(join(commandsPath, item)).isDirectory();
            });
            
            for (const category of categories) {
                const categoryPath = join(commandsPath, category);
                const listCommand = readdirSync(categoryPath).filter(command => 
                    command.endsWith('.js') && !global.config.commandDisabled.includes(command)
                );
                
                for (const command of listCommand) {
                    try {
                        const module = require(join(categoryPath, command));
                        if (!module.config || !module.run) throw new Error("Format error");
                        
                        global.client.commands.set(module.config.name, module);
                        logger.loader(`🌸『 تـم تحميل: ${module.config.name} 』🌸`);
                    } catch (error) {
                        logger.loader(`Fail load command: ${command}`, 'error');
                    }
                }
            }
        })();

        // تحميل الأحداث
        (function() {
            const eventsPath = join(global.client.mainPath, 'script', 'events');
            if (existsSync(eventsPath)) {
                const events = readdirSync(eventsPath).filter(ev => ev.endsWith('.js'));
                for (const ev of events) {
                    try {
                        const event = require(join(eventsPath, ev));
                        global.client.events.set(event.config.name, event);
                    } catch (err) { logger.loader("Fail load event: " + ev, "error"); }
                }
            }
        })();

        logger.loader(`Loaded ${global.client.commands.size} commands and ${global.client.events.size} events`);
        if (existsSync(global.client.configPath + '.temp')) unlinkSync(global.client.configPath + '.temp');        
        
        const listenerData = { api: loginApiData, models: botModel };
        const listener = require('./includes/listen.js')(listenerData);
        loginApiData.listenMqtt((error, message) => {
            if (error) return;
            return listener(message);
        });
        
        global.client.api = loginApiData;
        logger(`KIRA ✨`, '[ by ayman ]');

        // إشعار التشغيل
        const timeNow = moment().tz("Africa/Casablanca").format("HH:mm:ss");
        if (global.config.ADMINBOT && global.config.ADMINBOT[0]) {
            loginApiData.sendMessage(`لـقـد تـم تـشـغـيـل الـبـوت فـي ${timeNow} ✅`, global.config.ADMINBOT[0]);
        }

        // تحديث السيرة الذاتية
        cron.schedule(`0 0 */1 * * *`, () => {
            const dateStr = moment().tz("Asia/Manila").format("MM/DD/YYYY");
            loginApiData.changeBio(`Prefix: ${global.config.PREFIX}\n\nBot Name: ${global.config.BOTNAME}\nDate: ${dateStr}`);
        }, { scheduled: true, timezone: "Africa/Casablanca" });

    });
}

// الاتصال بقاعدة البيانات والتشغيل
(async() => {
    try {
        await sequelize.authenticate();
        const models = require('./includes/database/model.js')({ Sequelize, sequelize });
        onBot({ models });
    } catch (error) { 
        console.log(error);
        logger("DB Error", "error"); 
    }
    console.log(chalk.bold.hex("#eff1f0").bold("════════════════ SUCCESFULLY ═════════════════"));
})();

process.on('unhandledRejection', (err) => { console.log(err); });
