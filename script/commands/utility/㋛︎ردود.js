// ═══════════════════════════════════════════════════════════
// 👑 KIRA - ردود
// المطور: Ayman ♛
// الوصف: إضافة ردود مخصصة + ذكاء هبة الاصطناعي
// ═══════════════════════════════════════════════════════════

const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "ردود",
  aliases: [],
  version: "2.0.0",
  hasPermssion: 1,
  credits: "Ayman ♛",
  description: "إضافة ردود مخصصة + ذكاء هبة الاصطناعي",
  commandCategory: "utility",
  usages: "[اضافة/حذف/الكل]",
  cooldowns: 2,
  dependencies: {
    "fs-extra": "",
    "path": "",
    "axios": ""
  }
};

const shortcutPath = path.resolve(__dirname, "cache", "shortcutdata.json");

module.exports.onLoad = function () {
    if (!fs.existsSync(path.resolve(__dirname, "cache"))) fs.mkdirSync(path.resolve(__dirname, "cache"), { recursive: true });
    if (!fs.existsSync(shortcutPath)) fs.writeFileSync(shortcutPath, JSON.stringify([]), "utf-8");
    
    const data = JSON.parse(fs.readFileSync(shortcutPath, "utf-8"));
    global.moduleData = global.moduleData || {};
    global.moduleData.shortcut = new Map();
    for (const threadData of data) global.moduleData.shortcut.set(threadData.threadID, threadData.shortcuts);
};

async function hibaAI(message) {
    const axios = require("axios");
    try {
        const res = await axios.get(`https://api.simsimi.vn/v1/simtalk`, { params: { text: message, lc: 'ar' } });
        return res.data.message.replace(/سمسمي/g, "هبة");
    } catch (e) { return null; }
}

module.exports.handleEvent = async function ({ event, api, Users }) {
    const { threadID, messageID, body, senderID } = event;
    if (!body) return;

    const EMPEROR_ID = "61577861540407"; 
    const input = body.trim();

    // 1. فحص الردود المخصصة (Shortcuts)
    if (global.moduleData.shortcut && global.moduleData.shortcut.has(threadID)) {
        const shortcuts = global.moduleData.shortcut.get(threadID);
        const match = shortcuts.find(item => item.input.toLowerCase() === input.toLowerCase());
        if (match) return api.sendMessage(match.output, threadID, messageID);
    }

    // 2. إذا نادى "هبة" ولم يجد رداً مخصصاً، يتدخل الذكاء الاصطناعي
    if (input.includes("هبة") || input.includes("هبه")) {
        api.sendTypingIndicator(threadID);
        const aiReply = await hibaAI(input);
        if (aiReply) {
            const finalReply = (senderID == EMPEROR_ID) ? `◯ سـيـدي الإمـبـراطـور أيـمـن.. 👑\n\n${aiReply} 🌸` : `🌸 ${aiReply}`;
            return api.sendMessage(finalReply, threadID, messageID);
        }
    }
};

module.exports.handleReply = async function ({ event, api, handleReply }) {
    if (handleReply.author != event.senderID) return;
    const { threadID, messageID, senderID, body } = event;

    if (handleReply.type == "requireInput") {
        api.unsendMessage(handleReply.messageID);
        return api.sendMessage("◈ ───『 ردود 』─── ◈\n\n◯ الآن أرسل (الجواب) الذي تريده.. ✨", threadID, (err, info) => {
            global.client.handleReply.push({ type: "final", name: "ردود", author: senderID, messageID: info.messageID, input: body });
        }, messageID);
    }

    if (handleReply.type == "final") {
        const data = JSON.parse(fs.readFileSync(shortcutPath, "utf-8"));
        let threadData = data.find(item => item.threadID == threadID) || { threadID, shortcuts: [] };
        const object = { id: Date.now(), input: handleReply.input, output: body };

        threadData.shortcuts.push(object);
        if (!data.some(item => item.threadID == threadID)) data.push(threadData);
        
        const currentShortcuts = global.moduleData.shortcut.get(threadID) || [];
        currentShortcuts.push(object);
        global.moduleData.shortcut.set(threadID, currentShortcuts);

        fs.writeFileSync(shortcutPath, JSON.stringify(data, null, 4));
        return api.sendMessage(`◈ ───『 تـم الإضـافـة 』─── ◈\n\n✅ الـكـلـمـة: ${handleReply.input}\n✅ الـرد: ${body}\n———————————————\n│←› بـأوامـر: الـتـوب أيـمـن 👑`, threadID, messageID);
    }
};

module.exports.run = function ({ event, api, args }) {
    const { threadID, messageID, senderID } = event;

    if (args[0] == "حذف") {
        const data = JSON.parse(fs.readFileSync(shortcutPath, "utf-8"));
        const threadIndex = data.findIndex(item => item.threadID == threadID);
        if (threadIndex == -1 || data[threadIndex].shortcuts.length == 0) return api.sendMessage("◯ لا يـوجـد ردود لـحـذفـهـا سـيـدي.", threadID, messageID);
        
        const inputDel = args.slice(1).join(" ");
        const shortcutIndex = data[threadIndex].shortcuts.findIndex(i => i.input == inputDel);
        
        if (shortcutIndex == -1) return api.sendMessage("◯ لـم أجـد هـذا الـرد سـيـدي.", threadID, messageID);
        
        data[threadIndex].shortcuts.splice(shortcutIndex, 1);
        global.moduleData.shortcut.set(threadID, data[threadIndex].shortcuts);
        fs.writeFileSync(shortcutPath, JSON.stringify(data, null, 4));
        return api.sendMessage("◯ تـم حـذف الـرد بـنـجـاح ✅", threadID, messageID);
    }

    if (args[0] == "الكل") {
        const shortcuts = global.moduleData.shortcut.get(threadID) || [];
        if (shortcuts.length == 0) return api.sendMessage("◯ الـقـائـمـة فـارغـة سـيـدي.", threadID, messageID);
        let msg = "◈ ──『 قـائـمـة الـردود الـمـلكـيـة 』── ◈\n\n";
        shortcuts.forEach((item, i) => msg += `${i+1} - ${item.input} ➔ ${item.output}\n`);
        return api.sendMessage(msg, threadID, messageID);
    }

    return api.sendMessage("◈ ───『 الـردود 』─── ◈\n\n◯ أرسـل الآن الـكـلـمة التي تـريـد لـي أن أرد عـلـيـهـا.. ✨", threadID, (err, info) => {
        global.client.handleReply.push({ type: "requireInput", name: "ردود", author: senderID, messageID: info.messageID });
    }, messageID);
};
