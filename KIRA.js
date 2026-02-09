const { spawn } = require("child_process");
const { readFileSync } = require("fs-extra");
const axios = require("axios");
const semver = require("semver");
const logger = require("./utils/log");
const express = require("express");
const gradient = require("gradient-string");

const logo = `
██╗  ██╗ ██╗ ██████╗   ██╗  
██║ ██╔╝ ██║ ██╔══██╗ ███║  
█████╔╝  ██║ ██████╔╝ ╚██║  
██╔═██╗  ██║ ██╔══██╗  ██║  
██║  ██╗ ██║ ██║  ██║  ██║  
╚═╝  ╚═╝ ╚═╝ ╚═╝  ╚═╝  ╚═╝  
`;

const c = ["cyan", "#7D053F"];
const redToGreen = gradient("red", "cyan");

console.log(redToGreen("━".repeat(50), { interpolation: "hsv" }));
const text = gradient(c).multiline(logo);
console.log(text);
console.log(redToGreen("━".repeat(50), { interpolation: "hsv" }));

const app = express();
const port = process.env.PORT || 3078;

// ✅ إضافة middleware للـ JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ الصفحة الرئيسية
app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>KIRA Bot Status</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
            font-family: 'Courier New', monospace;
            color: #00ff00;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            text-align: center;
        }
        .container {
            background: rgba(0, 0, 0, 0.8);
            border: 2px solid #00ff00;
            border-radius: 15px;
            padding: 40px;
            box-shadow: 0 0 30px rgba(0, 255, 0, 0.3);
        }
        h1 {
            font-size: 48px;
            margin-bottom: 20px;
            text-shadow: 0 0 20px #00ff00;
        }
        .status {
            font-size: 24px;
            color: #00ff00;
            margin: 20px 0;
        }
        .robot {
            font-size: 80px;
            margin: 20px 0;
            animation: float 3s ease-in-out infinite;
        }
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="robot">🤖</div>
        <h1>KIRA BOT</h1>
        <div class="status">✅ Status: Online</div>
        <div class="status">🚀 Version: 1.2.14</div>
        <div class="status">⚡ Running on Port: ${port}</div>
    </div>
</body>
</html>
  `);
});

// ✅ API endpoint للحالة
app.get("/api/status", (req, res) => {
  res.json({
    status: "online",
    bot: "KIRA",
    version: "1.2.14",
    uptime: process.uptime(),
    port: port,
    timestamp: new Date().toISOString()
  });
});

// ✅ تهيئة العداد
global.countRestart = 0;

function startBot(message) {
  if (message) logger(message, "[ Starting ]");

  const child = spawn("node", ["--trace-warnings", "--async-stack-traces", "index.js"], {
    cwd: __dirname,
    stdio: "inherit",
    shell: true
  });

  child.on("close", (codeExit) => {
    if (codeExit != 0 || (global.countRestart && global.countRestart < 5)) {
      global.countRestart += 1;
      logger(`Restarting bot... Attempt ${global.countRestart}/5`, "[ Restart ]");
      startBot("Starting up...");
      return;
    } else {
      logger("Bot stopped after 5 restart attempts", "[ Error ]");
      return;
    }
  });

  child.on("error", function(error) {
    logger("An error occurred: " + JSON.stringify(error), "[ Starting ]");
  });
}

// ✅ معلومات النظام
logger('KIRA BOT', "[ NAME ]");
logger("Version: 1.2.14", "[ VERSION ]");
logger(`Port: ${port}`, "[ PORT ]");

// ✅ بدء البوت
startBot();

// ✅ بدء الخادم
app.listen(port, () => {
  console.log(gradient(["green", "cyan"])(`🚀 Server running on port: ${port}`));
  logger(`Health check available at http://localhost:${port}`, "[ Server ]");
});

// ✅ معالجة الأخطاء غير المتوقعة
process.on('unhandledRejection', (reason, promise) => {
  logger('Unhandled Rejection at:', "[ Error ]");
  console.error(promise);
  console.error('Reason:', reason);
});

process.on('uncaughtException', (error) => {
  logger('Uncaught Exception:', "[ Error ]");
  console.error(error);
});

// ✅ معالجة إيقاف البوت
process.on('SIGINT', () => {
  logger('\nShutting down gracefully...', "[ Shutdown ]");
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger('\nReceived SIGTERM, shutting down...', "[ Shutdown ]");
  process.exit(0);
});
