// ═══════════════════════════════════════════════════════════
// 👑 KIRA - ايقاف
// المطور: Ayman ♛
// الوصف: تفعيل/إلغاء وضع الصمت الإمبراطوري
// ═══════════════════════════════════════════════════════════

const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
    name: "ايقاف",
  aliases: [],
    version: "3.0.0",
    hasPermssion: 2,
    credits: "Ayman ♛",
    description: "تفعيل/إلغاء وضع الصمت الإمبراطوري",
    commandCategory: "utility",
    usages: "[تشغيل / الغاء]",
    cooldowns: 3,
    usePrefix: false
};

module.exports.handleEvent = async function({ api, event }) {
    const { senderID, threadID, body } = event;
    const EMPEROR_ID = "61577861540407";
    const statusPath = path.join(__dirname, 'cache', 'bot_status.json');

    if (!fs.existsSync(statusPath)) return;

    const botStatus = fs.readJsonSync(statusPath);

    // إذا كان وضع الصمت مفعل والشخص ليس إمبراطور أو أدمن
    if (botStatus.status === "inactive") {
        const { ADMINBOT, NDH } = global.config;
        const isAdmin = ADMINBOT.includes(senderID) || NDH.includes(senderID) || senderID === EMPEROR_ID;

        if (!isAdmin && body && body.startsWith(global.config.PREFIX)) {
            // تجاهل الرسالة تماماً دون رد أو مسح الأوامر من المخزن المؤقت
            return; 
        }
    }
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID, senderID } = event;
    const EMPEROR_ID = "61577861540407";
    const { ADMINBOT, NDH } = global.config;
    
    if (senderID !== EMPEROR_ID && !ADMINBOT.includes(senderID) && !NDH.includes(senderID)) {
        return api.sendMessage("◈ ───『 تـنـبـيـه مـلـكـي 』─── ◈\n\n◯ هـذا الأمـر يـخـص الإمـبـراطـور وأركـان حـربـه فـقـط.\n———————————————\n◈ ─────────────── ◈", threadID, messageID);
    }
    
    const cacheDir = path.join(__dirname, 'cache');
    const statusPath = path.join(cacheDir, 'bot_status.json');
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    // التحقق من نوع الأمر (تشغيل أو إلغاء)
    if (args[0] === "الغاء" || args[0] === "تفعيل") {
        fs.writeJsonSync(statusPath, { status: "active" });
        return api.sendMessage(`◈ ───『 عـودة الـنظـام 🟢 』─── ◈\n\n◯ تـم إلـغاء وضـع الـصمـت.\n◉ الـبـوت يسـتجـيب للـجميـع الآن.\n———————————————\n│←› بـأوامـر: الإمـبـراطـور أيـمـن 👑`, threadID, messageID);
    } else {
        fs.writeJsonSync(statusPath, { status: "inactive" });
        return api.sendMessage(`◈ ───『 وضـع الـصـمـت 🔴 』─── ◈\n\n◯ تـم إيـقاف اسـتجـابة الـبـوت لـلعامـة.\n◉ الـحالـة: نـشـط لـلأدمنـية فـقط ✅\n———————————————\n◯ مـلاحظة: لـلإلـغاء اكـتب (ايقاف الغاء)\n———————————————\n│←› بـأوامـر: الإمـبـراطـور أيـمـن 👑`, threadID, messageID);
    }
};
