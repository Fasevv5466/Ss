const express = require('express');
const chalk = require('chalk');
const cron = require("node-cron");
const { exec } = require("child_process");
const moment = require("moment-timezone");
const fs = require("fs-extra");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8000;

// ⭐ Health Check الأساسي (مطلوب لـ Koyeb)
app.get('/', (req, res) => {
    res.json({ 
        status: 'online',
        bot: 'Kira Bot',
        node: process.version,
        uptime: process.uptime()
    });
});

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

app.listen(PORT, () => {
    console.log(chalk.cyan(`✅ Kira Bot running on port ${PORT}`));
    console.log(chalk.green(`📦 Node.js version: ${process.version}`));
});

// ⭐ تنظيف الكاش
exec("rm -rf script/commands/data && mkdir -p script/commands/data", (error) => {
    if (!error) console.log(chalk.green("[CLEAN] Cache cleared"));
});

// ⭐ باقي الكود الأصلي
const { readdirSync, readFileSync, writeFileSync, existsSync, unlinkSync } = require("fs-extra");
const { join, resolve } = require("path");
const axios = require("axios");

console.log(chalk.cyan("[KIRA] Initializing..."));

global.client = {
    commands: new Map(),
    events: new Map(),
    cooldowns: new Map(),
    eventRegistered: [],
    handleSchedule: [],
    handleReaction: [],
    handleReply: []
};

global.data = {
    threadInfo: new Map(),
    threadData: new Map(),
    userName: new Map(),
    userBanned: new Map(),
    threadBanned: new Map()
};

// ⭐ محاولة تحميل config
try {
    global.config = require("./config.json");
    console.log(chalk.green("[CONFIG] Loaded successfully"));
} catch (error) {
    console.log(chalk.red("[CONFIG] Error loading config.json"));
    process.exit(1);
}

// ⭐ محاولة تشغيل البوت مع hut-chat-api
try {
    const login = require("hut-chat-api");
    
    // ⭐ تحميل appstate.json
    let appState;
    try {
        appState = require("./appstate.json");
        console.log(chalk.green("[APPSTATE] Loaded successfully"));
    } catch (error) {
        console.log(chalk.red("[APPSTATE] Error: appstate.json not found"));
        console.log(chalk.yellow("⚠️ Please login first using: npm run login"));
        return;
    }
    
    // ⭐ محاولة تسجيل الدخول
    login({ appState }, (err, api) => {
        if (err) {
            console.log(chalk.red("[LOGIN] Error:"), err);
            return;
        }
        
        console.log(chalk.green("[LOGIN] Success! Bot is ready"));
        global.client.api = api;
        
        // ⭐ حفظ appstate المحدثة
        writeFileSync("./appstate.json", JSON.stringify(api.getAppState(), null, 2));
        
        // ⭐ إرسال رسالة تشغيل للمطور
        if (global.config.ADMINBOT && global.config.ADMINBOT[0]) {
            api.sendMessage(
                `✅ البوت يعمل الآن على Node.js ${process.version}\n🕒 ${moment().tz("Asia/Baghdad").format("HH:mm:ss")}`,
                global.config.ADMINBOT[0]
            );
        }
    });
    
} catch (error) {
    console.log(chalk.red("[HUT-API] Error loading hut-chat-api:"), error.message);
    console.log(chalk.yellow("💡 Try: npm install hut-chat-api@latest"));
}

// ⭐ معالجة الأخطاء غير المتوقعة
process.on('unhandledRejection', (error) => {
    console.log(chalk.red("[UNHANDLED ERROR]:"), error);
});
