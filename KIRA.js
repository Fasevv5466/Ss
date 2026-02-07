#!/usr/bin/env node
'use strict';

const { spawn } = require("child_process");
const { readFileSync } = require("fs-extra");
const axios = require("axios");
const logger = require("./utils/log");
const express = require("express");
const gradient = require("gradient-string");

const logo = `
╔══════════════════════════════════════════════╗
║ ██╗  ██╗ ██╗ ██████╗   ██╗   ██████╗  ██████╗║
║ ██║ ██╔╝ ██║ ██╔══██╗ ███║   ██╔══██╗██╔═══██╗║
║ █████╔╝  ██║ ██████╔╝ ╚██║   ██████╔╝██║   ██║║
║ ██╔═██╗  ██║ ██╔══██╗  ██║   ██╔══██╗██║   ██║║
║ ██║  ██╗ ██║ ██║  ██║  ██║   ██║  ██║╚██████╔╝║
║ ╚═╝  ╚═╝ ╚═╝ ╚═╝  ╚═╝  ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ║
║              𝐒𝐔𝐏𝐑𝐄𝐌𝐄 v24.11.0                ║
╚══════════════════════════════════════════════╝
`;

const c = ["#FF0000", "#8B0000"];
const redGradient = gradient(c);
console.log(redGradient.multiline(logo));
console.log(redGradient("━".repeat(55)));

const app = express();
const port = process.env.PORT || 3078;

app.get("/", (req, res) => {
    res.json({
        message: "𝐊𝐈𝐑𝐀 𝐒𝐔𝐏𝐑𝐄𝐌𝐄 v24.11.0",
        node_version: process.version,
        status: "online",
        timestamp: new Date().toISOString()
    });
});

function startBot(message) {
    if (message) logger(message, "[ Starting ]");

    console.log(`🚀 Starting KIRA Supreme v24.11.0 on Node.js ${process.version}`);

    const child = spawn("node", [
        "--max-old-space-size=1024",
        "--trace-warnings", 
        "--async-stack-traces", 
        "index.js"
    ], {
        cwd: __dirname,
        stdio: "inherit",
        shell: true
    });

    child.on("close", (codeExit) => {
        console.log(`\n⚠️  Bot stopped with code: ${codeExit}`);
        if (codeExit !== 0) {
            console.log("🔄 Restarting in 5 seconds...");
            setTimeout(() => startBot("Restarting..."), 5000);
        }
    });

    child.on("error", function(error) {
        console.error("❌ An error occurred:", error);
    });
};

logger('𝐊𝐈𝐑𝐀 𝐒𝐔𝐏𝐑𝐄𝐌𝐄', "[ NAME ]");
logger(`Version: 24.11.0 | Node.js ${process.version}`, "[ VERSION ]");

startBot();

app.listen(port, () => {
    console.log(`📡 Health server running on port: ${port}`);
});
