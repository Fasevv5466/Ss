const fs = require('fs-extra');
const path = require('path');

const SPAM_DB_PATH = path.join(process.cwd(), "Heba_DB", "spam_protection.json");

const SPAM_CONFIG = {
    maxMessages: 8,
    timeWindow: 15000,
    warningThreshold: 5,
    kickThreshold: 8,
    cooldownTime: 30000,
    exemptUsers: ["61577861540407"]
};

const initSpamDB = () => {
    if (!fs.existsSync(path.dirname(SPAM_DB_PATH))) {
        fs.mkdirSync(path.dirname(SPAM_DB_PATH), { recursive: true });
    }
    if (!fs.existsSync(SPAM_DB_PATH)) {
        fs.writeJsonSync(SPAM_DB_PATH, {
            users: {},
            stats: { totalWarnings: 0, totalKicks: 0, protectedGroups: 0, lastCleanup: new Date().toISOString() }
        });
    }
};

module.exports.config = {
    name: "antispam",
    eventType: ["message"],
    version: "1.0.0",
    credits: "النظام",
    description: "حماية تلقائية من السبام"
};

module.exports.run = async function({ api, event }) {
    try {
        const { threadID, senderID, messageID, body } = event;
        if (!threadID || threadID.toString().startsWith("1000") || SPAM_CONFIG.exemptUsers.includes(senderID.toString())) return;
        if (!body || body.length < 2 || body.length > 500 || body.startsWith('.') || body.startsWith('!') || body.startsWith('/')) return;

        initSpamDB();
        let db = fs.readJsonSync(SPAM_DB_PATH);
        const now = Date.now();

        if (!db.users[senderID]) {
            db.users[senderID] = { messages: [], warnings: 0, lastWarning: 0, kicked: false, groups: {} };
        }
        const userData = db.users[senderID];

        if (!userData.groups[threadID]) {
            userData.groups[threadID] = { messages: [], warningSent: false, lastAction: 0 };
        }
        const groupData = userData.groups[threadID];

        groupData.messages.push({ id: messageID, time: now });
        groupData.lastAction = now;
        groupData.messages = groupData.messages.filter(msg => now - msg.time <= SPAM_CONFIG.timeWindow);
        const messageCount = groupData.messages.length;

        if (messageCount >= SPAM_CONFIG.warningThreshold) {
            if (!groupData.warningSent && messageCount < SPAM_CONFIG.kickThreshold) {
                try {
                    await api.sendMessage(`
『 ✦ 』──────────『 ✦ 』
  تحذير سبام
تحذير: أرسلت ${messageCount} رسالة بسرعة
توقف فورا لتجنب الطرد التلقائي
『 ✦ 』──────────『 ✦ 』`, threadID);
                    groupData.warningSent = true;
                    userData.warnings++;
                    db.stats.totalWarnings++;
                } catch (e) {}
            }

            if (messageCount >= SPAM_CONFIG.kickThreshold) {
                try {
                    for (const msg of groupData.messages) { try { await api.unsendMessage(msg.id); } catch (e) {} }
                    await api.removeUserFromGroup(senderID, threadID);
                    userData.kicked = true;
                    db.stats.totalKicks++;
                    await api.sendMessage(`
『 ✦ 』──────────『 ✦ 』
  طرد تلقائي
تم طرد مستخدم بسبب السبام الزائد
نظام الحماية يعمل تلقائيا
『 ✦ 』──────────『 ✦ 』`, threadID);
                } catch (e) {
                    api.sendMessage(`تنبيه: المستخدم يرسل سبام، أحتاج صلاحية طرد`, threadID);
                }
                delete userData.groups[threadID];
            }
        }

        if (now - new Date(db.stats.lastCleanup).getTime() > 3600000) {
            db.stats.lastCleanup = new Date().toISOString();
        }
        fs.writeJsonSync(SPAM_DB_PATH, db);
    } catch (error) {}
};

module.exports.onLoad = () => {
    initSpamDB();
    console.log("🛡️ الحماية من السبام جاهزة");
};
