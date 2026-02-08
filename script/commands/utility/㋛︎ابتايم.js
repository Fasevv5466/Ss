// ═══════════════════════════════════════════════════════════
// 👑 KIRA - ابتايم
// المطور: Ayman ♛
// الوصف: عرض معلومات تشغيل السيرفر
// ═══════════════════════════════════════════════════════════

module.exports.config = {
  name: "ابتايم",
  aliases: [],
  version: "1.1.0",
  hasPermssion: 0,
  credits: "Ayman ♛",
  description: "عرض معلومات تشغيل السيرفر",
  commandCategory: "utility",
  usages: "ابتايم",
  cooldowns: 3
};

module.exports.run = async function ({ api, event }) {
  const os = require("os");
  const moment = require("moment-timezone");

  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);

  const totalMem = Math.round(os.totalmem() / 1024 / 1024);
  const freeMem = Math.round(os.freemem() / 1024 / 1024);
  const usedMem = totalMem - freeMem;
  const memUsage = ((usedMem / totalMem) * 100).toFixed(0);

  const cpuModel = os.cpus()[0].model;
  const cpuCores = os.cpus().length;
  const osType = `${os.type()} ${os.release()}`;
  const currentTime = moment.tz("Asia/Baghdad").format("YYYY/MM/DD │ HH:mm:ss");

  const message =
`◈ ───『 مـعـلـومـات الـسـيـرفـر 』─── ◈

◯ مـدة التـشـغـيـل:
│ ${hours} سـاعـة • ${minutes} دقـيـقـة • ${seconds} ثـانـيـة

◯ نـظـام التـشـغـيـل:
│ ${osType}

◯ الـمـعـالـج:
│ ${cpuModel}
│ الأنوية: ${cpuCores}

◯ الـذاكـرة (RAM):
│ الكلـي: ${totalMem} MB
│ المـسـتـخـدم: ${usedMem} MB
│ المـتـاح: ${freeMem} MB
│ الاسـتـهـلاك: ${memUsage}%

◯ الـوقـت الـحـالـي:
│ ${currentTime}

◈ ─────────────── ◈
│ بـواسـطـة الـمـطـور أيـمـن
◈ ─────────────── ◈`;

  return api.sendMessage(message, event.threadID, event.messageID);
};
