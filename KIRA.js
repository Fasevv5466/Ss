#!/usr/bin/env node

// ===================================================================
// NOVA BOT - Single File Bot
// Based on KIRA architecture but simplified into ONE file
// ===================================================================

const fs = require('fs-extra');
const path = require('path');
const express = require('express');
const login = require('hut-chat-api');
const chalk = require('chalk');
const moment = require('moment-timezone');

// ===================================================================
// CONFIGURATION
// ===================================================================

const CONFIG = {
    BOT_NAME: "NOVA",
    PREFIX: ".",
    ADMIN_IDS: ["61577861540407"], // غيّر هذا لـ Facebook ID تبعك
    LANGUAGE: "ar",
    PORT: process.env.PORT || 8000,
    TIMEZONE: "Africa/Casablanca",
    
    // Login options
    FCA_OPTIONS: {
        forceLogin: true,
        listenEvents: true,
        logLevel: "silent",
        selfListen: false,
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
};

// ===================================================================
// GLOBALS
// ===================================================================

global.client = {
    commands: new Map(),
    events: new Map(),
    cooldowns: new Map(),
    handleReply: new Map(),
    handleReaction: new Map()
};

global.data = {
    users: new Map(),
    threads: new Map(),
    banned: { users: [], threads: [] }
};

// ===================================================================
// LOGGER
// ===================================================================

const logger = {
    log: (msg, type = 'INFO') => {
        const colors = {
            'INFO': chalk.cyan,
            'SUCCESS': chalk.green,
            'WARN': chalk.yellow,
            'ERROR': chalk.red,
            'CMD': chalk.magenta
        };
        const color = colors[type] || chalk.white;
        console.log(color(`[${type}]`) + ' ' + msg);
    },
    
    info: (msg) => logger.log(msg, 'INFO'),
    success: (msg) => logger.log(msg, 'SUCCESS'),
    warn: (msg) => logger.log(msg, 'WARN'),
    error: (msg) => logger.log(msg, 'ERROR'),
    cmd: (msg) => logger.log(msg, 'CMD'),
    
    banner: () => {
        console.log(chalk.cyan(`
╔══════════════════════════════════════╗
║                                      ║
║         🌟 NOVA BOT 🌟              ║
║     Single-File Architecture         ║
║                                      ║
╚══════════════════════════════════════╝
        `));
    }
};

// ===================================================================
// DATABASE (Simple JSON)
// ===================================================================

class Database {
    constructor() {
        this.dbPath = 'database.json';
        this.data = this.load();
    }
    
    load() {
        try {
            if (fs.existsSync(this.dbPath)) {
                return fs.readJsonSync(this.dbPath);
            }
        } catch (e) {}
        return { users: {}, threads: {} };
    }
    
    save() {
        try {
            fs.writeJsonSync(this.dbPath, this.data, { spaces: 2 });
        } catch (e) {
            logger.warn('Failed to save database');
        }
    }
    
    getUser(uid) {
        if (!this.data.users[uid]) {
            this.data.users[uid] = { money: 0, exp: 0, banned: false };
        }
        return this.data.users[uid];
    }
    
    getThread(tid) {
        if (!this.data.threads[tid]) {
            this.data.threads[tid] = { name: '', banned: false };
        }
        return this.data.threads[tid];
    }
}

const db = new Database();

// Auto-save every minute
setInterval(() => db.save(), 60000);

// ===================================================================
// COMMAND LOADER
// ===================================================================

function loadCommands() {
    const commandsPath = path.join(__dirname, 'script', 'commands');
    
    if (!fs.existsSync(commandsPath)) {
        logger.warn('Commands folder not found');
        return;
    }
    
    let loaded = 0;
    
    // Load from all subdirectories
    const categories = fs.readdirSync(commandsPath)
        .filter(f => fs.statSync(path.join(commandsPath, f)).isDirectory());
    
    for (const category of categories) {
        const catPath = path.join(commandsPath, category);
        const files = fs.readdirSync(catPath).filter(f => f.endsWith('.js'));
        
        for (const file of files) {
            try {
                const cmd = require(path.join(catPath, file));
                
                if (!cmd.config || !cmd.config.name) continue;
                if (!cmd.run && !cmd.onStart && !cmd.onMessage) continue;
                
                global.client.commands.set(cmd.config.name, cmd);
                loaded++;
                logger.info(`  ✓ ${cmd.config.name}`);
                
            } catch (e) {
                logger.warn(`  ✗ ${file}: ${e.message}`);
            }
        }
    }
    
    logger.success(`Loaded ${loaded} commands`);
}

// ===================================================================
// EVENT LOADER
// ===================================================================

function loadEvents() {
    const eventsPath = path.join(__dirname, 'script', 'events');
    
    if (!fs.existsSync(eventsPath)) {
        logger.warn('Events folder not found');
        return;
    }
    
    let loaded = 0;
    const files = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));
    
    for (const file of files) {
        try {
            const event = require(path.join(eventsPath, file));
            
            if (!event.config || !event.config.name) continue;
            
            global.client.events.set(event.config.name, event);
            loaded++;
            logger.info(`  ✓ ${event.config.name}`);
            
        } catch (e) {
            logger.warn(`  ✗ ${file}: ${e.message}`);
        }
    }
    
    logger.success(`Loaded ${loaded} events`);
}

// ===================================================================
// COMMAND HANDLER
// ===================================================================

async function handleCommand(api, event) {
    if (!event.body || !event.body.startsWith(CONFIG.PREFIX)) return;
    
    const args = event.body.slice(CONFIG.PREFIX.length).trim().split(/ +/);
    const cmdName = args.shift().toLowerCase();
    
    const command = global.client.commands.get(cmdName);
    if (!command) return;
    
    // Check banned
    const user = db.getUser(event.senderID);
    if (user.banned) {
        return api.sendMessage('⛔ محظور', event.threadID);
    }
    
    // Check admin permission
    if (command.config.role > 0) {
        if (!CONFIG.ADMIN_IDS.includes(event.senderID)) {
            return api.sendMessage('⛔ للأدمن فقط', event.threadID);
        }
    }
    
    // Cooldown
    const cooldowns = global.client.cooldowns;
    if (!cooldowns.has(cmdName)) {
        cooldowns.set(cmdName, new Map());
    }
    
    const now = Date.now();
    const timestamps = cooldowns.get(cmdName);
    const cooldown = (command.config.cooldown || 3) * 1000;
    
    if (timestamps.has(event.senderID)) {
        const expire = timestamps.get(event.senderID) + cooldown;
        if (now < expire) {
            const left = ((expire - now) / 1000).toFixed(1);
            return api.sendMessage(`⏱️ انتظر ${left}s`, event.threadID);
        }
    }
    
    timestamps.set(event.senderID, now);
    setTimeout(() => timestamps.delete(event.senderID), cooldown);
    
    // Execute
    try {
        // Support all 3 formats
        if (command.run) {
            // Mirai format
            await command.run({ api, event, args });
        } else if (command.onStart) {
            // GoatBot format
            const message = {
                reply: (t) => api.sendMessage(t, event.threadID, event.messageID),
                send: (t) => api.sendMessage(t, event.threadID),
                react: (e) => api.setMessageReaction(e, event.messageID, () => {}, true)
            };
            await command.onStart({ api, event, args, message });
        } else if (command.onMessage) {
            // Xavia format
            const reply = (t) => api.sendMessage(t, event.threadID, null, event.messageID);
            const send = (t) => api.sendMessage(t, event.threadID);
            await command.onMessage({ api, event, args, reply, send });
        }
        
        logger.cmd(`${cmdName} by ${event.senderID}`);
        
    } catch (err) {
        logger.error(`Command error [${cmdName}]: ${err.message}`);
        api.sendMessage(`❌ خطأ: ${err.message}`, event.threadID);
    }
}

// ===================================================================
// EVENT HANDLER
// ===================================================================

async function handleEvents(api, event) {
    for (const [name, eventHandler] of global.client.events) {
        try {
            if (eventHandler.run) {
                await eventHandler.run({ api, event });
            }
        } catch (err) {
            logger.error(`Event error [${name}]: ${err.message}`);
        }
    }
}

// ===================================================================
// LISTENER
// ===================================================================

function startListening(api) {
    logger.success('🎧 Bot is listening...');
    
    api.listenMqtt((err, event) => {
        if (err) {
            console.error('\n' + '='.repeat(60));
            console.error('❌ LISTEN ERROR');
            console.error('='.repeat(60));
            console.error('Error:', err.error || err.message);
            console.error('Full:', JSON.stringify(err, null, 2));
            console.error('='.repeat(60) + '\n');
            
            logger.error('Bot stopped - Get fresh appstate.json');
            process.exit(1);
        }
        
        if (!event) return;
        
        try {
            // Messages
            if (event.type === 'message' || event.type === 'message_reply') {
                handleCommand(api, event);
            }
            
            // Events (join, leave, etc)
            else if (event.type === 'event') {
                handleEvents(api, event);
            }
            
        } catch (err) {
            logger.error('Processing error: ' + err.message);
        }
    });
}

// ===================================================================
// WEB SERVER
// ===================================================================

function startWebServer() {
    const app = express();
    
    app.get('/', (req, res) => {
        res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>NOVA Bot</title>
    <style>
        body { 
            font-family: Arial; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #fff; 
            text-align: center; 
            padding: 50px; 
            margin: 0;
        }
        .container {
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            max-width: 600px;
            margin: 0 auto;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }
        h1 { font-size: 48px; margin: 0 0 20px 0; }
        .status { 
            background: #2ecc71; 
            padding: 15px 30px; 
            border-radius: 50px; 
            display: inline-block;
            font-weight: bold;
            margin: 20px 0;
        }
        .stats { margin: 30px 0; }
        .stat { 
            display: inline-block; 
            margin: 0 20px;
            padding: 10px 20px;
            background: rgba(255,255,255,0.2);
            border-radius: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🌟 NOVA Bot</h1>
        <div class="status">✅ ONLINE</div>
        <div class="stats">
            <div class="stat">📚 Commands: ${global.client.commands.size}</div>
            <div class="stat">🎯 Events: ${global.client.events.size}</div>
            <div class="stat">⏱️ Uptime: ${Math.floor(process.uptime())}s</div>
        </div>
        <p>Prefix: <strong>${CONFIG.PREFIX}</strong></p>
        <p>Single-File Architecture</p>
    </div>
</body>
</html>
        `);
    });
    
    app.get('/api/status', (req, res) => {
        res.json({
            status: 'online',
            bot: CONFIG.BOT_NAME,
            prefix: CONFIG.PREFIX,
            commands: global.client.commands.size,
            events: global.client.events.size,
            uptime: process.uptime()
        });
    });
    
    app.listen(CONFIG.PORT, '0.0.0.0', () => {
        logger.success(`Web server on port ${CONFIG.PORT}`);
    });
}

// ===================================================================
// MAIN FUNCTION
// ===================================================================

async function start() {
    try {
        logger.banner();
        logger.info('Starting NOVA Bot...');
        console.log('');
        
        // Check appstate
        if (!fs.existsSync('appstate.json')) {
            logger.error('appstate.json not found!');
            logger.error('Get it from c3c-fbstate extension');
            process.exit(1);
        }
        
        const appstate = require('./appstate.json');
        logger.success('✓ AppState found');
        
        // Load commands & events
        logger.info('Loading commands...');
        loadCommands();
        console.log('');
        
        logger.info('Loading events...');
        loadEvents();
        console.log('');
        
        // Start web server
        startWebServer();
        
        // Login
        logger.info('Logging in...');
        
        login({ appState: appstate }, CONFIG.FCA_OPTIONS, async (err, api) => {
            if (err) {
                console.error('\n' + '='.repeat(60));
                console.error('❌ LOGIN FAILED');
                console.error('='.repeat(60));
                console.error(err);
                console.error('='.repeat(60) + '\n');
                
                logger.error('Solutions:');
                logger.error('  1. Get fresh appstate.json');
                logger.error('  2. Check for checkpoint');
                logger.error('  3. Verify account status');
                
                process.exit(1);
            }
            
            logger.success('✅ Login successful!');
            
            // Update appstate
            try {
                fs.writeJsonSync('appstate.json', api.getAppState(), { spaces: 2 });
                logger.success('✓ AppState updated');
            } catch (e) {}
            
            // Start listening
            startListening(api);
            
            // Ready message
            console.log('');
            console.log(chalk.green('╔════════════════════════════════════╗'));
            console.log(chalk.green('║                                    ║'));
            console.log(chalk.green('║     ✅ BOT IS READY!              ║'));
            console.log(chalk.green('║                                    ║'));
            console.log(chalk.green('╚════════════════════════════════════╝'));
            console.log('');
            logger.info(`Bot: ${CONFIG.BOT_NAME}`);
            logger.info(`Prefix: ${CONFIG.PREFIX}`);
            logger.info(`Commands: ${global.client.commands.size}`);
            logger.info(`Events: ${global.client.events.size}`);
            logger.info(`Dashboard: http://localhost:${CONFIG.PORT}`);
            console.log('');
            
            // Send to admin
            if (CONFIG.ADMIN_IDS[0]) {
                api.sendMessage(
                    `✅ ${CONFIG.BOT_NAME} started!\n\n` +
                    `📚 Commands: ${global.client.commands.size}\n` +
                    `🎯 Events: ${global.client.events.size}\n` +
                    `💬 Prefix: ${CONFIG.PREFIX}`,
                    CONFIG.ADMIN_IDS[0]
                );
            }
        });
        
    } catch (err) {
        logger.error('Startup failed: ' + err.message);
        console.error(err.stack);
        process.exit(1);
    }
}

// ===================================================================
// ERROR HANDLERS
// ===================================================================

process.on('unhandledRejection', (err) => {
    logger.error('Unhandled Rejection: ' + err.message);
});

process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception: ' + err.message);
    console.error(err.stack);
    process.exit(1);
});

process.on('SIGINT', () => {
    logger.warn('\nShutting down...');
    db.save();
    process.exit(0);
});

// ===================================================================
// START!
// ===================================================================

start();
