// ═══════════════════════════════════════════════════════════
// 👑 KIRA - رمضان
// المطور: Ayman ♛
// الوصف: الوقت المتبقي لرمضان
// ═══════════════════════════════════════════════════════════

module.exports.config = {
	name: "رمضان",
  aliases: [],
	version: "1.0.0",
	hasPermssion: 0,
	credits: "Ayman ♛",
	description: "الوقت المتبقي لرمضان",
	commandCategory: "utility",
	cooldowns: 5
}

module.exports.run = function ({ event, api }) {
    const t = Date.parse("March 23, 2023 00:00:00") - Date.parse(new Date());
    const seconds = Math.floor( (t/1000) % 60 );
    const minutes = Math.floor( (t/1000/60) % 60 );
    const hours = Math.floor( (t/(1000*60*60)) % 24 );
    const days = Math.floor( t/(1000*60*60*24) );

    return api.sendMessage(`「الوقت المتبقي لشهر رمضان」\n» ${days} يوم , ${hours} ساعة , ${minutes} دقيقة و ${seconds} ثانية «`, event.threadID, event.messageID);event.messageID);
      }