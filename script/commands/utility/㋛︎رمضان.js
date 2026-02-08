// ═══════════════════════════════════════════════════════════
// 👑 KIRA - رمضان
// المطور: Ayman ♛
// الوصف: حساب الوقت المتبقي لشهر رمضان المبارك بدقة
// ═══════════════════════════════════════════════════════════

module.exports.config = {
  name: "رمضان",
  aliases: [],
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Ayman ♛",
  description: "حساب الوقت المتبقي لشهر رمضان المبارك بدقة",
  commandCategory: "utility",
  cooldowns: 5
};

module.exports.run = function ({ event, api }) {
    // تحديد تاريخ بداية رمضان القادم (تقريباً 18 فبراير 2026)
    const ramadanDate = new Date("February 18, 2026 00:00:00").getTime();
    const now = new Date().getTime();
    const t = ramadanDate - now;

    if (t < 0) {
        return api.sendMessage("◈ ──『 تـنـبـيـه مـلـكـي 』── ◈\n\n◯ سيدي، نحن الآن في رحاب شهر رمضان أو قد مضى موعده المتوقع.\n◉ الـلـهـم بـلـغـنـا رمـضـان وأعـنـا عـلـى صـيـامـه 🌙", event.threadID, event.messageID);
    }

    const days = Math.floor(t / (1000 * 60 * 60 * 24));
    const hours = Math.floor((t % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((t % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((t % (1000 * 60)) / 1000);

    const msg = `◈ ───『 الـعـد الـتـنـازلـي 🌙 』─── ◈\n\n◯ الـوقـت الـمـتـبـقـي لـشـهـر رمـضـان:\n\n⏳  ${days} يـوم\n⏰  ${hours} سـاعـة\n⏲️  ${minutes} دقـيـقـة\n⏱️  ${seconds} ثـانـيـة\n\n———————————————\n│←› بـأوامـر: الـتـوب أيـمـن 👑\n◈ ──────────────── ◈`;

    return api.sendMessage(msg, event.threadID, event.messageID);
};
